import "server-only";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { PRICES, isRecurringRole, type CheckoutRole, type PriceRole } from "./config";

/** Resolve a role's Stripe price id via its lookup_key. Cached per process —
 *  lookup_keys are stable, and re-seeding rotates the key deliberately. */
const priceIdCache = new Map<string, string>();

export async function priceIdForRole(role: PriceRole): Promise<string> {
  const lookupKey = PRICES[role].lookupKey;
  const cached = priceIdCache.get(lookupKey);
  if (cached) return cached;

  const res = await getStripe().prices.list({ lookup_keys: [lookupKey], limit: 1 });
  const id = res.data[0]?.id;
  if (!id) {
    throw new Error(`No Stripe price for lookup_key ${lookupKey} — run npm run seed:stripe`);
  }
  priceIdCache.set(lookupKey, id);
  return id;
}

/**
 * F2.1 — convert a freshly created weekly subscription into an intro→standard
 * schedule: phase 1 = intro price for one week, phase 2 = standard, then release
 * so the subscription continues on the standard price indefinitely.
 *
 * Idempotent: if the subscription already has a schedule attached, do nothing —
 * so a duplicate `checkout.session.completed` delivery can't create a second
 * schedule (this runs before the webhook's dedup transaction).
 */
export async function ensureWeeklySchedule(sub: Stripe.Subscription): Promise<void> {
  if (sub.schedule) return;
  const stripe = getStripe();
  const [introPrice, stdPrice] = await Promise.all([
    priceIdForRole("week_intro"),
    priceIdForRole("week_std"),
  ]);
  const schedule = await stripe.subscriptionSchedules.create({ from_subscription: sub.id });
  // Anchor phase 1 to the subscription's current period start; with `duration`
  // (not end_date) Stripe requires a start_date on the first phase.
  const start = schedule.phases[0]?.start_date;
  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "release", // after the std phase, continue on std indefinitely
    phases: [
      // week 1 — the intro price already paid at checkout
      {
        items: [{ price: introPrice }],
        start_date: start,
        duration: { interval: "week", interval_count: 1 },
      },
      // week 2 on standard, then released to continue on standard indefinitely
      { items: [{ price: stdPrice }], duration: { interval: "week", interval_count: 1 } },
    ],
  });
}

/**
 * F3.3 — the Grand Slam earned-annual step-up: year 1 at the earned price, then
 * the standard annual price from year 2, released to continue indefinitely.
 * Idempotent (skips if a schedule is already attached).
 */
export async function ensureEarnedAnnualSchedule(sub: Stripe.Subscription): Promise<void> {
  if (sub.schedule) return;
  const stripe = getStripe();
  const [earnedPrice, stdPrice] = await Promise.all([
    priceIdForRole("annual_earned"),
    priceIdForRole("annual_std"),
  ]);
  const schedule = await stripe.subscriptionSchedules.create({ from_subscription: sub.id });
  const start = schedule.phases[0]?.start_date;
  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "release",
    phases: [
      // year 1 — the earned price already paid
      {
        items: [{ price: earnedPrice }],
        start_date: start,
        duration: { interval: "year", interval_count: 1 },
      },
      // year 2 onward — standard annual, released to continue indefinitely
      { items: [{ price: stdPrice }], duration: { interval: "year", interval_count: 1 } },
    ],
  });
}

export interface ConsentInput {
  /** J1 auto-renew acknowledgement — required for recurring, N/A for one-off. */
  autoRenew: boolean | null;
  /** J2 immediate-start + pro-rata acknowledgement — required for ALL purchases. */
  immediateStart: boolean;
}

/**
 * Validate the two consents for a role. Returns an error string if invalid.
 * Recurring purchases need BOTH consents; one-offs need only immediate-start.
 * This is the gate the checkout route enforces before creating a session.
 */
export function validateConsent(role: CheckoutRole, c: ConsentInput): string | null {
  if (c.immediateStart !== true) return "immediate_start_consent_required";
  if (isRecurringRole(role) && c.autoRenew !== true) return "auto_renew_consent_required";
  return null;
}

/**
 * Persist a consent record BEFORE checkout — the auditable proof required by
 * F1.2 (for withdrawals / disputes). Returns the doc id, which is attached to
 * the Checkout Session metadata so a payment can be traced to its consent.
 * If this write fails, the caller MUST NOT create the checkout session.
 */
export async function recordConsent(
  uid: string,
  role: CheckoutRole,
  c: ConsentInput,
  meta: { ip?: string | null; userAgent?: string | null },
): Promise<string> {
  const ref = adminDb.collection("users").doc(uid).collection("consents").doc();
  await ref.set({
    role,
    lookupKey: PRICES[role].lookupKey,
    autoRenew: c.autoRenew, // null for one-off
    immediateStart: c.immediateStart,
    recurring: isRecurringRole(role),
    at: Date.now(),
    ip: meta.ip ?? null,
    userAgent: meta.userAgent ?? null,
    source: "checkout",
  });
  return ref.id;
}
