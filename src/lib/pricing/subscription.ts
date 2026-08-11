import "server-only";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { COLLECTIONS, subscriptionDocId } from "./keys";
import { DUNNING, ONEOFF_ACCESS_DAYS, PRICES, DAY_MS } from "./config";
import {
  hasAccessFromData,
  type Plan,
  type SubStatus,
  type SubscriptionDoc,
} from "./types";

/** The ONE document that governs access: subscriptions/{uid}. */
export const subscriptionRef = (uid: string) =>
  adminDb.collection(COLLECTIONS.subscriptions).doc(subscriptionDocId(uid));

/** Get the user's Stripe customer id, creating one (with uid metadata) if needed. */
export async function getOrCreateCustomer(
  uid: string,
  email?: string | null,
): Promise<string> {
  const ref = subscriptionRef(uid);
  const snap = await ref.get();
  const existing = (snap.data() as SubscriptionDoc | undefined)?.stripeCustomerId;
  if (existing) return existing;

  const customer = await getStripe().customers.create({
    email: email ?? undefined,
    metadata: { uid },
  });
  await ref.set({ stripeCustomerId: customer.id, updatedAt: Date.now() }, { merge: true });
  return customer.id;
}

/**
 * THE entitlement check - reads exactly one document and defers the decision to
 * the pure rule. This is the only function anything (Mux gating, UI, cron)
 * should call to ask "can this user stream?".
 */
export async function hasAccess(uid: string): Promise<boolean> {
  const snap = await subscriptionRef(uid).get();
  return hasAccessFromData(snap.data() as SubscriptionDoc | undefined, Date.now());
}

// ── Stripe → Firestore mappers (PURE) ──────────────────────────────────────
// These do no I/O so the webhook can call them BEFORE opening its Firestore
// transaction (external calls must not run inside a transaction - it may retry).

function mapStatus(s: Stripe.Subscription.Status): SubStatus {
  switch (s) {
    case "active":
    case "trialing":
      return "ACTIVE";
    case "past_due":
    case "unpaid":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "EXPIRED";
    default:
      return "PAST_DUE"; // incomplete / paused-by-stripe → no access until resolved
  }
}

function planFromSub(sub: Stripe.Subscription): Plan {
  const interval = sub.items.data[0]?.price.recurring?.interval;
  if (interval === "week") return "WEEK";
  if (interval === "year") return "ANNUAL";
  return "MONTH";
}

const secToMs = (s: number | null | undefined): number | null =>
  s == null ? null : s * 1000;

/** Map a Stripe subscription into the single subscription doc (merge-safe). */
export function buildSubscriptionData(sub: Stripe.Subscription): SubscriptionDoc {
  const item = sub.items.data[0];
  const periodEndMs = secToMs(item?.current_period_end);
  const periodStartMs = secToMs(item?.current_period_start);
  let status = mapStatus(sub.status);

  // pause_collection is the source of truth for PAUSED - Stripe leaves the
  // status "active" while paused, so derive it here (keeps webhook-driven writes
  // from clobbering a paused sub back to ACTIVE).
  if (sub.pause_collection) status = "PAUSED";
  // cancel_at_period_end: Stripe keeps status "active" until the period ends, but
  // the user has cancelled - reflect CANCELED while access runs out at period end.
  else if (status === "ACTIVE" && sub.cancel_at_period_end) status = "CANCELED";

  // Access lever: normally the paid-through period end; during dunning we extend
  // it by the grace window so PAST_DUE users keep access (F5.1).
  let accessUntil = periodEndMs;
  if (status === "PAST_DUE" && periodEndMs != null) {
    accessUntil = periodEndMs + DUNNING.graceDays * DAY_MS;
  }

  return {
    status,
    plan: planFromSub(sub),
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripeSubscriptionId: sub.id,
    priceLookupKey: item?.price.lookup_key ?? null,
    currentPeriodEnd: periodEndMs,
    currentPeriodStart: periodStartMs,
    accessUntil,
    startedAt: secToMs(sub.start_date),
    canceledAt: secToMs(sub.canceled_at),
    updatedAt: Date.now(),
  };
}

/** Map a completed one-off purchase into the subscription doc. There is no
 *  recurring period - accessUntil = now + the product's access days. The payment
 *  intent + amount are stored so a within-14-day withdrawal can refund pro-rata. */
export function buildOneOffData(
  role: "week_oneoff" | "month_oneoff",
  customerId: string,
  nowMs: number,
  opts?: { paymentIntent?: string | null; amountPaid?: number | null },
): SubscriptionDoc {
  const accessUntil = nowMs + ONEOFF_ACCESS_DAYS[role] * DAY_MS;
  return {
    status: "ACTIVE",
    plan: role === "week_oneoff" ? "ONEOFF_WEEK" : "ONEOFF_MONTH",
    stripeCustomerId: customerId,
    stripeSubscriptionId: null,
    priceLookupKey: PRICES[role].lookupKey,
    currentPeriodEnd: accessUntil,
    currentPeriodStart: nowMs,
    accessUntil,
    lastPaymentIntent: opts?.paymentIntent ?? null,
    amountPaid: opts?.amountPaid ?? null,
    startedAt: nowMs,
    updatedAt: nowMs,
  };
}
