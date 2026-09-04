import "server-only";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { verifyRequest } from "@/lib/auth-server";
import { isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { subscriptionRef } from "@/lib/pricing/subscription";
import { releaseScheduleIfManaged } from "@/lib/pricing/lifecycle";
import { logEvent, notifyAdmin } from "@/lib/pricing/events";
import { milestoneOnce, milestoneClear } from "@/lib/milestones";
import { sendGuaranteeRefundConfirm } from "@/lib/mailer";
import { guaranteeEligibility, type CompletedWorkout } from "@/lib/pricing/refund";
import type { SubscriptionDoc } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One-shot marker so a retried request cannot refund twice. */
const KIND = "guarantee_10_refund";

/** Extract a refund target from an invoice, defensively across API versions.
 *  Same shape as the withdrawal route - deliberately, so the two behave alike. */
function invoiceRefundTarget(inv: Stripe.Invoice): Stripe.RefundCreateParams | null {
  const pi = (inv as unknown as { payment_intent?: string | Stripe.PaymentIntent | null })
    .payment_intent;
  if (pi) return { payment_intent: typeof pi === "string" ? pi : pi.id };
  const charge = (inv as unknown as { charge?: string | Stripe.Charge | null }).charge;
  if (charge) return { charge: typeof charge === "string" ? charge : charge.id };
  return null;
}

/** How much of this invoice is already refunded (so a resumed run skips it). */
function alreadyRefunded(inv: Stripe.Invoice): number {
  const v = (inv as unknown as { amount_refunded?: number }).amount_refunded;
  return typeof v === "number" ? v : 0;
}

/**
 * 10 edzés garancia — refund every membership fee paid to date.
 *
 * ADMIN-TRIGGERED in v1, by decision: the promise is "egy e-mail elég", a human
 * reads that mail, and the volume does not justify a self-serve path that could
 * refund the wrong person. This route is the button behind that conversation.
 *
 * It is deliberately NOT the withdrawal route with a different number:
 *   - withdrawal refunds the UNUSED portion of each invoice (statutory, J2);
 *   - the guarantee refunds each invoice IN FULL (voluntary, offer v3 §4.3).
 *
 * Idempotency has three layers, because a half-finished refund loop is the
 * worst failure available here:
 *   1. `milestoneOnce` claims the action before any money moves, and is only
 *      rolled back on a failure that happened BEFORE Stripe was called.
 *   2. every refund carries an idempotency key derived from the invoice, so a
 *      retry of the same invoice is a no-op at Stripe rather than a second
 *      refund.
 *   3. invoices that already carry a refund are skipped, so a run that died
 *      halfway resumes instead of double-paying the invoices it got through.
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    uid?: string;
    note?: string;
    /** Explicit override for a near-miss the owner decides to honour anyway. */
    overrideEligibility?: boolean;
  };
  const uid = typeof body.uid === "string" ? body.uid.trim() : "";
  if (!uid) return NextResponse.json({ error: "uid_required" }, { status: 400 });

  const ref = subscriptionRef(uid);
  const [snap, progSnap] = await Promise.all([
    ref.get(),
    adminDb.doc(`users/${uid}/progress/state`).get(),
  ]);
  const sub = snap.data() as SubscriptionDoc | undefined;
  if (!sub || sub.startedAt == null) {
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });
  }

  const completed = (progSnap.data()?.completed ?? []) as CompletedWorkout[];
  const verdict = guaranteeEligibility({ completed, startedAt: sub.startedAt });
  if (!verdict.eligible && !body.overrideEligibility) {
    // Not an error the caller did wrong - it is the answer. Return the numbers
    // so /admin can show WHY, and so a near-miss is a judgement call.
    return NextResponse.json({ error: "not_eligible", verdict }, { status: 409 });
  }

  // Claim before any money moves.
  if (!(await milestoneOnce(uid, KIND))) {
    return NextResponse.json({ error: "already_refunded" }, { status: 409 });
  }

  const stripe = getStripe();
  let refundedMinor = 0;
  const refundedInvoices: string[] = [];
  const skipped: string[] = [];

  try {
    if (sub.stripeSubscriptionId) {
      // Release the managing schedule FIRST, before any money moves. Weekly
      // subs are schedule-managed (the 490→1990 step-up) and Stripe rejects a
      // direct cancel while that is true - so the operation most likely to fail
      // happens before the refunds, and a failure cannot orphan a refund with
      // the subscription still running.
      await releaseScheduleIfManaged(sub.stripeSubscriptionId);

      const invoices = await stripe.invoices.list({
        subscription: sub.stripeSubscriptionId,
        status: "paid",
        limit: 100,
      });
      for (const inv of invoices.data) {
        if (!inv.amount_paid) continue;
        const outstanding = inv.amount_paid - alreadyRefunded(inv);
        if (outstanding <= 0) {
          skipped.push(inv.id ?? "");
          continue;
        }
        const target = invoiceRefundTarget(inv);
        if (!target) {
          skipped.push(inv.id ?? "");
          continue;
        }
        await stripe.refunds.create(
          { ...target, amount: outstanding, reason: "requested_by_customer" },
          { idempotencyKey: `guar_${uid}_${inv.id}` },
        );
        refundedMinor += outstanding;
        refundedInvoices.push(inv.id ?? "");
      }
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId);
    } else if (sub.lastPaymentIntent && sub.amountPaid) {
      // One-off purchase: a single payment, refunded whole.
      await stripe.refunds.create(
        {
          payment_intent: sub.lastPaymentIntent,
          amount: sub.amountPaid,
          reason: "requested_by_customer",
        },
        { idempotencyKey: `guar_${uid}_oneoff` },
      );
      refundedMinor = sub.amountPaid;
    }
  } catch (e) {
    // The claim is NOT cleared: Stripe was already called, so some invoices may
    // have been refunded. Re-running is safe (layers 2 and 3 above) but must be
    // a deliberate act, not an automatic retry that could race this one.
    await notifyAdmin("guarantee_refund_failed", {
      uid,
      refundedSoFarHuf: refundedMinor / 100,
      refundedInvoices,
      error: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json(
      {
        error: `stripe_error: ${e instanceof Error ? e.message : ""}`,
        refundedSoFarHuf: refundedMinor / 100,
        refundedInvoices,
      },
      { status: 502 },
    );
  }

  const now = Date.now();
  await ref.set(
    {
      status: "CANCELED",
      accessUntil: now, // the fees were returned in full, so access ends now
      canceledAt: now,
      cancelReason: "guarantee_10",
      updatedAt: now,
    },
    { merge: true },
  );

  await logEvent("guarantee_refund_approved", {
    uid,
    props: {
      plan: sub.plan,
      feesRefundedMinor: refundedMinor,
      invoiceIds: refundedInvoices,
      skippedInvoiceIds: skipped,
      completedInWindow: verdict.completedInWindow,
      overridden: !verdict.eligible,
      adminEmail: token.email ?? null,
      note: body.note ?? null,
    },
  });
  await notifyAdmin("guarantee_refund", {
    uid,
    plan: sub.plan,
    refundHuf: refundedMinor / 100,
    overridden: !verdict.eligible,
  });

  // Confirm on a durable medium, same as the withdrawal flow. Best-effort: the
  // money already moved, and a send failure must not fail the request.
  const email = (await adminDb.doc(`users/${uid}`).get()).data()?.email as string | undefined;
  if (email) {
    try {
      await sendGuaranteeRefundConfirm(email, Math.round(refundedMinor / 100));
    } catch (e) {
      console.error("[guarantee-refund] confirmation email failed:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    refundedHuf: refundedMinor / 100,
    refundedInvoices,
    skippedInvoices: skipped,
    verdict,
  });
}
