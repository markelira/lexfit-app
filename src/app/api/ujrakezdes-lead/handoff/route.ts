import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { onboardingDraftFromQuiz } from "@/lib/ujrakezdes/handoff";
import { LM_VARIANT, type LmLeadDoc } from "@/lib/ujrakezdes/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The quiz → register handoff, by plan token.
//
// The reveal's CTAs used to carry the quiz answers to /register purely via
// localStorage (writeQuizHandoff). That stopped being enough on 2026-09-13:
// the Android webview breakout opens /register in a DIFFERENT browser, and the
// D6/D9 emails link /register directly - in both cases the localStorage draft
// does not exist where the wizard mounts. So the CTAs append `?lt=<planToken>`
// and the wizard calls this endpoint to rebuild the same draft server-side.
//
// Returns ONLY the translated onboarding draft - no email, no consent record,
// no identity. The token is an unguessable 32-hex capability; the rate limit
// below keeps enumeration attempts pointless anyway.

const TOKEN_RE = /^[0-9a-f]{32}$/;

export async function GET(req: Request) {
  const lt = new URL(req.url).searchParams.get("lt") ?? "";
  if (!TOKEN_RE.test(lt)) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip");
  if (ip && !(await allowRequest("ujraHandoff", ip, 60, HOUR_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const snap = await adminDb
    .collection("quizLeads")
    .where("planToken", "==", lt)
    .limit(1)
    .get();
  const lead = snap.docs[0]?.data() as LmLeadDoc | undefined;
  if (!lead || lead.variant !== LM_VARIANT) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ draft: onboardingDraftFromQuiz(lead.answers) });
}
