import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { getOrCreateCustomer, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Open the Stripe Customer Portal so the user can manage/cancel their plan. */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const origin = req.headers.get("origin") ?? "http://localhost:3000";
  const customer = await getOrCreateCustomer(token.uid, token.email);

  const session = await getStripe().billingPortal.sessions.create({
    customer,
    return_url: `${origin}/app/profile`,
  });

  return NextResponse.json({ url: session.url });
}
