import "server-only";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyRequest } from "@/lib/auth-server";
import { getStripe } from "@/lib/stripe";
import { subscriptionRef } from "@/lib/pricing/subscription";
import { logEvent, notifyAdmin } from "@/lib/pricing/events";
import { sendEmail } from "@/lib/email";
import { WITHDRAWAL_DAYS, DAY_MS } from "@/lib/pricing/config";
import { unusedFraction } from "@/lib/pricing/refund";
import type { SubscriptionDoc } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Extract a refund target (payment_intent or charge) from an invoice,
 *  defensively across Stripe API versions. */
function invoiceRefundTarget(inv: Stripe.Invoice): Stripe.RefundCreateParams | null {
  const pi = (inv as unknown as { payment_intent?: string | Stripe.PaymentIntent | null })
    .payment_intent;
  if (pi) return { payment_intent: typeof pi === "string" ? pi : pi.id };
  const charge = (inv as unknown as { charge?: string | Stripe.Charge | null }).charge;
  if (charge) return { charge: typeof charge === "string" ? charge : charge.id };
  return null;
}

/**
 * F1.3 — right of withdrawal (J2). Refunds the UNUSED portion of each actually
 * paid invoice (so the weekly 490→1990 two-price first period is correct), then
 * closes access immediately, emits `withdrawal_requested` (F6 guardrail) and
 * notifies the admin.
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const ref = subscriptionRef(token.uid);
  const snap = await ref.get();
  const sub = snap.data() as SubscriptionDoc | undefined;
  if (!sub || sub.startedAt == null) {
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });
  }
  if (sub.status === "CANCELED" || sub.status === "EXPIRED") {
    return NextResponse.json({ error: "already_closed" }, { status: 409 });
  }

  const now = Date.now();
  if (now - sub.startedAt > WITHDRAWAL_DAYS * DAY_MS) {
    return NextResponse.json({ error: "withdrawal_window_expired" }, { status: 403 });
  }

  const stripe = getStripe();
  let refundedMinor = 0;

  try {
    if (sub.stripeSubscriptionId) {
      // Recurring: refund each paid invoice's unused portion from REAL invoices.
      const invoices = await stripe.invoices.list({
        subscription: sub.stripeSubscriptionId,
        status: "paid",
        limit: 24,
      });
      for (const inv of invoices.data) {
        const line = inv.lines.data[0];
        const start = line?.period?.start;
        const end = line?.period?.end;
        if (start == null || end == null || !inv.amount_paid) continue;
        const frac = unusedFraction(start * 1000, end * 1000, now);
        const amount = Math.round(inv.amount_paid * frac);
        const target = invoiceRefundTarget(inv);
        if (amount > 0 && target) {
          await stripe.refunds.create({ ...target, amount });
          refundedMinor += amount;
        }
      }
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    } else {
      // One-off: single "period" = startedAt..accessUntil, paid via stored PI.
      const start = sub.currentPeriodStart ?? sub.startedAt;
      const end = sub.currentPeriodEnd ?? sub.accessUntil ?? now;
      const amount = Math.round((sub.amountPaid ?? 0) * unusedFraction(start, end, now));
      if (amount > 0 && sub.lastPaymentIntent) {
        await stripe.refunds.create({ payment_intent: sub.lastPaymentIntent, amount });
        refundedMinor = amount;
      }
    }
  } catch (e) {
    return NextResponse.json(
      { error: `stripe_error: ${e instanceof Error ? e.message : ""}` },
      { status: 502 },
    );
  }

  await ref.set(
    {
      status: "CANCELED",
      accessUntil: now, // access ends now — the unused portion was refunded
      canceledAt: now,
      cancelReason: "withdrawal",
      updatedAt: now,
    },
    { merge: true },
  );

  await logEvent("withdrawal_requested", {
    uid: token.uid,
    props: {
      plan: sub.plan,
      refundMinor: refundedMinor,
      daysElapsed: (now - sub.startedAt) / DAY_MS,
    },
  });
  await notifyAdmin("withdrawal", {
    uid: token.uid,
    email: token.email ?? null,
    plan: sub.plan,
    refundHuf: refundedMinor / 100,
  });

  // 45/2014. Korm. r. 12. §: confirm receipt of the withdrawal on a durable
  // medium. Best-effort — the refund already happened; a send failure must not
  // fail the request.
  if (token.email) {
    const refundHuf = Math.round(refundedMinor / 100);
    try {
      await sendEmail({
        to: token.email,
        subject: "Elállásod megerősítése — LEXFIT",
        text: [
          "Szia!",
          "",
          "Megkaptuk az elállási nyilatkozatodat, és le is zártuk az előfizetésedet.",
          refundHuf > 0
            ? `A fel nem használt időszak árát (${refundHuf.toLocaleString("hu-HU")} Ft) visszatérítettük az eredeti fizetési módra. A bankodtól függően ez pár munkanapon belül jelenik meg.`
            : "A már felhasznált időszak alapján visszatérítendő összeg nem keletkezett.",
          "",
          "A hozzáférésed ezzel lezárult. Ha bármikor visszatérnél, szeretettel várunk.",
          "",
          "LEXFIT",
        ].join("\n"),
      });
    } catch (e) {
      console.error("[withdrawal] confirmation email failed:", e);
    }
  }

  return NextResponse.json({ ok: true, refundedHuf: refundedMinor / 100 });
}
