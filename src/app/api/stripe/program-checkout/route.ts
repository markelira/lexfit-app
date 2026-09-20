import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyRequest } from "@/lib/auth-server";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { priceIdForRole } from "@/lib/pricing/checkout-server";
import { PRICES, PROGRAM_PURCHASE_ROLES, isProgramRole, type ProgramRole } from "@/lib/pricing/config";
import { logEvent } from "@/lib/pricing/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Checkout for a PROGRAMME purchase - pay once, own it forever (P1).
 *
 * Unauthenticated on purpose. The subscription checkout demands an account
 * first, and that wall is where this funnel died: between Sep 14 and 19, 518
 * leads produced 0 registrations, so no one ever reached a payment form. Here
 * the buyer gives Stripe an email and a card, the webhook creates the account
 * from the receipt, and the welcome email carries a link to set a password.
 * Nothing is asked for before the money that is not needed to take the money.
 *
 * The J2 immediate-start consent is still mandatory and still persisted BEFORE
 * the session exists. With no uid to file it under, it goes to
 * `programConsents/{id}` and the webhook re-files it on the account it creates.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    role?: string;
    email?: string;
    immediateStart?: boolean;
    embedded?: boolean;
    /** Which CTA on the product page was pressed - CRO attribution only. */
    where?: string;
    marketing?: {
      consent?: string;
      fbp?: string; fbc?: string;
      ttp?: string; ttclid?: string;
    };
  };

  const role = body.role;
  if (!role || !isProgramRole(role)) {
    return NextResponse.json({ error: "invalid_role" }, { status: 400 });
  }
  // Digital content delivered at once: the buyer must acknowledge that
  // performance starts immediately (45/2014. Korm. r.). No tick, no checkout.
  if (body.immediateStart !== true) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  // No uid to meter, so the window is per client IP. Fail-open, like every
  // other limiter here - a limiter hiccup must never block a sale.
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!(await allowRequest("program_checkout", ip.replace(/[^0-9a-zA-Z:.]/g, "-"), 15, HOUR_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    return await createSession(req, role, body, ip);
  } catch (e) {
    // NEVER a bodyless 500. Next's default error page is not JSON, so the
    // browser reported "Unexpected end of JSON input" and Stripe's provider
    // timed out waiting for a client secret - the buyer saw a spinner that
    // never resolved. The commonest cause is a price that exists in test mode
    // and not in live, which is a deploy step, not a bug the buyer can fix.
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[program-checkout]", msg);
    return NextResponse.json(
      { error: /No Stripe price/.test(msg) ? "price_missing" : "checkout_failed" },
      { status: 500 },
    );
  }
}

async function createSession(
  req: Request,
  role: ProgramRole,
  body: {
    email?: string;
    embedded?: boolean;
    where?: string;
    marketing?: { consent?: string; fbp?: string; fbc?: string; ttp?: string; ttclid?: string };
  },
  ip: string,
) {
  const programSlug = PROGRAM_PURCHASE_ROLES[role];
  const email = typeof body.email === "string" && body.email.includes("@")
    ? body.email.trim().slice(0, 254)
    : undefined;

  // A signed-in buyer is recognised so the webhook grants onto the existing
  // account instead of creating a second one. Optional: absence is the norm.
  const token = await verifyRequest(req);

  const consentRef = adminDb.collection("programConsents").doc();
  await consentRef.set({
    role,
    programSlug,
    lookupKey: PRICES[role].lookupKey,
    autoRenew: null, // one-time payment - there is nothing to renew
    immediateStart: true,
    email: email ?? null,
    uid: token?.uid ?? null,
    ip,
    userAgent: req.headers.get("user-agent") ?? null,
    at: Date.now(),
  });

  const origin =
    req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const price = await priceIdForRole(role);

  const mkt = body.marketing ?? {};
  const adConsent = mkt.consent === "granted" ? "granted" : "denied";
  const meta = {
    kind: "program",
    role,
    programSlug,
    consentId: consentRef.id,
    adConsent,
    ...(token?.uid ? { uid: token.uid } : {}),
    ...(adConsent === "granted" && mkt.fbp ? { fbp: String(mkt.fbp).slice(0, 200) } : {}),
    ...(adConsent === "granted" && mkt.fbc ? { fbc: String(mkt.fbc).slice(0, 200) } : {}),
    ...(adConsent === "granted" && mkt.ttp ? { ttp: String(mkt.ttp).slice(0, 200) } : {}),
    ...(adConsent === "granted" && mkt.ttclid ? { ttclid: String(mkt.ttclid).slice(0, 200) } : {}),
  };

  const embedded = body.embedded === true;
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    // There is no customer yet for an anonymous buyer, and the webhook needs
    // one to attach the invoice and any later upgrade to.
    customer_creation: "always",
    ...(email ? { customer_email: email } : {}),
    line_items: [{ price, quantity: 1 }],
    ...(embedded
      ? {
          ui_mode: "embedded_page" as const,
          return_url: `${origin}/start/koszonjuk?session_id={CHECKOUT_SESSION_ID}`,
        }
      : {
          success_url: `${origin}/start/koszonjuk?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/start?canceled=1`,
        }),
    ...(token?.uid ? { client_reference_id: token.uid } : {}),
    locale: "hu",
    billing_address_collection: "required",
    metadata: meta,
    payment_intent_data: { metadata: meta },
  });

  await logEvent("program_checkout_started", {
    uid: token?.uid ?? null,
    props: {
      role,
      programSlug,
      consentId: consentRef.id,
      sessionId: session.id,
      where: typeof body.where === "string" ? body.where.slice(0, 40) : null,
    },
  });

  return NextResponse.json(
    embedded ? { clientSecret: session.client_secret } : { url: session.url },
  );
}
