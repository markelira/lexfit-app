// Lead magnet quiz - the answer shape and its enums.
//
// This is the MARKETING funnel's question set (docs/lexfit-kviz-MASTER-specifikacio.md),
// deliberately SEPARATE from the app's own onboarding answers (src/lib/user.ts).
// The two overlap on four questions but use different value sets; the mapping
// between them lives in ./handoff.ts, not here.
//
// Owner decisions baked in (docs/kviz-helyzetjelentes.md §7):
//   D5 - `life_stage` is gender-neutral (it shows for every sex, not just female)
//        and the bonus program is chosen by GOAL, never by sex.
//   D6 - the calorie output (O1) stays, so body metrics are collected.

export type Goal = "fat_loss" | "tone" | "strength" | "posture_energy" | "restart";
export type Sex = "male" | "female";
export type AgeBand = "18_29" | "30_39" | "40_49" | "50_59" | "60_plus";
export type DailyMove = "desk" | "mixed" | "active";
export type StepsNow = "lt4k" | "4_7k" | "7_10k" | "10k_plus";
export type TrainingNow = "none" | "sometimes" | "regular";
export type LifeStage = "postpartum" | "menopause" | "desk_strain" | "none";
export type SessionMin = "10_15" | "20_30" | "30_45";
export type Obstacle = "no_time" | "no_motivation" | "dont_know_how" | "gave_up" | "bad_experience";

export interface QuizAnswers {
  goal: Goal;
  sex: Sex;
  age_band: AgeBand;
  height_cm: number;
  weight_kg: number;
  /** Only asked when goal === "fat_loss"; null otherwise (spec §11.1). */
  target_weight_kg: number | null;
  daily_move: DailyMove;
  steps_now: StepsNow;
  training_now: TrainingNow;
  life_stage: LifeStage;
  session_min: SessionMin;
  obstacle: Obstacle;
}

// ─── Per-answer computation values (spec §4 tables) ──────────────────────────

/** Age used by the BMR formula - the midpoint of each band (spec S3). */
export const AGE_OF: Record<AgeBand, number> = {
  "18_29": 24, "30_39": 35, "40_49": 45, "50_59": 55, "60_plus": 63,
};

/** Assumed daily step count per band (spec S5). */
export const STEPS_MID_OF: Record<StepsNow, number> = {
  lt4k: 3000, "4_7k": 5500, "7_10k": 8500, "10k_plus": 11000,
};

/** Minutes a session may run, used only to tune copy (spec §5.3). */
export const SESSION_MINS_OF: Record<SessionMin, number> = {
  "10_15": 15, "20_30": 30, "30_45": 45,
};
