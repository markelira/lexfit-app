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
import { EmbeddedPay } from "@/components/onboarding/EmbeddedPay";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BrandPanel } from "@/components/onboarding/BrandPanel";
import { OptionList } from "@/components/onboarding/OptionList";
import { Segmented } from "@/components/onboarding/Segmented";
import { Whisper } from "@/components/onboarding/Whisper";
import { FlameRating } from "@/components/onboarding/FlameRating";
import type { WeekCellState } from "@/lib/profile";
import { MOCK } from "./_mock";

// ─── The wizard steps. URL: ?q=1…5 · why · reveal · plan · account · pay;
// welcome has no q. Onboarding is now part of one flow ending in payment
// (pay-to-join). (E1 — docs/onboarding-embedded-plan.md)
const STEPS = [
  "welcome", "goal", "focus", "level", "days", "time", "env", "obstacle", "why",
  "reveal", "plan", "account", "pay",
] as const;
type StepId = (typeof STEPS)[number];
const Q_OF: Record<StepId, string | null> = {
  welcome: null, goal: "1", focus: "2", level: "3", days: "4", time: "5", env: "6",
  obstacle: "7", why: "why", reveal: "reveal", plan: "plan", account: "account", pay: "pay",
};
const STEP_OF_Q: Record<string, StepId> = {
  "1": "goal", "2": "focus", "3": "level", "4": "days", "5": "time", "6": "env",
  "7": "obstacle", why: "why", reveal: "reveal", plan: "plan", account: "account", pay: "pay",
};
// Question number for the counter/progress (goal=1 … obstacle=7). Non-questions → 7.
const QUESTION_NO: Partial<Record<StepId, number>> = {
  goal: 1, focus: 2, level: 3, days: 4, time: 5, env: 6, obstacle: 7,
};
const QUESTION_TOTAL = 7;
// Monday-first day letters for the week selector (wireframe).
const DAY_LETTERS = ["H", "K", "SZE", "CS", "P", "SZO", "V"];

// Per-step heading text (for the live-region announcement + counters).
const HEADINGS: Partial<Record<StepId, string>> = {
  goal: MOCK.goal.heading, focus: MOCK.focus.heading, level: MOCK.level.heading,
  days: MOCK.days.heading, time: MOCK.time.heading, env: MOCK.env.heading,
  obstacle: MOCK.obstacle.heading, why: MOCK.why.heading, reveal: "A terved kész",
  plan: "A teljes LEXFIT", account: "Készítsd el a fiókod", pay: "Már csak egy lépés",
};

// ── The subscription offer ("A teljes LEXFIT"), styled to the iOS-paywall
// reference (docs/LEXFIT Elofizetes iOS.html). Features + selectable plan rows +
// a tucked CTA showing the selected price. Our real figures; NO fixed-length
// claims (owner rule — no "8 hetes / 40 edzés / 5.–8. hét"). ──
// [0] is the hero USP (full-width, emphasised); [1..] are the 2-col chip grid.
// Grid subs are short so nothing wraps at half width (apple-design: hierarchy).
const PAYWALL_FEATURES: { icon: string | string[]; title: string; sub: string }[] = [
  { icon: lxPaths.calendarCheck, title: "Vezetett programok", sub: "Foundation és több — végigvezetve, a te tempódban" },
  { icon: lxPaths.layoutGrid, title: "Teljes videótár", sub: "200+ edzés" },
  { icon: lxPaths.users, title: "Heti kihívások", sub: "Szavazz Magadra" },
  { icon: lxPaths.chartColumn, title: "Haladáskövetés", sub: "hétről hétre" },
  { icon: lxPaths.house, title: "Otthon, bárhol", sub: "eszköz nélkül" },
];
// Reference-format plan rows (name · sub · big price · unit). Heti is the
// highlighted default — low-friction 490 Ft entry (deep-research: lead with the
// weekly intro). Annual keeps its "best value" in its subline. `cta` = the full
// billing summary for the button. One-offs excluded — subscriptions only.
const PAYWALL_PLANS: {
  role: string; name: string; sub: string; price: string; unit: string; badge?: string; cta: string;
}[] = [
  {
    role: "week_intro", name: "Heti",
    sub: `Első hét ${formatHuf(PRICES.week_intro.amountHuf)} · utána ${formatHuf(PRICES.week_std.amountHuf)} / hét`,
    price: formatHuf(PRICES.week_intro.amountHuf), unit: "első hét",
    badge: "Ajánlott indulás", cta: `${formatHuf(PRICES.week_intro.amountHuf)} · első hét`,
  },
  {
    role: "month_std", name: "Havi", sub: "Havonta megújul",
    price: formatHuf(PRICES.month_std.amountHuf), unit: "/ hó",
    cta: `${formatHuf(PRICES.month_std.amountHuf)} / hó`,
  },
  {
    role: "annual_std", name: "Éves",
    sub: `${formatHuf(PRICES.annual_std.amountHuf)} / év · −${annualSavingsPct()}% · a legjobb ár`,
    price: formatHuf(perWeekHuf(PRICES.annual_std.amountHuf)), unit: "/ hét",
    cta: `${formatHuf(PRICES.annual_std.amountHuf)} / év`,
  },
];

