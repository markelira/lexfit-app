"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
// The quiz adopts the /register wizard's layout wholesale - the split-screen
// shell, the per-step photography, the question chrome and the option rows are
// the SAME components, not a lookalike. A marketing funnel that looks like a
// different product than the one it sells is a funnel that leaks trust at
// exactly the moment it is asking for an email.
import "@/app/login/auth.css";
import "@/app/onboarding/onbv2.css";
import "../ujrakezdes.css";
// The offer block reuses the shipped <PricingBand>, whose styles live in
// landing.css scoped under `.lxl` - so the stylesheet comes along and the band
// is wrapped in that class below, exactly as /arak does it. Scoping means none
// of it leaks into `.lxu`.
import "@/app/landing.css";
import * as C from "../copy";
import Image from "next/image";
import { GARANCIA, GUARANTEE_LIVE } from "@/components/landing/offer-copy";
import { PRICES } from "@/lib/pricing/config";
import { annualSavingsPct, formatHuf, perMonthHuf } from "@/lib/pricing/display";
import PlanTray, { trayChips } from "./PlanTray";
import MailPreview from "./MailPreview";
import { BrandPanel } from "@/components/onboarding/BrandPanel";
import { StepFrame } from "@/components/onboarding/StepFrame";
import { OptionList } from "@/components/onboarding/OptionList";
import type { LandingCatalog } from "@/lib/landing-catalog";
import {
  BODY_LIMITS, computeEnergy, parseBody, tempoDelta, tempoRate,
  type BodyInput, type EnergyGoal, type EnergyResult as Energy, type Tempo,
} from "@/lib/ujrakezdes/energy";
import { buildWeekPlan } from "@/lib/ujrakezdes/plan";
import { validateEmail } from "@/lib/quiz/validate";
import { STEP_IDS, type Answers, type Care, type StepId } from "@/lib/ujrakezdes/types";
import {
  marketingContext, newEventId, trackUjrakezdesGateView, trackUjrakezdesLead,
  trackUjrakezdesOfferClick, trackUjrakezdesRevealView, trackUjrakezdesStep,
  trackUjrakezdesStickyClick,
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

type Screen =
  | StepId
  | "interstitial"
  /** The calculator's own questions, asked HERE rather than on the reveal,
   *  behind an explicit invitation so the „7 kérdés" promise stays true. */
  | "calc_invite" | "body" | "goal" | "tempo"
  | "gate" | "reveal";

/** Screen order. The interstitial sits between Q4 and Q5 exactly as specced:
 *  the two forgiveness rules are stated BEFORE we ask about knees and backs, so
 *  the caution question lands as care rather than as a risk assessment. */
/**
 * Grouped so each SECTION is contiguous - the progress bar names sections, and
 * a section that jumps around the flow would be a label pointing at nothing.
 *
 * `daypart` moved up next to `days`: both answer "when", and the two now form
 * the schedule section. That also puts the interstitial immediately after the
 * schedule questions, which is where its two lines belong - they are about rest
 * days and missed weeks. It still lands BEFORE the caution question, so that
 * one still reads as care rather than as a risk assessment.
 */
const CORE: Screen[] = [
  "anchor", "level",
  "days", "daypart",
  "interstitial",
  "focus", "care", "place",
];

/**
 * The calculator's three questions, asked in the flow rather than after it.
 *
 * SKIPPABLE, and that is not a UX nicety. These are Art. 9 body metrics, and
 * consent to special-category data is only valid if it is freely given -
 * making the plan conditional on handing them over would make the consent
 * worthless and the processing unlawful with it. So the first of the three
 * carries a "Kihagyom" that jumps straight to the gate.
 */
const CALC: Screen[] = ["body", "goal", "tempo"];

/** 1-7 for the progress dots; 0 for the screens that are not questions. */
const Q_NUMBER: Partial<Record<Screen, number>> = Object.fromEntries(
  STEP_IDS.map((id, i) => [id, i + 1]),
);

/** How long the commit state is held before the next question arrives. Long
 *  enough to read as acknowledgement, short enough that nobody waits on it. */
const COMMIT_MS = 230;

/**
 * Our screen → the /register step whose photograph and caption fit it.
 *
 * BrandPanel keys its imagery off the join wizard's own step ids, so mapping
 * onto those ids is what gets the right picture rather than a default. The
 * pairing is by MEANING, not by position: `session` takes the player photo
 * because it asks how long a session is, and `care` takes the focus photo
 * because it asks what to work around.
 */
const BRAND_STEP: Record<Screen, string> = {
  anchor: "goal",          // the community photo - why they came
  level: "level",
  days: "days",
  focus: "focus",
  interstitial: "why",     // Alexa's quote, under the two rules
  care: "obstacle",       // what to work around
  place: "env",
  daypart: "time",         // the player
  calc_invite: "reassure", // the offer of the calculator, before its questions
  body: "reassure",        // the calculator's own three, still in the flow
  goal: "reassure",
  tempo: "reassure",
  gate: "reveal",          // the promise photo, as the plan is handed over
  reveal: "plan",
};

type Draft = Partial<Answers>;

type BodyDraft = {
  sex: BodyInput["sex"] | "";
  age: string;
  heightCm: string;
  weightKg: string;
  goal: EnergyGoal | "";
  tempo: Tempo;
};

const EMPTY_BODY: BodyDraft = {
  sex: "", age: "", heightCm: "", weightKg: "", goal: "", tempo: "kozepes",
};

/** The three calculator steps carry their own counter: the seven questions are
 *  genuinely finished by then, and inflating the denominator to ten from the
 *  first screen would overstate the length of a funnel most people will not
 *  extend. */
const CALC_NO: Partial<Record<Screen, number>> = { body: 1, goal: 2, tempo: 3 };

/** Which section each screen belongs to. The interstitial inherits the section
 *  it interrupts, so the bar does not blink between two states mid-beat. */
const SECTION_OF: Record<Screen, number> = {
  anchor: 0, level: 0,
  days: 1, daypart: 1, interstitial: 1,
  focus: 2, care: 2, place: 2,
  calc_invite: 3, body: 3, goal: 3, tempo: 3,
  gate: 3, reveal: 3,
};

const isComplete = (d: Draft): d is Answers =>
  !!(d.anchor && d.level && d.days && d.focus && d.place && d.daypart && d.care);

export default function PlanWizard({ catalog }: { catalog: LandingCatalog }) {
  const [screen, setScreen] = useState<Screen>("anchor");
  // The option being committed to, during the brief beat between the tap and
  // the advance. Null the rest of the time.
  const [picked, setPicked] = useState<string | null>(null);
  /** The step whose chip should animate into the tray. Cleared on navigation so
   *  going back does not replay a landing for an answer already sitting there. */
  const [landed, setLanded] = useState<string | null>(null);
  const [a, setA] = useState<Draft>({ care: [] });
  /** The calculator's answers. Separate from `a` because they are Art. 9 data
   *  with their own consent and their own retention clock. */
  const [body, setBody] = useState<BodyDraft>(EMPTY_BODY);
  const [bodyConsent, setBodyConsent] = useState(false);
  const [skipCalc, setSkipCalc] = useState(false);
  /** S · the sticky price bar (M4). Shown once B2's CTA scrolls out, hidden
   *  again while the closing CTA is on screen. Mobile only - desktop's rail is
   *  the constant price. */
  const [stickyOn, setStickyOn] = useState(false);
  const b2Ref = useRef<HTMLElement>(null);
  const closeCtaRef = useRef<HTMLAnchorElement>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  /** The question heading. Focus lands here on every step, which is what makes
   *  the change audible to a screen reader and reachable from the keyboard.
   *  Kept separate from `stageRef` (the reveal's container) rather than casting
   *  one into the other - they are different elements with different jobs. */
  const headingRef = useRef<HTMLHeadingElement>(null);
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

  // The order depends on whether they are still in the calculator branch: once
  // somebody skips it, the three steps leave the flow entirely rather than
  // lingering as screens they have to dismiss again on the way back.
  const ORDER: Screen[] = useMemo(
    () => [
      ...CORE,
      // The invitation stays in the order even after a decline, so Vissza from
      // the gate lands back on the offer rather than skipping past it - saying
      // no once should not be irreversible.
      "calc_invite" as Screen,
      ...(skipCalc ? [] : CALC),
      "gate" as Screen,
      "reveal" as Screen,
    ],
    [skipCalc],
  );

  const idx = ORDER.indexOf(screen);
  const qNum = Q_NUMBER[screen] ?? 0;

  const go = useCallback((next: Screen) => {
    setPicked(null);
    setScreen(next);
    // Move focus to the new question, or a screen change is silent to a screen
    // reader and lands nowhere for a keyboard user.
    requestAnimationFrame(() => (headingRef.current ?? stageRef.current)?.focus());
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

  // The interstitial holds for its own beat and then moves on by itself.
  useEffect(() => {
    if (screen !== "interstitial") return;
    const t = setTimeout(advance, C.INTERSTITIAL.holdMs);
    return () => clearTimeout(t);
  }, [screen, advance]);

  useEffect(() => { if (screen === "gate") trackUjrakezdesGateView(); }, [screen]);
  useEffect(() => { if (screen === "reveal") trackUjrakezdesRevealView(); }, [screen]);

  // M4. Two observers rather than scroll math: the bar appears when the fold
  // offer leaves upward, and yields while the closing CTA is visible so the
  // page never shows the same ask twice at once.
  useEffect(() => {
    if (screen !== "reveal") return;
    const b2 = b2Ref.current, cl = closeCtaRef.current;
    if (!b2 || !cl || typeof IntersectionObserver === "undefined") return;
    let past = false, closeVis = false;
    const upd = () => setStickyOn(past && !closeVis);
    const io1 = new IntersectionObserver(([e]) => {
      past = !!e && !e.isIntersecting && e.boundingClientRect.top < 0;
      upd();
    });
    const io2 = new IntersectionObserver(([e]) => { closeVis = !!e && e.isIntersecting; upd(); });
    io1.observe(b2);
    io2.observe(cl);
    return () => { io1.disconnect(); io2.disconnect(); };
  }, [screen]);

  /**
   * The programme's real session length, taken from the live catalogue: the
   * median of its published workouts. The quiz no longer ASKS how long a
   * session is, so the only honest number is the one the videos actually are.
   */
  const sessionMin = useMemo(() => {
    const mins = (catalog.entry?.sessions ?? []).map((s) => s.mins).filter((m) => m > 0).sort((x, y) => x - y);
    return mins.length ? mins[Math.floor(mins.length / 2)]! : undefined;
  }, [catalog]);

  const plan = useMemo(
    () => (isComplete(a) ? buildWeekPlan(a, sessionMin) : null),
    [a, sessionMin],
  );

  /** The week as far as it is known at the interstitial - `days` is answered by
   *  then, which is the whole reason the beat can show something true. */
  const interWeek = useMemo(
    () => (a.days ? buildWeekPlan({ ...(a as Answers), days: a.days }, sessionMin).days : []),
    [a, sessionMin],
  );

  /** Their answers, in the same labels the quiz's tray used - one source
   *  (trayChips), three surfaces (tray, gate mail, artifact). */
  const chips = useMemo(() => trayChips(a), [a]);

  /** The programme's first workout, for the artifact's last line item. Null on
   *  a degraded catalogue - the row simply does not render. */
  const firstW = useMemo(() => {
    const code = catalog.entry?.sessions[0]?.code;
    return code ? catalog.workouts.find((w) => w.code === code) ?? null : null;
  }, [catalog]);

  /** The parsed body block, or null when they skipped or have not finished. */
  const bodyInput = useMemo<BodyInput | null>(() => {
    if (skipCalc || !bodyConsent) return null;
    const parsed = parseBody({
      sex: body.sex, age: Number(body.age), heightCm: Number(body.heightCm),
      weightKg: Number(body.weightKg), goal: body.goal, tempo: body.tempo,
    });
    return Array.isArray(parsed) ? null : parsed;
  }, [skipCalc, bodyConsent, body]);

  /** Everything needed is answered by the gate, so the result is simply ready
   *  when the reveal arrives - no second form and no second submit. */
  const energy = useMemo<Energy | null>(
    () => (bodyInput && isComplete(a) ? computeEnergy(bodyInput, a.level, a.days, a.focus, sessionMin) : null),
    [bodyInput, a, sessionMin],
  );

  /**
   * The one place this funnel talks to the server. The gate calls it, and the
   * energy module calls it again with a body block attached; routing both
   * through the same function is what stops the two payloads drifting apart.
   */
  const post = useCallback((opts: { eventId?: string }) =>
    fetch("/api/ujrakezdes-lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        consent_marketing: consent,
        answers: a,
        hp_field: hp,
        ...(opts.eventId ? { event_id: opts.eventId, marketing_context: marketingContext() } : {}),
        ...(bodyInput ? { body: bodyInput, consent_health: true } : {}),
        utm: readUtm(),
      }),
    }), [email, consent, a, hp, bodyInput]);

  /** Q5's "Tovább". Hoisted rather than written inline in the cta prop: a
   *  handler created during render and closing over refs is what the compiler
   *  lint flags, and hoisting it is the fix rather than the silencer. */
  /**
   * Every section named, all the time, with the current one lifted out by
   * weight and opacity. Showing only the current label told somebody where they
   * were but never where they were going - the shape of the thing they had
   * agreed to was invisible until they reached the end of it.
   */
  const sectionLabels = (
    // Reuses `.fnl-top`'s own row so the horizontal padding, the gap and the
    // spacer width all track the back button at every breakpoint - the offsets
    // differ between desktop and the two mobile height ladders, and hardcoding
    // any of them would misalign the labels on some phone.
    <div className="fnl-top u-secs-row">
      <span className="fnl-back-spacer" aria-hidden="true" />
      <ol className="u-secs" aria-hidden="true">
        {C.SECTIONS.map((sec, i) => (
          <li
            key={sec.key}
            className={i === SECTION_OF[screen] ? "on" : i < SECTION_OF[screen] ? "done" : ""}
          >
            {sec.label}
          </li>
        ))}
      </ol>
    </div>
  );

  /** Every body field present. The consent is checked separately, because a
   *  filled form without it must still be able to move on - it just moves on
   *  without storing anything. */
  const bodyReady = !!(body.sex && body.age && body.heightCm && body.weightKg);

  const finishCare = useCallback(() => {
    setA((p) => ((p.care ?? []).length ? p : { ...p, care: ["none"] }));
    setLanded("care");
    trackUjrakezdesStep("care", 5);
    advance();
  }, [advance]);

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


  // ââ The reveal is NOT a wizard step ââââââââââââââââââââââââââââââââââââââââ
  // It carries the week, the whole Foundation programme, the calculator and the
  // offer. The split-screen exists to keep a single question company; giving
  // long-form content half a viewport would be using the layout against itself.
  if (screen === "reveal" && plan) {
    // ═══ The reveal — design-handoff rebuild (2026-09-08) ═══════════════════
    //
    // Block order per ~/Downloads/design_handoff_reveal README §5 (the order IS
    // the design): B0 progress-at-88% → B1 plan card → B2 offer at the fold →
    // B3 mechanism → B4 first workout → (B5 hidden: no consented member photos)
    // → B6 entry → B7 guarantee band → B8 Alexa → B9 anti-avatar → B10 FAQ →
    // B11 close → S sticky price bar.
    //
    // Desktop ≥1024px: B1/B3/B4 form the left column, the decision panel is a
    // 320px sticky rail on the right (B2 and B6 fold into it), B7 onward runs
    // full-width. Mobile is the master DOM order; the rail and the mobile-only
    // blocks swap via CSS, never by re-ordering the document.
    //
    // Guest playback does not exist (pay-to-join hard gate, locked P0), so the
    // handoff's guest button and every „vendégként" string are omitted - the
    // handoff itself prescribes exactly that for this case (Q3).
    const intro = formatHuf(PRICES.week_intro.amountHuf);
    const weekStd = formatHuf(PRICES.week_std.amountHuf);
    const month = formatHuf(PRICES.month_std.amountHuf);
    const annual = formatHuf(PRICES.annual_std.amountHuf);
    const perMonth = formatHuf(perMonthHuf());
    // The honesty comparison: weekly rhythm at monthly scale. Computed, never
    // typed - 1 990 × 4.33 rounded to the nearest hundred (handoff §8).
    const weeklyMonthly = formatHuf(Math.round((PRICES.week_std.amountHuf * 4.33) / 100) * 100);
    const firstDayName = plan.days.find((d) => d.training)?.full ?? "hétfő";

    return (
      <main className="lxu u2" ref={stageRef} tabIndex={-1}>
        {/* ── B0 · the quiz's bar, parked at 88% ──────────────────────────── */}
        <div className="u2-top">
          <span className="u2-top-mark">LEXFIT</span>
          <span className="u2-top-lbl">
            <b>{C.REVEAL.progress.done}</b> · {C.REVEAL.progress.left}
          </span>
          <span className="u2-top-bar" aria-hidden="true">
            <i style={{ width: `${C.REVEAL.progress.pct}%` }} />
          </span>
        </div>

        <div className="u2-grid">
          <div className="u2-main">
            {/* ── B1 · the plan card ──────────────────────────────────────── */}
            <section className="u2-plan" aria-labelledby="u2-h1">
              <p className="u2-eyebrow u2-m1" style={{ ["--i" as string]: 0 }}>{C.REVEAL.b1.eyebrow}</p>
              <h1 id="u2-h1" className="u2-m1" style={{ ["--i" as string]: 1 }}>{C.REVEAL.b1.hd}</h1>
              <p className="u2-sub u2-m1" style={{ ["--i" as string]: 2 }}>
                {C.REVEAL.b1.sub(plan.trainingCount, plan.sessionLabel)}
              </p>
              <p className="u2-identity u2-m1" style={{ ["--i" as string]: 3 }}>{C.REVEAL.b1.identity}</p>

              <ul className="u2-chips u2-m1" style={{ ["--i" as string]: 4 }} aria-label={C.REVEAL.b1.chipsAria}>
                {chips.slice(0, 6).map((c) => <li key={c.key}>{c.label}</li>)}
              </ul>

              <div className="u2-week" role="list" aria-label="A heti terved">
                {plan.days.map((d, i) => (
                  <div
                    key={d.weekday}
                    role="listitem"
                    className={`u2-day u2-m1 ${d.training ? "on" : ""}`}
                    style={{ ["--i" as string]: 5 + i }}
                  >
                    <span className="d">{d.short}</span>
                    <span className="dot" aria-hidden="true" />
                    <span className="u-sr-only">
                      {d.full}: {d.training ? `${d.minutes} perc` : "pihenőnap"}
                    </span>
                  </div>
                ))}
              </div>

              <ol className="u2-miles u2-m1" style={{ ["--i" as string]: 12 }} aria-label="Mérföldkövek">
                {C.REVEAL.b1.milestones.map((m, i) => (
                  <li key={m} className={i === C.REVEAL.b1.guardIdx ? "guard" : i === 0 ? "now" : ""}>{m}</li>
                ))}
              </ol>

              <dl className="u2-stats u2-m1" style={{ ["--i" as string]: 13 }}>
                <div><dt><Count to={plan.trainingCount} /></dt><dd>{C.REVEAL.b1.stats.days}</dd></div>
                <div><dt><Count to={plan.firstWorkoutMinutes} /></dt><dd>{C.REVEAL.b1.stats.mins}</dd></div>
                <div><dt>0</dt><dd>{C.REVEAL.b1.stats.equip}</dd></div>
              </dl>

              {C.ENERGY_LIVE && energy && (
                <p className="u2-calc u2-m1" style={{ ["--i" as string]: 14 }}>
                  {C.REVEAL.b1.calc(energy.kcal.toLocaleString("hu-HU"), energy.stepTarget.toLocaleString("hu-HU"))}
                </p>
              )}
            </section>

            {/* ── B2 · the offer at the fold (mobile; desktop = the rail) ──── */}
            <section className="u2-offer u2-mobile u2-m1" style={{ ["--i" as string]: 15 }} ref={b2Ref}>
              <RevealOffer intro={intro} weekStd={weekStd} />
            </section>

            {/* ── B3 · the mechanism ──────────────────────────────────────── */}
            <section className="u2-blk">
              <p className="u2-eyebrow">{C.REVEAL.b3.eyebrow}</p>
              <p className="u2-body">{C.REVEAL.b3.body}</p>
              <ol className="u2-rules">
                {C.REVEAL.b3.rules.map((r, i) => (
                  <li key={r}><span className="n">{String(i + 1).padStart(2, "0")}</span>{r}</li>
                ))}
              </ol>
            </section>

            {/* ── B4 · the first workout ──────────────────────────────────── */}
            <section className="u2-blk">
              <p className="u2-eyebrow">{C.REVEAL.b4.eyebrow(firstDayName)}</p>
              {firstW && (
                <div className="u2-cover" aria-hidden="true">
                  <span className="mono">LEXFIT · {firstW.code}</span>
                  <b>{firstW.theme}</b>
                  <i>{firstW.mins} PERC</i>
                </div>
              )}
              <h2>{C.REVEAL.b4.hd}</h2>
              <p className="u2-xs">{C.REVEAL.b4.sub(plan.firstWorkoutMinutes)}</p>
            </section>

            {/* B5 · „Akik már csinálják" does NOT render: no consented member
                photos exist, and the handoff forbids the section without them
                (invented or stock imagery is excluded outright). */}

            {/* ── B6 · the entry (mobile; desktop = the rail) ─────────────── */}
            <section className="u2-blk u2-entry u2-mobile" aria-labelledby="u2-entry-h">
              <p className="u2-eyebrow">{C.REVEAL.entry.eyebrow}</p>
              <h2 id="u2-entry-h">{C.REVEAL.entry.hd(intro)}</h2>
              <p className="u2-body">{C.REVEAL.entry.lead(weekStd)}</p>

              <p className="u2-label">{C.REVEAL.entry.listTitle}</p>
              <ul className="u2-inc">
                {C.REVEAL.entry.items.map((it) => (
                  <li key={it.b}>
                    <span className="k">{it.k}</span>
                    <span><b>{it.b}</b> — {it.d}</span>
                  </li>
                ))}
              </ul>

              <RevealRhythm month={month} annual={annual} perMonth={perMonth} weeklyMonthly={weeklyMonthly} />
              <p className="u2-body u2-yt">{C.REVEAL.entry.youtube}</p>
            </section>
          </div>

          {/* ── The decision rail (desktop only) ──────────────────────────── */}
          <aside className="u2-rail" aria-label="A belépő">
            <div className="u2-rail-in">
              <p className="u2-eyebrow">{C.REVEAL.entry.eyebrow}</p>
              <h2>{C.REVEAL.entry.hd(intro)}</h2>
              <p className="u2-xs">{C.REVEAL.entry.lead(weekStd)}</p>
              <ul className="u2-inc u2-inc-slim">
                {C.REVEAL.entry.items.map((it) => (
                  <li key={it.b}><span className="k">{it.k}</span><b>{it.b}</b></li>
                ))}
              </ul>
              <RevealOffer intro={intro} weekStd={weekStd} />
              <RevealRhythm month={month} annual={annual} perMonth={perMonth} weeklyMonthly={weeklyMonthly} />
            </div>
          </aside>
        </div>

        {/* ── B7 · the guarantee band — the page's one ground change ──────── */}
        {GUARANTEE_LIVE && (
          <section className="u2-band u2-dark" id="garancia">
            <div className="u2-col">
              <p className="u2-eyebrow">{C.REVEAL.guarEyebrow}</p>
              <h2>{GARANCIA.heading}</h2>
              <p className="u2-body">
                {GARANCIA.bodyLead}<b>{GARANCIA.bodyStrong}</b>{GARANCIA.bodyTail}
              </p>
              <p className="u2-xs">{GARANCIA.statutory}</p>
            </div>
          </section>
        )}

        {/* ── B8 · Alexa ──────────────────────────────────────────────────── */}
        <section className="u2-band">
          <div className="u2-col u2-alexa">
            <Image src="/alexa-av.jpg" alt="Alexa" width={72} height={72} className="u2-face" />
            <div>
              <p className="u2-eyebrow">{C.REVEAL.alexaEyebrow}</p>
              <h2>{C.ALEXA.name}</h2>
              <p className="u2-body">{C.ALEXA.story} {C.ALEXA.promise}</p>
              <p className="u2-signed">{C.REVEAL.alexaSigned}</p>
            </div>
          </div>
        </section>

        {/* ── B9 · who it is not for ──────────────────────────────────────── */}
        <section className="u2-band u2-tight">
          <div className="u2-col u2-notfor">
            <p className="u2-eyebrow">{C.REVEAL.notFor.eyebrow}</p>
            <p className="u2-body">{C.REVEAL.notFor.body}</p>
          </div>
        </section>

        {/* ── B10 · FAQ ───────────────────────────────────────────────────── */}
        <section className="u2-band u2-tight">
          <div className="u2-col">
            <p className="u2-eyebrow">{C.REVEAL.faqTitle}</p>
            <div className="u2-faq">
              {C.REVEAL.faq
                .filter((f) => !f.guar || GUARANTEE_LIVE)
                .map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
            </div>
          </div>
        </section>

        {/* ── B11 · the close ─────────────────────────────────────────────── */}
        <section className="u2-band u2-close">
          <div className="u2-col">
            <blockquote>
              <p>{C.REVEAL.close.quote}</p>
              <footer>{C.REVEAL.close.by}</footer>
            </blockquote>
            <a
              className="u2-cta"
              href={CTA_HREF}
              ref={closeCtaRef}
              onClick={trackUjrakezdesOfferClick}
            >
              {C.REVEAL.offer.cta(intro)}
            </a>
            <p className="u2-xs">
              {GUARANTEE_LIVE ? C.REVEAL.close.sub : C.REVEAL.close.subNoGuar}
            </p>
            <p className="u2-later">{C.REVEAL.close.later}</p>
            <p className="u2-trust">{C.REVEAL.close.trust}</p>
          </div>
        </section>

        {/* ── S · the sticky price bar (mobile only; M4) ──────────────────── */}
        <div className={`u2-sticky${stickyOn ? " on" : ""}`} aria-hidden={!stickyOn}>
          <div className="u2-sticky-p">
            <b>{C.REVEAL.sticky.line(intro)}</b>
            <span>{C.REVEAL.sticky.sub(weekStd)}</span>
          </div>
          <a className="u2-cta u2-cta-sm" href={CTA_HREF} onClick={trackUjrakezdesStickyClick}>
            {C.REVEAL.sticky.go}
          </a>
        </div>
      </main>
    );
  }

  // ââ The interstitial keeps the shell, and takes it over ââââââââââââââââââââ
  // Same photograph, same column; only the sheet is replaced by the two rules.
  // Dropping the shell for two seconds would read as a page break rather than a
  // beat inside the flow.
  return (
    <div className="lx authx fnl-wiz u-onb" data-step={BRAND_STEP[screen]}>
      <div className="authx-shell">
        {/* The gate asks where to send the plan, so the panel behind it shows
            the mail. Every other step keeps the photography. */}
        {screen === "gate"
          ? <MailPreview plan={plan} answers={a} />
          : <BrandPanel step={BRAND_STEP[screen]} />}

        <main className="fnl-col">
          <div className="fnl-sr" role="status" aria-live="polite">
            {C.SECTIONS[SECTION_OF[screen]]!.label}
          </div>

          {screen === "interstitial" && (
            <div className="fnl-main fnl u-inter-step">
              <div className="fnl-sheet">
                <div className="fnl-scroll">
                  {/* Not a loading screen. They have just answered how many days
                      and when, so at this exact point their week is knowable -
                      and showing it is worth more than two lines of text over a
                      photograph. The rules below then land as captions on
                      something concrete rather than as claims in the air. */}
                  <p className="u-inter-eyebrow">{C.INTERSTITIAL.eyebrow}</p>

                  <ul className="u-inter-week" aria-label="A heti terved">
                    {interWeek.map((d, i) => (
                      <li
                        key={d.weekday}
                        className={d.training ? "on" : ""}
                        style={{ ["--i" as string]: i }}
                      >
                        <span className="d">{d.short}</span>
                        <span className="m">{d.training ? "edzés" : "pihenő"}</span>
                      </li>
                    ))}
                  </ul>

                  {C.INTERSTITIAL.lines.map((l, i) => (
                    <p key={l} className="u-inter-line" style={{ ["--i" as string]: i }}>{l}</p>
                  ))}
                </div>
                <div className="fnl-foot">
                  <span className="u-inter-bar" aria-hidden="true"><i /></span>
                </div>
              </div>
            </div>
          )}

          {screen === "gate" && (
            <StepFrame
              onBack={back}
              progressCurrent={C.SECTIONS.length}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={C.GATE.hd}
              sub={C.GATE.sub}
              headingRef={headingRef}
              cta={
                <>
                  <button className="fnl-cta" onClick={submit as unknown as () => void} disabled={busy}>
                    {busy ? C.GATE.ctaBusy : C.GATE.cta}
                  </button>
                  <p className="fnl-alt">
                    {C.GATE.fine} <Link href="/adatvedelem" className="link">{C.GATE.privacy}</Link>
                  </p>
                </>
              }
            >
              <form onSubmit={submit} noValidate>
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

                <label className="u-consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>{C.GATE.consent}</span>
                </label>

                {/* Off-screen, never display:none - a bot reads the DOM. */}
                <div className="u-hp" aria-hidden="true">
                  <label htmlFor="u-company">Cég</label>
                  <input
                    id="u-company" name="company" tabIndex={-1} autoComplete="off"
                    value={hp} onChange={(e) => setHp(e.target.value)}
                  />
                </div>
              </form>
            </StepFrame>
          )}

          {/* ── The calculator, offered rather than assumed ───────────────
              Every ad promises „7 kérdés", and the calculator adds three. Asking
              permission keeps that promise true, and it is also the only shape
              under which the Art. 9 consent that follows can be called freely
              given: „no" is a whole button here, not a link under a form. */}
          {screen === "calc_invite" && (
            <StepFrame
              onBack={back}
              progressCurrent={SECTION_OF[screen] + 1}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={C.CALC_INVITE.hd}
              sub={C.CALC_INVITE.sub}
              helper={C.CALC_INVITE.helper}
              headingRef={headingRef}
              cta={
                <>
                  <button
                    className="fnl-cta"
                    onClick={() => { setSkipCalc(false); go("body"); }}
                  >
                    {C.CALC_INVITE.yes}
                  </button>
                  <button
                    className="fnl-skip"
                    onClick={() => { setSkipCalc(true); go("gate"); }}
                  >
                    {C.CALC_INVITE.no}
                  </button>
                </>
              }
            >
              <></>
            </StepFrame>
          )}

          {/* ── The calculator's three questions, in the flow ─────────────
              They sit after the seven and before the gate, carry their own
              counter (the seven are genuinely done), and the first one can be
              skipped outright - Art. 9 consent has to be freely given, so the
              plan can never be made conditional on handing over body metrics. */}
          {CALC_NO[screen] && (
            <StepFrame
              onBack={back}
              progressCurrent={SECTION_OF[screen] + 1}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={
                screen === "body" ? C.ENERGY.formHeading
                  : screen === "goal" ? C.ENERGY.goalLabel
                  : C.ENERGY.tempoHeading
              }
              sub={
                screen === "body" ? C.ENERGY.formSub
                  : screen === "goal" ? C.ENERGY.goalSub
                  : screen === "tempo" && body.goal ? C.ENERGY.tempoLead[body.goal]
                  : undefined
              }
              helper={screen === "body" ? C.ENERGY.formMicro : undefined}
              headingRef={headingRef}
              cta={
                screen === "body" ? (
                  <>
                    <button
                      className="fnl-cta"
                      disabled={!bodyReady}
                      onClick={advance}
                    >{C.ENERGY.next}</button>
                    <button
                      className="fnl-skip"
                      onClick={() => { setSkipCalc(true); go("gate"); }}
                    >{C.ENERGY.skip}</button>
                  </>
                ) : screen === "goal" ? (
                  <span className="u-cta-hint">{C.NAV.pickHint}</span>
                ) : (
                  <button className="fnl-cta" onClick={advance}>{C.ENERGY.next}</button>
                )
              }
            >
              {screen === "body" && (
                <>
                  <span className="u-flabel">{C.ENERGY.sexLabel}</span>
                  <div className="u-seg">
                    {C.ENERGY.sexOptions.map((o) => (
                      <button
                        key={o.value} type="button"
                        className={`u-seg-b${body.sex === o.value ? " on" : ""}`}
                        aria-pressed={body.sex === o.value}
                        onClick={() => setBody((p) => ({ ...p, sex: o.value }))}
                      >{o.label}</button>
                    ))}
                  </div>
                  <p className="u-fhint">{C.ENERGY.sexMicro}</p>

                  <div className="u-calc-nums">
                    {([
                      ["age", C.ENERGY.ageLabel, BODY_LIMITS.age],
                      ["heightCm", C.ENERGY.heightLabel, BODY_LIMITS.heightCm],
                      ["weightKg", C.ENERGY.weightLabel, BODY_LIMITS.weightKg],
                    ] as const).map(([k, label, [lo, hi]]) => (
                      <label key={k} className="u-calc-num">
                        <span className="u-flabel">{label}</span>
                        <input
                          className="u-input" type="number" inputMode="numeric"
                          min={lo} max={hi} value={body[k]}
                          onChange={(e) => setBody((p) => ({ ...p, [k]: e.target.value }))}
                        />
                      </label>
                    ))}
                  </div>

                  {/* The Art. 9 consent lives on the screen that asks for the
                      data, not bundled into the marketing box at the gate. */}
                  <label className="u-consent">
                    <input
                      type="checkbox" checked={bodyConsent}
                      onChange={(e) => setBodyConsent(e.target.checked)}
                    />
                    <span>{C.ENERGY.consent}</span>
                  </label>

                  {/* Tovább is enabled by the FIELDS, never by the consent -
                      requiring the tick would make the consent coerced. The
                      cost is a silent dead end: three questions answered, no
                      numbers at the reveal, no explanation. This says so. */}
                  {bodyReady && !bodyConsent && (
                    <p className="u-fhint u-consent-warn" role="status">
                      {C.ENERGY.consentMissing}
                    </p>
                  )}
                </>
              )}

              {screen === "goal" && (
                <OptionList
                  ariaLabel={C.ENERGY.goalLabel}
                  value={body.goal || null}
                  onChange={(v) => {
                    const val = v ?? body.goal;
                    if (!val) return;
                    setBody((p) => ({ ...p, goal: val as EnergyGoal }));
                    setLanded("goal");
                    commitTimer.current = setTimeout(advance, COMMIT_MS);
                  }}
                  items={C.ENERGY.goalOptions.map((o) => ({ v: o.value, label: o.label }))}
                />
              )}

              {screen === "tempo" && body.goal && (
                <div className="u-tempos">
                  {(["laza", "kozepes", "intenziv"] as Tempo[]).map((t) => (
                    <button
                      key={t} type="button"
                      className={`u-tempo${body.tempo === t ? " on" : ""}`}
                      aria-pressed={body.tempo === t}
                      onClick={() => setBody((p) => ({ ...p, tempo: t }))}
                    >
                      <span className="row">
                        <b>{C.ENERGY.tempoName[t]}</b>
                        {t === "kozepes" && <em>{C.ENERGY.tempoRecommended}</em>}
                        <span className="korr">{tempoDelta(body.goal as EnergyGoal, t)}</span>
                      </span>
                      <span className="desc">{C.ENERGY.tempoDesc[body.goal][t]}</span>
                      <span className="rate">{tempoRate(body.goal as EnergyGoal, t)}</span>
                    </button>
                  ))}
                </div>
              )}
            </StepFrame>
          )}

          {qNum > 0 && (
            <StepFrame
              onBack={idx > 0 ? back : undefined}
              progressCurrent={SECTION_OF[screen] + 1}
              progressTotal={C.SECTIONS.length}
              progressLabels={sectionLabels}
              heading={QUESTION[screen as StepId].hd}
              sub={QUESTION[screen as StepId].micro}
              headingRef={headingRef}
              cta={
                screen === "care" ? (
                  <button className="fnl-cta" onClick={finishCare}>{C.Q_CARE.cta}</button>
                ) : (
                  <span className="u-cta-hint">{C.NAV.pickHint}</span>
                )
              }
            >
              {screen === "care" ? (
                <OptionList
                  multi
                  ariaLabel={C.Q_CARE.hd}
                  exclusive="none"
                  value={a.care ?? []}
                  onChange={(v) => setA((p) => ({ ...p, care: v as Care[] }))}
                  items={C.Q_CARE.options.map((o) => ({
                    v: o.value, label: o.label, sub: o.sub, icon: o.icon,
                  }))}
                />
              ) : (
                <OptionList
                  ariaLabel={QUESTION[screen as StepId].hd}
                  value={(a as Record<string, string | undefined>)[screen] ?? null}
                  onChange={(v) => {
                    // OptionList treats a tap on the selected row as a deselect.
                    // These steps have no Tovább, so after coming back with an
                    // answer already chosen that would leave no way forward
                    // except changing it. Re-confirming advances instead.
                    const val = v ?? (a as Record<string, string | undefined>)[screen];
                    if (val) pick(screen as keyof Answers, val as never);
                  }}
                  items={QUESTION[screen as StepId].options.map((o) => ({
                    v: o.value,
                    label: o.label,
                    sub: o.sub,
                    icon: o.icon,
                    // "2 nap" and "20-30 perc" ARE numbers; an icon standing in
                    // for one is a worse tile than the number itself.
                    ...(o.icon ? {} : { leading: <span className="u-numtile">{NUM_TILE[o.value] ?? ""}</span> }),
                  }))}
                />
              )}

              {/* The plan assembling itself, inside the sheet where the answers
                  are given rather than floating above the chrome. */}
              <PlanTray a={a} latest={landed} />
            </StepFrame>
          )}
        </main>
      </div>
    </div>
  );
}

/** The reveal's CTA target. One destination for every button on the page -
 *  the pay step reads the ?plan= preselect (handoff Q1). */
const CTA_HREF = "/register?plan=week_intro";

/** B2 / rail: the offer. Module scope - a component created during render gets
 *  a new identity every pass. */
function RevealOffer({ intro, weekStd, sticky = false }: {
  intro: string; weekStd: string; sticky?: boolean;
}) {
  return (
    <>
      <p className="u2-proof">
        {GUARANTEE_LIVE
          ? <><b>{C.REVEAL.offer.proofGuar}</b>{C.REVEAL.offer.proofRest}</>
          : C.REVEAL.offer.proofNoGuar}
      </p>
      <a
        className="u2-cta"
        href={CTA_HREF}
        onClick={sticky ? trackUjrakezdesStickyClick : trackUjrakezdesOfferClick}
      >
        {C.REVEAL.offer.cta(intro)}
      </a>
      <p className="u2-renew">{C.REVEAL.offer.renew(weekStd)}</p>
    </>
  );
}

/** B6 / rail: the two rhythm cards. Information, not buttons (handoff Q2). */
function RevealRhythm({ month, annual, perMonth, weeklyMonthly }: {
  month: string; annual: string; perMonth: string; weeklyMonthly: string;
}) {
  return (
    <div className="u2-rhythm">
      <p className="u2-label">{C.REVEAL.entry.rhythmTitle}</p>
      <div className="u2-price2">
        <div className="on"><b>{month}</b><span>{C.REVEAL.entry.monthTag}</span></div>
        <div><b>{annual}</b><span>{C.REVEAL.entry.annualTag(perMonth, annualSavingsPct())}</span></div>
      </div>
      <p className="u2-xs">{C.REVEAL.entry.same}</p>
      <p className="u2-honesty">
        <b>{C.REVEAL.entry.honestyLead}</b>{C.REVEAL.entry.honesty(weeklyMonthly, month)}
      </p>
      <p className="u2-xs">{C.REVEAL.entry.later}</p>
    </div>
  );
}

/** M2 · a number that counts up to its value in ~700ms. Tabular numerals keep
 *  the width steady; reduced-motion renders the final value immediately. */
function Count({ to }: { to: number }) {
  // The node is driven directly rather than through state: the effect then
  // only touches an external system (the DOM), and the SERVER render already
  // contains the final value - no-JS and reduced-motion both simply keep it.
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = String(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      el.textContent = String(Math.round(to * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span ref={ref}>{to}</span>;
}

/** The numeric tiles for the two questions whose answers are quantities. */
const NUM_TILE: Record<string, string> = {
  "2": "2", "3": "3", "4": "4",
};

/** The seven questions, keyed by step, so the render can stay one branch. */
const QUESTION: Record<StepId, { hd: string; micro?: string; options: C.Choice<string>[] }> = {
  anchor: C.Q_ANCHOR as never,
  level: C.Q_LEVEL as never,
  days: C.Q_DAYS as never,
  focus: C.Q_FOCUS as never,
  care: C.Q_CARE as never,
  place: C.Q_PLACE as never,
  daypart: C.Q_DAYPART as never,
};

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
