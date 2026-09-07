import type { LmLeadDoc } from "./lead";

// Lead magnet v2 - the nurture schedule. Pure, so the rules are testable
// without a database; the cron does the I/O around it.
//
// Every step is timed from `createdAt`, not from the previous send. Chaining
// off the last send would let one slow cron run drag the whole sequence later
// and later; anchoring to the start means a missed run catches up instead.
//
// THREE STEPS, NOT FOUR. The v2 spec lists D0/D3/D6/D10. D10 is not
// implemented: its entire content is a September 30 deadline, and offer v3 §10
// lists "add urgency/counters" under *Never*, with §2 stating the position in
// full - "Urgency: none. No deadlines, no counters, ever." A replacement in the
// no-urgency register is an open item for Alexa (docs/lead-magnet-v2-plan.md
// §8); until it is approved, the sequence simply ends after the offer, which is
// the honest version of "ha most nem időszerű, a heti terved akkor is a tiéd".

/** D0 is sent inline by the submit route - the scheduled sequence starts at 3. */
export type LmStep = 3 | 6;

const DAY = 24 * 3600_000;

/** Offset from `createdAt` at which each step becomes due. */
export const LM_STEP_DUE_AT: Record<LmStep, number> = {
  3: 3 * DAY, // D3 - belief: what actually falls apart, and the two rules
  6: 6 * DAY, // D6 - the offer, with the guarantee
};

export const LM_LAST_STEP: LmStep = 6;

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
  return step === 3 ? 6 : null;
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
export const isLmStep = (n: unknown): n is LmStep => n === 3 || n === 6;
