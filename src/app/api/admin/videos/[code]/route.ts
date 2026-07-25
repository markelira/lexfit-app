import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["draft", "published", "soon", "archived"]);

interface RawExercise {
  name?: string;
  start?: number;
}

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
  blocks?: { name?: string; mins?: number; items?: (string | RawExercise)[]; start?: number }[];
  status?: string;
}

interface CleanExercise {
  name: string;
  start?: number;
}

interface CleanBlock {
  name: string;
  mins: number;
  items: CleanExercise[];
  start?: number;
}

/**
 * Sanitize a block's exercises. Each entry may arrive as a legacy string or as
 * { name, start? }. Empty-name entries are dropped. `start` (absolute seconds) is
 * kept only when finite and non-negative, clamped to the duration when known —
 * mirroring how block-level `start` is handled.
 */
function buildItems(raw: unknown, dur: number): CleanExercise[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): CleanExercise => {
      const src = typeof entry === "string" ? { name: entry } : (entry ?? {});
      const ex: CleanExercise = { name: String((src as RawExercise).name ?? "").trim() };
      const s = Number((src as RawExercise).start);
      if (Number.isFinite(s) && s >= 0) ex.start = dur > 0 ? Math.min(s, dur) : s;
      return ex;
    })
    .filter((ex) => ex.name);
}

/**
 * Sanitize blocks. When EVERY block carries a numeric `start` (seconds), the video
 * is "stamped": sort by start and auto-derive each block's `mins` from the gap to
 * the next start (last block runs to the video duration). `start` is only ever
 * attached when finite (Firestore rejects `undefined`).
 */
function buildBlocks(raw: VideoBody["blocks"], dur: number): CleanBlock[] {
  if (!Array.isArray(raw)) return [];
  let blocks: CleanBlock[] = raw
    .map((bl) => {
      const block: CleanBlock = {
        name: String(bl.name ?? "").trim(),
        mins: Math.max(0, Math.round(Number(bl.mins) || 0)),
        items: buildItems(bl.items, dur),
      };
      const s = Number(bl.start);
      if (Number.isFinite(s) && s >= 0) block.start = dur > 0 ? Math.min(s, dur) : s;
      return block;
    })
    .filter((bl) => bl.name);

  const allStamped = blocks.length > 0 && blocks.every((bl) => typeof bl.start === "number");
  if (allStamped) {
    blocks.sort((a, b) => a.start! - b.start!);
    blocks = blocks.map((bl, i) => {
      const next = i + 1 < blocks.length ? blocks[i + 1].start! : dur > 0 ? dur : null;
      const mins = next != null ? Math.max(0, Math.round((next - bl.start!) / 60)) : bl.mins;
      return { ...bl, mins };
    });
  }
  return blocks;
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

  // Initialize Mux/default fields on CREATE only — never clobber them on update.
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

/** Admin-only: delete a video — blocked while it's still linked in any program. */
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
