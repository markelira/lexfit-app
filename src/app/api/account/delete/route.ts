import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { verifyRequest } from "@/lib/auth-server";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { cancelAtPeriodEnd } from "@/lib/pricing/lifecycle";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// P6.2 - stage 1 of account deletion. Requires a FRESH ID token and the typed word
// TÖRLÉS. Marks deletionRequestedAt (server-only), cancels Stripe at period end,
// disables the Auth user, and emails the 30-day window + how to reverse. The
// GET /api/cron/purge-accounts job hard-deletes 30 days later.
const FRESH_S = 5 * 60; // re-auth must be within 5 minutes

export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec - (token.auth_time ?? 0) > FRESH_S) {
    return NextResponse.json({ error: "reauth_required" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "TÖRLÉS") {
    return NextResponse.json({ error: "confirm_mismatch" }, { status: 400 });
  }

  const uid = token.uid;

  await adminDb.doc(`users/${uid}`).set({ deletionRequestedAt: FieldValue.serverTimestamp() }, { merge: true });
  try { await cancelAtPeriodEnd(uid); } catch { /* no active subscription */ }
  try { await getAuth(adminApp).updateUser(uid, { disabled: true }); } catch { /* already gone */ }

  const email = token.email ?? (await getAuth(adminApp).getUser(uid).then((u) => u.email).catch(() => null));
  if (email) {
    // Best-effort: the deletion is already staged above - a failed
    // confirmation email must not surface as a 500 for a succeeded request.
    try {
      await sendEmail({
        to: email,
        subject: "LEXFIT - elindítottuk a fiókod törlését",
        text:
          "Elindítottuk a fiókod törlését. Az edzéseid, a sorozatod és a fotóid 30 napon " +
          "belül véglegesen törlődnek.\n\nHa meggondolnád magad, a 30 napon belül írj " +
          "Alexának a Súgóban, és visszavonjuk a törlést.",
      });
    } catch (e) {
      console.error("[account delete email]", e);
    }
  }

  return NextResponse.json({ ok: true });
}
