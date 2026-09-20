import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { signPreviewTokens } from "@/lib/mux";
import { PROGRAM_PURCHASE_ROLES } from "@/lib/pricing/config";
import { exerciseName } from "@/lib/blocks";
import type { VideoBlock } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The preview a /start visitor gets when they tap a workout card (P1).
 *
 * IMAGE-ONLY, and that is a hard line rather than a limitation of the moment.
 * A signed Mux playback token cannot be duration-limited: handing one to a
 * public page would open the whole workout - and, across 35 cards, most of the
 * library - to anyone who read it out of a network tab. So this returns a
 * poster and an animated clip, both signed as image types, plus the thing a
 * video cannot show at a glance anyway: the actual exercise list.
 *
 * A REAL sixty-second preview needs clipped Mux assets (one short asset per
 * workout, its own playback id), not a different token here. See the note in
 * docs/ads/program-purchase-v1-brief.md.
 *
 * The allowlist is the programme being sold. A code outside it 404s no matter
 * what the client asks for, so this cannot be walked across the library.
 */

const CODE_RE = /^[A-Za-z0-9_-]{1,32}$/;
const SLUG = PROGRAM_PURCHASE_ROLES.program_foundation;

// The playlist changes when content is published, not per request.
let allow: { at: number; codes: Set<string> } | null = null;
const TTL = 5 * 60_000;

async function allowedCodes(): Promise<Set<string>> {
  if (allow && Date.now() - allow.at < TTL) return allow.codes;
  const sessions = await adminDb
    .collection("programs").doc(SLUG).collection("sessions").get();
  const codes = new Set(
    sessions.docs.map((d) => d.data()?.videoCode as string | undefined).filter(Boolean) as string[],
  );
  allow = { at: Date.now(), codes };
  return codes;
}

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  if (!CODE_RE.test(code)) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip");
  if (ip && !(await allowRequest("startPreview", ip, 80, HOUR_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!(await allowedCodes()).has(code)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const snap = await adminDb.collection("videos").doc(code).get();
  const v = snap.data();
  // Draft or archived content must not be previewed as part of what is sold.
  if (!v || (v.status !== undefined && v.status !== "published")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const playbackId = v.muxPlaybackId as string | undefined;
  if (!playbackId) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Eight seconds at 420px, served as webp. Ten seconds of gif at 480 measured
  // 9.8MB - unshippable to a phone on a mobile ad landing; the same clip as
  // webp is a fifth of that, and the modal only fetches it on a tap.
  const { thumbnail, gif } = await signPreviewTokens(playbackId, 8, 420);
  const base = `https://image.mux.com/${playbackId}`;

  // The exercise list is the honest heart of a preview: it answers "what will I
  // actually be doing" better than sixty seconds of footage does.
  const blocks = (Array.isArray(v.blocks) ? (v.blocks as VideoBlock[]) : []).map((b) => ({
    name: String(b?.name ?? ""),
    mins: Number(b?.mins ?? 0),
    items: (Array.isArray(b?.items) ? b.items : []).map(exerciseName).filter(Boolean),
  }));

  return NextResponse.json(
    {
      code,
      title: String(v.title ?? code),
      theme: String(v.theme ?? ""),
      mins: Number(v.mins ?? 0),
      format: v.format ? String(v.format) : null,
      poster: `${base}/thumbnail.jpg?token=${thumbnail}`,
      animation: `${base}/animated.webp?token=${gif}`,
      blocks,
    },
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
