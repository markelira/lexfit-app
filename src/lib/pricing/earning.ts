// LEXFIT — kiérdemlési motor (F3), PURE logic. Unit-tested; no I/O.
//
// Two things are DELIBERATELY separate here (and in earning-server.ts):
//   • the check-in (napi pipa) — a community mechanic that works for EVERYONE;
//   • the offer engine — which only runs for weekly/monthly subscribers.
// Keeping them apart is why an annual/one-off buyer can still check in daily but
// never gets a Grand Slam offer (there's nothing to upsell).

import { budapestDay, budapestHour, addDaysToDay } from "./keys";
import { EARNING, LATE_CHECKIN_CUTOFF_HOUR, GRAND_SLAM_WINDOW_HOURS } from "./config";
import type { OfferDoc, Plan, SubscriptionDoc } from "./types";

/**
 * The kiérdemlési window: the first subscription day + the following days, as
 * `windowDays` Budapest calendar days. **Day 0 is the purchase's Budapest day**
 * and counts as the first day — so a 7-day window is [day0 .. day0+6].
 */
export function earningWindowDays(
  startedAtMs: number,
  windowDays: number = EARNING.windowDays,
): string[] {
  const day0 = budapestDay(new Date(startedAtMs));
  return Array.from({ length: windowDays }, (_, i) => addDaysToDay(day0, i));
}

/** Count how many of the check-in days fall inside the window. */
export function countInWindow(checkinDays: Iterable<string>, windowDays: string[]): number {
  const set = new Set(windowDays);
  let n = 0;
  for (const d of checkinDays) if (set.has(d)) n++;
  return n;
}

/** Have enough qualifying check-ins landed to earn the offer? */
export function isEarned(checkinDays: Iterable<string>, startedAtMs: number): boolean {
  return (
    countInWindow(checkinDays, earningWindowDays(startedAtMs)) >= EARNING.requiredCheckins
  );
}

/**
 * Which Budapest days a check-in submitted at `nowMs` may target: always today,
 * plus yesterday ONLY before the 04:00 makeup cutoff (for the late-night crowd).
 * No other backdating. Returned newest-first.
 */
export function allowedCheckinDays(nowMs: number): string[] {
  const now = new Date(nowMs);
  const today = budapestDay(now);
  if (budapestHour(now) < LATE_CHECKIN_CUTOFF_HOUR) {
    return [today, addDaysToDay(today, -1)];
  }
  return [today];
}

/** Only weekly & monthly subscribers can earn (F3 requirement #4). Annual has
 *  nothing to upsell; one-off isn't a subscription. */
export function isOfferEligible(sub: SubscriptionDoc | null | undefined): boolean {
  if (!sub) return false;
  const plan: Plan | undefined = sub.plan;
  return plan === "WEEK" || plan === "MONTH";
}

/** Grand Slam deadline from the unlock instant. */
export function grandSlamExpiry(unlockedAtMs: number): number {
  return unlockedAtMs + GRAND_SLAM_WINDOW_HOURS * 3_600_000;
}

/** Is an offer live and redeemable right now (server-time)? */
export function isOfferRedeemable(
  offer: OfferDoc | null | undefined,
  nowMs: number,
): boolean {
  if (!offer) return false;
  if (offer.redeemedAt || offer.voidedAt) return false;
  return offer.expiresAt == null || offer.expiresAt > nowMs;
}
