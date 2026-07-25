// LEXFIT pricing — pro-rata withdrawal maths (J2). Pure and unit-tested.
//
// Critical case (F2.1 makes it real): the weekly plan's first two periods have
// DIFFERENT prices — 490 Ft for week 1, then 1 990 Ft for week 2. A withdrawal
// on day 10 must refund the unused portion of EACH actually-paid invoice, not a
// single price × fraction. So the refund is a sum over real invoices, each
// weighted by how much of ITS OWN period is still unused.

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
