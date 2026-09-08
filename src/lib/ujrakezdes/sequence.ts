import type { LmLeadDoc } from "./lead";

// Lead magnet v2 - the nurture schedule. Pure, so the rules are testable
// without a database; the cron does the I/O around it.
//
// Every step is timed from `createdAt`, not from the previous send. Chaining
// off the last send would let one slow cron run drag the whole sequence later
// and later; anchoring to the start means a missed run catches up instead.
//
// FOUR STEPS. The v2 spec listed D0/D3/D6/D10; D10 was cut because its entire
// content was a September 30 deadline, and offer v3 §10 lists "add
// urgency/counters" under *Never*.
//
// D9 is the replacement, and it is NOT the deadline email wearing a new date.
// It carries proof: what the first ten workouts actually feel like, and the
// guarantee restated as a roadmap. The evidence supports exactly one more send
// and no more - a 7-vs-3 sequence test gained 35% conversion while unsubscribes
// rose 15% after email five, and fitness already carries the highest
// unsubscribe rate of any vertical at ~0.40%
// (docs/funnel-research/05-email-sequence.md). Four is inside the safe zone;
// six would not be.

/** D0 is sent inline by the submit route - the scheduled sequence starts at 3. */
export type LmStep = 3 | 6 | 9;

const DAY = 24 * 3600_000;

/** Offset from `createdAt` at which each step becomes due. */
export const LM_STEP_DUE_AT: Record<LmStep, number> = {
  3: 3 * DAY, // D3 - belief: what actually falls apart, and the two rules
  6: 6 * DAY, // D6 - the offer, with the guarantee
  9: 9 * DAY, // D9 - proof: what the first ten workouts are like. No deadline.
};

export const LM_LAST_STEP: LmStep = 9;

export type LmStopReason = "unsubscribed" | "no_consent" | "converted" | "finished";

/**
 * Why a lead should drop out, or null to keep going.
 *
 * Conversion stops everything. D6 pitches a membership; mailing that to
 * somebody who already bought is worse than sending nothing.
 */
export function lmStopReason(lead: LmLeadDoc, step: number): LmStopReason | null {
  if (lead.unsubscribedAt) return "unsubscribed";
  if (!lead.consents?.marketing) return "no_consent";
  if (lead.convertedAt) return "converted";
  if (step > LM_LAST_STEP) return "finished";
  return null;
}

/** The step after `step`, or null when the sequence is over. */
export function lmNextStep(step: LmStep): LmStep | null {
  if (step === 3) return 6;
  if (step === 6) return 9;
  return null;
}

export const lmDueAt = (createdAt: number, step: LmStep): number =>
  createdAt + LM_STEP_DUE_AT[step];

/**
 * The scheduling patch to write after sending `step`. Nulls once the sequence
 * is done, which is also what takes the lead out of the cron's query.
 */
export function lmScheduleAfter(
  lead: LmLeadDoc, step: LmStep,
): { nextEmailAt: number | null; nextEmailStep: number | null } {
  const next = lmNextStep(step);
  if (!next) return { nextEmailAt: null, nextEmailStep: null };
  return { nextEmailAt: lmDueAt(lead.createdAt, next), nextEmailStep: next };
}

/** Steps this variant knows how to send - guards the cron's dispatch. */
export const isLmStep = (n: unknown): n is LmStep => n === 3 || n === 6 || n === 9;
