"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "../ujrakezdes.css";
// The offer block reuses the shipped <PricingBand>, whose styles live in
// landing.css scoped under `.lxl` - so the stylesheet comes along and the band
// is wrapped in that class below, exactly as /arak does it. Scoping means none
// of it leaks into `.lxu`.
import "@/app/landing.css";
import * as C from "../copy";
import { PricingBand } from "@/components/landing/PricingBand";
import EnergyModule from "./EnergyModule";
import ProgramPreview from "./ProgramPreview";
import PlanTray from "./PlanTray";
import type { LandingCatalog } from "@/lib/landing-catalog";
import type { BodyInput } from "@/lib/ujrakezdes/energy";
import { buildWeekPlan } from "@/lib/ujrakezdes/plan";
import { validateEmail } from "@/lib/quiz/validate";
import { STEP_IDS, type Answers, type Care, type StepId } from "@/lib/ujrakezdes/types";
import {
  marketingContext, newEventId, trackUjrakezdesGateView, trackUjrakezdesLead,
  trackUjrakezdesOfferClick, trackUjrakezdesRevealView, trackUjrakezdesStep,
} from "@/lib/track";

// The lead magnet v2 wizard: Q1-Q7 → interstitial → gate → reveal.
//
// State model, deliberately simple: answers live in one object, the screen is a
// string, and both are mirrored to sessionStorage so a refresh mid-funnel does
// not throw somebody back to the first question. NOTHING reaches the server
// before the gate submit - that is a promise the gate copy makes ("Hova
// küldjük"), not an implementation detail, so there is no autosave anywhere.
//
// Six of the seven questions auto-advance on tap, per the spec. Q5 is the
// exception because it is multi-select: a screen that advanced on the first tap
// would make the second choice impossible.

const STORE_KEY = "lexfit_ujrakezdes_v1";

type Screen = StepId | "interstitial" | "gate" | "reveal";

/** Screen order. The interstitial sits between Q4 and Q5 exactly as specced:
 *  the two forgiveness rules are stated BEFORE we ask about knees and backs, so
 *  the caution question lands as care rather than as a risk assessment. */
const ORDER: Screen[] = [
  "anchor", "level", "days", "session",
  "interstitial",
  "care", "place", "daypart",
  "gate", "reveal",
];

/** 1-7 for the progress dots; 0 for the screens that are not questions. */
const Q_NUMBER: Partial<Record<Screen, number>> = Object.fromEntries(
  STEP_IDS.map((id, i) => [id, i + 1]),
);

/** How long the commit state is held before the next question arrives. Long
 *  enough to read as acknowledgement, short enough that nobody waits on it. */
const COMMIT_MS = 230;

type Draft = Partial<Answers>;

const isComplete = (d: Draft): d is Answers =>
  !!(d.anchor && d.level && d.days && d.session && d.place && d.daypart && d.care);

