// THE single source of truth for "this week" progress. Every screen that shows
// weekly status — the home (/app) strip + ring, the Haladásom (/app/progress)
// week card + ring, and any future indicator — MUST derive from this so the
// numbers never diverge again.
//
// Canonical inputs:
//   • training days + weekly target  → the user's PLAN (prefs.plan.weekdays /
//     .daysPerWeek), the days they actually chose — never the Mux-stamped
//     `workoutDays` or the onboarding snapshot, which drift after a plan edit.
//   • "done"                          → dated completions, confirmed
//     (progress.completed) plus the optimistic pending bridge
//     (getPendingCompletions()), against the real Monday-first calendar week.

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

export interface WeekDay {
  weekday: number; // 1=Mon … 7=Sun
  date: string; // YYYY-MM-DD
  done: boolean; // a completion landed on this calendar day
  today: boolean; // the real calendar today
  rest: boolean; // not one of the user's training days
  missed: boolean; // a training day in the past with no completion
}

export interface WeekProgress {
  days: WeekDay[]; // 7 cells, Monday-first
  target: number; // weekly goal = plan.daysPerWeek
  doneThisWeek: number; // completions within this calendar week (ring numerator)
  weekdays: number[]; // normalized training days (1..7)
}

type Entry = { code?: string; at: string };

export function computeWeekProgress(opts: {
  weekdays: number[]; // prefs.plan.weekdays (1=Mon … 7=Sun)
  daysPerWeek: number; // prefs.plan.daysPerWeek
  completed: Entry[]; // confirmed completions (progress.completed)
  pending?: Entry[]; // optimistic bridge (getPendingCompletions())
  now?: Date;
}): WeekProgress {
  const now = opts.now ?? new Date();
  const confirmed = opts.completed ?? [];
  // Merge the optimistic pending completions the Mux sync hasn't confirmed yet,
  // skipping any the confirmed list already covers (same code + day).
  const merged: Entry[] = [
    ...confirmed,
    ...(opts.pending ?? []).filter(
      (x) => !confirmed.some((c) => c.code === x.code && String(c.at) === String(x.at)),
    ),
  ];
  const dates = merged.map((c) => String(c.at));
  const doneDays = new Set(dates);
  const training = new Set(opts.weekdays);

  const mon = mondayOf(now);
  const todayKey = ymd(now);
  const monKey = ymd(mon);
  const endKey = ymd(addDays(mon, 7));

  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = ymd(addDays(mon, i));
    const weekday = i + 1;
    const isTraining = training.has(weekday);
    const done = doneDays.has(date);
    return {
      weekday,
      date,
      done,
      today: date === todayKey,
      rest: !isTraining,
      missed: isTraining && !done && date < todayKey,
    };
  });

  const doneThisWeek = dates.filter((s) => s >= monKey && s < endKey).length;
  // The weekly target is the number of TRAINING days — the workouts you'll do
  // that week. Rest days are never counted here (they only keep the streak); the
  // denominator always equals the count of non-rest cells.
  const target = Math.max(1, training.size || opts.daysPerWeek || 1);
  return { days, target, doneThisWeek, weekdays: [...training].sort((a, b) => a - b) };
}
