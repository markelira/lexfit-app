import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb, adminStorage } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// P6.2 — stage 2. Daily. For every deletion older than 30 days: recursively delete
// the users/{uid} Firestore subtree, delete users/{uid}/** in Storage, and delete
// the Auth user. Invoices/billing records live outside users/ and are retained as
// law requires. Secured with CRON_SECRET (same as api/cron/reminders).
const THIRTY_DAYS_MS = 30 * 24 * 3600 * 1000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail CLOSED: a missing CRON_SECRET must never make this public.
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
  const snap = await adminDb.collection("users").where("deletionRequestedAt", "<=", cutoff).get();

  const purged: string[] = [];
  for (const doc of snap.docs) {
    const uid = doc.id;
    try {
      await adminStorage.bucket().deleteFiles({ prefix: `users/${uid}/` }).catch(() => {});
      await adminDb.recursiveDelete(adminDb.doc(`users/${uid}`));
      await getAuth(adminApp).deleteUser(uid).catch(() => {});
      purged.push(uid);
      console.log(`[purge-accounts] purged ${uid}`);
    } catch (e) {
      console.error(`[purge-accounts] failed ${uid}`, e);
    }
  }

  return NextResponse.json({ purged: purged.length });
}
