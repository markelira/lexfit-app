// Static preview of the Foundation program's first week (F001–F007), for the
// ANONYMOUS reveal step — prod content is admin-uploaded and the reveal runs
// pre-auth, so it can't call loadFoundation(uid). Source: docs/workouts.
// Foundation is a fixed ordered queue; "fewer days = slower progression", so a
// user's week 1 is simply the first N workouts on their chosen weekdays.
// (F008–F020 to be added when the /app program needs a full static manifest.)

export interface PreviewWorkout {
  code: string;
  order: number;
  title: string;
  theme: string; // short category word for the week strip / cards
  mins: number; // main-workout minutes (what the "22 PERC" chip shows)
}

export const FOUNDATION_WEEK1: PreviewWorkout[] = [
  { code: "F001", order: 1, title: "Láb alapokról", theme: "Alsótest", mins: 22 },
  { code: "F002", order: 2, title: "Felsőtest indító", theme: "Felsőtest", mins: 22 },
  { code: "F003", order: 3, title: "Csendes cardio", theme: "Cardio", mins: 22 },
  { code: "F004", order: 4, title: "Mindent egy edzésben", theme: "Teljes test", mins: 22 },
  { code: "F005", order: 5, title: "Reset — alap flow", theme: "Mobilitás", mins: 22 },
  { code: "F006", order: 6, title: "Fenék-fókusz", theme: "Fenék", mins: 22 },
  { code: "F007", order: 7, title: "Egyenes hát, nyitott mell", theme: "Hát · tartás", mins: 22 },
];

/** The reveal's "első edzésed" — always F001 (Foundation is a fixed progression). */
export const FIRST_WORKOUT = FOUNDATION_WEEK1[0];

/** Week 1 for a chosen day count: the first N workouts of the fixed queue. */
export function week1For(days: number): PreviewWorkout[] {
  return FOUNDATION_WEEK1.slice(0, Math.max(1, Math.min(7, days)));
}
