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

type Draft = Partial<Answers>;

const isComplete = (d: Draft): d is Answers =>
  !!(d.anchor && d.level && d.days && d.session && d.place && d.daypart && d.care);

export default function PlanWizard() {
  const [screen, setScreen] = useState<Screen>("anchor");
  const [a, setA] = useState<Draft>({ care: [] });
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

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

  const go = useCallback((next: Screen) => {
    setScreen(next);
    // Move focus to the new question, or a screen change is silent to a screen
    // reader and lands nowhere for a keyboard user.
    requestAnimationFrame(() => stageRef.current?.focus());
  }, []);

  const advance = useCallback(() => {
    const next = ORDER[ORDER.indexOf(screen) + 1];
    if (next) go(next);
  }, [screen, go]);

  const back = useCallback(() => {
    const prev = ORDER[ORDER.indexOf(screen) - 1];
    // Stepping back INTO the interstitial would replay a beat they already sat
    // through, so it is skipped in reverse.
    if (prev === "interstitial") go(ORDER[ORDER.indexOf(screen) - 2]!);
    else if (prev) go(prev);
  }, [screen, go]);

  /** Answer a single-select question and move on. */
  const pick = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setA((prev) => ({ ...prev, [key]: value }));
    if (Q_NUMBER[screen]) trackUjrakezdesStep(String(screen), Q_NUMBER[screen]!);
    advance();
  }, [screen, advance]);

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

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (validateEmail(email)) { setErr(C.GATE.emailError); return; }
    if (!isComplete(a)) { back(); return; }

    setBusy(true);
    setErr(null);
    const eventId = newEventId();
    try {
      const res = await fetch("/api/ujrakezdes-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          consent_marketing: consent,
          answers: a,
          hp_field: hp,
          event_id: eventId,
          marketing_context: marketingContext(),
          utm: readUtm(),
        }),
      });
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
  }, [busy, email, consent, a, hp, back, go]);

  return (
    <main className="lxu">
      {screen !== "reveal" && (
        <div className="u-top">
          <div className="u-topline">
            {idx > 0 && (
              <button type="button" className="u-back" onClick={back}>
                {C.NAV.back}
              </button>
            )}
            {qNum > 0 && (
              <>
                <div className="u-dots" aria-hidden="true">
                  {STEP_IDS.map((id, i) => (
                    <span
                      key={id}
                      className={`u-dot${i + 1 < qNum ? " on" : ""}${i + 1 === qNum ? " now" : ""}`}
                    />
                  ))}
                </div>
                <span className="u-count">{C.NAV.progress(qNum, STEP_IDS.length)}</span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="u-wrap u-stage" ref={stageRef} tabIndex={-1}>
        {screen === "anchor" && <Single q={C.Q_ANCHOR} onPick={(v) => pick("anchor", v)} />}
        {screen === "level" && <Single q={C.Q_LEVEL} onPick={(v) => pick("level", v)} />}
        {screen === "days" && <Single q={C.Q_DAYS} onPick={(v) => pick("days", v)} />}
        {screen === "session" && <Single q={C.Q_SESSION} onPick={(v) => pick("session", v)} />}

        {screen === "interstitial" && (
          <div className="u-inter" role="status">
            {C.INTERSTITIAL.lines.map((l) => <p key={l}>{l}</p>)}
          </div>
        )}

        {screen === "care" && (
          <>
            <h1 className="u-q">{C.Q_CARE.hd}</h1>
            <p className="u-micro">{C.Q_CARE.micro}</p>
            <div className="u-opts">
              {C.Q_CARE.options.map((o) => {
                const on = (a.care ?? []).includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    className={`u-opt${on ? " sel" : ""}`}
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
                  trackUjrakezdesStep("care", 5);
                  advance();
                }}
              >
                {C.Q_CARE.cta}
              </button>
            </div>
          </>
        )}

        {screen === "place" && <Single q={C.Q_PLACE} onPick={(v) => pick("place", v)} />}
        {screen === "daypart" && <Single q={C.Q_DAYPART} onPick={(v) => pick("daypart", v)} />}

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
              {plan.days.map((d) => (
                <div
                  key={d.weekday}
                  role="listitem"
                  className={`u-day ${d.training ? "train" : "rest"}`}
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
  q, onPick,
}: {
  q: { hd: string; micro?: string; options: C.Choice<T>[] };
  onPick: (v: T) => void;
}) {
  return (
    <>
      <h1 className="u-q">{q.hd}</h1>
      {q.micro && <p className="u-micro">{q.micro}</p>}
      <div className="u-opts">
        {q.options.map((o) => (
          <button key={o.value} type="button" className="u-opt" onClick={() => onPick(o.value)}>
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
