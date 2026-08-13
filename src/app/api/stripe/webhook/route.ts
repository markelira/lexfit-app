import "server-only";
import type Stripe from "stripe";
import { adminDb } from "@/lib/firebase-admin";
import { getStripe, uidForCustomer } from "@/lib/stripe";
import { COLLECTIONS, milestoneDocId, webhookEventDocId } from "@/lib/pricing/keys";
import { ROLE_BY_LOOKUP_KEY } from "@/lib/pricing/config";
import {
  ensureWeeklySchedule,
  ensureEarnedAnnualSchedule,
} from "@/lib/pricing/checkout-server";
import { markOfferRedeemed } from "@/lib/pricing/earning-server";
import { logEvent } from "@/lib/pricing/events";
import { issueInvoice, type InvoiceParty } from "@/lib/pricing/invoice";
import { budapestDay } from "@/lib/pricing/keys";
import { planDisplay, sendDunningDay0, sendSubscriptionStarted } from "@/lib/mailer";
import { sendPurchase } from "@/lib/meta-capi";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin";
import {
  buildOneOffData,
  buildSubscriptionData,
  subscriptionRef,
} from "@/lib/pricing/subscription";
import type { SubscriptionDoc } from "@/lib/pricing/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A resolved business write to apply atomically alongside the dedup record. */
type PendingWrite = { uid: string; data: SubscriptionDoc } | null;

/** Newer Stripe API versions moved the subscription id off the invoice root. */
function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as unknown as { subscription?: string | null }).subscription;
  if (legacy) return legacy;
  const parent = (invoice as unknown as {
    parent?: { subscription_details?: { subscription?: string | null } };
  }).parent;
  return parent?.subscription_details?.subscription ?? null;
}

const customerId = (
  c: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string => (typeof c === "string" ? c : (c?.id ?? ""));

function mapAddress(a: Stripe.Address | null | undefined): InvoiceParty["address"] {
  if (!a) return null;
  return {
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    postalCode: a.postal_code,
    country: a.country,
  };
}

async function emailForUid(uid: string): Promise<string | null> {
  try {
    return (await getAuth(adminApp).getUser(uid)).email ?? null;
  } catch {
    return null;
  }
}

/**
 * F5.1 day-0 dunning email - the card was declined. Sends once per episode
 * (gated by `dunningDay0Sent`), linking the Stripe hosted invoice so the user
 * can pay / update the card. Access is kept through the grace window meanwhile.
 * The day-3 reminder + grace expiry live in the cron.
 */
async function maybeDunning(event: Stripe.Event): Promise<void> {
  if (event.type !== "invoice.payment_failed") return;
  const inv = event.data.object as Stripe.Invoice;
  const subId = invoiceSubscriptionId(inv);
  if (!subId) return;
  const sub = await getStripe().subscriptions.retrieve(subId);
  const uid = (sub.metadata?.uid as string | undefined) ?? (await uidForCustomer(sub.customer));
  if (!uid) return;

  const ref = subscriptionRef(uid);
  const doc = (await ref.get()).data() as SubscriptionDoc | undefined;
  if (doc?.status !== "PAST_DUE" || doc.dunningDay0Sent) return;

  const payUrl = inv.hosted_invoice_url ?? "";
  const email = await emailForUid(uid);
  // Flag only after an actual successful send (deliver() never throws - it
  // returns { sent }): an unset flag lets Stripe's redeliveries of this event
  // retry the day-0 email instead of silently ending the episode's dunning.
  if (!email || !payUrl) return;
  if (!(await sendDunningDay0(email, payUrl)).sent) return;
  await ref.set({ dunningDay0Sent: true }, { merge: true });
  await logEvent("dunning_started", { uid });
}

/**
 * "Elindult az előfizetésed" - the subscription-started / payment-confirmed
 * email, once per checkout session (milestone-keyed on the session id, so
 * Stripe redeliveries and plan renewals never re-fire it). Best-effort: a send
 * failure must not 500 the webhook. Billingo sends the legal invoice separately.
 */
async function maybeSubscriptionStarted(
  event: Stripe.Event,
  write: PendingWrite,
): Promise<void> {
  if (event.type !== "checkout.session.completed" || !write) return;
  const session = event.data.object as Stripe.Checkout.Session;
  const mRef = adminDb
    .collection(COLLECTIONS.milestones)
    .doc(milestoneDocId(write.uid, `sub_started_${session.id}`));
  if ((await mRef.get()).exists) return;

  const display = planDisplay(
    write.data.priceLookupKey,
    write.data.currentPeriodEnd ?? write.data.accessUntil,
  );
  const email = await emailForUid(write.uid);
  if (display && email) {
    // A definite send failure leaves the milestone unclaimed so a Stripe
    // redelivery retries; deliberate skips (no display/email) still claim it
    // below - redelivering the same event could never change those.
    if (!(await sendSubscriptionStarted(email, display)).sent) return;
  }
  await mRef.set({ userId: write.uid, kind: "sub_started", sessionId: session.id, firedAt: Date.now() });
}

/**
 * Issue an invoice for a completed payment. Subscription payments arrive as
 * `invoice.paid`; one-off purchases as a `payment` checkout (no Stripe invoice),
 * so they invoice off `checkout.session.completed`. Zero-amount invoices (trials)
 * are skipped. Idempotent via issueInvoice's marker.
 */
async function maybeIssueInvoice(event: Stripe.Event): Promise<void> {
  const DESC = "Lexfit teljes hozzáférés";
  if (event.type === "invoice.paid") {
    const inv = event.data.object as Stripe.Invoice;
    if (!inv.amount_paid) return;
    const paidAt = inv.status_transitions?.paid_at ?? inv.created;
    await issueInvoice(inv.id ?? `inv_${paidAt}`, {
      party: {
        name: inv.customer_name ?? null,
        email: inv.customer_email ?? null,
        address: mapAddress(inv.customer_address),
      },
      amountHuf: Math.round(inv.amount_paid / 100),
      description: DESC,
      fulfillmentDate: budapestDay(new Date(paidAt * 1000)),
    });
    return;
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "payment" || !session.amount_total) return; // subs → invoice.paid
    const pi =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? session.id);
    const d = session.customer_details;
    await issueInvoice(pi, {
      party: {
        name: d?.name ?? null,
        email: d?.email ?? null,
        address: mapAddress(d?.address),
      },
      amountHuf: Math.round(session.amount_total / 100),
      description: DESC,
      fulfillmentDate: budapestDay(new Date()),
    });
  }
}

