import "server-only";
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { sendLoginLink } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Passwordless sign-in link (P1).
 *
 * Programme buyers never choose a password: they pay, the webhook builds the
 * account from the receipt, and the thank-you page signs them in on the spot.
 * When that session eventually ends - a sign-out, a cleared browser, a second
 * device - this is the only way back into something they have already paid for.
 *
 * Built the same way as the password-reset route: the Admin SDK generates the
 * action link and SendGrid delivers OUR template, so nobody ever meets
 * Firebase's default English email. The link lands on /auth/action, which is
 * the action URL configured in the Firebase console.
 *
 * ALWAYS answers { ok: true } for a syntactically valid address. A different
 * answer for a known address would turn this into an account-enumeration
 * oracle, and the address here belongs to a paying customer.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; next?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  // Where to land after the link is consumed. Only same-site paths: an
  // attacker-supplied absolute URL here would make our own email a redirector.
  const next = typeof body.next === "string" && /^\/[A-Za-z0-9/_-]*$/.test(body.next)
    ? body.next
    : "/app";

  // Per-address window, so this cannot be used to bomb an inbox. The generic
  // answer below fires either way, so a limited call is indistinguishable.
  if (await allowRequest("loginlink", email, 5, HOUR_MS)) {
    try {
      const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
      const link = await getAuth(adminApp).generateSignInWithEmailLink(email, {
        url: `${base}${next}`,
        handleCodeInApp: true,
      });
      await sendLoginLink(email, link);
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      if (code !== "auth/email-not-found" && code !== "auth/user-not-found") {
        console.error("[login-link]", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
