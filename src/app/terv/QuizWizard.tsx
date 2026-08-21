"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./terv.css";
import * as C from "./quiz-copy";
import { calories, steps } from "@/lib/quiz/calc";
import { recommend, resolve } from "@/lib/quiz/recommend";
import { canSubmit, normalizeFirstName, validateEmail, validateFirstName } from "@/lib/quiz/validate";
import type { QuizProgram } from "@/lib/quiz/catalog.server";
import {
  trackQuizStart, trackQuizStep, trackQuizEmailView, trackQuizLead,
  trackQuizResultView, trackQuizCtaClick,
} from "@/lib/track";
import type {
  QuizAnswers, Goal, Sex, AgeBand, DailyMove, StepsNow,
  TrainingNow, LifeStage, SessionMin, Obstacle,
} from "@/lib/quiz/types";

// The quiz wizard (S0-S15).
//
// State model, deliberately simple: answers live in one object, the step is an
// index, and both are mirrored to sessionStorage so a refresh mid-funnel does
// not throw the filler back to the start. NOTHING reaches the server before the
// S14 submit - that is a privacy promise made in the copy and in the privacy
// policy, not an implementation detail, so there is no autosave anywhere here.

const STORE_KEY = "lexfit_quiz_v1";

type StepId =
  | "intro" | "goal" | "sex" | "age" | "move" | "stepsNow" | "training"
  | "fact" | "body" | "target" | "lifeStage" | "session" | "obstacle"
  | "loading" | "capture" | "result";

/** Screens that count toward the progress bar (S1-S12 in the spec). */
const QUESTION_STEPS: StepId[] = [
  "goal", "sex", "age", "move", "stepsNow", "training",
  "fact", "body", "target", "lifeStage", "session", "obstacle",
];

type Draft = Partial<QuizAnswers>;

