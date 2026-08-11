import "server-only";
import Stripe from "stripe";

// Lazy singleton - instantiating Stripe with an empty key throws, which would
// break the build (module is imported when collecting route config). Only
// create it at request time, when the key is present.
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

/** Resolve the LEXFIT uid behind a Stripe customer (stored in customer metadata). */
export async function uidForCustomer(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
): Promise<string | null> {
  const id = typeof customer === "string" ? customer : customer.id;
  const c = await getStripe().customers.retrieve(id);
  if (c.deleted) return null;
  return (c.metadata?.uid as string | undefined) ?? null;
}

// Subscription reads/writes live in @/lib/pricing/subscription - the single
// source of truth for the subscriptions/{uid} document. Do not add Firestore
// access here; keep this module Stripe-client-only to avoid two access paths.
