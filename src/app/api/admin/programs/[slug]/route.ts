import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS = new Set(["members", "free"]);
const STATUSES = new Set(["draft", "published", "soon", "archived"]);
const str = (v: unknown) => String(v ?? "").trim();
const numOrNull = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Admin-only: create/update a program's metadata (totalSessions is managed by the sessions route). */
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!str(b.title)) return NextResponse.json({ error: "A cím kötelező." }, { status: 400 });

  const ref = adminDb.collection("programs").doc(slug);
  const snap = await ref.get();
  if (b.create && snap.exists) {
    return NextResponse.json({ error: `A(z) "${slug}" program már létezik.` }, { status: 409 });
  }

  const facts = Array.isArray(b.facts) ? b.facts : [];
  const phases = Array.isArray(b.phases) ? b.phases : [];
  const patch: Record<string, unknown> = {
    title: str(b.title),
    hu: str(b.hu),
    category: str(b.category) || "Program",
    eyebrow: str(b.eyebrow),
    level: str(b.level),
    goal: str(b.goal) || null,
    equipment: str(b.equipment) || null,
    synopsis: str(b.synopsis),
    facts: facts
      .map((f) => ({ label: str((f as Record<string, unknown>).label), value: str((f as Record<string, unknown>).value) }))
      .filter((f) => f.label),
    defaultMins: numOrNull(b.defaultMins),
    phases: phases.map((p, i) => {
      const o = p as Record<string, unknown>;
      return {
        idx: i,
        icon: str(o.icon),
        name: str(o.name),
        short: str(o.short),
        desc: str(o.desc),
        colorVar: str(o.colorVar) || "var(--cat-teljes)",
      };
    }),
    cover: str(b.cover) || null,
    trailerPlaybackId: str(b.trailerPlaybackId) || null,
    access: ACCESS.has(String(b.access)) ? b.access : "members",
    status: STATUSES.has(String(b.status)) ? b.status : "draft",
    order: numOrNull(b.order) ?? 0,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!snap.exists) {
    Object.assign(patch, { slug, totalSessions: 0, createdAt: FieldValue.serverTimestamp() });
  }

  await ref.set(patch, { merge: true });
  return NextResponse.json({ ok: true, slug });
}

/** Admin-only: delete a program and its sessions subcollection. */
export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const ref = adminDb.collection("programs").doc(slug);
  const sessions = await ref.collection("sessions").get();
  const batch = adminDb.batch();
  sessions.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();
  return NextResponse.json({ ok: true });
}
