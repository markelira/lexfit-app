"use client";

import "@/app/login/auth.css"; // the wizard adopts the /login layout + design
import "./onbv2.css";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { hasOnboarded } from "@/lib/user";
import { paidDestination } from "@/lib/billing";
import { readDraft, writeDraft, clearDraft, type DraftAnswers } from "@/lib/onboarding-draft";
import { FIRST_WORKOUT } from "@/lib/foundation-preview";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perWeekHuf, annualSavingsPct } from "@/lib/pricing/display";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { StepFrame } from "@/components/onboarding/StepFrame";
import { PlanCard } from "@/components/onboarding/PlanCard";
import { EmbeddedPay } from "@/components/onboarding/EmbeddedPay";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { OptionList } from "@/components/onboarding/OptionList";
import { Segmented } from "@/components/onboarding/Segmented";
import { Whisper } from "@/components/onboarding/Whisper";
import { FlameRating } from "@/components/onboarding/FlameRating";
import { WeekStrip } from "@/components/profile/WeekStrip";
import type { WeekCellState } from "@/lib/profile";
import { MOCK } from "./_mock";

// ─── The wizard steps. URL: ?q=1…5 · why · reveal · plan · account · pay;
// welcome has no q. Onboarding is now part of one flow ending in payment
// (pay-to-join). (E1 — docs/onboarding-embedded-plan.md)
const STEPS = [
  "welcome", "goal", "level", "days", "time", "env", "why", "reveal", "plan", "account", "pay",
] as const;
type StepId = (typeof STEPS)[number];
const Q_OF: Record<StepId, string | null> = {
  welcome: null, goal: "1", level: "2", days: "3", time: "4", env: "5", why: "why",
  reveal: "reveal", plan: "plan", account: "account", pay: "pay",
};
const STEP_OF_Q: Record<string, StepId> = {
  "1": "goal", "2": "level", "3": "days", "4": "time", "5": "env", why: "why",
  reveal: "reveal", plan: "plan", account: "account", pay: "pay",
};
// Question number for the counter/progress (goal=1 … env=5). Non-questions → 5.
const QUESTION_NO: Partial<Record<StepId, number>> = { goal: 1, level: 2, days: 3, time: 4, env: 5 };
// Monday-first day letters for the week selector (wireframe).
const DAY_LETTERS = ["H", "K", "SZE", "CS", "P", "SZO", "V"];

// Per-step heading text (for the live-region announcement + counters).
const HEADINGS: Partial<Record<StepId, string>> = {
  goal: MOCK.goal.heading, level: MOCK.level.heading, days: MOCK.days.heading,
  time: MOCK.time.heading, env: MOCK.env.heading, why: MOCK.why.heading, reveal: "A terved kész",
  plan: "Válaszd ki, hogyan kezded", account: "Készítsd el a fiókod", pay: "Már csak egy lépés",
};

// ── The plan-picker offers (E1). Every figure from PRICES. Default is the
// low-friction weekly intro (deep-research wf_8fdc08c7-f57 — 490 Ft entry, not a
// bare full charge); annual keeps "best value" for high-intent buyers. ──
const FUNNEL_PLANS: {
  role: string; label: string; price: string; unit: string; terms: string; badge?: string;
}[] = [
  {
    role: "week_intro", label: "HETI", price: formatHuf(PRICES.week_intro.amountHuf), unit: "/ első 7 nap",
    terms: `Utána ${formatHuf(PRICES.week_std.amountHuf)} / hét · bármikor lemondható`,
    badge: "AJÁNLOTT INDULÁS",
  },
  {
    role: "month_std", label: "HAVI", price: formatHuf(PRICES.month_std.amountHuf), unit: "/ hó",
    terms: "Havonta automatikusan megújul",
  },
  {
    role: "annual_std", label: "ÉVES", price: formatHuf(perWeekHuf(PRICES.annual_std.amountHuf)), unit: "/ hét",
    terms: `${formatHuf(PRICES.annual_std.amountHuf)} / év · SPÓROLJ ${annualSavingsPct()}%`,
    badge: "LEGNÉPSZERŰBB",
  },
];
// One-off products removed from the funnel (user, 2026-08-03) — subscriptions only.

