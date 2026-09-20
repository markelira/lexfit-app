// LEXFIT pricing - domain types + THE entitlement rule.
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

/** Access tier - the model is multi-tier-ready for a future "Belső Kör" level. */
export type Tier = "standard" | "inner_circle";

/**
 * A permanent, programme-scoped grant bought with a single payment (P1).
 *
 * It has no expiry field ON PURPOSE. Every other access path in this system is
 * a date (`accessUntil`) that some flow moves forward; this one is an owned
 * thing. "Egyszer fizetsz, örökre a tiéd" is the promise the ad makes, and the
 * data model has to be incapable of quietly breaking it.
 */
export interface ProgramGrant {
  grantedAt: number; // epoch ms
  /** Price lookup_key the grant came from - provenance for support/refunds. */
  via: string;
  paymentIntent?: string | null;
  amountPaid?: number | null; // minor units
}

/**
 * `subscriptions/{uid}` - the ONE document that governs access.
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
  /** The 490 Ft weekly intro is once per user - set true once consumed. */
  weekIntroUsed?: boolean;
  /**
   * Comped access - staff/admin/press, granted outside Stripe by
   * `scripts/grant-comp-access.mjs`. Deliberately a flag and NOT a long
   * `accessUntil`: the Stripe webhook merges its own status/accessUntil over
   * this doc, so a date-based comp would be silently revoked the next time the
   * account touched checkout. `hasAccessFromData` honours the flag first.
   */
  comp?: boolean;
  compReason?: string | null;
  compGrantedAt?: number | null; // epoch ms
  /**
   * Permanently owned programmes, keyed by `programs/{slug}` id (P1).
   *
   * Lives on THIS document rather than its own collection for the same reason
   * `comp` does: the gate already reads `subscriptions/{uid}` on every video
   * token, and the webhook writes here with `{ merge: true }`, so a map added
   * alongside survives every subscription write without a second round trip.
   * Never expires, never cleared by a cancellation - only a refund removes a key.
   */
  programs?: Record<string, ProgramGrant>;
  /** Total days spent paused - F4.3 founder-lock tenure is shifted by this. */
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
  currentPeriodStart?: number | null; // epoch ms - for pro-rata withdrawal
  accessUntil?: number | null; // epoch ms - SOLE driver of hasAccess
  lastPaymentIntent?: string | null; // Stripe PI of the latest charge (refunds)
  amountPaid?: number | null; // minor units of the latest charge (pro-rata base)
  startedAt?: number | null; // epoch ms
  canceledAt?: number | null; // epoch ms
  cancelReason?: string | null;
  updatedAt?: number; // epoch ms
}

/**
 * `offers/{uid}_{OfferType}` - a kiérdemelt/nudge offer. The doc ID enforces
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
 * THE entitlement rule. Pure, single-doc, unit-testable - the one place access
 * is decided. Do not re-implement this check against Stripe status, check-ins,
 * or any other collection; call this with the subscription doc and current time.
 *
 * Access iff `accessUntil` is in the future AND the status is not a no-access
 * status. PAUSED/EXPIRED are hard-denied even if `accessUntil` hasn't elapsed.
 *
 * One exception outranks all of it: a comped account (`comp: true`) always has
 * access, whatever Stripe last wrote into the doc. Only the grant script sets
 * that flag.
 */
export function hasAccessFromData(
  sub: SubscriptionDoc | null | undefined,
  nowMs: number,
): boolean {
  if (sub?.comp === true) return true;
  if (!sub || sub.accessUntil == null) return false;
  if (sub.status === "PAUSED" || sub.status === "EXPIRED") return false;
  return sub.accessUntil > nowMs;
}

/** The programmes this account owns outright, whatever its subscription state. */
export function ownedPrograms(sub: SubscriptionDoc | null | undefined): string[] {
  return Object.keys(sub?.programs ?? {});
}

/**
 * Can this account open content belonging to `slug`?
 *
 * Membership outranks ownership: an active entitlement opens every programme,
 * so a member who also bought one keeps full access and the grant simply sits
 * there, waiting for the day the membership lapses. A programme buyer with no
 * membership gets exactly what they paid for and nothing adjacent.
 */
export function hasProgramAccessFromData(
  sub: SubscriptionDoc | null | undefined,
  slug: string,
  nowMs: number,
): boolean {
  if (hasAccessFromData(sub, nowMs)) return true;
  return sub?.programs?.[slug] != null;
}

/**
 * Is there ANY reason to let this account into the app?
 *
 * This is the door, not the rooms. A programme buyer must get past /login and
 * the paid gate - otherwise they have paid for something they cannot reach -
 * but every individual video is still decided by `hasProgramAccessFromData`.
 */
export function hasAnyAccessFromData(
  sub: SubscriptionDoc | null | undefined,
  nowMs: number,
): boolean {
  return hasAccessFromData(sub, nowMs) || ownedPrograms(sub).length > 0;
}
