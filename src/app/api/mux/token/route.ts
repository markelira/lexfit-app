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

  const code = new URL(req.url).searchParams.get("code");
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });

  if (!(await hasAccess(token.uid))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const snap = await adminDb.collection("videos").doc(code).get();
  const playbackId = snap.data()?.muxPlaybackId as string | undefined;
  if (!playbackId) return NextResponse.json({ error: "no video attached" }, { status: 404 });

  const tokens = await signPlaybackTokens(playbackId);
  return NextResponse.json({ playbackId, tokens });
}
