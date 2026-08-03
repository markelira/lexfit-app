"use client";

import "./onbv2.css";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { saveOnboarding, hasOnboarded, type OnboardingAnswers, BLANK_ONBOARDING } from "@/lib/user";
import { paidDestination } from "@/lib/billing";
import { readDraft, writeDraft, clearDraft, type DraftAnswers } from "@/lib/onboarding-draft";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { StepFrame } from "@/components/onboarding/StepFrame";
import { OptionList } from "@/components/onboarding/OptionList";
import { Segmented } from "@/components/onboarding/Segmented";
import { Whisper } from "@/components/onboarding/Whisper";
import { FlameRating } from "@/components/onboarding/FlameRating";
import { WeekStrip } from "@/components/profile/WeekStrip";
import { DayPills } from "@/components/profile/DayPills";
import type { WeekCellState } from "@/lib/profile";
import { MOCK } from "./_mock";

// ─── The 8 pre-auth steps. URL: ?q=1…5 · why · reveal; welcome has no q. ───
const STEPS = ["welcome", "goal", "level", "days", "time", "env", "why", "reveal"] as const;
type StepId = (typeof STEPS)[number];
const Q_OF: Record<StepId, string | null> = {
  welcome: null, goal: "1", level: "2", days: "3", time: "4", env: "5", why: "why", reveal: "reveal",
};
const STEP_OF_Q: Record<string, StepId> = {
  "1": "goal", "2": "level", "3": "days", "4": "time", "5": "env", why: "why", reveal: "reveal",
};
// Question number for the counter/progress (goal=1 … env=5). Non-questions → 5.
const QUESTION_NO: Partial<Record<StepId, number>> = { goal: 1, level: 2, days: 3, time: 4, env: 5 };

// Per-step heading text (for the live-region announcement + counters).
const HEADINGS: Partial<Record<StepId, string>> = {
  goal: MOCK.goal.heading, level: MOCK.level.heading, days: MOCK.days.heading,
  time: MOCK.time.heading, env: MOCK.env.heading, why: MOCK.why.heading, reveal: MOCK.reveal.heading,
};

interface FunnelAnswers {
  goal: string | null;
  level: number | null;
  days: number;
  weekdays: number[];
  time: string | null;
  env: string[];
  why: string;
}
const INITIAL: FunnelAnswers = {
  goal: null, level: null, days: MOCK.days.recommended,
  weekdays: [...MOCK.days.defaults[MOCK.days.recommended]], time: null, env: [], why: "",
};

// FunnelAnswers ↔ the persisted draft (OnboardingAnswers-shaped, so it attaches
// verbatim on registration). `why` is stored under its canonical `motiv` field.
function draftFromFunnel(a: FunnelAnswers): DraftAnswers {
  return {
    goal: a.goal, level: a.level, days: a.days, weekdays: a.weekdays,
    time: a.time, env: a.env, motiv: a.why,
  };
}
function funnelFromDraft(a: DraftAnswers): FunnelAnswers {
  const days = a.days ?? INITIAL.days;
  return {
    goal: a.goal ?? null,
    level: a.level ?? null,
    days,
    weekdays: a.weekdays ?? [...(MOCK.days.defaults[days] ?? INITIAL.weekdays)],
    time: a.time ?? null,
    env: a.env ?? [],
    why: a.motiv ?? "",
  };
}
function initialAnswers(): FunnelAnswers {
  const d = readDraft();
  return d?.answers ? funnelFromDraft(d.answers) : INITIAL;
}

function stepFromUrl(): StepId {
  if (typeof window === "undefined") return "welcome";
  const q = new URLSearchParams(window.location.search).get("q");
  return (q && STEP_OF_Q[q]) || "welcome";
}

// The URL is the source of truth for the current step, so back/forward and
// refresh work from the first commit (41 §P1.3). Read it via an external store
// rather than effect-driven state: popstate covers browser nav; pushState is
// silent, so goto() dispatches NAV_EVENT to re-read.
const NAV_EVENT = "fnl:nav";
function subscribeNav(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(NAV_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(NAV_EVENT, cb);
  };
}