interface FunnelAnswers {
  goal: string | null;
  focus: string | null; // single primary focus area (persisted as OnboardingAnswers.focus[])
  level: number | null;
  days: number;
  weekdays: number[];
  time: string | null;
  env: string[];
  obstacle: string | null; // "what stopped you before"
  why: string;
  plan: string; // chosen pricing role; default = the low-friction weekly intro (data-backed, E1)
}
const INITIAL: FunnelAnswers = {
  goal: null, focus: null, level: null, days: MOCK.days.recommended,
  weekdays: [...MOCK.days.defaults[MOCK.days.recommended]], time: null, env: [],
  obstacle: null, why: "", plan: "week_intro", // highlighted default = Heti (low-friction 490)
};

// FunnelAnswers ↔ the persisted draft (OnboardingAnswers-shaped, so it attaches
// verbatim on registration). `why` is stored under its canonical `motiv` field.
function draftFromFunnel(a: FunnelAnswers): DraftAnswers {
  return {
    goal: a.goal, focus: a.focus ? [a.focus] : [], level: a.level, days: a.days,
    weekdays: a.weekdays, time: a.time, env: a.env, obstacle: a.obstacle, motiv: a.why,
  };
}
function funnelFromDraft(a: DraftAnswers): FunnelAnswers {
  const days = a.days ?? INITIAL.days;
  return {
    goal: a.goal ?? null,
    focus: a.focus?.[0] ?? null,
    level: a.level ?? null,
    days,
    weekdays: a.weekdays ?? [...(MOCK.days.defaults[days] ?? INITIAL.weekdays)],
    time: a.time ?? null,
    env: a.env ?? [],
    obstacle: a.obstacle ?? null,
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
    if (step === "focus") return answers.focus != null;
    if (step === "level") return answers.level != null;
    if (step === "days") return answers.weekdays.length >= 1;
    return true; // time/env/obstacle/why are non-blocking
  }, [step, answers]);

  // Polite step-change announcement (40 §40.12) — reliable across screen readers
  // regardless of whether a focused <legend> is spoken.
  const liveLabel = useMemo(() => {
    if (step === "welcome") return "";
    const h = HEADINGS[step] ?? "";
    const no = QUESTION_NO[step];
    return no ? `${no}. kérdés a ${QUESTION_TOTAL}-ből. ${h}` : h;
  }, [step]);

  // The reveal composes its summary from the user's own answers (O-RULE 05);
  // it reads `answers` directly, so nothing is pre-assembled here.
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
        <BrandPanel step={step} />
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
                a={answers}
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
                onPlanChange={(r) => set("plan", r)}
                onExit={() => router.push("/")}
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
    step === "goal" ? MOCK.goal
    : step === "focus" ? MOCK.focus
    : step === "level" ? MOCK.level
    : step === "days" ? MOCK.days
    : step === "time" ? MOCK.time
    : step === "env" ? MOCK.env
    : MOCK.obstacle;

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
      counter={`${no} / ${QUESTION_TOTAL}`}
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

      {step === "focus" && (
        <OptionList
          ariaLabel={MOCK.focus.heading}
          items={MOCK.focus.options}
          value={answers.focus}
          onChange={(v) => pick("focus", v as string | null)}
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

      {step === "obstacle" && (
        <OptionList
          ariaLabel={MOCK.obstacle.heading}
          items={MOCK.obstacle.options}
          value={answers.obstacle}
          onChange={(v) => pick("obstacle", v as string | null)}
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
      progressCurrent={QUESTION_TOTAL}
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

// ── Step 08 — the reveal. Apple-Fitness-style (skill: apple-design): the week
// ring is the signature; everything else stays quiet. A once-per-session
// "building your plan" moment (honest, reflects real inputs) materializes into
// the plan. Consumes every answer: ring=days, legend=weekdays, headline=goal,
// quote=why, coach line=obstacle, stat tiles=focus/level/time/env, pace=days.
// Motion is transform/opacity only; reduced-motion cross-fades (skill §11/§14). ──
const REVEAL_SEEN_KEY = "lx_reveal_built";
const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const revealSeen = () => {
  try { return sessionStorage.getItem(REVEAL_SEEN_KEY) === "1"; } catch { return false; }
};
const markRevealSeen = () => { try { sessionStorage.setItem(REVEAL_SEEN_KEY, "1"); } catch { /* private mode */ } };

// The activity ring — one green arc filled to days/7, the count in the centre.
// Draws on mount via CSS (stroke-dashoffset from a --c custom prop); structure
// is information — the arc IS the share of the week that is training.
function WeekRing({ days, size = 132 }: { days: number; size?: number }) {
  const stroke = 12;
  const rad = (size - stroke) / 2;
  const c = 2 * Math.PI * rad;
  const target = c * (1 - Math.max(0, Math.min(days, 7)) / 7);
  const half = size / 2;
  return (
    <div className="wr" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id="wr-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle className="wr-track" cx={half} cy={half} r={rad} strokeWidth={stroke} fill="none" />
        <circle
          className="wr-prog" cx={half} cy={half} r={rad} strokeWidth={stroke} fill="none"
          strokeLinecap="round" transform={`rotate(-90 ${half} ${half})`}
          style={{ "--c": `${c}px`, strokeDasharray: c, strokeDashoffset: target } as React.CSSProperties}
        />
      </svg>
      <div className="wr-c">
        <span className="wr-n tabular">{days}</span>
        <span className="wr-l mono">nap / hét</span>
      </div>
    </div>
  );
}

const LEGEND_LETTERS = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];
function WeekdayLegend({ cells }: { cells: { weekday: number; state: WeekCellState }[] }) {
  return (
    <div className="rv-legend" role="group" aria-label="Edzésnapok">
      {LEGEND_LETTERS.map((lb, i) => {
        const on = cells.find((cc) => cc.weekday === i + 1)?.state === "todo";
        return (
          <span key={i} className={`rv-ld${on ? " on" : ""}`} aria-label={`${lb} ${on ? "edzésnap" : "pihenő"}`}>
            {lb}
          </span>
        );
      })}
    </div>
  );
}

// The honest "building your plan" moment (research: labor illusion lifts perceived
// value; skill §11 — never fake-long). Status lines reflect real answers.
function BuildingPlan({ a, onDone }: { a: FunnelAnswers; onDone: () => void }) {
  const r = MOCK.reveal;
  const lines = useMemo(() => {
    const focus = a.focus ? r.focusPhrase[a.focus] : null;
    return [
      "Elemzem a válaszaidat",
      focus ? `Fókusz: ${focus}` : "Kiválasztom az edzéseidet",
      `Heti ${a.days} edzés összeáll`,
      "Kész",
    ];
  }, [a, r]);
  const [i, setI] = useState(0);
  useEffect(() => {
    const stepMs = 540;
    const iv = setInterval(() => setI((x) => (x < lines.length - 1 ? x + 1 : x)), stepMs);
    const done = setTimeout(onDone, stepMs * lines.length + 220);
    return () => { clearInterval(iv); clearTimeout(done); };
  }, [lines.length, onDone]);
  return (
    <div className="fnl-main fnl fnl-reveal fnl-building" aria-busy="true">
      <div className="fnl-buildwrap">
        <WeekRing days={a.days} />
        <div className="fnl-buildstatus" role="status" aria-live="polite">
          <span key={i} className="bs-line">{lines[i]}</span>
        </div>
        <div className="fnl-buildbar" aria-hidden="true">
          <span style={{ "--p": `${((i + 1) / lines.length) * 100}%` } as React.CSSProperties} />
        </div>
      </div>
    </div>
  );
}

function Reveal({
  a, weekCells, onBack, onNext, headRef,
}: {
  a: FunnelAnswers;
  weekCells: { weekday: number; state: WeekCellState }[];
  onBack: () => void;
  onNext: () => void;
  headRef: React.Ref<HTMLHeadingElement>;
}) {
  // Play the build moment once per session; reduced-motion skips straight in.
  const [built, setBuilt] = useState(() => prefersReducedMotion() || revealSeen());
  const finish = useCallback(() => { markRevealSeen(); setBuilt(true); }, []);
  if (!built) return <BuildingPlan a={a} onDone={finish} />;

  const r = MOCK.reveal;
  const headline = (r.outcomes[a.goal ?? "ero"] ?? r.outcomes.ero).headline;
  const fw = FIRST_WORKOUT;
  const why = a.why.trim();
  const obstacleLine = a.obstacle ? r.obstaclePhrase[a.obstacle] : null;

  // Stat tiles — every answer echoed back (Apple "summary" tiles). Only the
  // answers with a value render; days lives in the ring.
  const timeChip = MOCK.time.options.find((o) => o.v === a.time)?.label;
  const envReal = a.env.filter((e) => e !== "none");
  const envChip = envReal.length === 1 ? r.envChip[envReal[0]] : envReal.length > 1 ? r.envChipMany : null;
  const stats = [
    a.focus ? { k: "Fókusz", v: r.focusPhrase[a.focus] } : null,
    a.level ? { k: "Tempó", v: r.levelPhrase[a.level] } : null,
    timeChip ? { k: "Mikor", v: timeChip } : null,
    { k: "Figyelek", v: envChip ?? "Nincs külön kérés" },
  ].filter(Boolean) as { k: string; v: string }[];

  const paceLine = r.paceLine
    .replace("{days}", String(a.days))
    .replace("{sessions}", String(a.days * 4));

  return (
    <div className="fnl-main fnl fnl-reveal">
      <div className="fnl-top">
        <button className="fnl-back hit44" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
      </div>
      <div className="fnl-scroll rv2">
        {/* Hero — the ring is the signature; count = days/week, legend = which days. */}
        <div className="rv-hero">
          <div className="eyebrow mono">{r.eyebrow}</div>
          <WeekRing days={a.days} />
          <WeekdayLegend cells={weekCells} />
          <h1 className="reveal-hd" ref={headRef} tabIndex={-1}>{headline}</h1>
        </div>

        {/* Their own words, quoted back — the emotional anchor. */}
        {why && (
          <figure className="fnl-quote rv-i">
            <span className="fq-l mono">{r.whyLabel}</span>
            <blockquote>„{why}”</blockquote>
            <figcaption>— {r.whyEcho}</figcaption>
          </figure>
        )}

        {/* Alexa's reassurance for the obstacle they named. */}
        {obstacleLine && <p className="rv-coach rv-i">{obstacleLine}</p>}

        {/* Plan summary — stat tiles + honest, computed pace footer. */}
        <section className="rv-card rv-i" aria-label={r.chipsLabel}>
          <div className="rv-stats">
            {stats.map((s) => (
              <div className="rv-stat" key={s.k}>
                <span className="rv-k mono">{s.k}</span>
                <span className="rv-v">{s.v}</span>
              </div>
            ))}
          </div>
          <div className="rv-pace">
            <strong className="tabular">{paceLine}</strong>
            <span>{r.paceNote}</span>
          </div>
        </section>

        {/* The concrete first step — the material card (deliberate depth). */}
        <span className="reveal-wl mono rv-i">{r.workoutLabel}</span>
        <div className="fnl-workout rv-i">
          <div className="thumb">
            <span className="flag mono">1. NAP</span>
            <span className="dur mono tabular">{fw.mins} PERC</span>
          </div>
          <div className="wtitle">Foundation · {fw.title}</div>
        </div>

        <p className="reveal-social mono rv-i">{r.social}</p>
      </div>
      <div className="fnl-foot">
        <button className="fnl-cta" onClick={onNext}>{r.cta}</button>
      </div>
    </div>
  );
}

// The LEXFIT mark as a filled green tile (paywall header + reference LexMark).
function LexMark({ size = 56 }: { size?: number }) {
  return (
    <span className="pw-mark" style={{ width: size, height: size, borderRadius: size * 0.24 }}>
      <svg viewBox="0 0 680 616" width={size * 0.52} height={size * 0.47} aria-hidden="true">
        <g transform="translate(-192,-152)">
          <path d="M248 712A400 400 0 0 1 648 312" fill="none" stroke="#fff" strokeWidth="112" strokeLinecap="round" />
          <circle cx="800" cy="224" r="72" fill="#fff" />
        </g>
      </svg>
    </span>
  );
}

// A selectable plan row (reference PlanRow): radio/check · name+sub · price+unit.
function PlanRow({
  p, selected, onSelect, tabIndex, onKeyDown,
}: {
  p: (typeof PAYWALL_PLANS)[number];
  selected: boolean;
  onSelect: () => void;
  tabIndex: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button" role="radio" aria-checked={selected}
      className={`pw-plan${selected ? " on" : ""}`}
      onClick={onSelect} tabIndex={tabIndex} onKeyDown={onKeyDown}
    >
      {p.badge && <span className="pw-badge">{p.badge}</span>}
      <span className="pw-radio" aria-hidden="true">
        {selected && <LxIcon d={lxPaths.check} size={12} sw={2.6} />}
      </span>
      <span className="pw-pinfo">
        <span className="pw-pname">{p.name}</span>
        <span className="pw-psub">{p.sub}</span>
      </span>
      <span className="pw-pprice">
        <span className="pw-pnum tabular">{p.price}</span>
        <span className="pw-punit">{p.unit}</span>
      </span>
    </button>
  );
}

// ── Step 09 — the subscription offer ("A teljes LEXFIT"), redesigned to the
// iOS-paywall reference. Features + selectable plan rows + a tucked CTA with the
// selected price. CTA → account → embedded Stripe pay. ──
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
  const rovingIdx = Math.max(0, PAYWALL_PLANS.findIndex((p) => p.role === value));
  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const n = PAYWALL_PLANS.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(PAYWALL_PLANS[next].role);
    groupRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next]?.focus();
  };
  const sel = PAYWALL_PLANS.find((p) => p.role === value) ?? PAYWALL_PLANS[0];
  return (
    <div className="fnl-main fnl pw">
      <div className="fnl-top">
        <button className="fnl-back" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
      </div>
      <div className="fnl-scroll pw-scroll">
        <div className="pw-head">
          <LexMark size={46} />
          <h1 className="pw-title" ref={headRef} tabIndex={-1}>A teljes LEXFIT</h1>
          <p className="pw-sub">Egy előfizetés, minden funkció.</p>
        </div>
        <div className="pw-feats">
          <div className="pw-hero">
            <span className="pw-fic"><LxIcon d={PAYWALL_FEATURES[0].icon} size={20} /></span>
            <span className="pw-ftx"><b>{PAYWALL_FEATURES[0].title}</b><span>{PAYWALL_FEATURES[0].sub}</span></span>
          </div>
          <div className="pw-grid">
            {PAYWALL_FEATURES.slice(1).map((f) => (
              <div className="pw-tile" key={f.title}>
                <span className="pw-fic"><LxIcon d={f.icon} size={17} /></span>
                <span className="pw-ftx"><b>{f.title}</b><span>{f.sub}</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="pw-plans" role="radiogroup" aria-label="Csomag" ref={groupRef}>
          {PAYWALL_PLANS.map((p, i) => (
            <PlanRow
              key={p.role} p={p}
              selected={value === p.role}
              onSelect={() => onChange(p.role)}
              tabIndex={i === rovingIdx ? 0 : -1}
              onKeyDown={onKeyDown(i)}
            />
          ))}
        </div>
      </div>
      <div className="fnl-foot">
        <button className="fnl-cta" onClick={onNext}>Előfizetek — {sel.cta}</button>
        <p className="pw-fine">
          Az előfizetés automatikusan megújul, amíg le nem mondod. Bármikor lemondható · 14 napos pénzvisszafizetési garancia.
        </p>
        <div className="pw-links">
          <a href="/terms">Feltételek</a>
          <a href="/privacy">Adatvédelem</a>
        </div>
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
  plan, goal, onBack, onPlanChange, onExit, headRef,
}: {
  plan: string;
  goal: string | null;
  onBack: () => void;
  onPlanChange: (role: string) => void;
  onExit: () => void;
  headRef: React.Ref<HTMLHeadingElement>;
}) {
  const outcome = MOCK.reveal.outcomes[goal ?? "ero"]?.headline;
  return (
    <div className="fnl-main fnl">
      <div className="fnl-top">
        <button className="fnl-back" onClick={onBack} aria-label="Vissza">
          <LxIcon d={lxPaths.chevronLeft} size={18} />
        </button>
        <button className="fnl-later" onClick={onExit}>Később</button>
      </div>
      <div className="fnl-scroll">
        <h1 className="fnl-q" ref={headRef} tabIndex={-1}>Már csak egy lépés</h1>
        {outcome && (
          <p className="fnl-paygoal">
            <span className="mono">Amit megnyitsz</span>
            <strong>{outcome}</strong>
          </p>
        )}
        <EmbeddedPay plans={PAYWALL_PLANS} role={plan} onRoleChange={onPlanChange} />
      </div>
    </div>
  );
}
