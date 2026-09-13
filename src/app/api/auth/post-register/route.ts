import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { verifyRequest } from "@/lib/auth-server";
import { milestoneClear, milestoneOnce } from "@/lib/milestones";
import { sendVerifyEmail, sendWelcome } from "@/lib/mailer";
import { leadId } from "@/lib/quiz/lead";
import { LM_VARIANT, type LmLeadDoc } from "@/lib/ujrakezdes/lead";

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
  // lead, stamp the registration. Best-effort: a lead-side failure must not
  // break signup.
  //
  // TWO VARIANTS, TWO RULES (changed 2026-09-13):
  //  - lm_v2 (/ujrakezdes): registration does NOT stop the nurture sequence.
  //    The register wizard ends in a PAID checkout, so "registered" here means
  //    "abandoned at the pay step" until the Stripe webhook stamps `paidAt` -
  //    and a lead in that state is exactly who D6/D9 exist for. The sequence's
  //    stop rule (lmStopReason) keys on `paidAt`, which the webhook writes.
  //  - original quiz: unchanged - conversion stamps and stops, as before.
  try {
    const ref = adminDb.doc(`quizLeads/${leadId(user.email)}`);
    const snap = await ref.get();
    if (snap.exists) {
      const now = Date.now();
      if ((snap.data() as LmLeadDoc).variant === LM_VARIANT) {
        await ref.set(
          { convertedAt: (snap.data() as LmLeadDoc).convertedAt ?? now, registeredAt: now },
          { merge: true },
        );
      } else {
        await ref.set(
          { convertedAt: now, nextEmailAt: null, nextEmailStep: null },
          { merge: true },
        );
      }
      results.leadConverted = true;
    }
  } catch (e) {
    console.error("[post-register] lead conversion marker", e);
  }

  return NextResponse.json({ ok: true, ...results });
}
