import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";
import { buildBlocks, type RawBlock } from "@/lib/admin-blocks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["draft", "published", "soon", "archived"]);

interface VideoBody {
  create?: boolean;
  kind?: string;
  series?: string | null;
  title?: string;
  theme?: string;
  level?: number;
  format?: string;
  types?: string[];
  mins?: number;
  blocks?: RawBlock[];
  status?: string;
}

/** Admin-only: create/update a video's metadata (Mux fields stay mux-managed). */
export async function PUT(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { code } = await params;
  const b = (await req.json().catch(() => ({}))) as VideoBody;

  if (!b.title || !String(b.title).trim()) {
    return NextResponse.json({ error: "A cím kötelező." }, { status: 400 });
  }

  const ref = adminDb.collection("videos").doc(code);
  const snap = await ref.get();
  if (b.create && snap.exists) {
    return NextResponse.json({ error: `A(z) "${code}" kód már létezik.` }, { status: 409 });
  }

  const kind = b.kind === "bonus" ? "bonus" : "workout";
  const patch: Record<string, unknown> = {
    kind,
    series: kind === "bonus" && b.series ? String(b.series).trim() : null,
    title: String(b.title).trim(),
    theme: String(b.theme ?? "").trim(),
    level: Math.min(3, Math.max(1, Number(b.level) || 1)),
    format: String(b.format ?? "").trim(),
    types: Array.isArray(b.types) ? [...new Set(b.types.map((t) => String(t).trim()).filter(Boolean))] : [],
    mins: Math.max(0, Math.round(Number(b.mins) || 0)),
    blocks: buildBlocks(b.blocks, Number(snap.data()?.muxDuration) || 0),
    status: STATUSES.has(String(b.status)) ? b.status : "draft",
    updatedAt: FieldValue.serverTimestamp(),
  };

  // Initialize Mux/default fields on CREATE only - never clobber them on update.
  if (!snap.exists) {
    Object.assign(patch, {
      code,
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

/** Admin-only: delete a video - blocked while it's still linked in any program. */
export async function DELETE(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { code } = await params;

  const sessions = await adminDb.collectionGroup("sessions").get();
  const usedIn = new Set<string>();
  sessions.forEach((d) => {
    if (d.data().videoCode === code) {
      const slug = d.ref.parent.parent?.id;
      if (slug) usedIn.add(slug);
    }
  });
  if (usedIn.size > 0) {
    return NextResponse.json(
      { error: `A videó még használatban van: ${[...usedIn].join(", ")}. Előbb vedd ki a program(ok)ból.` },
      { status: 409 },
    );
  }

  await adminDb.collection("videos").doc(code).delete();
  return NextResponse.json({ ok: true });
}
