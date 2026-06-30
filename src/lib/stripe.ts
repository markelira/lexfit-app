import "server-only";
import Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";

// Lazy singleton — instantiating Stripe with an empty key throws, which would
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

const subRef = (uid: string) => adminDb.doc(`users/${uid}/subscription/status`);

/** Get the user's Stripe customer id, creating one (with uid metadata) if needed. */
export async function getOrCreateCustomer(uid: string, email?: string | null): Promise<string> {
  const snap = await subRef(uid).get();
  const existing = snap.data()?.stripeCustomerId as string | undefined;
  if (existing) return existing;

  const customer = await getStripe().customers.create({
    email: email ?? undefined,
    metadata: { uid },
  });
  await subRef(uid).set({ stripeCustomerId: customer.id }, { merge: true });
  return customer.id;
}

/** Mirror a Stripe subscription into users/{uid}/subscription/status. */
export async function writeSubscription(uid: string, sub: Stripe.Subscription): Promise<void> {
  await subRef(uid).set(
    {
      status: sub.status, // active | trialing | past_due | canceled | …
      plan: "monthly",
      stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      stripeSubscriptionId: sub.id,
      currentPeriodEnd: sub.items.data[0]?.current_period_end ?? null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

/** Resolve the LEXFIT uid behind a Stripe customer (stored in customer metadata). */
export async function uidForCustomer(customer: string | Stripe.Customer | Stripe.DeletedCustomer): Promise<string | null> {
  const id = typeof customer === "string" ? customer : customer.id;
  const c = await getStripe().customers.retrieve(id);
  if (c.deleted) return null;
  return (c.metadata?.uid as string | undefined) ?? null;
}
