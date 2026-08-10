import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { sendPasswordReset } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Branded password-reset email. Replaces the client SDK's
 * `sendPasswordResetEmail` (which sends Google's default template): the Admin
 * SDK generates the action link and SendGrid delivers our own email — the
 * sanctioned custom-auth-email pattern. The link points at the Firebase-console
 * action URL (https://www.lexfit.hu/auth/action) and expires in 1 hour.
 *
 * ALWAYS answers { ok: true } for a syntactically valid email — never leaks
 * whether an account exists (auth/email-not-found is swallowed). Public
 * endpoint → rate-limited per address so it can't be used to bomb an inbox.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  // Fixed-window limiter keyed on the target address (5/hour). The generic
  // response below fires either way, so a limited call is indistinguishable.
  if (await allowRequest("pwreset", email, 5, HOUR_MS)) {
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
      const link = await getAuth(adminApp).generatePasswordResetLink(email, {
        url: `${base}/login`,
      });
      await sendPasswordReset(email, link);
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      // Unknown address → same generic answer (no account enumeration).
      if (code !== "auth/email-not-found" && code !== "auth/user-not-found") {
        console.error("[reset-request]", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
