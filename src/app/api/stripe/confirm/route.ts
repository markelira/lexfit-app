import "server-only";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyRequest } from "@/lib/auth-server";
import { getStripe } from "@/lib/stripe";
import {
  buildOneOffData,
  buildSubscriptionData,
  subscriptionRef,
} from "@/lib/pricing/subscription";
import { ROLE_BY_LOOKUP_KEY } from "@/lib/pricing/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Success-page fulfillment (F1 / research-verified). The webhook is the source
 * of truth and always fires, but it can lag — so when the paying user lands on
 * the success page we ALSO write the subscription doc here, giving instant
 * access. Idempotent: it merges the same fields the webhook writes, so running
 * both (even concurrently) converges. Only writes the access-governing doc;
 * schedules and offer-redemption stay with the webhook.
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { sessionId } = (await req.json().catch(() => ({}))) as { sessionId?: string };
  if (!sessionId) return NextResponse.json({ error: "missing_session" }, { status: 400 });

  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  // Security: the session must belong to this user, and be paid.
  const uid = session.client_reference_id ?? (session.metadata?.uid as string | undefined);
  if (uid !== token.uid) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return NextResponse.json({ error: "not_paid", access: false }, { status: 409 });
  }

  if (session.mode === "subscription" && session.subscription) {
    const sub = session.subscription as Stripe.Subscription;
    const data = buildSubscriptionData(sub);
    if (session.metadata?.role === "week_intro") data.weekIntroUsed = true;
    await subscriptionRef(token.uid).set(data, { merge: true });
  } else if (session.mode === "payment") {
    const items = await getStripe().checkout.sessions.listLineItems(session.id, {
      expand: ["data.price"],
    });
    const role = items.data[0]?.price?.lookup_key
      ? ROLE_BY_LOOKUP_KEY[items.data[0].price.lookup_key]
      : undefined;
    if (role === "week_oneoff" || role === "month_oneoff") {
      const customerId =
        typeof session.customer === "string" ? session.customer : (session.customer?.id ?? "");
      const pi =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);
      await subscriptionRef(token.uid).set(
        buildOneOffData(role, customerId, Date.now(), {
          paymentIntent: pi,
          amountPaid: session.amount_total,
        }),
        { merge: true },
      );
    }
  }

  return NextResponse.json({ ok: true, access: true });
}
