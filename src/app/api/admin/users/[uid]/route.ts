import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { serialize } from "@/lib/admin-serialize";
import { guaranteeEligibility, type CompletedWorkout } from "@/lib/pricing/refund";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: one member's profile + onboarding + progress + subscription (read-only). */
export async function GET(req: Request, { params }: { params: Promise<{ uid: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { uid } = await params;
  const [uSnap, onbSnap, progSnap, subSnap] = await Promise.all([
    adminDb.doc(`users/${uid}`).get(),
    adminDb.doc(`users/${uid}/onboarding/profile`).get(),
    adminDb.doc(`users/${uid}/progress/state`).get(),
    adminDb.doc(`subscriptions/${uid}`).get(),
  ]);

  if (!uSnap.exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  // The guarantee verdict is computed HERE, from the same pure helper the refund
  // route uses, so /admin can never show a verdict the route would disagree with.
  const guarantee = guaranteeEligibility({
    completed: (progSnap.data()?.completed ?? []) as CompletedWorkout[],
    startedAt: (subSnap.data()?.startedAt as number | undefined) ?? null,
  });

  return NextResponse.json({
    uid,
    guarantee,
    profile: serialize(uSnap.data()),
    onboarding: onbSnap.exists ? serialize(onbSnap.data()) : null,
    progress: progSnap.exists ? serialize(progSnap.data()) : null,
    subscription: subSnap.exists ? serialize(subSnap.data()) : null,
    // Whether this server runs on a LIVE Stripe key - the member page builds
    // the correct dashboard deep-link from it (was hardcoded to /test/).
    stripeLive: (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live"),
  });
}
