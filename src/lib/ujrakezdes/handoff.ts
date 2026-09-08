import { writeDraft, type DraftAnswers } from "@/lib/onboarding-draft";
import { trainingDays } from "./plan";
import type { Answers } from "./types";

// The reveal → /register handoff.
//
// The reveal's CTAs skip the join wizard's seven questions and land straight on
// the plan picker (`/register?q=plan`). That is only honest if the answers the
// person already gave in THIS quiz travel with them - otherwise the skip
// silently produces an account with no preferences, and the app they paid for
// knows less about them than the funnel did.
//
// So the quiz's answers are translated into the wizard's own draft (the same
// localStorage document the wizard writes for itself), and the wizard's
// `initialAnswers()` picks them up at mount exactly as if the questions had
// been answered there.
//
// TRANSLATION RULES. Every mapping below is meaning-for-meaning, and anything
// without an honest counterpart maps to null/omitted rather than to a guess:
// the quiz's `place` (hol fogsz mozogni) has no onboarding equivalent and is
// dropped; `browsing` claims no goal; `varies` claims no time of day.

/** goal ← anchor. `browsing` deliberately maps to nothing. */
const GOAL: Record<Answers["anchor"], string | null> = {
  restart: "vissza",    // „Visszatérni a mozgáshoz"
  careful: "tartas",    // „Jobb tartás, kevesebb fájdalom"
  no_energy: "szokas",  // „Napi mozgás-szokás" - a rendszer hiányzik, nem az erő
  stronger: "ero",      // „Erősebb, energikusabb test"
  browsing: null,
};

/** obstacle ← anchor, only where the answer genuinely says what stopped them. */
const OBSTACLE: Record<Answers["anchor"], string | null> = {
  restart: "motiv",     // „Elfogyott a lendület" - a restart implies it died before
  careful: "serules",   // „Fájdalom vagy sérülés"
  no_energy: null,
  stronger: null,
  browsing: null,
};

/** level (1-3) ← the quiz's four activity bands. */
const LEVEL: Record<Answers["level"], number> = {
  none: 1, rare: 1, weekly: 2, regular: 3,
};

/** focus ids match except the upper body, which the wizard calls `kar`. */
const FOCUS: Record<Answers["focus"], string> = {
  fenek: "fenek", core: "core", felso: "kar", tartas: "tartas", teljes: "teljes",
};

const TIME: Record<Answers["daypart"], string | null> = {
  morning: "reggel", midday: "napkozben", evening: "este", varies: null,
};

/** env ← care. The wizard's env step IS the care question („Van bármi, amire
 *  figyeljek?"), so this is the one place the two funnels ask the same thing
 *  with different ids. `fal` has no quiz counterpart and is never claimed. */
const ENV: Record<Answers["care"][number], string> = {
  knee: "terd", back: "hat", quiet: "csendes", none: "none",
};

/** The wizard's `plan` step index in its STEPS array - where a resumed visit
 *  should land. The wizard does not export STEPS; if its shape changes, the
 *  cost is a resume one step off, never a crash (readDraft clamps). */
export const PLAN_STEP_IDX = 10;

/** Pure translation, so the selftest can pin every rule. */
export function onboardingDraftFromQuiz(a: Answers): DraftAnswers {
  const flexible = a.days === "flex";
  const env = a.care.map((c) => ENV[c]).filter(Boolean);
  return {
    goal: GOAL[a.anchor],
    level: LEVEL[a.level],
    focus: [FOCUS[a.focus]],
    days: flexible ? 3 : Number(a.days),
    // The same weekday derivation the quiz's own plan used - the plan they saw
    // and the plan the app schedules must be the same week.
    weekdays: flexible ? [] : [...trainingDays(a.days)],
    flexible,
    time: TIME[a.daypart],
    env: env.length ? env : ["none"],
    obstacle: OBSTACLE[a.anchor],
    motiv: "",
  };
}

/** Write the handoff draft. Called from the reveal's CTAs, synchronously,
 *  before navigation - localStorage writes complete before the page unloads. */
export function writeQuizHandoff(a: Answers): void {
  writeDraft({
    v: 1,
    idx: PLAN_STEP_IDX,
    answers: onboardingDraftFromQuiz(a),
    startedAt: Date.now(),
  });
}
