import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { signPlaybackTokens } from "@/lib/mux";
import { loadLandingCatalog } from "@/lib/landing-catalog.server";
import { LM_VARIANT, type LmLeadDoc } from "@/lib/ujrakezdes/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The reveal's free first workout, served to the REAL player (guest mode of
// /player/[code], 2026-09-13): full video document (title, blocks, stamps -
// everything the HUD needs) + signed playback tokens.
//
// ACCESS CONTRACT: a valid lm_v2 plan token unlocks exactly ONE code - the
// entry programme's current first session, resolved server-side from the
// catalogue. The requested code must match it; anything else is 404 no matter
// what the client asks for. Anonymous visitors cannot read `videos/` through
// client Firestore (rules gate on auth), so this endpoint is their only path,
// and it is this narrow on purpose.

const TOKEN_RE = /^[0-9a-f]{32}$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lt = url.searchParams.get("lt") ?? "";
  const code = url.searchParams.get("code") ?? "";
  if (!TOKEN_RE.test(lt) || !code) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip");
  if (ip && !(await allowRequest("ujraWatch", ip, 60, HOUR_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const leadSnap = await adminDb
    .collection("quizLeads")
    .where("planToken", "==", lt)
    .limit(1)
    .get();
  const lead = leadSnap.docs[0]?.data() as LmLeadDoc | undefined;
  if (!lead || lead.variant !== LM_VARIANT) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const catalog = await loadLandingCatalog();
  const firstCode = catalog.entry?.sessions[0]?.code;
  if (!firstCode || code !== firstCode) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const snap = await adminDb.collection("videos").doc(firstCode).get();
  const data = snap.data();
  if (!data?.muxPlaybackId) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (data.status !== undefined && data.status !== "published") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const tokens = await signPlaybackTokens(data.muxPlaybackId as string);
  return NextResponse.json({
    video: { code: snap.id, ...data },
    playbackId: data.muxPlaybackId,
    tokens,
  });
}
