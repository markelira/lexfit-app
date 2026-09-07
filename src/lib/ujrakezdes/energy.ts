import type { Days, Level } from "./types";

// The energy module - BMR → TDEE → daily target, macros, step goal, water.
//
// Ported from the szavazzmagadra calculator (app/src/lib/calculations.ts and
// app/src/data/exerciseData.ts). The equations, the tempo correction table and
// the step targets are reproduced exactly; only the plumbing differs.
//
// ── WHAT IS DELIBERATELY NOT PORTED ─────────────────────────────────────────
// Two pieces of the original are left out, and neither is an oversight:
//
//  - BMI and its category labels ("Túlsúlyos", "Elhízott"). Labelling somebody's
//    body from two numbers is the single most criticised pattern in this product
//    category, and it is not needed for a calorie target.
//  - `calculateGoalPlan` - the goal-weight projection ("X kg in Y weeks").
//    docs/onboarding-personalization-plan.md §6 lists weight-target projections
//    under AVOID on FTC-substantiation grounds: a week count is a performance
//    claim we would have to be able to prove.
//
// Neither was part of the request, which was the calorie target and the
// training recommendation.
//
// ── ACTIVITY IS NOT ASKED AGAIN ─────────────────────────────────────────────
// The original asks for an activity level outright. We already know it: Q2 is
// how much they move now and Q3 is how many days they will train. Deriving the
// multiplier from those is the actual integration - it is why this module needs
// four new fields instead of five, and every field removed from a form is
// conversion kept.

export type Sex = "female" | "male";
export type EnergyGoal = "fogyas" | "tonus" | "tomeg";
export type Tempo = "laza" | "kozepes" | "intenziv";

export const SEXES: readonly Sex[] = ["female", "male"];
export const ENERGY_GOALS: readonly EnergyGoal[] = ["fogyas", "tonus", "tomeg"];
export const TEMPOS: readonly Tempo[] = ["laza", "kozepes", "intenziv"];

/** The body block. Art. 9 data - see LM_HEALTH_FIELDS in lead.ts. */
export interface BodyInput {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goal: EnergyGoal;
  tempo: Tempo;
}

export const BODY_LIMITS = {
  age: [16, 99],
  heightCm: [120, 230],
  weightKg: [35, 250],
} as const;

// ── Activity ────────────────────────────────────────────────────────────────

/** Baseline from Q2 - how much they move now. */
const LEVEL_BASE: Record<Level, number> = {
  none: 1.2,
  rare: 1.325,
  weekly: 1.425,
  regular: 1.55,
};

/** What the training days they just chose add on top. `flex` resolves to 3,
 *  exactly as the plan does, so the two never disagree. */
const DAYS_BONUS: Record<Days, number> = { "2": 0, "3": 0.05, "4": 0.1, flex: 0.05 };

/** Clamped to the range the original's lookup tables actually cover. */
export function activityMultiplier(level: Level, days: Days): number {
  const raw = LEVEL_BASE[level] + DAYS_BONUS[days];
  return Math.min(1.725, Math.max(1.2, Math.round(raw * 1000) / 1000));
}

// ── BMR · TDEE ──────────────────────────────────────────────────────────────

/** Mifflin-St Jeor, as in the original. */
export function bmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "female" ? base - 161 : base + 5;
}

export const tdee = (bmrValue: number, activity: number): number => bmrValue * activity;

// ── Target calories ─────────────────────────────────────────────────────────

/** The original's correction table, reproduced value for value. */
const TEMPO_CORRECTION: Record<EnergyGoal, Record<Tempo, number>> = {
  fogyas: { laza: -250, kozepes: -400, intenziv: -600 },
  tonus:  { laza: 0,    kozepes: -150, intenziv: -300 },
  tomeg:  { laza: 150,  kozepes: 250,  intenziv: 400 },
};

export const tempoCorrection = (goal: EnergyGoal, tempo: Tempo): number =>
  TEMPO_CORRECTION[goal][tempo];

