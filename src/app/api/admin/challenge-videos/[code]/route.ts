import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { buildBlocks, type RawBlock } from "@/lib/admin-blocks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["draft", "published", "soon", "archived"]);

interface ChallengeVideoBody {
  create?: boolean;
  title?: string;
  bodyPart?: string;
  level?: number;
  mins?: number;
  blocks?: RawBlock[];
  status?: string;
}

/** Admin-only: create/update a Kihívások day video (challengeVideos/). Mux fields stay mux-managed. */
export async function PUT(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { code } = await params;
  const b = (await req.json().catch(() => ({}))) as ChallengeVideoBody;

  if (!b.title || !String(b.title).trim()) {
    return NextResponse.json({ error: "A cím kötelező." }, { status: 400 });
  }

  const ref = adminDb.collection("challengeVideos").doc(code);
  const snap = await ref.get();
  if (b.create && snap.exists) {
    return NextResponse.json({ error: `A(z) "${code}" kód már létezik.` }, { status: 409 });
  }

  const patch: Record<string, unknown> = {
    title: String(b.title).trim(),
    bodyPart: String(b.bodyPart ?? "").trim(),
    level: Math.min(3, Math.max(1, Number(b.level) || 1)),
    mins: Math.max(0, Math.round(Number(b.mins) || 0)),
    blocks: buildBlocks(b.blocks, Number(snap.data()?.muxDuration) || 0),
    status: STATUSES.has(String(b.status)) ? b.status : "draft",
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Initialize Mux/default fields on CREATE only — never clobber them on update.
  if (!snap.exists) {
    Object.assign(patch, {
      code,
      orientation: "portrait",
      muxAssetId: null,
      muxPlaybackId: null,
      muxStatus: "none",
      muxDuration: null,
      thumb: null,
      published: false,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  await ref.set(patch, { merge: true });
  return NextResponse.json({ ok: true, code });
}

/** Admin-only: delete a challenge video — blocked while any challenge day links it. */
export async function DELETE(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { code } = await params;

  const days = await adminDb.collectionGroup("days").get();
  const usedIn = new Set<string>();
  days.forEach((d) => {
    if (d.data().videoCode === code) {
      const slug = d.ref.parent.parent?.id;
      if (slug) usedIn.add(slug);
    }
  });
  if (usedIn.size > 0) {
    return NextResponse.json(
      { error: `A videó még használatban van: ${[...usedIn].join(", ")}. Előbb vedd ki a kihívás(ok)ból.` },
      { status: 409 },
    );
  }

  await adminDb.collection("challengeVideos").doc(code).delete();
  return NextResponse.json({ ok: true });
}
