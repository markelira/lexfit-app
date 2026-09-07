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

/** Q4 - minutes per session. */
export type Session = "10_15" | "20_30" | "30_plus";

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
  session: Session;
  care: Care[];
  place: Place;
  daypart: Daypart;
}

export const ANCHORS: readonly Anchor[] = ["restart", "careful", "no_energy", "stronger", "browsing"];
export const LEVELS: readonly Level[] = ["none", "rare", "weekly", "regular"];
export const DAYS: readonly Days[] = ["2", "3", "4", "flex"];
export const SESSIONS: readonly Session[] = ["10_15", "20_30", "30_plus"];
export const CARES: readonly Care[] = ["knee", "back", "quiet", "none"];
export const PLACES: readonly Place[] = ["living_room", "small", "varied"];
export const DAYPARTS: readonly Daypart[] = ["morning", "midday", "evening", "varies"];

/** The seven step ids, in order. Drives the progress dots and the URL. */
export const STEP_IDS = [
  "anchor", "level", "days", "session", "care", "place", "daypart",
] as const;
export type StepId = (typeof STEP_IDS)[number];
