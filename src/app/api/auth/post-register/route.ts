import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { verifyRequest } from "@/lib/auth-server";
import { COLLECTIONS, milestoneDocId } from "@/lib/pricing/keys";
import { sendVerifyEmail, sendWelcome } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FRESH_ACCOUNT_MS = 48 * 3600_000;

async function milestoneOnce(uid: string, kind: string): Promise<boolean> {
  const ref = adminDb.collection(COLLECTIONS.milestones).doc(milestoneDocId(uid, kind));
  if ((await ref.get()).exists) return false;
  await ref.set({ userId: uid, kind, firedAt: Date.now() });
  return true;
}

/**
 * Fired (fire-and-forget) by the register flows right after ensureUserDoc
 * creates the user doc. Sends the welcome email, and — for email+password
 * accounts — our branded verification email via the Admin SDK action link
 * (replacing the client SDK's Google-templated `sendEmailVerification`).
 * Idempotent via milestone docs, and refuses accounts older than 48h so a
 * replayed call can never welcome a veteran.
 */
export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getAuth(adminApp).getUser(token.uid);
  const createdAt = Date.parse(user.metadata.creationTime ?? "");
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > FRESH_ACCOUNT_MS) {
    return NextResponse.json({ ok: true, skipped: "not_fresh" });
  }
  if (!user.email) return NextResponse.json({ ok: true, skipped: "no_email" });

  const results: Record<string, boolean> = {};

  if (await milestoneOnce(token.uid, "welcome_email_sent")) {
    const firstName =
      (await adminDb.doc(`users/${token.uid}`).get()).data()?.displayName ??
      user.displayName?.split(" ")[0] ??
      null;
    await sendWelcome(user.email, firstName).catch((e) => console.error("[welcome email]", e));
    results.welcome = true;
  }

  // P5.4: verification is informational, never an access gate — but the email
  // itself is ours now. Password accounts only; OAuth addresses arrive verified.
  if (token.firebase?.sign_in_provider === "password" && !user.emailVerified) {
    if (await milestoneOnce(token.uid, "verify_email_sent")) {
      try {
        const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
        const link = await getAuth(adminApp).generateEmailVerificationLink(user.email, {
          url: `${base}/app`,
        });
        await sendVerifyEmail(user.email, link);
        results.verification = true;
      } catch (e) {
        console.error("[verify email]", e);
      }
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
