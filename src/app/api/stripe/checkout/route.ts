import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { allowRequest, DAY_MS_RL } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { getOrCreateCustomer, subscriptionRef } from "@/lib/pricing/subscription";
import {
  priceIdForRole,
  recordConsent,
  validateConsent,
  type ConsentInput,
} from "@/lib/pricing/checkout-server";
import { isCheckoutRole, isRecurringRole, type PriceRole } from "@/lib/pricing/config";
import { logEvent } from "@/lib/pricing/events";
import type { SubscriptionDoc } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a Checkout session for a chosen product.
 *
 * Flow (F1.2): validate the two consents → persist an auditable consent record
 * → only THEN create the Stripe session. No persisted consent, no checkout.
 * Recurring = subscription mode (needs J1 + J2 consent); one-off = payment mode
 * (needs J2 consent). The weekly recurring role enters on the intro price; the
 * intro→standard schedule + once-per-user guard are F2.1.
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    role?: string;
    autoRenew?: boolean;
    immediateStart?: boolean;
    embedded?: boolean; // E2 - embedded Checkout (return clientSecret instead of a redirect url)
    // Ad-measurement context from the browser, carried to the webhook on the
    // session metadata (the webhook can see neither cookies nor consent).
    marketing?: { consent?: string; fbp?: string; fbc?: string };
  };
  const role = body.role;
  if (!role || !isCheckoutRole(role)) {
    return NextResponse.json({ error: "invalid_role" }, { status: 400 });
  }

  const consent: ConsentInput = {
    autoRenew: isRecurringRole(role) ? body.autoRenew === true : null,
    immediateStart: body.immediateStart === true,
  };
  const consentError = validateConsent(role, consent);
  if (consentError) return NextResponse.json({ error: consentError }, { status: 400 });

  // Every call writes a consent doc + creates a Stripe session - cap per uid.
  if (!(await allowRequest("checkout", token.uid, 20, DAY_MS_RL))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Persist consent BEFORE creating the session - if this throws, no checkout.
  const consentId = await recordConsent(token.uid, role, consent, {
    ip: req.headers.get("x-forwarded-for"),
    userAgent: req.headers.get("user-agent"),
  });

  // F2.1 - the 490 Ft weekly intro is once per user. The guard is SERVER-SIDE,
  // decided here at session creation (never trusted from the UI): a returning
  // weekly buyer gets the standard price directly, with no intro schedule.
  let priceRole: PriceRole = role;
  let scheduleWeekly = false;
  if (role === "week_intro") {
    const existing = (await subscriptionRef(token.uid).get()).data() as
      | SubscriptionDoc
      | undefined;
    if (existing?.weekIntroUsed) {
      priceRole = "week_std"; // returning weekly buyer → straight to standard
    } else {
      scheduleWeekly = true; // first-timer → intro price now, step-up via schedule
    }
  }

  const origin =
    req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const customer = await getOrCreateCustomer(token.uid, token.email);
  const price = await priceIdForRole(priceRole);
  const recurring = isRecurringRole(role);
  // Ad-measurement context. Stored on the session so the webhook can report the
  // purchase to Meta - but ONLY when the buyer accepted cookies. Anything the
  // client claims here is advertising metadata, never an access decision, so it
  // needs no trust: the worst a forged value can do is add or drop one of the
  // buyer's OWN ad events. `granted` must be explicit; everything else refuses.
  const mkt = body.marketing ?? {};
  const adConsent = mkt.consent === "granted" ? "granted" : "denied";
  const meta = {
    uid: token.uid,
    role,
    priceRole,
    consentId,
    scheduleWeekly: String(scheduleWeekly),
    adConsent,
    // Meta's own first-party cookies; they only exist when the Pixel ran, i.e.
    // when consent was given. Truncated to stay well inside Stripe's 500-char
    // per-value metadata limit.
    ...(adConsent === "granted" && mkt.fbp ? { fbp: String(mkt.fbp).slice(0, 200) } : {}),
    ...(adConsent === "granted" && mkt.fbc ? { fbc: String(mkt.fbc).slice(0, 200) } : {}),
  };

  const embedded = body.embedded === true;
  const session = await getStripe().checkout.sessions.create({
    mode: recurring ? "subscription" : "payment",
    customer,
    line_items: [{ price, quantity: 1 }],
    // Embedded Checkout mounts on our page and returns via return_url; the
    // redirect form (kept until /subscribe is retired) uses success/cancel urls.
    ...(embedded
      ? { ui_mode: "embedded_page" as const, return_url: `${origin}/app?sub=success&session_id={CHECKOUT_SESSION_ID}` }
      : {
          success_url: `${origin}/app?sub=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/subscribe?canceled=1`,
        }),
    client_reference_id: token.uid,
    locale: "hu",
    // Collect name + billing address for the NAV-compliant invoice (F0.6),
    // and persist them onto the Stripe customer.
    billing_address_collection: "required",
    customer_update: { address: "auto", name: "auto" },
    metadata: meta,
    ...(recurring
      ? { subscription_data: { metadata: meta } }
      : { payment_intent_data: { metadata: meta } }),
  });

  await logEvent("checkout_started", { uid: token.uid, props: { role, consentId } });

  return NextResponse.json(
    embedded ? { clientSecret: session.client_secret } : { url: session.url },
  );
}
