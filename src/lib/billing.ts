"use client";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

async function postWithToken(path: string): Promise<string> {
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    method: "POST",
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) throw new Error(body.error ?? "Stripe hiba");
  return body.url as string;
}

/** Start subscription Checkout (redirects to Stripe). */
export async function startCheckout(): Promise<void> {
  window.location.href = await postWithToken("/api/stripe/checkout");
}

/** Open the Stripe Customer Portal (manage / cancel). */
export async function openPortal(): Promise<void> {
  window.location.href = await postWithToken("/api/stripe/portal");
}

export interface Subscription {
  status?: string;
  plan?: string;
  currentPeriodEnd?: number | null;
  cancelAtPeriodEnd?: boolean;
}

export async function getSubscription(uid: string): Promise<Subscription | null> {
  const snap = await getDoc(doc(db, "users", uid, "subscription", "status"));
  return snap.exists() ? (snap.data() as Subscription) : null;
}

export const isSubscribed = (sub: Subscription | null): boolean =>
  !!sub && (sub.status === "active" || sub.status === "trialing");
