import { HEALTH_RETENTION_MS, LEAD_RETENTION_MS, type LeadDoc } from "./lead";

// The nurture sequence's schedule and stop conditions - pure, so the rules are
// testable without a database. The cron section in
// src/app/api/cron/quiz-leads/route.ts does the I/O around it.
//
// Every step is timed from `createdAt`, not from the previous send. Chaining
// off the last send would let one slow cron run drag the whole sequence later
// and later; anchoring to the start means a missed run catches up instead.

/** Step 1 is E1, sent inline by the submit route - the sequence starts at 2. */
export type SequenceStep = 2 | 3 | 4 | 5 | 6 | 7;

const HOUR = 3600_000;
const DAY = 24 * HOUR;

/** Offset from `createdAt` at which each step becomes due (spec §12). */
export const STEP_DUE_AT: Record<SequenceStep, number> = {
  2: 36 * HOUR, // E2 - the obstacle they named
  3: 3 * DAY,   // E3 - how it actually works
  4: 6 * DAY,   // E4 - the offer
  5: 10 * DAY,  // E5 - objections + the statutory withdrawal right
  6: 14 * DAY,  // E6 - last call
  7: 45 * DAY,  // W1 - win-back, non-converters only
};

export const LAST_STEP: SequenceStep = 7;

export type StopReason =
  | "unsubscribed"
  | "no_consent"
  | "converted"
  | "finished"
  | "health_expired";

/**
 * Why a lead should drop out of the sequence, or null to keep going.
 *
 * Conversion stops EVERYTHING, not just the win-back. The spec only excludes
 * converters from W1, but E4 and E6 pitch "your first week is 490 Ft" - mailing
 * that to somebody who already paid is worse than sending nothing.
 */
export function stopReason(lead: LeadDoc, step: SequenceStep): StopReason | null {
  if (lead.unsubscribedAt) return "unsubscribed";
  if (!lead.consents?.marketing) return "no_consent";
  if (lead.convertedAt) return "converted";
  if (step > LAST_STEP) return "finished";
  return null;
}

/** The step after `step`, or null when the sequence is over. */
export function nextStep(step: SequenceStep): SequenceStep | null {
  return step < LAST_STEP ? ((step + 1) as SequenceStep) : null;
}

/** When `step` should go out for a lead acquired at `createdAt`. */
export const dueAt = (createdAt: number, step: SequenceStep): number =>
  createdAt + STEP_DUE_AT[step];

/**
 * The scheduling patch to write after sending `step`. Returns nulls once the
 * sequence is done, which is also what takes the lead out of the cron's query.
 */
export function scheduleAfter(
  lead: LeadDoc, step: SequenceStep,
): { nextEmailAt: number | null; nextEmailStep: number | null } {
  const next = nextStep(step);
  if (!next) return { nextEmailAt: null, nextEmailStep: null };
  return { nextEmailAt: dueAt(lead.createdAt, next), nextEmailStep: next };
}

// ─── Retention ───────────────────────────────────────────────────────────────

/**
 * The Art. 9 fields, stripped at 12 months while the lead record itself lives
 * to 24 (see lead.ts). Body metrics and the calorie figures derived from them
 * go; the non-health answers that drive segmentation - goal, obstacle, the
 * recommended program - stay, exactly as the privacy-policy amendment says.
 */
export const HEALTH_FIELDS = [
  "answers.height_cm",
  "answers.weight_kg",
  "answers.target_weight_kg",
  "answers.life_stage",
  "computed.maintenanceKcal",
  "computed.goalKcal",
  "computed.weeklyLossKg",
] as const;

export const healthDueAt = (createdAt: number) => createdAt + HEALTH_RETENTION_MS;
export const leadDueAt = (createdAt: number) => createdAt + LEAD_RETENTION_MS;
