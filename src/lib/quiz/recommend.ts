// Lead magnet quiz - O2, the program recommender.
//
// TWO SOURCES OF TRUTH, deliberately split (owner decision D4):
//   - WHICH program a profile maps to        → this file (a marketing decision)
//   - whether that program EXISTS and its    → Firestore `programs`, read at
//     name/description                          render time (`status: published`)
//
// So the tree below names real prod slugs, never invented codes, and every
// branch is re-checked against the live catalogue by `resolve()`. Publishing a
// program in /admin is therefore enough to redirect traffic to it - no deploy.
// (That is exactly what the spec's T7 acceptance test asks for.)
//
// `primary` records the IDEAL target even when it is not built yet. After a few
// weeks the primary/fallback split shows which unbuilt program has the most
// demand - that is the input to the next content decision (spec §9).

import type { QuizAnswers, Goal } from "./types";

/** Slugs that exist in production today (verified 2026-08-21). */
export const SLUG = {
  ELSO_LEPES: "elsolepes",
  START: "foundation",              // display title: "Lexfit Start"
  TARTAS: "tartasjavito",
  LAB_FENEK: "5naposlabfenekchallange",
  HAS_TORZS: "5naposhasmelytorzschallange",
  NAPINDITO: "napindito",
  NAPZARO: "napzaro",
} as const;

/**
 * Programs the spec wants but which do not exist yet. They are never returned
 * as a recommendation - only recorded as `primary`, so demand is measurable.
 */
export const PLANNED = {
  ANYA: "planned:anya-ujrakezdes",
  VALTOZOKOR: "planned:valtozokor-ero",
  OTTHONI_ERO: "planned:otthoni-ero",
  IROASZTAL: "planned:iroasztal-ellenszer",
} as const;

/**
 * "And once you're done?" - a marketing narrative, not content data, so it
 * lives here rather than in the program model (owner decision, §9.2).
 * `resolve()` drops the chain if the target is not published.
 */
const NEXT_STEP: Record<string, string> = {
  [SLUG.ELSO_LEPES]: SLUG.START,
  [SLUG.TARTAS]: SLUG.START,
};

/** Which rule fired - carried into analytics so the tree can be tuned. */
export type Rule = "life_stage" | "super_beginner" | "goal";

/** Copy modifiers the result page applies on top of the program's own synopsis. */
export type CopyMode = "gentle_postpartum" | "menopause" | "strength" | "desk" | "none";

export interface Recommendation {
  /** The ideal target - MAY be a PLANNED slug that does not exist yet. */
  primary: string;
  /** What we actually show. Always a real, published slug after `resolve()`. */
  program: string;
  bonus: string;
  nextStep: string | null;
  rule: Rule;
  copyMode: CopyMode;
  fallbackUsed: boolean;
  /** Medical-clearance disclaimer is mandatory when true. */
  medicalDisclaimer: boolean;
  /** Add the "joint-friendly" qualifier (spec §11.1: older + absolute beginner). */
  jointFriendly: boolean;
  /** True when the program's typical session outruns the filler's time budget. */
  shortenNote: boolean;
}

// ─── Bonus mini-programme ────────────────────────────────────────────────────
//
// D5: chosen by GOAL, never by sex. The spec's original rules 3-4 split
// Legs&Glutes vs Core by male/female; that gendered body-part stereotype is
// gone now that the product is no longer women-first.

function pickBonus(a: QuizAnswers): string {
  if (a.obstacle === "no_motivation") return SLUG.NAPINDITO;
  if (a.goal === "restart") return SLUG.NAPZARO;
  if (a.goal === "fat_loss" || a.goal === "tone") return SLUG.LAB_FENEK;
  if (a.goal === "strength") return SLUG.HAS_TORZS;
  return SLUG.NAPINDITO; // posture_energy
}

// ─── Main programme ──────────────────────────────────────────────────────────

const GOAL_TARGET: Record<Goal, { primary: string; real: string; copy: CopyMode }> = {
  fat_loss: { primary: SLUG.START, real: SLUG.START, copy: "none" },
  tone: { primary: SLUG.START, real: SLUG.START, copy: "none" },
  strength: { primary: PLANNED.OTTHONI_ERO, real: SLUG.START, copy: "strength" },
  posture_energy: { primary: PLANNED.IROASZTAL, real: SLUG.TARTAS, copy: "desk" },
  restart: { primary: SLUG.ELSO_LEPES, real: SLUG.ELSO_LEPES, copy: "none" },
};

