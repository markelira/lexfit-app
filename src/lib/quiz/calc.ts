// Lead magnet quiz - O1 (calories) and O3 (step goal).
//
// Pure and dependency-free: the client renders from it instantly, and the API
// route re-runs it server-side to reject a tampered payload (spec §8.1). Both
// sides MUST get the same numbers, which is why every intermediate value stays
// unrounded and only the displayed figures are rounded.
//
// Verified by scripts/quiz-selftest.ts (T1-T11 from the spec's §14 table).

import {
  AGE_OF, STEPS_MID_OF,
  type QuizAnswers, type Goal, type Sex,
} from "./types";

// ─── Rounding ────────────────────────────────────────────────────────────────
//
// HARD RULE (spec §5.218): exact halves round UP, always. Math.round() already
// does this for positives, but several languages round half-to-even, so the
// intent is spelled out rather than inherited - a platform swap must not move
// a displayed number.

/** Nearest 50, halves up. */
export const round50 = (x: number): number => Math.floor(x / 50 + 0.5) * 50;
/** Nearest 500, halves up. */
export const round500 = (x: number): number => Math.floor(x / 500 + 0.5) * 500;
/** Nearest 0.05, halves up - the weekly-loss figure. */
export const round005 = (x: number): number => Math.floor(x / 0.05 + 0.5) * 0.05;

// ─── O1: maintenance and goal calories ───────────────────────────────────────

/** Mifflin-St Jeor. `age` is the band's midpoint, not a real age. */
export function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

const MOVE_ADJ = { desk: 0, mixed: 0.05, active: 0.1 } as const;
const STEPS_ADJ = { lt4k: 0, "4_7k": 0.05, "7_10k": 0.1, "10k_plus": 0.15 } as const;
const TRAIN_ADJ = { none: 0, sometimes: 0.05, regular: 0.12 } as const;

/**
 * Additive activity multiplier (spec §5.1/2). Theoretical max is 1.57, so no
 * upper clamp is needed. Kept as a float - rounding here would shift calories.
 */
export function activityMultiplier(a: QuizAnswers): number {
  return 1.2 + MOVE_ADJ[a.daily_move] + STEPS_ADJ[a.steps_now] + TRAIN_ADJ[a.training_now];
}

const GOAL_FACTOR: Record<Goal, number> = {
  fat_loss: 0.85, tone: 0.93, strength: 1.08, posture_energy: 1.0, restart: 1.0,
};

/** Absolute floor per sex - we never advise eating below this (spec §5.1/5). */
const FLOOR_OF: Record<Sex, number> = { female: 1200, male: 1500 };

/** Which copy branch the result page must render instead of the pace sentence. */
export type CalorieNote =
  | "pace"        // normal fat_loss: show the dynamic weekly-loss sentence
  | "maintain"    // target >= current weight: goal was overridden to maintenance
  | "floor"       // the safety floor bit; pace sentence is suppressed
  | "none";       // non-fat_loss goals: a fixed one-liner, no pace maths

export interface CalorieResult {
  maintenanceKcal: number;      // rounded, for display
  goalKcal: number;             // rounded, for display
  activityMultiplier: number;
  /** kg/week, rounded to 0.05. Null unless `note === "pace"`. */
  weeklyLossKg: number | null;
  /** kg after 4 weeks, rounded to 0.1. Null unless a valid target exists. */
  fourWeekLossKg: number | null;
  note: CalorieNote;
}

export function calories(a: QuizAnswers): CalorieResult {
  const mult = activityMultiplier(a);
  const maintenanceRaw = bmr(a.sex, a.weight_kg, a.height_cm, AGE_OF[a.age_band]) * mult;

  // Override (spec §5.1/4): a fat-loss goal with a target at or above the
  // current weight is not a deficit - it is maintenance, and says so.
  const overridden =
    a.goal === "fat_loss" && a.target_weight_kg != null && a.target_weight_kg >= a.weight_kg;
  const factor = overridden ? 1.0 : GOAL_FACTOR[a.goal];

  let goalRaw = maintenanceRaw * factor;
  let note: CalorieNote = overridden ? "maintain" : a.goal === "fat_loss" ? "pace" : "none";

  // Safety floor (spec §5.1/5), two branches. (b) exists because clamping a
  // tiny-frame result UP to the floor would put the goal ABOVE maintenance -
  // nonsense for a fat-loss goal. Machine edge-testing surfaced this (T11).
  const floor = FLOOR_OF[a.sex];
  if (goalRaw < floor) {
    goalRaw = maintenanceRaw <= floor ? maintenanceRaw : floor;
    note = "floor";
  }

  const deficit = maintenanceRaw - goalRaw;
  // 7700 kcal ~ 1 kg of fat. Only meaningful while an actual deficit exists.
  const weeklyLossKg = note === "pace" ? round005((deficit * 7) / 7700) : null;

  const hasRealTarget =
    a.goal === "fat_loss" && a.target_weight_kg != null && a.target_weight_kg < a.weight_kg;
  const fourWeekLossKg =
    weeklyLossKg != null && hasRealTarget ? Math.round(4 * weeklyLossKg * 10) / 10 : null;

  return {
    maintenanceKcal: round50(maintenanceRaw),
    goalKcal: round50(goalRaw),
    activityMultiplier: mult,
    weeklyLossKg,
    fourWeekLossKg,
    note,
  };
}

// ─── O3: daily step goal ─────────────────────────────────────────────────────

const STEP_BAND: Record<Goal, { min: number; max: number }> = {
  fat_loss: { min: 8000, max: 10000 },
  tone: { min: 7000, max: 9000 },
  strength: { min: 6000, max: 8000 },
  posture_energy: { min: 7000, max: 9000 },
  restart: { min: 6000, max: 8000 },
};

/** Which of the four copy branches the result page renders (spec §5.2). */
export type StepNote = "already_walker" | "two_stage" | "plus_1000" | "easy";

export interface StepResult {
  current: number;          // the band midpoint we assumed
  target: number;
  note: StepNote;
  /** First milestone for the two-stage branch; null otherwise. */
  firstStage: number | null;
}

export function steps(a: QuizAnswers): StepResult {
  const current = STEPS_MID_OF[a.steps_now];
  const band = STEP_BAND[a.goal];

  // Already at or past the band: hold, don't push.
  if (current >= band.max) {
    return { current, target: round500(current), note: "already_walker", firstStage: null };
  }

  const target = round500(Math.min(Math.max(current + 2000, band.min), band.max));
  const gap = target - current;

  // Exactly one branch runs, checked in this order (spec §5.2 table).
  if (gap >= 4000) {
    return { current, target, note: "two_stage", firstStage: round500(current + 2000) };
  }
  if (gap >= 2000) return { current, target, note: "plus_1000", firstStage: null };
  return { current, target, note: "easy", firstStage: null };
}