export default function QuizWizard({ programs }: { programs: Record<string, QuizProgram> }) {
  const [step, setStep] = useState<StepId>("intro");
  const [a, setA] = useState<Draft>({});
  const [lead, setLead] = useState({ firstName: "", email: "" });
  const [hydrated, setHydrated] = useState(false);

  // Restore once on mount. Failure is non-fatal: Safari private mode throws on
  // storage access, and a quiz that refuses to start is worse than a lost draft.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw) as { a?: Draft; step?: StepId };
        if (d.a) setA(d.a);
        // Never resume INTO a terminal screen - those depend on a submit that
        // did not survive the refresh.
        if (d.step && d.step !== "result" && d.step !== "loading") setStep(d.step);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ a, step })); } catch { /* ignore */ }
  }, [a, step, hydrated]);

  // Measurement lives here rather than in each screen, so a new screen cannot
  // be added without one. Only the screen id travels - never the answer.
  useEffect(() => {
    if (!hydrated) return;
    if (step === "capture") trackQuizEmailView();
    else if (step !== "intro" && step !== "result") trackQuizStep(step);
  }, [step, hydrated]);

  // ── Which screens actually apply to this filler ───────────────────────────
  //
  // Two screens are conditional. The spec skips the life-stage screen when the
  // filter would leave only "none" - after D5 that can no longer happen, since
  // desk strain applies to everyone, but the guard stays so the rule survives a
  // future option change.
  const stageOptions = useMemo(() => lifeStageOptions(a.sex, a.age_band), [a.sex, a.age_band]);

  const applies = useCallback(
    (s: StepId): boolean => {
      if (s === "target") return a.goal === "fat_loss";
      if (s === "lifeStage") return stageOptions.length > 1;
      return true;
    },
    [a.goal, stageOptions.length],
  );

  const order = useMemo<StepId[]>(
    () => (["intro", ...QUESTION_STEPS, "loading", "capture", "result"] as StepId[]).filter(applies),
    [applies],
  );

  const idx = order.indexOf(step);
  const go = useCallback(
    (dir: 1 | -1) => {
      const next = order[idx + dir];
      if (next) setStep(next);
    },
    [order, idx],
  );

  // Progress counts SKIPPED screens too, so the bar never jumps backwards when
  // a conditional screen drops out (spec §3).
  const qDone = QUESTION_STEPS.filter((s) => order.indexOf(s) !== -1 && order.indexOf(s) < idx).length;
  const qTotal = QUESTION_STEPS.length;
  const pct = step === "intro" ? 0 : idx >= order.indexOf("loading") ? 1 : qDone / qTotal;

  /** Answer a single-select: record it and advance in one gesture (spec §3). */
  const pick = <K extends keyof QuizAnswers>(k: K, v: QuizAnswers[K]) => {
    setA((prev) => {
      const nextA = { ...prev, [k]: v };
      // Changing the goal away from fat-loss must not leave a stale target.
      if (k === "goal" && v !== "fat_loss") nextA.target_weight_kg = null;
      return nextA;
    });
    // Let the state commit before the screen changes, so the pressed state is
    // visible for a frame rather than being swallowed by the transition.
    requestAnimationFrame(() => go(1));
  };

  const complete = isComplete(a, order);
  const publishedSet = useMemo(() => new Set(Object.keys(programs)), [programs]);

  return (
    <div className="lxq">
      <header className="q-top">
        <div className="q-topline">
          <button className="q-back" onClick={() => go(-1)} hidden={idx <= 0 || step === "result"}>
            ← {C.NAV.back}
          </button>
          {step !== "intro" && step !== "result" && (
            <span className="q-count">{C.NAV.of(Math.min(qDone + 1, qTotal), qTotal)}</span>
          )}
        </div>
        <div className="q-bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${pct})` }} />
        </div>
      </header>

      <main className="q-main">
        <div className="q-screen" key={step}>
          {step === "intro" && <Intro onStart={() => { trackQuizStart(); go(1); }} />}

          {step === "goal" && <Single hd={C.Q_GOAL.hd} opts={C.Q_GOAL.options} sel={a.goal} on={(v: Goal) => pick("goal", v)} />}
          {step === "sex" && <Single hd={C.Q_SEX.hd} micro={C.Q_SEX.micro} opts={C.Q_SEX.options} sel={a.sex} on={(v: Sex) => pick("sex", v)} />}
          {step === "age" && <Single hd={C.Q_AGE.hd} opts={C.Q_AGE.options} sel={a.age_band} on={(v: AgeBand) => pick("age_band", v)} />}
          {step === "move" && <Single hd={C.Q_MOVE.hd} opts={C.Q_MOVE.options} sel={a.daily_move} on={(v: DailyMove) => pick("daily_move", v)} />}
          {step === "stepsNow" && <Single hd={C.Q_STEPS.hd} micro={C.Q_STEPS.micro} opts={C.Q_STEPS.options} sel={a.steps_now} on={(v: StepsNow) => pick("steps_now", v)} />}
          {step === "training" && <Single hd={C.Q_TRAINING.hd} micro={C.Q_TRAINING.micro} opts={C.Q_TRAINING.options} sel={a.training_now} on={(v: TrainingNow) => pick("training_now", v)} />}

          {step === "fact" && <Fact desk={a.daily_move === "desk"} onNext={() => go(1)} />}
          {step === "body" && <Body a={a} setA={setA} onNext={() => go(1)} />}
          {step === "target" && <Target a={a} setA={setA} onNext={() => go(1)} />}

          {step === "lifeStage" && (
            <Single hd={C.Q_LIFESTAGE.hd} opts={stageOptions} sel={a.life_stage} on={(v: LifeStage) => pick("life_stage", v)} />
          )}
          {step === "session" && <Single hd={C.Q_SESSION.hd} micro={C.Q_SESSION.micro} opts={C.Q_SESSION.options} sel={a.session_min} on={(v: SessionMin) => pick("session_min", v)} />}
          {step === "obstacle" && <Single hd={C.Q_OBSTACLE.hd} opts={C.Q_OBSTACLE.options} sel={a.obstacle} on={(v: Obstacle) => pick("obstacle", v)} />}

          {step === "loading" && <Loading onDone={() => go(1)} />}
          {step === "capture" && complete && (
            <Capture
              answers={complete}
              lead={lead}
              setLead={setLead}
              onDone={() => {
                // The program slug is catalogue content, not personal data -
                // safe to carry, and it is what makes the campaign report
                // which profile actually converts.
                trackQuizLead(resolve(recommend(complete), publishedSet).program);
                setStep("result");
              }}
            />
          )}
          {step === "result" && complete && (
            <Result answers={complete} firstName={lead.firstName} programs={programs} />
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Conditional-screen helpers ──────────────────────────────────────────────

/**
 * D5: the life-stage screen is no longer women-only. Everyone gets it, with the
 * options that can actually apply - a man sees the desk-strain option rather
 * than a screen that silently skips itself.
 */
function lifeStageOptions(sex?: Sex, age?: AgeBand): C.Choice<LifeStage>[] {
  const o: C.Choice<LifeStage>[] = [];
  if (sex === "female" && (age === "18_29" || age === "30_39" || age === "40_49")) {
    o.push({ value: "postpartum", label: C.Q_LIFESTAGE.options.postpartum });
  }
  if (sex === "female" && (age === "40_49" || age === "50_59")) {
    o.push({ value: "menopause", label: C.Q_LIFESTAGE.options.menopause });
  }
  o.push({ value: "desk_strain", label: C.Q_LIFESTAGE.options.desk_strain });
  o.push({ value: "none", label: C.Q_LIFESTAGE.options.none });
  return o;
}

/** Narrows the draft once every applicable screen has an answer. */
function isComplete(a: Draft, order: StepId[]): QuizAnswers | null {
  const needTarget = order.includes("target");
  const ok =
    a.goal && a.sex && a.age_band && a.daily_move && a.steps_now && a.training_now &&
    a.height_cm && a.weight_kg && a.session_min && a.obstacle &&
    (!needTarget || a.target_weight_kg != null);
  if (!ok) return null;
  return { ...a, life_stage: a.life_stage ?? "none" } as QuizAnswers;
}

// ─── Screens ─────────────────────────────────────────────────────────────────

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <>
      <span className="q-eyebrow">{C.INTRO.eyebrow}</span>
      <h1>{C.INTRO.headline}</h1>
      <p className="q-micro">{C.INTRO.sub}</p>
      <button className="q-cta" onClick={onStart}>{C.INTRO.cta}</button>
      <p className="q-fine" style={{ textAlign: "center" }}>{C.INTRO.micro}</p>
    </>
  );
}

function Single<T extends string>({
  hd, micro, opts, sel, on,
}: {
  hd: string; micro?: string; opts: C.Choice<T>[]; sel?: T; on: (v: T) => void;
}) {
  return (
    <>
      <h1>{hd}</h1>
      {micro && <p className="q-micro">{micro}</p>}
      <div className="q-opts">
        {opts.map((o) => (
          <button
            key={o.value}
            className="q-opt"
            aria-pressed={sel === o.value}
            onClick={() => on(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </>
  );
}

function Fact({ desk, onNext }: { desk: boolean; onNext: () => void }) {
  const f = desk ? C.INTERSTITIAL.A : C.INTERSTITIAL.B;
  return (
    <>
      <div className="q-fact">
        <span className="q-eyebrow">{f.hd}</span>
        <p className="big">{f.body}</p>
        <p>{f.tail}</p>
        <p className="q-src">{f.source}</p>
      </div>
      <button className="q-cta" onClick={onNext}>{C.INTERSTITIAL.cta}</button>
    </>
  );
}

function Body({
  a, setA, onNext,
}: { a: Draft; setA: (f: (p: Draft) => Draft) => void; onNext: () => void }) {
  const [h, setH] = useState(a.height_cm ? String(a.height_cm) : "");
  const [w, setW] = useState(a.weight_kg ? String(a.weight_kg) : "");
  const [touched, setTouched] = useState(false);

  const hOk = inRange(h, 120, 230);
  const wOk = inRange(w, 35, 250);

  const submit = () => {
    setTouched(true);
    if (!hOk || !wOk) return;
    setA((p) => ({ ...p, height_cm: Number(h), weight_kg: Number(w.replace(",", ".")) }));
    onNext();
  };

  return (
    <>
      <h1>{C.Q_BODY.hd}</h1>
      <p className="q-micro">{C.Q_BODY.micro}</p>
      <div className="q-fields">
        <div className={`q-field${touched && !hOk ? " bad" : ""}`}>
          <label htmlFor="q-h">{C.Q_BODY.heightLabel}</label>
          <input
            id="q-h" inputMode="numeric" autoComplete="off" placeholder="172"
            value={h} onChange={(e) => setH(e.target.value)}
          />
          {touched && !hOk && <p className="q-err">{C.Q_BODY.heightError}</p>}
        </div>
        <div className={`q-field${touched && !wOk ? " bad" : ""}`}>
          <label htmlFor="q-w">{C.Q_BODY.weightLabel}</label>
          <input
            id="q-w" inputMode="decimal" autoComplete="off" placeholder="78"
            value={w} onChange={(e) => setW(e.target.value)}
          />
          {touched && !wOk && <p className="q-err">{C.Q_BODY.weightError}</p>}
        </div>
      </div>
      <button className="q-cta" onClick={submit}>{C.Q_BODY.cta}</button>
    </>
  );
}

function Target({
  a, setA, onNext,
}: { a: Draft; setA: (f: (p: Draft) => Draft) => void; onNext: () => void }) {
  const [t, setT] = useState(a.target_weight_kg ? String(a.target_weight_kg) : "");
  const [touched, setTouched] = useState(false);
  const ok = inRange(t, 35, 250);
  const n = Number(t.replace(",", "."));
  // A soft nudge, never a block: the number is theirs to choose.
  const ambitious = ok && a.weight_kg != null && n < a.weight_kg * 0.6;

  const submit = () => {
    setTouched(true);
    if (!ok) return;
    setA((p) => ({ ...p, target_weight_kg: n }));
    onNext();
  };

  return (
    <>
      <h1>{C.Q_TARGET.hd}</h1>
      <div className="q-fields">
        <div className={`q-field${touched && !ok ? " bad" : ""}`}>
          <label htmlFor="q-t">{C.Q_TARGET.label}</label>
          <input
            id="q-t" inputMode="decimal" autoComplete="off" placeholder="68"
            value={t} onChange={(e) => setT(e.target.value)}
          />
          {touched && !ok && <p className="q-err">{C.Q_TARGET.error}</p>}
        </div>
      </div>
      {ambitious && <p className="q-warn">{C.Q_TARGET.ambitious}</p>}
      <button className="q-cta" onClick={submit}>{C.Q_TARGET.cta}</button>
    </>
  );
}

/**
 * The "building your plan" beat. 3.6s total, not the spec's 8-12: the beat is
 * there to make the personalisation legible, and past a few seconds it only
 * costs completions (docs/onboarding-personalization-plan.md - "never fake-long").
 * The maths already finished; this is honest framing, not a fake progress bar.
 */
function Loading({ onDone }: { onDone: () => void }) {
  const [lit, setLit] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { done.current(); return; }
    const timers = [
      setTimeout(() => setLit(1), 900),
      setTimeout(() => setLit(2), 1900),
      setTimeout(() => setLit(3), 2900),
      setTimeout(() => done.current(), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <h1>Összerakom a terved…</h1>
      <ul className="q-load">
        {C.LOADER.steps.map((s, i) => (
          <li key={s} className={i < lit ? "on" : ""}>
            <span className="q-tick">{i < lit ? "✓" : ""}</span>
            {s}
          </li>
        ))}
      </ul>
    </>
  );
}

function Capture({
  answers, lead, setLead, onDone,
}: {
  answers: QuizAnswers;
  lead: { firstName: string; email: string };
  setLead: (v: { firstName: string; email: string }) => void;
  onDone: () => void;
}) {
  const [health, setHealth] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [netError, setNetError] = useState(false);

  const nameErr = validateFirstName(lead.firstName);
  const mailErr = validateEmail(lead.email);
  const ready = canSubmit({ ...lead, consentHealth: health, consentMarketing: marketing });

  async function submit() {
    setTouched(true);
    if (!ready || busy) return;
    setBusy(true);
    setNetError(false);
    try {
      const res = await fetch("/api/quiz-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: lead.firstName,
          email: lead.email,
          consent_health: health,
          consent_marketing: marketing,
          answers,
          utm: readUtm(),
          hp_field: "",
        }),
      });
      // A 503 means the quiz is not switched on yet. The filler still earned
      // their result, so show it - only the lead is lost, and that is our
      // problem, not theirs.
      if (!res.ok && res.status !== 503) throw new Error(String(res.status));
      onDone();
    } catch {
      setNetError(true);
      setBusy(false);
    }
  }

  return (
    <>
      <h1>{C.CAPTURE.hd}</h1>
      <p className="q-micro">{C.CAPTURE.sub}</p>
      <div className="q-fields">
        <div className={`q-field${touched && nameErr ? " bad" : ""}`}>
          <input
            aria-label={C.CAPTURE.namePlaceholder}
            placeholder={C.CAPTURE.namePlaceholder}
            autoComplete="given-name"
            value={lead.firstName}
            onChange={(e) => setLead({ ...lead, firstName: e.target.value })}
          />
          {touched && nameErr && <p className="q-err">{C.CAPTURE.nameError}</p>}
        </div>
        <div className={`q-field${touched && mailErr ? " bad" : ""}`}>
          <input
            aria-label={C.CAPTURE.emailPlaceholder}
            placeholder={C.CAPTURE.emailPlaceholder}
            type="email" inputMode="email" autoComplete="email"
            value={lead.email}
            onChange={(e) => setLead({ ...lead, email: e.target.value })}
          />
          {touched && mailErr && <p className="q-err">{C.CAPTURE.emailError}</p>}
        </div>
      </div>

      {/* Two separate, unticked boxes. Not a style choice: the health one is
          the Art. 9 legal basis and must stand alone from the marketing one. */}
      <label className="q-consent">
        <input type="checkbox" checked={health} onChange={(e) => setHealth(e.target.checked)} />
        <span>
          {C.CAPTURE.consentHealth}{" "}
          <a href="/adatvedelem" target="_blank" rel="noreferrer">{C.CAPTURE.consentHealthLink}</a>
        </span>
      </label>
      <label className="q-consent">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
        <span>{C.CAPTURE.consentMarketing}</span>
      </label>

      {netError && <p className="q-err">{C.CAPTURE.networkError}</p>}
      <button className="q-cta" onClick={submit} disabled={!ready || busy}>
        {busy ? C.CAPTURE.ctaBusy : C.CAPTURE.cta}
      </button>
      <p className="q-fine" style={{ textAlign: "center" }}>{C.CAPTURE.micro}</p>
    </>
  );
}

function Result({
  answers, firstName, programs,
}: { answers: QuizAnswers; firstName: string; programs: Record<string, QuizProgram> }) {
  const cal = calories(answers);
  const st = steps(answers);
  const rec = resolve(recommend(answers), new Set(Object.keys(programs)));
  const prog = programs[rec.program];
  const bonus = rec.bonus ? programs[rec.bonus] : null;
  const next = rec.nextStep ? programs[rec.nextStep] : null;
  const name = normalizeFirstName(firstName);

  // Fires once per mount; the result screen is terminal, so there is no rerun.
  useEffect(() => { trackQuizResultView(rec.program); }, [rec.program]);

  // Exactly one calorie line renders (spec §7 R1).
  const calLine =
    cal.note === "maintain" ? C.RESULT.maintainLine
      : cal.note === "floor" ? C.RESULT.floorLine
        : cal.note === "pace" && cal.weeklyLossKg
          ? C.RESULT.paceLine(round2(cal.weeklyLossKg))
          : C.RESULT.goalLine[answers.goal] ?? "";

  const stepLine =
    st.note === "already_walker" ? C.RESULT.stepCopy.already_walker(st.target)
      : st.note === "two_stage" ? C.RESULT.stepCopy.two_stage(st.target, st.firstStage!)
        : st.note === "plus_1000" ? C.RESULT.stepCopy.plus_1000(st.target)
          : C.RESULT.stepCopy.easy();

  const modeLine = C.RESULT.copyMode[rec.copyMode];

  return (
    <div className="q-screen q-result">
      <h1>{name ? C.RESULT.lead(name) : C.RESULT.leadNoName}</h1>

      <section className="q-card">
        <h2>{C.RESULT.kcalHd}</h2>
        <div className="q-kcals">
          <div className="q-kcal">
            <span className="k">{C.RESULT.maintenanceLabel}</span>
            <span className="v">kb. {cal.maintenanceKcal.toLocaleString("hu-HU")}</span>
          </div>
          <span className="q-arrow" aria-hidden="true">→</span>
          <div className="q-kcal">
            <span className="k">{C.RESULT.goalLabel}</span>
            <span className="v">kb. {cal.goalKcal.toLocaleString("hu-HU")}</span>
          </div>
        </div>
        {calLine && <p>{calLine}</p>}
        {cal.fourWeekLossKg != null && <p>{C.RESULT.checkpointLine(cal.fourWeekLossKg)}</p>}
        <p className="q-fine">{C.RESULT.kcalFine}</p>
      </section>

      <section className="q-card">
        <h2>{C.RESULT.mirrorHd}</h2>
        <p>{C.RESULT.mirror[answers.training_now]}</p>
        <p className="q-fine">{C.RESULT.mirrorSource}</p>
      </section>

      {prog && (
        <section className="q-card">
          <h2>{C.RESULT.programHd}</h2>
          <p style={{ fontSize: 20, fontWeight: 300 }}>{prog.title}</p>
          {prog.synopsis && <p>{prog.synopsis}</p>}
          <p>{C.RESULT.obstacleLine[answers.obstacle]}</p>
          {modeLine && <p>{modeLine}</p>}
          {rec.jointFriendly && <p>{C.RESULT.jointFriendly}</p>}
          {rec.shortenNote && <p className="q-fine">{C.RESULT.shortenNote}</p>}
          {next && <p>{C.RESULT.nextStep(next.title)}</p>}
          {bonus && <p className="q-bonus">{C.RESULT.bonus(bonus.title)}</p>}
        </section>
      )}

      <section className="q-card">
        <h2>{C.RESULT.stepsHd}</h2>
        <p className="q-kcal">
          <span className="v">{st.target.toLocaleString("hu-HU")}</span>
        </p>
        <p className="q-fine">{C.RESULT.stepsNow(st.current)}</p>
        <div className="q-progline" aria-hidden="true">
          <i style={{ width: `${Math.min(100, (st.current / st.target) * 100)}%` }} />
        </div>
        <p>{stepLine}</p>
      </section>

      <p className="q-closer">{C.RESULT.closer}</p>
      <a
        className="q-cta"
        href="/register"
        style={{ display: "block", textAlign: "center", textDecoration: "none" }}
        onClick={() => trackQuizCtaClick(rec.program)}
      >
        {C.RESULT.cta}
      </a>
      <a className="q-link" href="/">{C.RESULT.secondary}</a>
      <p className="q-legal">
        {C.RESULT.disclaimer}
        {rec.medicalDisclaimer ? ` ${C.RESULT.postpartumDisclaimer}` : ""}
      </p>
    </div>
  );
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function inRange(raw: string, lo: number, hi: number): boolean {
  const n = Number(raw.replace(",", "."));
  return raw.trim() !== "" && Number.isFinite(n) && n >= lo && n <= hi;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Campaign attribution, read from the ad's landing URL. */
function readUtm(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const p = new URLSearchParams(window.location.search);
    for (const k of ["source", "medium", "campaign", "content", "term"]) {
      const v = p.get(`utm_${k}`);
      if (v) out[k] = v;
    }
  } catch { /* ignore */ }
  return out;
}
