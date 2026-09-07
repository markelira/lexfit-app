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
import { PricingBand } from "@/components/landing/PricingBand";
import EnergyResult from "./EnergyResult";
import ProgramPreview from "./ProgramPreview";
import PlanTray from "./PlanTray";
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
  /** The calculator's own questions, asked HERE rather than on the reveal. */
  | "body" | "goal" | "tempo"
  | "gate" | "reveal";

/** Screen order. The interstitial sits between Q4 and Q5 exactly as specced:
 *  the two forgiveness rules are stated BEFORE we ask about knees and backs, so
 *  the caution question lands as care rather than as a risk assessment. */
const CORE: Screen[] = [
  "anchor", "level", "days", "focus",
  "interstitial",
  "care", "place", "daypart",
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
    () => [...CORE, ...(skipCalc ? [] : CALC), "gate" as Screen, "reveal" as Screen],
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
    return (
      <main className="lxu">
        <div className="u-wrap u-stage" ref={stageRef} tabIndex={-1}>
          <h1 className="u-q">{C.REVEAL.hd}</h1>
          <p className="u-micro">{C.REVEAL.sub(plan.trainingCount, plan.sessionLabel)}</p>

          <div className="u-grid" role="list" aria-label="A heti terved">
            {plan.days.map((d, i) => (
              <div
                key={d.weekday}
                role="listitem"
                className={`u-day ${d.training ? "train" : "rest"}`}
                style={{ ["--i" as string]: i }}
              >
                <div className="u-dayname">{d.short}</div>
                <div className="u-daymin">{d.training ? `${d.minutes}′` : "—"}</div>
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
            <h2 className="u-vidh" id="u-alexavid">{C.REVEAL.alexaVideo.heading}</h2>
            <div className="u-video"><span className="u-dayname">videó</span></div>
            <p className="u-transcript">{C.REVEAL.alexaVideo.transcript}</p>
          </section>

          {/* What they are joining, before what it costs. */}
          <ProgramPreview catalog={catalog} onCta={() => { window.location.href = "/register"; }} />

          {C.ENERGY_LIVE && energy && (
            <EnergyResult
              result={energy}
              trainingCount={plan.trainingCount}
              goal={body.goal}
              tempo={body.tempo}
            />
          )}

          <div className="lxl u-offer" onClickCapture={trackUjrakezdesOfferClick}>
            <PricingBand surface="ujrakezdes" />
          </div>

          <p className="u-fine">{C.REVEAL.footer}</p>
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
        <BrandPanel step={BRAND_STEP[screen]} />

        <main className="fnl-col">
          <div className="fnl-sr" role="status" aria-live="polite">
            {qNum > 0 ? `${qNum}. kérdés a hétből` : ""}
          </div>

          {screen === "interstitial" && (
            <div className="fnl-main fnl u-inter-step">
              <div className="fnl-sheet">
                <div className="fnl-scroll center">
                  {C.INTERSTITIAL.lines.map((l) => (
                    <p key={l} className="u-inter-line">{l}</p>
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
              progressCurrent={7}
              counter={C.NAV.progress(7, STEP_IDS.length)}
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

          {/* ── The calculator's three questions, in the flow ─────────────
              They sit after the seven and before the gate, carry their own
              counter (the seven are genuinely done), and the first one can be
              skipped outright - Art. 9 consent has to be freely given, so the
              plan can never be made conditional on handing over body metrics. */}
          {CALC_NO[screen] && (
            <StepFrame
              onBack={back}
              progressCurrent={STEP_IDS.length}
              counter={`Kalkulátor · ${CALC_NO[screen]} / 3`}
              heading={
                screen === "body" ? C.ENERGY.card1
                  : screen === "goal" ? C.ENERGY.goalLabel
                  : C.ENERGY.tempoHeading
              }
              sub={
                screen === "body" ? C.ENERGY.formMicro
                  : screen === "tempo" && body.goal ? C.ENERGY.tempoLead[body.goal]
                  : undefined
              }
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
                </>
              )}

              {screen === "goal" && (
                <OptionList
                  ariaLabel={C.ENERGY.goalLabel}
                  value={body.goal || null}
                  onChange={(v) => {
                    if (v == null) return;
                    setBody((p) => ({ ...p, goal: v as EnergyGoal }));
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
              progressCurrent={qNum}
              counter={C.NAV.progress(qNum, STEP_IDS.length)}
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
                  onChange={(v) => { if (v != null) pick(screen as keyof Answers, v as never); }}
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
