// LEXFIT pricing - pro-rata withdrawal maths (J2). Pure and unit-tested.
//
// Critical case (F2.1 makes it real): the weekly plan's first two periods have
// DIFFERENT prices - 490 Ft for week 1, then 1 990 Ft for week 2. A withdrawal
// on day 10 must refund the unused portion of EACH actually-paid invoice, not a
// single price × fraction. So the refund is a sum over real invoices, each
// weighted by how much of ITS OWN period is still unused.

import { GUARANTEE, DAY_MS, budapestDay } from "./config";

/** A single paid invoice period (epoch ms) and its paid amount (minor units). */
export interface PaidPeriod {
  amountPaid: number; // minor units (HUF × 100)
  periodStart: number; // epoch ms
  periodEnd: number; // epoch ms
}

/** Fraction of [start,end] still unused at `now`, clamped to [0,1]. */
export function unusedFraction(startMs: number, endMs: number, nowMs: number): number {
  if (endMs <= startMs) return 0;
  return Math.min(1, Math.max(0, (endMs - nowMs) / (endMs - startMs)));
}

/**
 * Refund per invoice = amountPaid × unused fraction of that invoice's period.
 * A fully-consumed period (end ≤ now) refunds 0; a not-yet-started one refunds
 * its full amount. Returns integer minor units per period, same order as input.
 */
export function refundPerPeriod(periods: PaidPeriod[], nowMs: number): number[] {
  return periods.map((p) =>
    Math.round(p.amountPaid * unusedFraction(p.periodStart, p.periodEnd, nowMs)),
  );
}

/** Total refund (minor units) across all paid periods. */
export function computeRefundMinor(periods: PaidPeriod[], nowMs: number): number {
  return refundPerPeriod(periods, nowMs).reduce((a, b) => a + b, 0);
}

// ── 10 edzés garancia (offer v3) ───────────────────────────────────────────
//
// A VOLUNTARY commercial guarantee, and deliberately not the same shape as the
// statutory withdrawal above it:
//   withdrawal  → the UNUSED portion of each paid invoice, member-triggered,
//                 inside 14 days.
//   guarantee   → the FULL amount of every paid invoice, admin-triggered, once
//                 the member has actually done the ten workouts.
// Keeping both in one file is the point: the difference between them is the
// thing most likely to be got wrong later.

/** Total of every fee paid, in minor units. Not pro-rata: the guarantee refunds
 *  what was paid, not what is unused. */
export function fullRefundTotalMinor(periods: Pick<PaidPeriod, "amountPaid">[]): number {
  return periods.reduce((sum, p) => sum + p.amountPaid, 0);
}

/** One completed workout, as `users/{uid}/progress/state.completed[]` stores it. */
export interface CompletedWorkout {
  code: string;
  /** Budapest calendar day, `YYYY-MM-DD`. */
  at: string;
}

export interface GuaranteeVerdict {
  eligible: boolean;
  /** Distinct workouts completed inside the window. */
  completedInWindow: number;
  required: number;
  /** Epoch ms the window closes (exclusive of later completions). */
  windowEndsAt: number;
  /** Set when the member has done enough but ran past the window. */
  missedWindow: boolean;
}

/**
 * Did this member earn the guarantee?
 *
 * Counts DISTINCT workout codes: re-watching the same session is not a second
 * workout, and the completion list can legitimately hold a repeat (a member who
 * redoes day 3 before moving on). Counting rows instead of codes would let ten
 * replays of one video qualify.
 *
 * The comparison is done in CALENDAR DAYS, not timestamps. `completed[].at` is
 * already a Budapest day (`YYYY-MM-DD`), so the window is converted to Budapest
 * days too and the three are compared as ISO strings. Parsing `at` back into an
 * instant would mean picking an offset, and Budapest is +01:00 for part of the
 * year and +02:00 for the rest - a fixed offset silently moves the boundary by
 * an hour for half of every year, which is exactly enough to decide a
 * last-day completion wrongly.
 */
export function guaranteeEligibility(input: {
  completed: CompletedWorkout[] | undefined | null;
  /** Subscription start, epoch ms. */
  startedAt: number | null | undefined;
  requiredWorkouts?: number;
  windowDays?: number;
}): GuaranteeVerdict {
  const required = input.requiredWorkouts ?? GUARANTEE.requiredWorkouts;
  const windowDays = input.windowDays ?? GUARANTEE.windowDays;
  const startedAt = input.startedAt ?? 0;
  const windowEndsAt = startedAt + windowDays * DAY_MS;

  if (!input.startedAt || !Array.isArray(input.completed)) {
    return { eligible: false, completedInWindow: 0, required, windowEndsAt, missedWindow: false };
  }

  // Inclusive on both ends: the day they started counts, and so does the last
  // day of the window. ISO dates sort lexicographically, so string compare IS
  // date compare here.
  const firstDay = budapestDay(new Date(startedAt));
  const lastDay = budapestDay(new Date(windowEndsAt));

  const seen = new Set<string>();
  let total = 0;
  for (const c of input.completed) {
    if (!c?.code || typeof c.at !== "string" || c.at.length < 10) continue;
    total += 1;
    const day = c.at.slice(0, 10);
    if (day < firstDay || day > lastDay) continue;
    seen.add(c.code);
  }

  const completedInWindow = seen.size;
  return {
    eligible: completedInWindow >= required,
    completedInWindow,
    required,
    windowEndsAt,
    // They did the work, just not inside five weeks. Worth surfacing in /admin
    // so a near-miss is a judgement call rather than a silent "no".
    missedWindow: completedInWindow < required && total >= required,
  };
}
