// LEXFIT pricing — domain types + THE entitlement rule.
//
// Pure (no firebase, no server-only): imported by client billing UI, server
// routes, and tests alike, so everyone decides "does this user have access?"
// through the exact same function reading the exact same single document.

/** Which product the current subscription doc represents. */
export type Plan = "WEEK" | "MONTH" | "ANNUAL" | "ONEOFF_WEEK" | "ONEOFF_MONTH";

/** Business status. PAUSED/EXPIRED never have access; CANCELED keeps access
 *  until accessUntil (period end); PAST_DUE keeps access through dunning grace. */
export type SubStatus = "ACTIVE" | "PAST_DUE" | "PAUSED" | "CANCELED" | "EXPIRED";

export type OfferType =
  | "EARNED_ANNUAL"
  | "M2_CREDIT"
  | "M11_RENEW"
  | "WINBACK"
  | "ANNUAL_NUDGE";

/** Access tier — the model is multi-tier-ready for a future "Belső Kör" level. */
export type Tier = "standard" | "inner_circle";

/**
 * `subscriptions/{uid}` — the ONE document that governs access.
 *
 * Timestamps are epoch **milliseconds** (comparable to `Date.now()` with no
 * conversion). `accessUntil` is the single lever `hasAccess` reads; every flow
 * (recurring renewal, one-off purchase, dunning grace, pause, cancel) expresses
 * itself by setting this field, so access is never re-derived elsewhere.
 */
export interface SubscriptionDoc {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string | null;
  plan?: Plan;
  tier?: Tier;
  status?: SubStatus;
  priceLookupKey?: string | null;
  isGrandfathered?: boolean;
  founderLockApplied?: boolean;
  /** The 490 Ft weekly intro is once per user — set true once consumed. */
  weekIntroUsed?: boolean;
  /** Total days spent paused — F4.3 founder-lock tenure is shifted by this. */
  pausedDaysTotal?: number;
  /** Pause bookkeeping (F2.3). Set while PAUSED, cleared on resume. */
  pausedAt?: number | null; // epoch ms the pause began
  pauseUntil?: number | null; // epoch ms auto-resume is scheduled
  pauseRemainingMs?: number | null; // paid time banked at pause, restored on resume
  /** Set true while a monthly→weekly downgrade is scheduled for period end. */
  downgradeScheduled?: boolean;
  /** Dunning bookkeeping (F5.1). Set on entering PAST_DUE, cleared on recovery. */
  pastDueSince?: number | null;
  dunningDay0Sent?: boolean;
  dunningDay3Sent?: boolean;
  currentPeriodEnd?: number | null; // epoch ms
  currentPeriodStart?: number | null; // epoch ms — for pro-rata withdrawal
  accessUntil?: number | null; // epoch ms — SOLE driver of hasAccess
  lastPaymentIntent?: string | null; // Stripe PI of the latest charge (refunds)
  amountPaid?: number | null; // minor units of the latest charge (pro-rata base)
  startedAt?: number | null; // epoch ms
  canceledAt?: number | null; // epoch ms
  cancelReason?: string | null;
  updatedAt?: number; // epoch ms
}

/**
 * `offers/{uid}_{OfferType}` — a kiérdemelt/nudge offer. The doc ID enforces
 * once-per-user-per-type. State is a strict progression: unlocked → (redeeming)
 * → redeemed, OR unlocked → voided (expired, FINAL). Timestamps are epoch ms.
 */
export interface OfferDoc {
  type: OfferType;
  userId: string;
  unlockedAt: number;
  expiresAt: number | null; // Grand Slam: unlockedAt + 72h; null = no deadline
  redeemedAt: number | null;
  voidedAt: number | null; // expired → voided, NEVER reopened (J4)
  redeemingAt: number | null; // in-flight checkout lock (transactional gate)
  createdAt: number;
}

/**
 * THE entitlement rule. Pure, single-doc, unit-testable — the one place access
 * is decided. Do not re-implement this check against Stripe status, check-ins,
 * or any other collection; call this with the subscription doc and current time.
 *
 * Access iff `accessUntil` is in the future AND the status is not a no-access
 * status. PAUSED/EXPIRED are hard-denied even if `accessUntil` hasn't elapsed.
 */
export function hasAccessFromData(
  sub: SubscriptionDoc | null | undefined,
  nowMs: number,
): boolean {
  if (!sub || sub.accessUntil == null) return false;
  if (sub.status === "PAUSED" || sub.status === "EXPIRED") return false;
  return sub.accessUntil > nowMs;
}
