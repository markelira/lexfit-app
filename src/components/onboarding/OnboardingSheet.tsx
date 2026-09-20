"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { STEP_OPTIONS, WEEK, type ChoiceOption } from "@/lib/onboarding-data";
import {
  BLANK_ONBOARDING,
  getOnboarding,
  saveOnboarding,
  setOnboardingAnswered,
  type OnboardingAnswers,
} from "@/lib/user";
import { trackSetupStep, trackSetupDone } from "@/lib/track";
import "./OnboardingSheet.css";

/**
 * Setup, run INSIDE the app (P1).
 *
 * A paying member used to be sent back out to /onboarding - a funnel whose
 * last steps ask for an account and a card they have already given. Worse, it
 * caught exactly the people most likely to be affected: the lead base is full
 * of accounts that started the funnel and stopped before the end, and buying
 * the programme does not fill in what they skipped.
 *
 * So the questions come to them. Same questions, same shared data
 * (`STEP_OPTIONS`), so the two surfaces cannot drift - only the chrome differs.
 * What is deliberately NOT here: height, weight and goal weight. They are
 * Art. 9 data with a twelve-month clock, the plan does not use them, and this
 * flow is not the place to start collecting them.
 *
 * Dismissible on purpose. Everything works without it - a programme buyer is
 * given a sensible default at purchase - so holding the app hostage over a
 * preference would be a tax on someone who has already paid. It asks again
 * next visit, and it remembers where they stopped.
 */

type StepId = "goal" | "focus" | "level" | "days" | "time" | "env" | "obstacle";

const STEPS: { id: StepId; hd: string; sub: string; multi?: boolean }[] = [
  { id: "goal", hd: "Mi a célod?", sub: "Ehhez igazítjuk, mit ajánlunk elsőként." },
  { id: "focus", hd: "Mire fókuszálnál?", sub: "Többet is választhatsz.", multi: true },
  { id: "level", hd: "Hol tartasz most?", sub: "Ettől függ, milyen nehézséggel indulunk." },
  { id: "days", hd: "Hány nap fér bele?", sub: "Ebből lesz a heted - bármikor átírhatod." },
  { id: "time", hd: "Mikor edzenél?", sub: "Ide időzítjük az emlékeztetőt, ha kérsz." },
  { id: "env", hd: "Van bármi, amire figyeljünk?", sub: "Többet is választhatsz.", multi: true },
  { id: "obstacle", hd: "Mi akasztott meg eddig?", sub: "Erre külön figyelünk majd." },
];

const DAY_CHOICES = [2, 3, 4];
/** The default weekday spread for a given count - spaced, not stacked. */
const SPREAD: Record<number, number[]> = { 2: [1, 4], 3: [1, 3, 5], 4: [1, 2, 4, 6] };

const LOCAL_KEY = "lx-setup-progress";

