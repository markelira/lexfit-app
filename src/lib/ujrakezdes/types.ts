// Lead magnet v2 ("Szeptemberi újrakezdés") - the seven answers.
//
// A deliberately smaller set than the v3.0 quiz behind /terv. There is no sex,
// no age, no height, no weight, no target weight and no calorie arithmetic
// here, and that is the point: offer v3 hard rule 2 forbids weight-loss
// vocabulary and body-transformation promises, and the cheapest way to keep a
// funnel honest is to never collect the numbers that tempt you to break it.
//
// Q5 (`care`) is the one health-adjacent field. It is stored under the same
// 12-month Art. 9 clock as the older quiz's body metrics - see
// docs/lead-magnet-v2-plan.md §4.

/** Q1 - the anchor. Doubles as the segment tag that picks the D3 postscript. */
export type Anchor = "restart" | "careful" | "no_energy" | "stronger" | "browsing";

/** Q2 - how much they move now. */
export type Level = "none" | "rare" | "weekly" | "regular";

/** Q3 - days per week. `flex` is a real answer, not a refusal to answer. */
export type Days = "2" | "3" | "4" | "flex";

/**
 * Q4 - where they want to get stronger.
 *
 * REPLACED the old "how long is a session" question, which asked about a
 * control this product does not have: the Start programme's sessions are ~30
 * minutes, fixed (18 of the seeded workouts are 30, three are 32). Offering
 * 10-15 implied we would hand somebody a twelve-minute Foundation workout, and
 * the reveal duly printed "12'" next to a thirty-minute video.
 * docs/onboarding-personalization-plan.md lists session length under
 * "Deliberately NOT adding" for exactly this reason.
 *
 * These values map onto the real library themes and the real programmes, so the
 * answer can actually change what somebody is shown.
 */
export type Focus = "fenek" | "core" | "felso" | "tartas" | "teljes";

/** Q5 - multi-select. `none` is exclusive: picking it clears the others. */
export type Care = "knee" | "back" | "quiet" | "none";

/** Q6 - where they will move. */
export type Place = "living_room" | "small" | "varied";

/** Q7 - the realistic part of the day. */
export type Daypart = "morning" | "midday" | "evening" | "varies";

export interface Answers {
  anchor: Anchor;
  level: Level;
  days: Days;
  focus: Focus;
  care: Care[];
  place: Place;
  daypart: Daypart;
}

export const ANCHORS: readonly Anchor[] = ["restart", "careful", "no_energy", "stronger", "browsing"];
export const LEVELS: readonly Level[] = ["none", "rare", "weekly", "regular"];
export const DAYS: readonly Days[] = ["2", "3", "4", "flex"];
export const FOCUSES: readonly Focus[] = ["fenek", "core", "felso", "tartas", "teljes"];
export const CARES: readonly Care[] = ["knee", "back", "quiet", "none"];
export const PLACES: readonly Place[] = ["living_room", "small", "varied"];
export const DAYPARTS: readonly Daypart[] = ["morning", "midday", "evening", "varies"];

/** The seven step ids, in order. Drives the progress dots and the URL. */
export const STEP_IDS = [
  "anchor", "level", "days", "focus", "care", "place", "daypart",
] as const;
export type StepId = (typeof STEP_IDS)[number];
