// Pure date/streak helpers shared by the client screens and the server-side
// Mux sync route. No Firebase, no browser APIs — everything works on plain
// YYYY-MM-DD strings so client (local time) and server (Europe/Budapest) agree.

const pad = (n: number) => String(n).padStart(2, "0");

export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseYmd = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Monday-first weekday index (H=0 … V=6) of a YYYY-MM-DD string. */
export const weekdayIdx = (s: string) => (parseYmd(s).getDay() + 6) % 7;

/**
 * Current streak in days, derived fresh from the completion dates — never
 * stored-stale. Honors the product promise "a pihenőnap nem töri meg a
 * sorozatot": a day with no completion only breaks the streak if it was a
 * scheduled workout day (`workoutIdx`, Monday-first indices). Today without a
 * completion never breaks — the day isn't over. With an unknown schedule
 * (empty set) every missed day breaks, matching the old strict behavior.
 */
export function computeStreak(
  dates: Iterable<string>,
  workoutIdx: Set<number>,
  todayStr: string,
  restDayKeepsStreak = true,
): number {
  const done = new Set(dates);
  const today = parseYmd(todayStr);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const day = addDays(today, -i);
    const key = ymd(day);
    if (done.has(key)) { streak++; continue; }
    if (i === 0) continue; // today, not yet trained — undecided, not broken
    const rest = workoutIdx.size > 0 && !workoutIdx.has((day.getDay() + 6) % 7);
    // A scheduled rest day only protects the streak when the user leaves that on
    // (prefs.plan.restDayKeepsStreak). Turned off → any gap breaks it. (30 §P5.9)
    if (rest && restDayKeepsStreak) continue;
    break;
  }
  return streak;
}
