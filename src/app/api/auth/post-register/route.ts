import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { verifyRequest } from "@/lib/auth-server";
import { milestoneClear, milestoneOnce } from "@/lib/milestones";
import { sendVerifyEmail, sendWelcome } from "@/lib/mailer";
import { leadId } from "@/lib/quiz/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FRESH_ACCOUNT_MS = 48 * 3600_000;

/**
 * Fired (fire-and-forget) by the register flows right after ensureUserDoc
 * creates the user doc. Sends the welcome email, and - for email+password
 * accounts - our branded verification email via the Admin SDK action link
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

  // deliver() never throws - it returns { sent } (see mailer.ts). Roll the
  // milestone back on a definite failure so a later register-flow call inside
  // the 48h fresh-account window retries, and report `results` honestly.
  if (await milestoneOnce(token.uid, "welcome_email_sent")) {
    const firstName =
      (await adminDb.doc(`users/${token.uid}`).get()).data()?.displayName ??
      user.displayName?.split(" ")[0] ??
      null;
    if ((await sendWelcome(user.email, firstName)).sent) {
      results.welcome = true;
    } else {
      await milestoneClear(token.uid, "welcome_email_sent");
    }
  }

  // P5.4: verification is informational, never an access gate - but the email
  // itself is ours now. Password accounts only; OAuth addresses arrive verified.
  if (token.firebase?.sign_in_provider === "password" && !user.emailVerified) {
    if (await milestoneOnce(token.uid, "verify_email_sent")) {
      try {
        const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
        const link = await getAuth(adminApp).generateEmailVerificationLink(user.email, {
          url: `${base}/app`,
        });
        if ((await sendVerifyEmail(user.email, link)).sent) {
          results.verification = true;
        } else {
          await milestoneClear(token.uid, "verify_email_sent");
        }
      } catch (e) {
        // generateEmailVerificationLink threw - roll back so a retry can send.
        await milestoneClear(token.uid, "verify_email_sent");
        console.error("[verify email]", e);
      }
    }
  }

  // Close the quiz funnel's measurement loop: if this address came in as a
  // lead, stamp the conversion. It also STOPS the nurture sequence - E4 and E6
  // pitch "your first week is 490 Ft", which is the wrong mail for someone who
  // just registered. Best-effort: a lead-side failure must not break signup.
  try {
    const ref = adminDb.doc(`quizLeads/${leadId(user.email)}`);
    if ((await ref.get()).exists) {
      await ref.set(
        { convertedAt: Date.now(), nextEmailAt: null, nextEmailStep: null },
        { merge: true },
      );
      results.leadConverted = true;
    }
  } catch (e) {
    console.error("[post-register] lead conversion marker", e);
  }

  return NextResponse.json({ ok: true, ...results });
}