/**
 * Report the purchase to Meta's Conversions API - the same two events that
 * trigger invoicing, because those are the ones where money actually arrived.
 *
 * ONLY with the buyer's cookie consent. The browser stamped its decision onto
 * the Checkout session metadata (`adConsent`) at session creation; for
 * subscription renewals the same metadata is copied onto the subscription, so
 * `invoice.paid` can read it back. No "granted" → no report, ever.
 *
 * Idempotent: `event_id` is the Stripe invoice / payment-intent id, so a Stripe
 * retry (or a renewal of the same invoice) is deduped by Meta itself.
 */
async function maybeReportPurchase(event: Stripe.Event): Promise<void> {
  const read = (m: Stripe.Metadata | null | undefined) => ({
    adConsent: m?.adConsent,
    fbp: m?.fbp,
    fbc: m?.fbc,
  });

  let id: string | null = null;
  let valueHuf = 0;
  let email: string | null = null;
  let when = 0;
  let mkt: { adConsent?: string; fbp?: string; fbc?: string } = {};

  if (event.type === "invoice.paid") {
    const inv = event.data.object as Stripe.Invoice;
    if (!inv.amount_paid) return;
    const sub = inv.parent?.subscription_details?.subscription;
    const subMeta =
      sub && typeof sub !== "string" ? sub.metadata : inv.parent?.subscription_details?.metadata;
    mkt = read(subMeta);
    id = inv.id ?? null;
    valueHuf = Math.round(inv.amount_paid / 100);
    email = inv.customer_email ?? null;
    when = inv.status_transitions?.paid_at ?? inv.created;
  } else if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "payment" || !session.amount_total) return; // subs → invoice.paid
    mkt = read(session.metadata);
    id =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? session.id);
    valueHuf = Math.round(session.amount_total / 100);
    email = session.customer_details?.email ?? null;
    when = Math.floor(Date.now() / 1000);
  } else {
    return;
  }

  // Deliberate silent skips until now. Log the decision so a missing Purchase
  // can be diagnosed from the Vercel log alone - "no error" is not "reported".
  if (mkt.adConsent !== "granted" || !id) {
    console.log(
      "[meta-capi] skipped: not reportable",
      JSON.stringify({
        eventType: event.type,
        // The literal value matters: "denied" is a working consent gate,
        // undefined means the browser never wrote metadata onto the session.
        adConsent: mkt.adConsent ?? null,
        hasEventId: !!id,
      }),
    );
    return;
  }
  await sendPurchase({
    eventId: id,
    eventTime: when,
    valueHuf,
    email,
    fbp: mkt.fbp,
    fbc: mkt.fbc,
  });
}

/**
 * Resolve the business effect of an event. All external Stripe calls happen
 * HERE, before the transaction - a Firestore transaction may retry, and it must
 * not re-issue network I/O. Returns the write to apply, or null (status-only /
 * not-yet-handled events still get deduped so retries are cheap).
 */