interface FunnelAnswers {
  goal: string | null;
  level: number | null;
  days: number;
  weekdays: number[];
  time: string | null;
  env: string[];
  why: string;
  plan: string; // chosen pricing role; default = the low-friction weekly intro (data-backed, E1)
}
const INITIAL: FunnelAnswers = {
  goal: null, level: null, days: MOCK.days.recommended,
  weekdays: [...MOCK.days.defaults[MOCK.days.recommended]], time: null, env: [], why: "",
  plan: "week_intro",
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
    plan: INITIAL.plan, // plan isn't persisted in the draft yet (E4 resume-at-pay)
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
  const headingRef = useRef<HTMLLegendElement>(null);
  const revealHeadRef = useRef<HTMLHeadingElement>(null);
  const sectionHeadRef = useRef<HTMLHeadingElement>(null); // plan / account / pay headings
  const startedAtRef = useRef<number>(0); // stamped in the persist effect (post-render)
  const resumedRef = useRef(false);

  const goto = useCallback((next: StepId, replace = false) => {
    const q = Q_OF[next];
    const url = q ? `/register?q=${q}` : "/register"; // the wizard lives at /register (E1.3)
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
    const el =
      step === "reveal" ? revealHeadRef.current
      : step === "plan" || step === "account" || step === "pay" ? sectionHeadRef.current
      : headingRef.current;
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

  return (
    <div className="lx authx fnl-wiz">
      <div className="authx-shell">
        <AuthBrand />
        <main className="fnl-col">
          <div className="fnl-sr" role="status" aria-live="polite">
            {liveLabel}
          </div>
          {/* each step IS the one 480px content column (header · body · action). */}
          {step === "welcome" && <Welcome onStart={() => goto("goal")} />}
            {QUESTION_NO[step] && (
              <QuestionStep
                key={step}
                step={step}
                answers={answers}
                set={set}
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
                goal={answers.goal}
                summary={weekSummary}
                weekCells={weekCells}
                onBack={() => go(-1)}
                onNext={() => goto("plan")}
                headRef={revealHeadRef}
              />
            )}
            {step === "plan" && (
              <PlanStep
                value={answers.plan}
                onChange={(role) => set("plan", role)}
                onBack={() => go(-1)}
                onNext={() => goto("account")}
                headRef={sectionHeadRef}
              />
            )}
            {step === "account" && (
              <AccountStep
                onBack={() => go(-1)}
                onNext={() => goto("pay")}
                headRef={sectionHeadRef}
              />
            )}
            {step === "pay" && (
              <PayStep
                plan={answers.plan}
                goal={answers.goal}
                onBack={() => go(-1)}
                headRef={sectionHeadRef}
              />
            )}
        </main>
      </div>
    </div>
  );
}

// (BrandAside + MobileMark removed — the wizard now uses the shared <AuthBrand/>
//  in the /login split-screen shell for exact consistency with /login.)

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
  step, answers, set, onBack, onNext, canNext, headingRef,
}: {
  step: StepId;
  answers: FunnelAnswers;
  set: <K extends keyof FunnelAnswers>(k: K, v: FunnelAnswers[K]) => void;
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  headingRef: React.Ref<HTMLLegendElement>;
}) {
  const no = QUESTION_NO[step]!;
  const q =
    step === "goal" ? MOCK.goal : step === "level" ? MOCK.level : step === "days" ? MOCK.days
    : step === "time" ? MOCK.time : MOCK.env;

  // Single-choice steps auto-advance after a brief highlight; multi-select /
  // free-text / the days compound wait for the "Tovább" button (user request).
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (advanceRef.current) clearTimeout(advanceRef.current); }, []);
  const pick = <K extends keyof FunnelAnswers>(k: K, v: FunnelAnswers[K] | null) => {
    set(k, v as FunnelAnswers[K]);
    if (advanceRef.current) clearTimeout(advanceRef.current);
    if (v != null) advanceRef.current = setTimeout(onNext, 240);
  };

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
          onChange={(v) => pick("goal", v as string | null)}
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
          onChange={(v) => pick("level", v as number | null)}
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

          {/* Week card — interactive check/moon day-boxes (wireframe 1:1); tap a
              day to toggle it work/rest (P0.3 weekday picking). */}
          <div className="fnl-weekcard">
            <span className="wc-hd mono">{MOCK.days.weekHeading}</span>
            <div className="fnl-week" role="group" aria-label={MOCK.days.weekdaysLabel}>
              {DAY_LETTERS.map((lb, i) => {
                const wd = i + 1;
                const on = answers.weekdays.includes(wd);
                return (
                  <button
                    key={wd}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${lb} — ${on ? "edzésnap" : "pihenőnap"}`}
                    className={`fnl-day${on ? " done" : " rest"}`}
                    onClick={() => {
                      const next = on
                        ? answers.weekdays.filter((x) => x !== wd)
                        : [...answers.weekdays, wd].sort((a, b) => a - b);
                      set("weekdays", next);
                      set("days", next.length);
                    }}
                  >
                    <span className="d">{lb}</span>
                    <span className="dot">
                      <LxIcon d={on ? lxPaths.check : lxPaths.moon} size={12} sw={on ? 2.8 : 2} />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="wc-note">{MOCK.days.restNote}</p>
          </div>
        </div>
      )}

      {step === "time" && (
        <OptionList
          ariaLabel={MOCK.time.heading}
          items={MOCK.time.options}
          value={answers.time}
          onChange={(v) => pick("time", v as string | null)}
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

// ── Step 08 — the reveal: a personalized PLAN WITH AN OUTCOME (research —
// docs). Goal-tied 3-beat arc (the payoff) → restated week (proof it's theirs)
// → first workout (concrete first step). CTA leads into plan selection. ──
const ARC_LABELS = ["1. hét", "Néhány hét", "A cél"];
function Reveal({
  goal, summary, weekCells, onBack, onNext, headRef,
}: {
  goal: string | null;
  summary: string;
  weekCells: { weekday: number; state: WeekCellState }[];
  onBack: () => void;
  onNext: () => void;
  headRef: React.Ref<HTMLHeadingElement>;
}) {
  const r = MOCK.reveal;
  const arc = r.outcomes[goal ?? "ero"] ?? r.outcomes.ero;
  const fw = FIRST_WORKOUT;
  return (
    <div className="fnl-main fnl fnl-reveal">
      <div className="fnl-top">
        <button className="fnl-back hit44" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
      </div>
      <div className="fnl-scroll">
        {/* The outcome (hero) — goal-tied headline + 3-beat progression. */}
        <div className="eyebrow mono">{r.eyebrow}</div>
        <h1 className="reveal-hd" ref={headRef} tabIndex={-1}>
          {arc.headline}
        </h1>
        <ol className="fnl-arc">
          {arc.beats.map((beat, i) => (
            <li key={i} className={`fnl-beat${i === arc.beats.length - 1 ? " goal" : ""}`}>
              <span className="node" aria-hidden="true" />
              <span className="ab-t mono">{ARC_LABELS[i]}</span>
              <span className="ab-x">{beat}</span>
            </li>
          ))}
        </ol>

        {/* Restated week — proof the plan is built from THEIR answers. */}
        <span className="reveal-wl mono">{r.weekLabel}</span>
        <div className="fnl-weekcard">
          <WeekStrip week={weekCells} />
          <p className="wc-sum">{summary}</p>
        </div>

        {/* The concrete first step — always F001. */}
        <span className="reveal-wl mono">{r.workoutLabel}</span>
        <div className="fnl-workout">
          <div className="thumb">
            <span className="flag mono">1. NAP</span>
            <span className="dur mono tabular">{fw.mins} PERC</span>
          </div>
          <div className="wtitle">Foundation · {fw.title}</div>
        </div>

        <Whisper strong>{r.whisper}</Whisper>
      </div>
      <div className="fnl-foot">
        <button className="fnl-cta" onClick={onNext}>
          {r.cta}
        </button>
      </div>
    </div>
  );
}

// ── Step 09 — plan picker (E1). Reuses PlanCard; default = weekly intro. One
// fixed CTA → account. Radiogroup semantics + arrow-key nav (a11y). ──
function PlanStep({
  value, onChange, onBack, onNext, headRef,
}: {
  value: string;
  onChange: (role: string) => void;
  onBack: () => void;
  onNext: () => void;
  headRef: React.Ref<HTMLHeadingElement>;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const rovingIdx = Math.max(0, FUNNEL_PLANS.findIndex((p) => p.role === value));
  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const n = FUNNEL_PLANS.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(FUNNEL_PLANS[next].role);
    groupRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next]?.focus();
  };
  return (
    <div className="fnl-main fnl">
      <div className="fnl-top">
        <button className="fnl-back" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
      </div>
      <div className="fnl-scroll">
        <h1 className="fnl-q" ref={headRef} tabIndex={-1}>Válaszd ki, hogyan kezded</h1>
        <p className="fnl-sub">Bármelyikkel ugyanaz a teljes hozzáférés. Bármikor lemondhatod.</p>
        <div className="fnl-plans" role="radiogroup" aria-label="Csomag" ref={groupRef}>
          {FUNNEL_PLANS.map((p, i) => (
            <PlanCard
              key={p.role}
              label={p.label}
              price={p.price}
              unit={p.unit}
              terms={p.terms}
              badge={p.badge}
              selected={value === p.role}
              onSelect={() => onChange(p.role)}
              tabIndex={i === rovingIdx ? 0 : -1}
              onKeyDown={onKeyDown(i)}
            />
          ))}
        </div>
      </div>
      <div className="fnl-foot">
        <button className="fnl-cta" onClick={onNext}>Tovább</button>
        <p className="fnl-alt">Bármikor lemondható · 14 napos pénzvisszafizetési garancia</p>
      </div>
    </div>
  );
}

// ── Step 10 — account (E1 STUB; E1.2 mounts the extracted <RegisterForm>). ──
function AccountStep({
  onBack, onNext, headRef,
}: {
  onBack: () => void;
  onNext: () => void;
  headRef: React.Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="fnl-main fnl">
      <div className="fnl-top">
        <button className="fnl-back" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
      </div>
      <div className="fnl-scroll">
        <h1 className="fnl-q" ref={headRef} tabIndex={-1}>Készítsd el a fiókod</h1>
        <p className="fnl-sub">A válaszaidat a fiókodhoz mentem — így bármikor folytathatod.</p>
        <RegisterForm onAuthed={onNext} />
      </div>
    </div>
  );
}

// ── Step 11 — pay: embedded Stripe Checkout. Repeats the user's goal outcome
// above checkout (research — surfacing the goal at the paywall lifts pay). ──
function PayStep({
  plan, goal, onBack, headRef,
}: {
  plan: string;
  goal: string | null;
  onBack: () => void;
  headRef: React.Ref<HTMLHeadingElement>;
}) {
  const chosen = FUNNEL_PLANS.find((p) => p.role === plan) ?? FUNNEL_PLANS[0];
  const outcome = MOCK.reveal.outcomes[goal ?? "ero"]?.headline;
  return (
    <div className="fnl-main fnl">
      <div className="fnl-top">
        <button className="fnl-back" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
      </div>
      <div className="fnl-scroll">
        <h1 className="fnl-q" ref={headRef} tabIndex={-1}>Már csak egy lépés</h1>
        {outcome && (
          <p className="fnl-paygoal">
            <span className="mono">Amit megnyitsz</span>
            <strong>{outcome}</strong>
          </p>
        )}
        <EmbeddedPay
          role={chosen.role}
          planLabel={chosen.label}
          planPrice={`${chosen.price} ${chosen.unit}`}
          planTerms={chosen.terms}
        />
      </div>
    </div>
  );
}