export default function PlanWizard({ catalog }: { catalog: LandingCatalog }) {
  const [screen, setScreen] = useState<Screen>("anchor");
  // Which way the stage is travelling. Enter and exit share an axis: forward
  // brings the next screen in from the right, Vissza mirrors it exactly, so a
  // screen always leaves the way it arrived (spatial consistency).
  const [dir, setDir] = useState<1 | -1>(1);
  // The option being committed to, during the brief beat between the tap and
  // the advance. Null the rest of the time.
  const [picked, setPicked] = useState<string | null>(null);
  /** The step whose chip should animate into the tray. Cleared on navigation so
   *  going back does not replay a landing for an answer already sitting there. */
  const [landed, setLanded] = useState<string | null>(null);
  const [a, setA] = useState<Draft>({ care: [] });
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Any pending commit must die with the component, or it fires setState on an
  // unmounted tree when somebody leaves mid-answer.
  useEffect(() => () => { if (commitTimer.current) clearTimeout(commitTimer.current); }, []);

  // Restore once on mount. Failure is non-fatal: Safari private mode throws on
  // storage access, and a quiz that refuses to start is worse than a lost draft.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as { a?: Draft; screen?: Screen };
      if (d.a) setA({ care: [], ...d.a });
      // Never resume INTO the reveal: it depends on a submit that did not
      // survive the refresh, and re-showing it would imply a lead we never saved.
      if (d.screen && d.screen !== "reveal" && d.screen !== "interstitial") {
        setScreen(d.screen);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ a, screen }));
    } catch { /* ignore */ }
  }, [a, screen]);

  const idx = ORDER.indexOf(screen);
  const qNum = Q_NUMBER[screen] ?? 0;
  // The bar never reads as empty: arriving at question one is already progress,
  // and the two non-question screens hold the last real position rather than
  // dropping to zero.
  const shownStep = qNum || (screen === "interstitial" ? 4 : STEP_IDS.length);

  const go = useCallback((next: Screen, direction: 1 | -1 = 1) => {
    setDir(direction);
    setPicked(null);
    setScreen(next);
    // Move focus to the new question, or a screen change is silent to a screen
    // reader and lands nowhere for a keyboard user.
    requestAnimationFrame(() => stageRef.current?.focus());
  }, []);

  const advance = useCallback(() => {
    const next = ORDER[ORDER.indexOf(screen) + 1];
    if (next) go(next, 1);
  }, [screen, go]);

  const back = useCallback(() => {
    const prev = ORDER[ORDER.indexOf(screen) - 1];
    // Stepping back INTO the interstitial would replay a beat they already sat
    // through, so it is skipped in reverse.
    if (prev === "interstitial") go(ORDER[ORDER.indexOf(screen) - 2]!, -1);
    else if (prev) go(prev, -1);
  }, [screen, go]);

  /**
   * Answer a single-select question, then move on.
   *
   * The advance is held for one short beat so the choice is visibly
   * acknowledged first. Swapping the screen on the raw tap is faster but reads
   * as "did that register?" - the commit is what makes it feel answered.
   */
  const pick = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    if (picked) return;                      // ignore a double-tap mid-commit
    setA((prev) => ({ ...prev, [key]: value }));
    setPicked(String(value));
    setLanded(String(key));
    if (Q_NUMBER[screen]) trackUjrakezdesStep(String(screen), Q_NUMBER[screen]!);
    commitTimer.current = setTimeout(advance, COMMIT_MS);
  }, [picked, screen, advance]);

  /** Q5 only. "Semmi különös" is exclusive both ways: picking it clears the
   *  cautions, and picking a caution clears it. */
  const toggleCare = useCallback((value: Care) => {
    setA((prev) => {
      const cur = prev.care ?? [];
      if (value === "none") return { ...prev, care: cur.includes("none") ? [] : ["none"] };
      const without = cur.filter((c) => c !== "none");
      return {
        ...prev,
        care: without.includes(value) ? without.filter((c) => c !== value) : [...without, value],
      };
    });
  }, []);

  // The interstitial holds for its own beat and then moves on by itself.
  useEffect(() => {
    if (screen !== "interstitial") return;
    const t = setTimeout(advance, C.INTERSTITIAL.holdMs);
    return () => clearTimeout(t);
  }, [screen, advance]);

  useEffect(() => { if (screen === "gate") trackUjrakezdesGateView(); }, [screen]);
  useEffect(() => { if (screen === "reveal") trackUjrakezdesRevealView(); }, [screen]);

  const plan = useMemo(() => (isComplete(a) ? buildWeekPlan(a) : null), [a]);

  /**
   * The one place this funnel talks to the server. The gate calls it, and the
   * energy module calls it again with a body block attached; routing both
   * through the same function is what stops the two payloads drifting apart.
   */
  const post = useCallback((opts: { eventId?: string; body?: BodyInput }) =>
    fetch("/api/ujrakezdes-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        consent_marketing: consent,
        answers: a,
        hp_field: hp,
        ...(opts.eventId ? { event_id: opts.eventId, marketing_context: marketingContext() } : {}),
        ...(opts.body ? { body: opts.body, consent_health: true } : {}),
        utm: readUtm(),
      }),
    }), [email, consent, a, hp]);

  /**
   * The energy module finished. The result is already on screen - this only
   * attaches the block to the stored lead, so a failure is silent by design:
   * re-showing an error over a result they can already read would be noise
   * about something they did not ask us to save in the first place.
   */
  const attachBody = useCallback((bodyBlock: BodyInput) => {
    void post({ body: bodyBlock }).catch(() => { /* result already rendered */ });
  }, [post]);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (validateEmail(email)) { setErr(C.GATE.emailError); return; }
    if (!isComplete(a)) { back(); return; }

    setBusy(true);
    setErr(null);
    const eventId = newEventId();
    try {
      const res = await post({ eventId });
      if (!res.ok) throw new Error(String(res.status));
      trackUjrakezdesLead(eventId);
      go("reveal");
    } catch {
      // The plan is theirs either way - but we cannot claim to have mailed it,
      // so the error says what actually failed and invites a retry.
      setErr(C.GATE.networkError);
    } finally {
      setBusy(false);
    }
  }, [busy, email, a, back, go, post]);

  return (
    <main className="lxu">
      {/* The interstitial lives OUTSIDE the stage on purpose. It is a full-bleed
          takeover, and `position: fixed` resolves against the nearest
          transformed ancestor - so rendering it inside the stage would clip it
          to that box for the length of the stage's entry animation. */}
      {screen === "interstitial" && (
        <div
          className="u-inter"
          role="status"
          style={{ ["--inter-ms" as string]: `${C.INTERSTITIAL.holdMs}ms` }}
        >
          <div className="u-inter-lines">
            {C.INTERSTITIAL.lines.map((l) => <p key={l}>{l}</p>)}
          </div>
          {/* Makes the pause legible as "this is going somewhere" rather than as
              the page having stalled. */}
          <span className="u-inter-bar" aria-hidden="true"><i /></span>
        </div>
      )}

      {screen !== "reveal" && (
        <div className="u-top">
          <div className="u-topline">
            {idx > 0 && (
              <button type="button" className="u-back" onClick={back}>
                {C.NAV.back}
              </button>
            )}
            <div
              className="u-progress"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={STEP_IDS.length}
              aria-valuenow={shownStep}
              aria-label="Haladás a kérdéseken"
            >
              <i style={{ width: `${(shownStep / STEP_IDS.length) * 100}%` }} />
            </div>
            <span className="u-count">{C.NAV.progress(shownStep, STEP_IDS.length)}</span>
          </div>

          {/* The plan assembling itself. Only while questions are running - once
              the gate is reached it has done its job, and on the reveal the real
              week takes over. */}
          {qNum > 0 && <PlanTray a={a} latest={landed} />}
        </div>
      )}

      <div
        key={screen}
        className={`u-wrap u-stage ${dir === 1 ? "u-anim-fwd" : "u-anim-back"}`}
        ref={stageRef}
        tabIndex={-1}
      >
        {screen === "anchor" && <Single q={C.Q_ANCHOR} onPick={(v) => pick("anchor", v)} picked={picked} />}
        {screen === "level" && <Single q={C.Q_LEVEL} onPick={(v) => pick("level", v)} picked={picked} />}
        {screen === "days" && <Single q={C.Q_DAYS} onPick={(v) => pick("days", v)} picked={picked} />}
        {screen === "session" && <Single q={C.Q_SESSION} onPick={(v) => pick("session", v)} picked={picked} />}

        {screen === "care" && (
          <>
            <h1 className="u-q">{C.Q_CARE.hd}</h1>
            <p className="u-micro">{C.Q_CARE.micro}</p>
            <div className="u-opts">
              {C.Q_CARE.options.map((o, i) => {
                const on = (a.care ?? []).includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={`u-opt${on ? " sel" : ""}`}
                    style={{ ["--i" as string]: i }}
                    aria-pressed={on}
                    onClick={() => toggleCare(o.value)}
                  >
                    <span className="u-tick" aria-hidden="true">✓</span>
                    {o.label}
                  </button>
                );
              })}
            </div>
            <div className="u-ctawrap">
              <button
                type="button"
                className="u-cta"
                onClick={() => {
                  // An empty selection IS an answer - "Semmi különös" by another
                  // name - so the button is never disabled here.
                  if (!(a.care ?? []).length) setA((p) => ({ ...p, care: ["none"] }));
                  setLanded("care");
                  trackUjrakezdesStep("care", 5);
                  advance();
                }}
              >
                {C.Q_CARE.cta}
              </button>
            </div>
          </>
        )}

        {screen === "place" && <Single q={C.Q_PLACE} onPick={(v) => pick("place", v)} picked={picked} />}
        {screen === "daypart" && <Single q={C.Q_DAYPART} onPick={(v) => pick("daypart", v)} picked={picked} />}

        {screen === "gate" && (
          <form onSubmit={submit} noValidate>
            <h1 className="u-q">{C.GATE.hd}</h1>
            <p className="u-micro">{C.GATE.sub}</p>

            <div className="u-field">
              <label className="u-label" htmlFor="u-email">{C.GATE.emailLabel}</label>
              <input
                id="u-email"
                className="u-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder={C.GATE.emailPlaceholder}
                value={email}
                aria-invalid={err ? true : undefined}
                aria-describedby={err ? "u-email-err" : undefined}
                onChange={(e) => { setEmail(e.target.value); if (err) setErr(null); }}
              />
              {err && <p className="u-err" id="u-email-err" role="alert">{err}</p>}
            </div>

            <label className="u-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{C.GATE.consent}</span>
            </label>

            {/* Off-screen, never display:none - a bot reads the DOM, not pixels. */}
            <div className="u-hp" aria-hidden="true">
              <label htmlFor="u-company">Cég</label>
              <input
                id="u-company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
              />
            </div>

            <div className="u-ctawrap">
              <button type="submit" className="u-cta" disabled={busy}>
                {busy ? C.GATE.ctaBusy : C.GATE.cta}
              </button>
            </div>

            <p className="u-fine">
              {C.GATE.fine}{" "}
              <Link href="/adatvedelem">{C.GATE.privacy}</Link>
            </p>
          </form>
        )}

        {screen === "reveal" && plan && (
          <>
            <h1 className="u-q">{C.REVEAL.hd}</h1>
            <p className="u-micro">
              {C.REVEAL.sub(plan.trainingCount, plan.sessionLabel)}
            </p>

            <div className="u-grid" role="list" aria-label="A heti terved">
              {plan.days.map((d, i) => (
                <div
                  key={d.weekday}
                  role="listitem"
                  className={`u-day ${d.training ? "train" : "rest"}`}
                  style={{ ["--i" as string]: i }}
                >
                  <div className="u-dayname">{d.short}</div>
                  <div className="u-daymin">
                    {d.training ? `${d.minutes}′` : "—"}
                  </div>
                  <span className="u-sr-only">
                    {d.full}: {d.training ? `${d.minutes} perc` : C.REVEAL.restLabel}
                  </span>
                </div>
              ))}
            </div>

            {plan.care.length > 0 && (
              <ul className="u-carelist">
                {plan.care.map((c) => <li key={c}>{C.CARE_NOTE[c]}</li>)}
              </ul>
            )}

            <div className="u-panel">
              <h3>{C.REVEAL.firstWorkout.lead}</h3>
              <p>{C.REVEAL.firstWorkout.body(plan.firstWorkoutMinutes)}</p>
            </div>

            <section aria-labelledby="u-alexavid">
              <h2 className="u-q" id="u-alexavid" style={{ fontSize: 20 }}>
                {C.REVEAL.alexaVideo.heading}
              </h2>
              <div className="u-video">
                <span className="u-dayname">videó</span>
              </div>
              <p className="u-transcript">{C.REVEAL.alexaVideo.transcript}</p>
            </section>

            {/* What they are joining, before what it costs. The order matters:
                the offer band reads as expensive next to a plan and reasonable
                next to thirty workouts they have just been able to open. */}
            <ProgramPreview catalog={catalog} onCta={() => { window.location.href = "/register"; }} />

            {/* The calculator, opt-in and after the plan: the lead is already
                captured and the promise already kept, so nobody is asked for
                their weight in order to receive what the ad offered. Renders
                only when NEXT_PUBLIC_ENERGY_MODULE=1. */}
            {C.ENERGY_LIVE && isComplete(a) && (
              <EnergyModule
                level={a.level}
                days={a.days}
                trainingCount={plan.trainingCount}
                onComputed={attachBody}
              />
            )}

            <div className="lxl u-offer" onClickCapture={trackUjrakezdesOfferClick}>
              <PricingBand surface="ujrakezdes" />
            </div>

            <p className="u-fine">{C.REVEAL.footer}</p>
          </>
        )}
      </div>
    </main>
  );
}

/** A single-select question. Tap advances - six of the seven work this way. */
function Single<T extends string>({
  q, onPick, picked,
}: {
  q: { hd: string; micro?: string; options: C.Choice<T>[] };
  onPick: (v: T) => void;
  /** The value being committed to, or null. Dims the options not chosen. */
  picked: string | null;
}) {
  return (
    <>
      <h1 className="u-q">{q.hd}</h1>
      {q.micro && <p className="u-micro">{q.micro}</p>}
      <div className={`u-opts${picked ? " committing" : ""}`}>
        {q.options.map((o, i) => (
          <button
            key={o.value}
            type="button"
            className={`u-opt${picked === o.value ? " picked" : ""}`}
            style={{ ["--i" as string]: i }}
            onClick={() => onPick(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </>
  );
}

/** UTMs off the current URL. The campaign puts them on the ad link, and they
 *  ride along to Stripe metadata if this person later buys. */
function readUtm(): Record<string, string> {
  try {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of ["source", "medium", "campaign", "content", "term"]) {
      const v = p.get(`utm_${k}`);
      if (v) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}
