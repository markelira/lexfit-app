import type { Answers, Care, Days } from "./types";

// Turning seven answers into the week the reveal draws.
//
// Pure, and deliberately small. The v2 spec promises "a heti tervedet,
// pihenőnapokkal" - not a periodised programme - so this decides two things
// only: WHICH days train, and HOW LONG a session runs. Everything else the
// reveal says is a restatement of an answer the person just gave, which is the
// honest kind of personalisation: it never claims to know more than it was
// told.
//
// The rest days are the feature, not the leftover. Offer v3's two rules - a
// rest day does not break the streak, a missed week does not reset - are the
// product's whole differentiator, so the grid renders rest days as first-class
// cells rather than gaps.

/** 1 = hétfő … 7 = vasárnap, matching the app's weekday convention. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WEEKDAY_SHORT = ["H", "K", "Sze", "Cs", "P", "Szo", "V"] as const;
export const WEEKDAY_FULL = [
  "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap",
] as const;

/**
 * How many training days a `days` answer means.
 *
 * `flex` resolves to 3. Someone who picked "ahogy jön" did not ask for less -
 * they asked not to be held to a number, and handing them an empty week would
 * read as the plan giving up. Three is the middle option and the one the
 * reveal can honestly call "a te tempódban".
 */
export const daysCount = (d: Days): 2 | 3 | 4 => (d === "flex" ? 3 : (Number(d) as 2 | 3 | 4));

/**
 * Which weekdays train. Spread as evenly as the count allows, always starting
 * Monday: the spec's own promise is "ma vagy hétfőn kezded, mindegy", and a
 * Monday-anchored grid is the one people recognise as a week.
 */
export function trainingDays(d: Days): Weekday[] {
  switch (daysCount(d)) {
    case 2: return [1, 4];
    case 4: return [1, 2, 4, 5];
    default: return [1, 3, 5];
  }
}

/**
 * How long a session actually is.
 *
 * NOT asked, and deliberately so - the Start programme's workouts are ~30
 * minutes and that is not a dial we can turn. This is the programme's real
 * length, and the wizard overrides it with the live catalogue's own figure
 * where one is available, so the grid can never print a duration no video has.
 */
export const DEFAULT_SESSION_MIN = 30;

/** The label the reveal header and the D0 mail both use. */
export const sessionLabel = (mins: number): string => `${mins} perc`;

export interface PlanDay {
  weekday: Weekday;
  short: string;
  full: string;
  training: boolean;
  minutes: number | null;
}

export interface WeekPlan {
  days: PlanDay[];
  trainingCount: 2 | 3 | 4;
  sessionLabel: string;
  /** True when the person asked for a flexible week - the copy softens. */
  flexible: boolean;
  /** Q5, minus the exclusive "none", in the order the reveal lists them. */
  care: Exclude<Care, "none">[];
  firstWorkoutMinutes: number;
}

export function buildWeekPlan(a: Answers, sessionMin = DEFAULT_SESSION_MIN): WeekPlan {
  const set = new Set(trainingDays(a.days));
  const minutes = sessionMin;
  return {
    days: ([1, 2, 3, 4, 5, 6, 7] as Weekday[]).map((w) => ({
      weekday: w,
      short: WEEKDAY_SHORT[w - 1],
      full: WEEKDAY_FULL[w - 1],
      training: set.has(w),
      minutes: set.has(w) ? minutes : null,
    })),
    trainingCount: daysCount(a.days),
    sessionLabel: sessionLabel(minutes),
    flexible: a.days === "flex",
    care: a.care.filter((c): c is Exclude<Care, "none"> => c !== "none"),
    firstWorkoutMinutes: minutes,
  };
}