export function OnboardingSheet() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [saving, setSaving] = useState(false);
  const [a, setA] = useState<OnboardingAnswers>({ ...BLANK_ONBOARDING, days: 3, weekdays: [1, 3, 5] });
  const sheetRef = useRef<HTMLDivElement>(null);

  // Shown when nobody has actually answered. That covers two people: an
  // account that started the acquisition funnel and stopped, and a programme
  // buyer whose profile was DEFAULTED at purchase so the app would work from
  // the first second. The default is a working plan, not an answer - it is
  // recorded as `defaulted: true` precisely so this can tell them apart and
  // offer to replace it.
  useEffect(() => {
    if (!user) return;
    let active = true;
    getOnboarding(user.uid)
      .then((profile) => {
        const answered = profile != null && profile.completedAt != null && profile.defaulted !== true;
        if (!active || answered) return;
        // Start from whatever the default put there, so a buyer confirming
        // three days a week is confirming what they already have.
        if (profile) {
          setA((s) => ({
            ...s,
            days: typeof profile.days === "number" ? profile.days : s.days,
            weekdays: Array.isArray(profile.weekdays) && profile.weekdays.length
              ? (profile.weekdays as number[])
              : s.weekdays,
          }));
        }
        try {
          const raw = localStorage.getItem(LOCAL_KEY);
          if (raw) {
            const d = JSON.parse(raw) as { i?: number; a?: Partial<OnboardingAnswers> };
            if (d.a) setA((s) => ({ ...s, ...d.a }));
            if (typeof d.i === "number") setI(Math.max(0, Math.min(STEPS.length - 1, d.i)));
          }
        } catch { /* a corrupt draft is not worth a failed open */ }
        setOpen(true);
      })
      .catch(() => { /* never block the app on this */ });
    return () => { active = false; };
  }, [user]);

  // Remember where they stopped, so dismissing costs nothing.
  useEffect(() => {
    if (!open) return;
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ i, a })); } catch {}
  }, [open, i, a]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const step = STEPS[i];

  const finish = useCallback(async (answers: OnboardingAnswers) => {
    if (!user) return;
    setSaving(true);
    try {
      // `defaulted: false` is the point of the write: it is what stops this
      // sheet coming back, and what tells the rest of the app these answers
      // are a person's rather than a placeholder.
      await saveOnboarding(user.uid, answers);
      await setOnboardingAnswered(user.uid);
      try { localStorage.removeItem(LOCAL_KEY); } catch {}
      trackSetupDone();
      setOpen(false);
    } catch {
      setSaving(false);   // leave it open; the next tap retries
    }
  }, [user]);

  const advance = useCallback((next: OnboardingAnswers) => {
    trackSetupStep(STEPS[i].id);
    if (i < STEPS.length - 1) { setA(next); setI(i + 1); return; }
    setA(next);
    void finish(next);
  }, [i, finish]);

  const opts: ChoiceOption[] = useMemo(
    () => (step.id === "days" ? [] : (STEP_OPTIONS[step.id as keyof typeof STEP_OPTIONS] ?? [])),
    [step.id],
  );

  if (!open || !user) return null;

  const multiValue = (id: StepId): (string | number)[] =>
    id === "focus" ? a.focus : id === "env" ? a.env : [];

  const toggleMulti = (id: StepId, v: string | number) => {
    const cur = multiValue(id).map(String);
    const has = cur.includes(String(v));
    const next = has ? cur.filter((x) => x !== String(v)) : [...cur, String(v)];
    setA((s) => (id === "focus" ? { ...s, focus: next } : { ...s, env: next }));
  };

  const singleChosen = (id: StepId): string | number | null =>
    id === "goal" ? a.goal : id === "level" ? a.level : id === "time" ? a.time
      : id === "obstacle" ? a.obstacle : null;

  const chooseSingle = (id: StepId, v: string | number) => {
    const next: OnboardingAnswers = { ...a };
    if (id === "goal") next.goal = String(v);
    else if (id === "level") next.level = Number(v);
    else if (id === "time") next.time = String(v);
    else if (id === "obstacle") next.obstacle = String(v);
    // A single choice IS the answer, so it advances on the same tap. Making
    // someone confirm a radio button is a tap that buys nothing.
    advance(next);
  };

  const canContinue =
    step.id === "days" ? a.weekdays.length > 0 : step.multi ? multiValue(step.id).length > 0 : true;

  return (
    <div className="lxob" role="presentation">
      <div
        className="lxob-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lxob-hd"
        ref={sheetRef}
      >
        <div className="lxob-top">
          <button
            type="button"
            className="lxob-back"
            onClick={() => setI((n) => Math.max(0, n - 1))}
            disabled={i === 0}
            aria-label="Vissza"
          >
            <LxIcon d={lxPaths.chevronLeft} size={16} sw={2.2} />
          </button>
          <div className="lxob-dots" aria-hidden="true">
            {STEPS.map((s, n) => (
              <span key={s.id} className={n <= i ? "on" : ""} />
            ))}
          </div>
          <button type="button" className="lxob-later" onClick={() => setOpen(false)}>
            Később
          </button>
        </div>

        <div className="lxob-body">
          <p className="lxob-count">{i + 1} / {STEPS.length}</p>
          <h2 id="lxob-hd">{step.hd}</h2>
          <p className="lxob-sub">{step.sub}</p>

          {step.id === "days" ? (
            <>
              <div className="lxob-days" role="group" aria-label="Heti edzésnapok száma">
                {DAY_CHOICES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`lxob-day${a.days === d ? " on" : ""}`}
                    aria-pressed={a.days === d}
                    onClick={() => setA((s) => ({ ...s, days: d, weekdays: [...SPREAD[d]] }))}
                  >
                    <strong>{d}</strong>
                    <span>nap</span>
                  </button>
                ))}
              </div>
              <p className="lxob-wdlabel">Mely napokon?</p>
              <div className="lxob-week" role="group" aria-label="Edzésnapok">
                {WEEK.map((w, n) => {
                  const wd = n + 1;
                  const on = a.weekdays.includes(wd);
                  return (
                    <button
                      key={w.d}
                      type="button"
                      className={`lxob-wd${on ? " on" : ""}`}
                      aria-pressed={on}
                      aria-label={w.d}
                      onClick={() =>
                        setA((s) => {
                          const next = on ? s.weekdays.filter((x) => x !== wd) : [...s.weekdays, wd];
                          return { ...s, weekdays: next.sort((x, y) => x - y), days: next.length || s.days };
                        })
                      }
                    >
                      {w.dd}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="lxob-opts" role={step.multi ? "group" : "radiogroup"}>
              {opts.map((o) => {
                const on = step.multi
                  ? multiValue(step.id).map(String).includes(String(o.v))
                  : String(singleChosen(step.id) ?? "") === String(o.v);
                return (
                  <button
                    key={String(o.v)}
                    type="button"
                    className={`lxob-opt${on ? " on" : ""}`}
                    role={step.multi ? "checkbox" : "radio"}
                    aria-checked={on}
                    onClick={() =>
                      step.multi ? toggleMulti(step.id, o.v) : chooseSingle(step.id, o.v)
                    }
                  >
                    {o.ic && <span className="ic" aria-hidden="true">{o.ic}</span>}
                    {o.flames != null && (
                      <span className="ic" aria-hidden="true">{"🔥".repeat(o.flames)}</span>
                    )}
                    <span className="tx">
                      <strong>{o.b}</strong>
                      {o.s && <em>{o.s}</em>}
                    </span>
                    <span className="mk" aria-hidden="true">
                      {on && <LxIcon d={lxPaths.check} size={12} sw={2.8} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Single-choice steps advance on the tap, so the footer only exists
            where a choice genuinely is not finished yet. */}
        {(step.multi || step.id === "days") && (
          <div className="lxob-foot">
            <button
              type="button"
              className="lxob-cta"
              disabled={!canContinue || saving}
              onClick={() => advance(a)}
            >
              {saving ? "Mentés…" : i === STEPS.length - 1 ? "Kész" : "Tovább"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
