import "server-only";
import type Stripe from "stripe";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";
import { COLLECTIONS, milestoneDocId } from "@/lib/pricing/keys";
import { PRICES, PROGRAM_PURCHASE_ROLES, isProgramRole } from "@/lib/pricing/config";
import { logEvent } from "@/lib/pricing/events";
import { sendProgramAccess } from "@/lib/mailer";
import { buildProgramGrantData, subscriptionRef } from "@/lib/pricing/subscription";

/**
 * Fulfilment for a programme purchase (P1) - shared by the Stripe webhook and
 * the thank-you page.
 *
 * Two callers on purpose. The buyer paid without an account, so the access
 * email is not a nicety: it is the ONLY way into what they bought. A webhook
 * that silently fails would leave someone charged and locked out, so the page
 * they land on after paying can complete the same work. Every step here is
 * idempotent - the account is keyed by email, the grant write is a merge of
 * identical data, and the email is milestone-gated on the session id - so
 * whichever path runs first, and however often either runs, the result is one
 * account, one grant and one email.
 */

const customerIdOf = (
  c: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): string => (typeof c === "string" ? c : (c?.id ?? ""));

/**
 * Find or create the account a programme purchase belongs to.
 *
 * `emailVerified` stays false: Stripe verified a card, not that this person
 * controls this mailbox. The password link sent next is what proves that, and
 * completing it flips the flag through Firebase's own flow.
 */
export async function ensureAccountForPurchase(
  session: Stripe.Checkout.Session,
): Promise<string | undefined> {
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  if (!email) return undefined;
  const auth = getAuth(adminApp);
  const existing = await auth.getUserByEmail(email).catch(() => null);
  if (existing) return existing.uid;
  try {
    const name = session.customer_details?.name?.trim() || undefined;
    const user = await auth.createUser({ email, emailVerified: false, displayName: name });
    // The app reads users/{uid} on every screen; create it here so the buyer
    // does not land on a half-built account.
    await adminDb.collection("users").doc(user.uid).set(
      {
        email,
        // Hungarian name order (vezetéknév keresztnév) - the given name is the
        // LAST token, and this checkout is Hungarian-locale only.
        firstName: name ? name.split(/\s+/).slice(-1)[0] : "",
        createdAt: Date.now(),
        source: "program_purchase",
      },
      { merge: true },
    );
    await logEvent("program_account_created", { uid: user.uid, props: { sessionId: session.id } });
    return user.uid;
  } catch (e) {
    console.error("[program-fulfil] could not create account:", e);
    return undefined;
  }
}

/**
 * Send the access email, once per checkout session.
 *
 * Ordering matters: the link is generated and the mail sent BEFORE the
 * milestone is claimed, so any definite failure leaves the marker unset and
 * the next caller (a Stripe redelivery, or the thank-you page) retries.
 */
export async function deliverProgramAccess(
  uid: string,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const slug = session.metadata?.programSlug;
  const role = session.metadata?.role;
  if (!slug || !role || !isProgramRole(role)) return;

  const mRef = adminDb
    .collection(COLLECTIONS.milestones)
    .doc(milestoneDocId(uid, `program_access_${session.id}`));
  if ((await mRef.get()).exists) return;

  const email = (await getAuth(adminApp).getUser(uid).catch(() => null))?.email;
  if (!email) return; // nothing to send into - leave unclaimed so a retry can

  const prog = await adminDb.collection("programs").doc(slug).get();
  const title = (prog.data()?.title as string | undefined) ?? "programod";
  const sessionCount = (await prog.ref.collection("sessions").count().get()).data().count;

  let setPasswordUrl: string;
  try {
    setPasswordUrl = await getAuth(adminApp).generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://lexfit.hu"}/app`,
    });
  } catch (e) {
    console.error("[program-fulfil] could not generate access link:", e);
    return;
  }

  if (
    !(
      await sendProgramAccess(email, {
        programTitle: title,
        sessionCount,
        amountHuf: PRICES[role].amountHuf,
        setPasswordUrl,
      })
    ).sent
  ) {
    return;
  }
  await mRef.set({ userId: uid, kind: "program_access", sessionId: session.id, firedAt: Date.now() });
  await logEvent("program_purchased", {
    uid,
    props: { slug, role, amountHuf: PRICES[role].amountHuf, sessionId: session.id },
  });
}

/**
 * The standalone path: take a checkout session id, verify with Stripe that it
 * was actually paid, and complete every step of fulfilment.
 *
 * The session id is the only credential, which is safe because Stripe's ids
 * are unguessable and the id reached the caller through their own return URL.
 * Nothing here trusts the client for anything but that id - the amount, the
 * price, the email and the paid status all come from Stripe.
 */
export async function fulfilProgramSession(sessionId: string): Promise<{
  ok: boolean;
  email?: string | null;
  programSlug?: string;
}> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") return { ok: false };
  if (session.metadata?.kind !== "program") return { ok: false };
  const role = session.metadata?.role;
  const slug = session.metadata?.programSlug;
  if (!role || !isProgramRole(role) || slug !== PROGRAM_PURCHASE_ROLES[role]) return { ok: false };

  const uid =
    session.client_reference_id ??
    (session.metadata?.uid as string | undefined) ??
    (await ensureAccountForPurchase(session));
  const email = session.customer_details?.email ?? session.customer_email ?? null;
  if (!uid) return { ok: false, email };

  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);
  await subscriptionRef(uid).set(
    buildProgramGrantData(slug, PRICES[role].lookupKey, customerIdOf(session.customer), Date.now(), {
      paymentIntent: pi,
      amountPaid: session.amount_total,
    }),
    { merge: true },
  );
  await deliverProgramAccess(uid, session);
  return { ok: true, email, programSlug: slug };
}
