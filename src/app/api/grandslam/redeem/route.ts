import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { getStripe } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/pricing/subscription";
import { priceIdForRole } from "@/lib/pricing/checkout-server";
import { lockOfferForRedeem, RedeemError } from "@/lib/pricing/earning-server";
import { logEvent } from "@/lib/pricing/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Redeem the Grand Slam offer. The offer state is validated AND locked in one
 * transaction (lockOfferForRedeem) BEFORE any Stripe session is created, so a
 * checkout started at the expiry instant, or two concurrent checkouts, can't
 * slip through. The first-year earned price steps up to the standard annual
 * price from year 2 via a schedule (attached on checkout completion); the
 * step-up is spelled out in the UI and metadata.
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await lockOfferForRedeem(token.uid); // transactional gate - throws if not redeemable
  } catch (e) {
    if (e instanceof RedeemError) {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    throw e;
  }

  const origin =
    req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const customer = await getOrCreateCustomer(token.uid, token.email);
  const price = await priceIdForRole("annual_earned");
  const meta = { uid: token.uid, role: "annual_earned", scheduleEarnedAnnual: "true" };

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/app?sub=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/app/grandslam?canceled=1`,
    client_reference_id: token.uid,
    locale: "hu",
    billing_address_collection: "required",
    customer_update: { address: "auto", name: "auto" },
    metadata: meta,
    subscription_data: { metadata: meta },
  });

  await logEvent("grand_slam_redeemed", { uid: token.uid });
  return NextResponse.json({ url: session.url });
}