/**
 * The daily target.
 *
 * FLOORED, which the original does not do. An unclamped intensive deficit on a
 * small, sedentary body can land under 1200 kcal, and putting a number that low
 * in front of somebody unsupervised is not something this product should do.
 * The floor is applied per sex and is deliberately conservative.
 */
export const CALORIE_FLOOR: Record<Sex, number> = { female: 1200, male: 1500 };

export function targetCalories(
  tdeeValue: number, goal: EnergyGoal, tempo: Tempo, sex: Sex,
): { kcal: number; floored: boolean } {
  const raw = Math.round(tdeeValue + tempoCorrection(goal, tempo));
  const floor = CALORIE_FLOOR[sex];
  return raw < floor ? { kcal: floor, floored: true } : { kcal: raw, floored: false };
}

// ── Macros ──────────────────────────────────────────────────────────────────

export interface Macros { proteinG: number; carbsG: number; fatG: number; }

const PROTEIN_PER_KG: Record<EnergyGoal, number> = { fogyas: 2.0, tonus: 2.2, tomeg: 2.0 };

export function macros(weightKg: number, kcal: number, goal: EnergyGoal): Macros {
  const proteinG = weightKg * PROTEIN_PER_KG[goal];
  const fatG = (kcal * 0.25) / 9;
  const carbsG = Math.max(0, (kcal - proteinG * 4 - fatG * 9) / 4);
  return {
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
  };
}

// ── Steps · water ───────────────────────────────────────────────────────────

/** The original's step targets, by goal. */
const STEP_TARGET: Record<EnergyGoal, number> = { fogyas: 8000, tonus: 8000, tomeg: 6000 };
export const stepTarget = (goal: EnergyGoal): number => STEP_TARGET[goal];

/** Litres per day: 33 ml/kg plus an activity allowance, as in the original. */
export function waterLitres(weightKg: number, activity: number): number {
  const extra = activity <= 1.2 ? 0.3 : activity <= 1.375 ? 0.5 : 0.7;
  return Math.round((weightKg * 0.033 + extra) * 10) / 10;
}

// ── Orchestrator ────────────────────────────────────────────────────────────

export interface EnergyResult {
  /** Two LEXFIT programmes for the goal - the workout half of the original. */
  programs: WorkoutPick[];
  bmr: number;
  tdee: number;
  activity: number;
  kcal: number;
  floored: boolean;
  macros: Macros;
  stepTarget: number;
  waterLitres: number;
}

export function computeEnergy(body: BodyInput, level: Level, days: Days): EnergyResult {
  const activity = activityMultiplier(level, days);
  const b = bmr(body.sex, body.weightKg, body.heightCm, body.age);
  const t = tdee(b, activity);
  const { kcal, floored } = targetCalories(t, body.goal, body.tempo, body.sex);
  return {
    bmr: Math.round(b),
    tdee: Math.round(t),
    activity,
    kcal,
    floored,
    macros: macros(body.weightKg, kcal, body.goal),
    stepTarget: stepTarget(body.goal),
    waterLitres: waterLitres(body.weightKg, activity),
    programs: recommendPrograms(body.goal, level),
  };
}

// ── Validation ──────────────────────────────────────────────────────────────

const inRange = (v: unknown, lo: number, hi: number): number | null => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};

const IN = <T extends string>(vals: readonly T[]) => (v: unknown): v is T =>
  typeof v === "string" && (vals as readonly string[]).includes(v);

const isSex = IN<Sex>(SEXES);
const isGoal = IN<EnergyGoal>(ENERGY_GOALS);
const isTempo = IN<Tempo>(TEMPOS);

