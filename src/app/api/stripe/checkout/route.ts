import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { getOrCreateCustomer, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create a subscription Checkout session for the signed-in user. */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const price = process.env.STRIPE_PRICE_MONTHLY;
  if (!price) return NextResponse.json({ error: "no price configured" }, { status: 500 });

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const customer = await getOrCreateCustomer(token.uid, token.email);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/app?sub=success`,
    cancel_url: `${origin}/subscribe?canceled=1`,
    client_reference_id: token.uid,
    subscription_data: { metadata: { uid: token.uid } },
    allow_promotion_codes: true,
    locale: "hu",
  });

  return NextResponse.json({ url: session.url });
}
