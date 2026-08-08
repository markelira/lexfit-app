import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest } from "@/lib/auth-server";
import { hasAccess } from "@/lib/entitlement";
import { signPlaybackTokens } from "@/lib/mux";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Issue signed Mux playback tokens for a workout, gated by entitlement. */
export async function GET(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const code = params.get("code");
  // Kihívások day videos live in challengeVideos/ — same signed-playback gating.
  const collection = params.get("type") === "challenge" ? "challengeVideos" : "videos";
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });

  if (!(await hasAccess(token.uid))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const snap = await adminDb.collection(collection).doc(code).get();
  const data = snap.data();
  // Draft/soon/archived content must not stream, even for entitled users who
  // guess a code. (Docs without a status field predate the admin CMS — allow.)
  if (data?.status !== undefined && data.status !== "published") {
    return NextResponse.json({ error: "no video attached" }, { status: 404 });
  }
  const playbackId = data?.muxPlaybackId as string | undefined;
  if (!playbackId) return NextResponse.json({ error: "no video attached" }, { status: 404 });

  const tokens = await signPlaybackTokens(playbackId);
  return NextResponse.json({ playbackId, tokens });
}
