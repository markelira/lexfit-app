import "server-only";
import type Stripe from "stripe";
import { getStripe, uidForCustomer, writeSubscription } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Stripe webhook → mirror subscription status into Firestore. */
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response("missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return new Response(`bad signature: ${e instanceof Error ? e.message : ""}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = (sub.metadata?.uid as string | undefined) ?? (await uidForCustomer(sub.customer));
        if (uid) await writeSubscription(uid, sub);
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.client_reference_id ?? (session.metadata?.uid as string | undefined);
        if (uid && session.subscription) {
          const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
          await writeSubscription(uid, sub);
        }
        break;
      }
    }
  } catch (e) {
    return new Response(`handler error: ${e instanceof Error ? e.message : ""}`, { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