/** Typical session length per program, for the "sessions can be shortened" note. */
const TYPICAL_MINS: Record<string, number> = {
  [SLUG.START]: 30, [SLUG.ELSO_LEPES]: 10, [SLUG.TARTAS]: 15,
};

/**
 * Runs the decision tree. The result may still name a PLANNED slug as
 * `primary` - call `resolve()` before rendering anything.
 */
export function recommend(a: QuizAnswers): Recommendation {
  const bonus = pickBonus(a);
  const timeBudget = a.session_min === "10_15" ? 15 : a.session_min === "20_30" ? 30 : 45;

  const base = {
    bonus,
    medicalDisclaimer: false,
    jointFriendly:
      a.training_now === "none" && (a.age_band === "50_59" || a.age_band === "60_plus"),
    shortenNote: false,
  };

  const finish = (r: Omit<Recommendation, "nextStep" | "shortenNote">): Recommendation => ({
    ...r,
    nextStep: NEXT_STEP[r.program] ?? null,
    shortenNote: (TYPICAL_MINS[r.program] ?? 0) > timeBudget,
  });

  // 1. LIFE STAGE - overrides everything.
  if (a.life_stage === "postpartum") {
    return finish({
      ...base,
      primary: PLANNED.ANYA,
      program: SLUG.ELSO_LEPES,
      rule: "life_stage",
      copyMode: "gentle_postpartum",
      fallbackUsed: true,
      medicalDisclaimer: true,
    });
  }

  // Menopause and desk-strain do NOT short-circuit: they only tag the copy and
  // let the goal-based branch pick the program (spec §5.3 rule 1, second line).
  const lifeCopy: CopyMode | null =
    a.life_stage === "menopause" &&
    (a.goal === "strength" || a.goal === "tone" || a.goal === "fat_loss")
      ? "menopause"
      : a.life_stage === "desk_strain"
        ? "desk"
        : null;
  const lifePrimary =
    lifeCopy === "menopause" ? PLANNED.VALTOZOKOR
      : lifeCopy === "desk" ? PLANNED.IROASZTAL
        : null;

  // 2. SUPER BEGINNER - never anything harder than the 7-day starter.
  if (a.training_now === "none" || a.goal === "restart") {
    return finish({
      ...base,
      primary: lifePrimary ?? SLUG.ELSO_LEPES,
      program: SLUG.ELSO_LEPES,
      rule: lifePrimary ? "life_stage" : "super_beginner",
      copyMode: lifeCopy ?? "none",
      fallbackUsed: lifePrimary != null,
    });
  }

  // 3. GOAL-BASED.
  const t = GOAL_TARGET[a.goal];
  const primary = lifePrimary ?? t.primary;
  return finish({
    ...base,
    primary,
    program: t.real,
    rule: lifePrimary ? "life_stage" : "goal",
    copyMode: lifeCopy ?? t.copy,
    fallbackUsed: primary !== t.real,
  });
}

// ─── Reality rule ────────────────────────────────────────────────────────────

/**
 * Enforces the spec's "reality rule": nothing that is not live may be named.
 * Every branch falls back to the entry program, and a dead next-step link is
 * dropped rather than shown. Call this with the slugs Firestore reports as
 * published - on a catalogue read failure pass the known-good set instead of
 * failing the page (the landing catalogue loader uses the same fail-safe).
 */
export function resolve(r: Recommendation, published: ReadonlySet<string>): Recommendation {
  const live = (slug: string, fallback: string) => (published.has(slug) ? slug : fallback);

  const program = live(r.program, SLUG.START);
  // The bonus is a gift, not a promise - if it is gone, show none at all.
  const bonus = published.has(r.bonus) ? r.bonus : "";
  const nextStep = r.nextStep && published.has(r.nextStep) ? r.nextStep : null;

  return {
    ...r,
    program,
    bonus,
    nextStep,
    fallbackUsed: r.fallbackUsed || program !== r.program,
  };
}
