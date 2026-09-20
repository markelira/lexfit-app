import "server-only";
import { NextResponse } from "next/server";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { fulfilProgramSession } from "@/lib/pricing/program-fulfil";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Complete a programme purchase from the thank-you page (P1).
 *
 * The webhook normally gets there first; this is the second path, because a
 * buyer with no account has no other way in if the webhook is late or lost.
 * Fulfilment is idempotent, so running both is not a problem - the account is
 * keyed by email, the grant write is a merge, and the email is milestone-gated.
 *
 * Authorisation is the session id itself: Stripe's ids are unguessable and it
 * reached the caller through their own return URL. Everything that matters -
 * whether it was paid, for what, by whom - is read back from Stripe, never
 * from the request.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { sessionId?: string };
  const sessionId = body.sessionId;
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  // Tighter than the other public routes: a successful call hands back a
  // credential, so the window is small enough that guessing session ids is
  // pointless even before Stripe's own entropy is considered.
  if (!(await allowRequest("program_confirm", ip.replace(/[^0-9a-zA-Z:.]/g, "-"), 12, HOUR_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const r = await fulfilProgramSession(sessionId);
    // The response carries a one-shot sign-in token, so it must never be
    // cached by a proxy or the browser on its way back.
    return NextResponse.json(r, {
      headers: { "Cache-Control": "no-store, private" },
    });
  } catch (e) {
    console.error("[program-confirm]", e);
    // The money is safe either way - the webhook retries for 3 days. Tell the
    // page so it can say something true rather than pretending nothing happened.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
