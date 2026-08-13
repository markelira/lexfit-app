"use client";

import { doc, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { COLLECTIONS, subscriptionDocId, checkinDocId } from "@/lib/pricing/keys";
import { hasAccessFromData, type SubscriptionDoc } from "@/lib/pricing/types";
import { marketingContext } from "@/lib/track";

async function postJson(
  path: string,
  payload?: unknown,
): Promise<Record<string, unknown>> {
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    method: "POST",
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error((body.error as string) ?? "Stripe hiba");
  return body;
}

async function getJson(path: string): Promise<Record<string, unknown>> {
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error((body.error as string) ?? "Hiba");
  return body;
}

/** The two legally-required consents (F1.2). autoRenew is null for one-off. */
export interface Consents {
  autoRenew: boolean | null;
  immediateStart: boolean;
}

/** Start Checkout for a chosen product with its consents (redirects to Stripe). */
export async function startCheckout(role: string, consents: Consents): Promise<void> {
  const body = await postJson("/api/stripe/checkout", {
    role,
    autoRenew: consents.autoRenew ?? undefined,
    immediateStart: consents.immediateStart,
    marketing: marketingContext(),
  });
  if (!body.url) throw new Error("Stripe hiba");
  window.location.href = body.url as string;
}

/** E2 - create an embedded Checkout session; returns its client_secret so the
 *  page can mount <EmbeddedCheckout>. Consent is recorded server-side first. */
export async function fetchEmbeddedClientSecret(role: string, consents: Consents): Promise<string> {
  const body = await postJson("/api/stripe/checkout", {
    role,
    autoRenew: consents.autoRenew ?? undefined,
    immediateStart: consents.immediateStart,
    embedded: true,
    // Carried to the webhook via Stripe metadata - see marketingContext().
    marketing: marketingContext(),
  });
  if (!body.clientSecret) throw new Error("Stripe hiba");
  return body.clientSecret as string;
}

/** Request withdrawal (14-day right, J2). Returns the refunded amount in Ft. */
export async function requestWithdrawal(): Promise<number> {
  const body = await postJson("/api/withdrawal");
  return (body.refundedHuf as number) ?? 0;
}

// ── F2.3 cancel-flow actions ───────────────────────────────────────────────
/** Pause 1/2/3 months - billing + access pause, remaining time is banked. */
export async function pauseSubscription(months: 1 | 2 | 3): Promise<void> {
  await postJson("/api/subscription/manage", { action: "pause", months });
}

/** Downgrade monthly → weekly standard at period end. Returns effective date (ms). */
export async function downgradeSubscription(): Promise<number> {
  const body = await postJson("/api/subscription/manage", { action: "downgrade" });
  return (body.effectiveAt as number) ?? 0;
}

/** Cancel at period end. Returns the access-until date (ms) to show the user. */
export async function cancelSubscription(): Promise<number> {
  const body = await postJson("/api/subscription/manage", { action: "cancel" });
  return (body.accessUntil as number) ?? 0;
}

/** Optional post-cancel reason (skippable). */
export async function submitCancelReason(reason: string): Promise<void> {
  await postJson("/api/subscription/manage", { action: "reason", reason });
}

// ── F3 check-in + Grand Slam ────────────────────────────────────────────────
/** Log a daily check-in (defaults to today). Returns whether the offer unlocked. */
export async function logCheckin(day?: string): Promise<{ day: string; earned: boolean }> {
  const body = await postJson("/api/checkin", day ? { day } : {});
  return { day: body.day as string, earned: !!body.earned };
}

/** Which of the given Budapest days the user has checked in (owner-readable). */
export async function getCheckedInDays(uid: string, days: string[]): Promise<Set<string>> {
  const q = query(collection(db, COLLECTIONS.checkins), where("userId", "==", uid));
  const snap = await getDocs(q);
  const wanted = new Set(days.map((d) => checkinDocId(uid, d)));
  const done = new Set<string>();
  snap.forEach((d) => {
    if (wanted.has(d.id)) done.add((d.data().day as string) ?? "");
  });
  return done;
}

export interface GrandSlamState {
  serverNow: number;
  redeemable: boolean;
  offer: { expiresAt: number | null; redeemedAt: number | null; voidedAt: number | null } | null;
}

/** Grand Slam offer state (+ serverNow for a server-time countdown). */
export async function getGrandSlam(): Promise<GrandSlamState> {
  const body = await getJson("/api/grandslam");
  return body as unknown as GrandSlamState;
}

/** Success-page fulfillment: confirm the Checkout session so access is instant
 *  even if the webhook lags. Idempotent server-side. Returns whether access is on. */
export async function confirmCheckout(sessionId: string): Promise<boolean> {
  try {
    const body = await postJson("/api/stripe/confirm", { sessionId });
    return !!body.access;
  } catch {
    return false; // webhook will still fulfill; don't block the user
  }
}

/** Redeem the Grand Slam offer (transactional gate server-side; redirects). */
export async function redeemGrandSlam(): Promise<void> {
  const body = await postJson("/api/grandslam/redeem");
  if (!body.url) throw new Error("Stripe hiba");
  window.location.href = body.url as string;
}

/** Re-exported so UI reads the same shape the server writes. */
export type Subscription = SubscriptionDoc;

/** Read the single source of truth, subscriptions/{uid}. */
export async function getSubscription(uid: string): Promise<Subscription | null> {
  const snap = await getDoc(
    doc(db, COLLECTIONS.subscriptions, subscriptionDocId(uid)),
  );
  return snap.exists() ? (snap.data() as Subscription) : null;
}

/** UI access check - same pure rule the server entitlement uses. */
export const isSubscribed = (sub: Subscription | null): boolean =>
  hasAccessFromData(sub, Date.now());

/**
 * Where an onboarded user belongs (40 §40.8 truth table): the app if they have
 * an active entitlement, else checkout. On a read failure default to /app rather
 * than trapping them at /subscribe - the server re-validates access anyway.
 */
export async function paidDestination(uid: string): Promise<"/app" | "/subscribe"> {
  try {
    return isSubscribed(await getSubscription(uid)) ? "/app" : "/subscribe";
  } catch {
    return "/app";
  }
}
