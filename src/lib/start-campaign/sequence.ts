/**
 * The Lexfit Start campaign to the quiz list (2026-09).
 *
 * WHY IT EXISTS. The nurture sequence that ran before this one pointed at the
 * 490 Ft weekly SUBSCRIPTION, and 456 leads produced 4 purchases. The
 * defensible reading is not that they refused the training - it is that they
 * refused a recurring charge chosen before seeing a workout. /start removes
 * exactly that objection, so this is a different offer to the same people, not
 * the same pitch again.
 *
 * WHAT IT DELIBERATELY LACKS. No deadline, no counter, no "spots left". The
 * owner declined the shared-start mechanic, so there is nothing true to put a
 * clock on - and inventing one would breach both offer v3 §2 and the pattern
 * the GVH fined in the AboutYou case. Four mails, the last one says it is the
 * last, and that promise is kept.
 *
 * WHO MAY RECEIVE IT. `consents.marketing === true` only. 221 of the 456 leads
 * set it to false and can never be mailed here; `stopFor` is the single gate
 * and every send path goes through it.
 *
 * This module is pure so `scripts/start-campaign-selftest.ts` can exercise the
 * schedule and the gate without Firestore or a network.
 */

export const STEPS = [1, 2, 3, 4] as const;
export type Step = (typeof STEPS)[number];

/** 2026-09-21 17:30 Budapest - the owner's chosen first send. */
export const CAMPAIGN_START_MS = Date.parse("2026-09-21T17:30:00+02:00");

const DAY = 86_400_000;

/**
 * Days after the first send. Mail 4 sits two days behind mail 3 rather than
 * one: the close reads better with a gap, and four mails inside three days is
 * the shape that drives unsubscribes in this vertical.
 */
const OFFSET_DAYS: Record<Step, number> = { 1: 0, 2: 1, 3: 2, 4: 4 };

export const dueAt = (step: Step): number => CAMPAIGN_START_MS + OFFSET_DAYS[step] * DAY;

/** The highest step whose send time has passed, or null before the campaign. */
export function dueStep(nowMs: number): Step | null {
  let out: Step | null = null;
  for (const s of STEPS) if (nowMs >= dueAt(s)) out = s;
  return out;
}

export interface CampaignLead {
  email?: string;
  consents?: { marketing?: boolean };
  unsubscribedAt?: unknown;
  paidAt?: unknown;
  convertedAt?: unknown;
  /** Highest campaign step already delivered to this lead. */
  startCampaignStep?: number;
  /** Set when the lead is still mid-nurture; see SKIP_MID_SEQUENCE. */
  nextEmailAt?: number | null;
}

export type Stop =
  | "no_email"
  | "no_consent"
  | "unsubscribed"
  | "converted"
  | "already_sent"
  | "mid_sequence";

/**
 * When true, a lead whose earlier nurture sequence has not finished is skipped
 * until it has. 174 of the 456 leads were still mid-sequence when this campaign
 * was scheduled, and the owner chose to mail everyone anyway - so the default
 * is false. Flipping this to true is the one-line way to change that decision
 * without touching anything else.
 */
export const SKIP_MID_SEQUENCE = false;

/** The only gate. Returns null when this lead may receive `step`. */
export function stopFor(lead: CampaignLead, step: Step, nowMs: number): Stop | null {
  if (!lead.email) return "no_email";
  // Consent first, and never inferred: the key exists on every lead, but only
  // an explicit true is permission.
  if (lead.consents?.marketing !== true) return "no_consent";
  if (lead.unsubscribedAt) return "unsubscribed";
  if (lead.paidAt || lead.convertedAt) return "converted";
  // Idempotent by design: the step number is written with the send, so a cron
  // that runs twice in a day cannot mail the same person twice.
  if ((lead.startCampaignStep ?? 0) >= step) return "already_sent";
  if (SKIP_MID_SEQUENCE && typeof lead.nextEmailAt === "number" && lead.nextEmailAt > nowMs) {
    return "mid_sequence";
  }
  return null;
}

/** The mail-3 door for a lead. `browsing` (8 people) shares the restart text
 *  rather than getting a variant written for a segment of eight. */
export function segmentOf(s: string | undefined): "restart" | "no_energy" | "careful" | "stronger" {
  return s === "no_energy" || s === "careful" || s === "stronger" ? s : "restart";
}

/** Campaign link for a step, with the UTMs the daily brief and GA4 read. */
export function ctaHref(appUrl: string, step: Step): string {
  return `${appUrl}/start?utm_source=email&utm_medium=owned&utm_campaign=start9990_szept&utm_content=c${step}`;
}