export function OnboardingV2() {
  const { user } = useAuth();
  const router = useRouter();
  const step = useSyncExternalStore(subscribeNav, stepFromUrl, () => "welcome" as StepId);
  const [answers, setAnswers] = useState<FunnelAnswers>(initialAnswers);
  const [saving, setSaving] = useState(false);
  const headingRef = useRef<HTMLLegendElement>(null);
  const revealHeadRef = useRef<HTMLHeadingElement>(null);
  const startedAtRef = useRef<number>(0); // stamped in the persist effect (post-render)
  const resumedRef = useRef(false);

  const goto = useCallback((next: StepId, replace = false) => {
    const q = Q_OF[next];
    const url = q ? `/onboarding?q=${q}` : "/onboarding";
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
    window.dispatchEvent(new Event(NAV_EVENT));
  }, []);

  // A signed-in user who already onboarded never re-enters the funnel (40 §40.8
  // / P3, path 5). Discard any stale local draft and route by entitlement: paid
  // → /app, unpaid → /subscribe (truth table auth_ready vs auth_unpaid).
  useEffect(() => {
    if (!user) return;
    let active = true;
    hasOnboarded(user.uid).then(async (done) => {
      if (!active || !done) return;
      clearDraft();
      const dest = await paidDestination(user.uid);
      if (active) router.replace(dest);
    });
    return () => {
      active = false;
    };
  }, [user, router]);

  // Resume once, on cold open: if a draft has a step past welcome and the URL is
  // at welcome, jump to where they left off (P3, path 2). goto() updates the URL
  // store, not React state — safe to call from an effect.
  useEffect(() => {
    if (resumedRef.current) return;
    resumedRef.current = true;
    const d = readDraft();
    if (d && d.idx > 0 && d.idx < STEPS.length && stepFromUrl() === "welcome") {
      goto(STEPS[d.idx], true);
    }
  }, [goto]);

  // Persist on every answer/step change past welcome (40 §40.8). Writing to
  // localStorage is an external-system sync, not React state.
  useEffect(() => {
    if (step === "welcome") return;
    if (startedAtRef.current === 0) startedAtRef.current = readDraft()?.startedAt ?? Date.now();
    writeDraft({
      v: 1,
      idx: STEPS.indexOf(step),
      answers: draftFromFunnel(answers),
      startedAt: startedAtRef.current,
    });
  }, [step, answers]);

  const idx = STEPS.indexOf(step);
  const go = (delta: number) => {
    const n = STEPS[Math.max(0, Math.min(STEPS.length - 1, idx + delta))];
    goto(n);
  };

  // Move focus to the step heading on change; announce politely (40 §40.12).
  useLayoutEffect(() => {
    const el = step === "reveal" ? revealHeadRef.current : headingRef.current;
    el?.focus();
  }, [step]);

  const set = <K extends keyof FunnelAnswers>(k: K, v: FunnelAnswers[K]) =>
    setAnswers((a) => ({ ...a, [k]: v }));

  const canNext = useMemo(() => {
    if (step === "goal") return answers.goal != null;
    if (step === "level") return answers.level != null;
    if (step === "days") return answers.weekdays.length >= 1;
    return true; // time/env/why are non-blocking
  }, [step, answers]);

  // Polite step-change announcement (40 §40.12) — reliable across screen readers
  // regardless of whether a focused <legend> is spoken.
  const liveLabel = useMemo(() => {
    if (step === "welcome") return "";
    const h = HEADINGS[step] ?? "";
    const no = QUESTION_NO[step];
    return no ? `${no}. kérdés az 5-ből. ${h}` : h;
  }, [step]);

  // Reveal summary, assembled from the user's own answers (O-RULE 05).
  const envPhrase = useMemo(() => {
    const real = answers.env.filter((e) => e !== "none");
    if (real.length === 0) return MOCK.envPhraseNone;
    if (real.length === 1) return MOCK.envPhrase[real[0]] ?? MOCK.envPhraseMany;
    return MOCK.envPhraseMany;
  }, [answers.env]);
  const weekSummary = `Heti ${answers.days} edzés · ${
    answers.time ? MOCK.timePhrase[answers.time] : "bármikor"
  } · ${envPhrase}`;

  const weekCells: { weekday: number; state: WeekCellState }[] = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        weekday: i + 1,
        state: (answers.weekdays.includes(i + 1) ? "todo" : "rest") as WeekCellState,
      })),
    [answers.weekdays],
  );

  // Reveal CTA. Anonymous (the funnel's normal state) → /register; the full
  // draft-attach-on-register wiring is P3 (41 §P3.2–P3.5). A signed-in visitor
  // (e.g. reviewing) → save + /app, preserving the current behaviour. Deferred
  // OnboardingAnswers fields stay blank.
  async function saveAndContinue() {
    if (!user) {
      router.push("/register");
      return;
    }
    setSaving(true);
    const payload: OnboardingAnswers = { ...BLANK_ONBOARDING, ...draftFromFunnel(answers) };
    try {
      await saveOnboarding(user.uid, payload);
      clearDraft();
      router.replace(await paidDestination(user.uid));
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="lx">
      <div className="fnl-stage">
        <div className="fnl-shell">
          <BrandAside welcome={step === "welcome"} />
          <div className="fnl-pane">
            <div className="fnl-sr" role="status" aria-live="polite">
              {liveLabel}
            </div>
            <MobileMark />
            {step === "welcome" && <Welcome onStart={() => goto("goal")} />}
            {QUESTION_NO[step] && (
              <QuestionStep
                key={step}
                step={step}
                answers={answers}
                set={set}
                weekCells={weekCells}
                onBack={() => go(-1)}
                onNext={() => go(1)}
                canNext={canNext}
                headingRef={headingRef}
              />
            )}
            {step === "why" && (
              <WhyStep
                value={answers.why}
                onChange={(v) => set("why", v)}
                onBack={() => go(-1)}
                onNext={() => go(1)}
                headingRef={headingRef}
              />
            )}
            {step === "reveal" && (
              <Reveal
                summary={weekSummary}
                weekCells={weekCells}
                saving={saving}
                onBack={() => go(-1)}
                onSave={saveAndContinue}
                headRef={revealHeadRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── The static brand panel (40 §40.6 — identical to auth, never moves). ──
function BrandAside({ welcome }: { welcome: boolean }) {
  const w = MOCK.welcome;
  return (
    <aside className="fnl-aside" aria-hidden={!welcome}>
      <span className="ring" aria-hidden="true" />
      <span className="ring two" aria-hidden="true" />
      <div className="wm">
        <span className="hash">
          <LxIcon d={lxPaths.dumbbell} size={16} />
        </span>
        LEXFIT
      </div>
      <div className="body">
        <div className="eyebrow mono">{w.eyebrow}</div>
        <h1 className="hero">{w.line1}</h1>
        <h1 className="hero soft">{w.line2}</h1>
        <p className="sub">{w.sub}</p>
      </div>
      <div className="proof">
        {w.stats.map((s) => (
          <div className="stat" key={s.l}>
            <b className="tabular">{s.n}</b>
            <span>{s.l}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function MobileMark() {
  return (
    <div className="fnl-mark" aria-hidden="true">
      <span className="hash">
        <LxIcon d={lxPaths.dumbbell} size={14} />
      </span>
      LEXFIT
    </div>
  );
}

// ── Step 01 — Üdvözlés ──
function Welcome({ onStart }: { onStart: () => void }) {
  const w = MOCK.welcome;
  return (
    <div className="fnl-main fnl fnl-welcome">
      <div className="fnl-scroll center">
        <div className="eyebrow mono">{w.eyebrow}</div>
        <h1 className="welcome-hd">
          {w.line1}
          <br />
          {w.line2}
        </h1>
        <p className="welcome-sub">{w.sub}</p>
      </div>
      <div className="fnl-foot">
        <button className="fnl-cta" onClick={onStart}>
          {w.cta}
        </button>
        <p className="fnl-alt">
          {w.loginPrompt}{" "}
          <a href="/login" className="link">
            {w.loginCta}
          </a>
        </p>
      </div>
    </div>
  );
}

// ── Steps 02–06 — the five questions ──
function QuestionStep({
  step, answers, set, weekCells, onBack, onNext, canNext, headingRef,
}: {
  step: StepId;
  answers: FunnelAnswers;
  set: <K extends keyof FunnelAnswers>(k: K, v: FunnelAnswers[K]) => void;
  weekCells: { weekday: number; state: WeekCellState }[];
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  headingRef: React.Ref<HTMLLegendElement>;
}) {
  const no = QUESTION_NO[step]!;
  const q =
    step === "goal" ? MOCK.goal : step === "level" ? MOCK.level : step === "days" ? MOCK.days
    : step === "time" ? MOCK.time : MOCK.env;

  return (
    <StepFrame
      onBack={onBack}
      progressCurrent={no}
      counter={`${no} / 5`}
      heading={q.heading}
      sub={q.sub}
      headingRef={headingRef}
      cta={
        <button className="fnl-cta" disabled={!canNext} onClick={onNext}>
          Tovább
        </button>
      }
    >
      {step === "goal" && (
        <OptionList
          ariaLabel={MOCK.goal.heading}
          items={MOCK.goal.options}
          value={answers.goal}
          onChange={(v) => set("goal", v as string | null)}
        />
      )}

      {step === "level" && (
        <OptionList
          ariaLabel={MOCK.level.heading}
          items={MOCK.level.options.map((o) => ({
            v: o.v,
            label: o.label,
            sub: o.sub,
            leading: <FlameRating n={o.flames as 1 | 2 | 3} />,
          }))}
          value={answers.level}
          onChange={(v) => set("level", v as number | null)}
        />
      )}

      {step === "days" && (
        <div className="fnl-days">
          <Segmented
            ariaLabel="Hány nap egy héten"
            options={MOCK.days.counts}
            value={answers.days}
            onChange={(v) => {
              set("days", v);
              set("weekdays", [...MOCK.days.defaults[v]]);
            }}
          />
          <p className={`fnl-reco${answers.days === MOCK.days.recommended ? " on" : ""}`}>
            {answers.days === MOCK.days.recommended
              ? `ajánlott · heti ${answers.days} edzés`
              : `heti ${answers.days} edzés`}
          </p>

          <div className="fnl-weekpick">
            <span className="lbl">{MOCK.days.weekdaysLabel}</span>
            <DayPills
              value={answers.weekdays}
              onChange={(v) => {
                set("weekdays", v);
                if (v.length >= 3 && v.length <= 6) set("days", v.length);
              }}
              ariaLabel={MOCK.days.weekdaysLabel}
            />
          </div>

          <div className="fnl-weekcard">
            <span className="wc-hd">{MOCK.days.weekHeading}</span>
            <WeekStrip week={weekCells} />
            <p className="wc-note">{MOCK.days.restNote}</p>
          </div>
        </div>
      )}

      {step === "time" && (
        <OptionList
          ariaLabel={MOCK.time.heading}
          items={MOCK.time.options}
          value={answers.time}
          onChange={(v) => set("time", v as string | null)}
        />
      )}

      {step === "env" && (
        <OptionList
          multi
          ariaLabel={MOCK.env.heading}
          items={MOCK.env.options}
          value={answers.env}
          exclusive={MOCK.env.exclusive}
          onChange={(v) => set("env", v as string[])}
        />
      )}
    </StepFrame>
  );
}

// ── Step 07 — Miért kezdted ──
function WhyStep({
  value, onChange, onBack, onNext, headingRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
  headingRef: React.Ref<HTMLLegendElement>;
}) {
  const w = MOCK.why;
  return (
    <StepFrame
      onBack={onBack}
      progressCurrent={5}
      counter="Kész"
      heading={w.heading}
      sub={w.sub}
      headingRef={headingRef}
      cta={
        <>
          <button className="fnl-cta" onClick={onNext}>
            {w.cta}
          </button>
          <button className="fnl-skip" onClick={onNext}>
            {w.skip}
          </button>
        </>
      }
    >
      <div className="fnl-why">
        <textarea
          className="fnl-textarea"
          value={value}
          maxLength={w.maxLength}
          placeholder={w.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-label={w.heading}
        />
        <div className="fnl-charcount mono tabular">
          {value.length} / {w.maxLength}
        </div>
        <Whisper>{w.whisper}</Whisper>
      </div>
    </StepFrame>
  );
}

// ── Step 08 — the reveal ──
function Reveal({
  summary, weekCells, saving, onBack, onSave, headRef,
}: {
  summary: string;
  weekCells: { weekday: number; state: WeekCellState }[];
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
  headRef: React.Ref<HTMLHeadingElement>;
}) {
  const r = MOCK.reveal;
  return (
    <div className="fnl-main fnl fnl-reveal">
      <div className="fnl-top">
        <button className="fnl-back hit44" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
      </div>
      <div className="fnl-scroll">
        <div className="eyebrow mono">{r.eyebrow}</div>
        <h1 className="reveal-hd" ref={headRef} tabIndex={-1}>
          {r.heading}
        </h1>

        <div className="fnl-weekcard">
          <WeekStrip week={weekCells} />
          <p className="wc-sum">{summary}</p>
        </div>

        <span className="reveal-wl mono">{r.workoutLabel}</span>
        <div className="fnl-workout">
          <div className="thumb">
            <span className="flag mono">{r.firstWorkout.flag}</span>
            <span className="dur mono tabular">{r.firstWorkout.duration}</span>
          </div>
          <div className="wtitle">{r.firstWorkout.title}</div>
        </div>

        <Whisper strong>{r.whisper}</Whisper>
      </div>
      <div className="fnl-foot">
        <button className="fnl-cta" onClick={onSave} disabled={saving}>
          {saving ? "Mentés…" : r.cta}
        </button>
      </div>
    </div>
  );
}