async function resolveWrite(event: Stripe.Event): Promise<PendingWrite> {
  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid =
        session.client_reference_id ?? (session.metadata?.uid as string | undefined);
      if (!uid) return null;

      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        // F2.1: first-time weekly buyer → attach the intro→standard schedule
        // (idempotent). Runs before the dedup tx, so it must be safe to re-enter.
        if (session.metadata?.scheduleWeekly === "true") {
          await ensureWeeklySchedule(sub);
        }
        // F3.3: Grand Slam earned-annual → year-1 earned, then standard.
        if (session.metadata?.scheduleEarnedAnnual === "true") {
          await ensureEarnedAnnualSchedule(sub);
          await markOfferRedeemed(uid);
        }
        const data = buildSubscriptionData(sub);
        // Mark the once-per-user intro as consumed (weekly checkouts only).
        if (session.metadata?.role === "week_intro") data.weekIntroUsed = true;
        return { uid, data };
      }
      if (session.mode === "payment") {
        // One-off (7/30-day) purchase - resolve which price was bought.
        const items = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ["data.price"],
        });
        const lookup = items.data[0]?.price?.lookup_key ?? undefined;
        const role = lookup ? ROLE_BY_LOOKUP_KEY[lookup] : undefined;
        if (role === "week_oneoff" || role === "month_oneoff") {
          const pi =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null);
          return {
            uid,
            data: buildOneOffData(role, customerId(session.customer), Date.now(), {
              paymentIntent: pi,
              amountPaid: session.amount_total,
            }),
          };
        }
      }
      return null;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = invoiceSubscriptionId(invoice);
      if (!subId) return null; // one-off invoices carry no subscription
      const sub = await stripe.subscriptions.retrieve(subId);
      const uid =
        (sub.metadata?.uid as string | undefined) ?? (await uidForCustomer(sub.customer));
      if (!uid) return null;
      // invoice.payment_failed → buildSubscriptionData maps PAST_DUE and extends
      // accessUntil by the dunning grace window (F5.1); emails are sent post-tx.
      const data = buildSubscriptionData(sub);
      const prior = (await subscriptionRef(uid).get()).data() as SubscriptionDoc | undefined;

      if (event.type === "invoice.paid") {
        data.amountPaid = invoice.amount_paid ?? null; // pro-rata base (F1.3)
        if (prior?.status === "PAST_DUE") {
          // Recovered - clear dunning bookkeeping (churn saved).
          data.pastDueSince = null;
          data.dunningDay0Sent = false;
          data.dunningDay3Sent = false;
          await logEvent("dunning_recovered", { uid });
        }
      } else {
        // payment_failed: start (or continue) the dunning episode.
        const newEpisode = prior?.status !== "PAST_DUE";
        data.pastDueSince = newEpisode ? Date.now() : (prior?.pastDueSince ?? Date.now());
        if (newEpisode) {
          data.dunningDay0Sent = false;
          data.dunningDay3Sent = false;
        }
      }
      return { uid, data };
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const uid =
        (sub.metadata?.uid as string | undefined) ?? (await uidForCustomer(sub.customer));
      if (!uid) return null;
      const data = buildSubscriptionData(sub);
      if (event.type === "customer.subscription.deleted") {
        // Fully gone - access ends at the (already-past) period end. Win-back
        // email trigger is F5.3.
        data.status = "EXPIRED";
        data.accessUntil = data.currentPeriodEnd;
      }
      return { uid, data };
    }

    case "invoice.upcoming":
      // Renewal-reminder triggers (weekly day-5, annual −30/−7) are F2.2 / F4.2.
      // Deduped as a no-op for now so Stripe retries don't re-fire later work.
      return null;

    default:
      return null;
  }
}

/** Stripe webhook → mirror into subscriptions/{uid}. Signature-verified, and
 *  idempotent: dedup-create + business write happen in ONE transaction. */
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return new Response("missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return new Response(`bad signature: ${e instanceof Error ? e.message : ""}`, {
      status: 400,
    });
  }

  try {
    // External Stripe I/O first - never inside the transaction (it may retry).
    const write = await resolveWrite(event);

    await adminDb.runTransaction(async (tx) => {
      const evtRef = adminDb
        .collection(COLLECTIONS.stripeWebhookEvents)
        .doc(webhookEventDocId(event.id));
      const seen = await tx.get(evtRef); // read before write - Firestore tx rule
      if (seen.exists) return; // already processed → idempotent skip

      if (write) tx.set(subscriptionRef(write.uid), write.data, { merge: true });
      tx.set(evtRef, { type: event.type, processedAt: Date.now() });
    });

    if (write && event.type === "checkout.session.completed") {
      await logEvent("checkout_completed", {
        uid: write.uid,
        props: { plan: write.data.plan, lookupKey: write.data.priceLookupKey },
      });
    }

    // F0.6: issue the NAV-compliant invoice. Idempotent + best-effort (its own
    // marker prevents doubles; failures are recorded for the cron retry, and
    // never throw here). Called on every delivery so a post-commit crash still
    // issues on Stripe's retry.
    await maybeIssueInvoice(event);
    // F5.1: day-0 dunning email (gated once per episode).
    await maybeDunning(event);
    // "Elindult az előfizetésed" (gated once per checkout session).
    await maybeSubscriptionStarted(event, write);
    // Meta Conversions API - consent-gated, best-effort (never throws).
    await maybeReportPurchase(event);
  } catch (e) {
    // Non-2xx tells Stripe to retry; the dedup record is only written on success.
    return new Response(`handler error: ${e instanceof Error ? e.message : ""}`, {
      status: 500,
    });
  }

  return new Response("ok", { status: 200 });
}