/** Parses the body block. Returns the field names that failed, never a partial. */
export function parseBody(raw: unknown): BodyInput | string[] {
  const b = (raw ?? {}) as Record<string, unknown>;
  const errs: string[] = [];

  const age = inRange(b.age, ...BODY_LIMITS.age);
  const heightCm = inRange(b.heightCm, ...BODY_LIMITS.heightCm);
  const weightKg = inRange(b.weightKg, ...BODY_LIMITS.weightKg);

  if (!isSex(b.sex)) errs.push("sex");
  if (age === null) errs.push("age");
  if (heightCm === null) errs.push("heightCm");
  if (weightKg === null) errs.push("weightKg");
  if (!isGoal(b.goal)) errs.push("goal");
  if (!isTempo(b.tempo)) errs.push("tempo");

  if (errs.length) return errs;
  return {
    sex: b.sex as Sex,
    age: age!,
    heightCm: heightCm!,
    weightKg: weightKg!,
    goal: b.goal as EnergyGoal,
    tempo: b.tempo as Tempo,
  };
}

// ── The workout half ────────────────────────────────────────────────────────
//
// The source pairs its calorie target with `getExerciseRecommendation`, which
// returns a weekly session count, a step goal and four lines of training
// advice. Two of those three could not be ported as they stand:
//
//  1. THE SESSION COUNT IS NOT REPEATED. The source would tell a sedentary
//     person to train 4-5 times a week; the plan they were just shown says 2, 3
//     or 4, because that is what they chose. Two numbers for the same question
//     is worse than one, so the count always comes from the plan and this
//     module never restates it.
//
//  2. THE TRAINING ADVICE IS RE-POINTED AT LEXFIT. The source recommends
//     resistance bands, dumbbells and HIIT circuits. LEXFIT's whole promise is
//     "elég egy matrac" - repeating that advice would sell equipment the
//     product does not use and the ad did not mention. So the recommendation
//     names real programmes from the catalogue instead, which is also the
//     honest bridge from a free calculator to the thing being sold.
//
// The step goal ports unchanged; it is the one output that was already ours.

/** Canonical programme names. Kept in sync with PRICING_BAND.included by the
 *  selftest, so a rename on the offer surfaces cannot leave this stale. */
export const PROGRAM = {
  START: "LEXFIT Start",
  KEZDO: "7 napos kezdő",
  REGGELI: "Reggeli rutinok",
  ESTI: "Esti rutinok",
  TARTAS: "Tartásjavító",
  HAS: "Has & Mély Törzs",
  LAB: "Láb & Fenék",
} as const;

export type ProgramName = (typeof PROGRAM)[keyof typeof PROGRAM];

export interface WorkoutPick {
  program: ProgramName;
  why: string;
}

/**
 * Two programmes for the goal, in the order they should be started.
 *
 * `level` decides the entry point rather than the goal does: somebody starting
 * from nothing gets the 7-day beginner programme first whatever they picked,
 * because the fastest way to lose a beginner is to open with the hardest thing
 * on the shelf.
 */
export function recommendPrograms(goal: EnergyGoal, level: Level): WorkoutPick[] {
  const opener: WorkoutPick =
    level === "none"
      ? { program: PROGRAM.KEZDO, why: "Hét rövid nap, hogy meglegyen a lendület." }
      : { program: PROGRAM.START, why: "A gerincprogram — 30 vezetett edzés, a te tempódban." };

  const second: WorkoutPick =
    goal === "fogyas"
      ? { program: PROGRAM.LAB, why: "Nagy izomcsoportok, több energia egy edzés alatt." }
      : goal === "tonus"
        ? { program: PROGRAM.HAS, why: "Törzserő — ez tartja meg a formát a többi edzésben." }
        : { program: PROGRAM.TARTAS, why: "Stabil váll és csípő, hogy bírja a terhelést." };

  // Never recommend the same thing twice: a beginner's opener is the 7-day
  // programme, so LEXFIT Start becomes their second step rather than a repeat.
  if (opener.program === PROGRAM.KEZDO && second.program === PROGRAM.START) return [opener];
  return level === "none"
    ? [opener, { program: PROGRAM.START, why: "Utána ez viszi tovább, 30 edzésen át." }]
    : [opener, second];
}
