import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// P6.1 - "Adataim letöltése". Assembles the user's own data into one JSON file:
// account, onboarding, progress (full completed log), settings, photo METADATA
// (paths + dates, not bytes) and a subscription summary (no Stripe internals).
const MAX_PER_DAY = 5;

export async function GET(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = token.uid;

  // Light rate-limit (a few/day/uid) via a server-only audit doc.
  const auditRef = adminDb.doc(`exportAudit/${uid}`);
  const day = new Date().toISOString().slice(0, 10);
  const audit = (await auditRef.get()).data() as { day?: string; count?: number } | undefined;
  const count = audit?.day === day ? (audit.count ?? 0) : 0;
  if (count >= MAX_PER_DAY) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const [userDoc, onb, progress, prefs, photosSnap, sub] = await Promise.all([
    adminDb.doc(`users/${uid}`).get(),
    adminDb.doc(`users/${uid}/onboarding/profile`).get(),
    adminDb.doc(`users/${uid}/progress/state`).get(),
    adminDb.doc(`users/${uid}/settings/prefs`).get(),
    adminDb.collection(`users/${uid}/photos`).get(),
    adminDb.doc(`subscriptions/${uid}`).get(),
  ]);

  const s = sub.data() ?? null;
  const subscriptionSummary = s
    ? {
        plan: s.plan ?? null,
        status: s.status ?? null,
        currentPeriodStart: s.currentPeriodStart ?? null,
        currentPeriodEnd: s.currentPeriodEnd ?? null,
        accessUntil: s.accessUntil ?? null,
        startedAt: s.startedAt ?? null,
      }
    : null;

  const payload = {
    exportedAt: new Date().toISOString(),
    uid,
    account: userDoc.data() ?? null,
    onboarding: onb.data() ?? null,
    progress: progress.data() ?? null,
    settings: prefs.data() ?? null,
    photos: photosSnap.docs.map((d) => d.data()),
    subscription: subscriptionSummary,
  };

  await auditRef.set({ day, count: count + 1, lastAt: FieldValue.serverTimestamp() }, { merge: true });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lexfit-adataim-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
