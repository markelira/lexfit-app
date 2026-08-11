import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin-only: replace a program's playlist - an ordered list of video codes.
 * The playlist IS the structure: `order` is the sequence, `phaseIdx` groups it,
 * `retest` marks a visszamérés. No week/weekday is authored - the user's chosen
 * cadence (prefs.plan.daysPerWeek / weekdays) schedules the pool.
 *
 * Each session may carry an explicit `phaseIdx` and `retest`. When `phaseIdx`
 * is omitted, the playlist is distributed evenly across the program's phases.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { slug } = await params;
  const b = (await req.json().catch(() => ({}))) as { sessions?: unknown };
  const list = Array.isArray(b.sessions) ? (b.sessions as Record<string, unknown>[]) : [];
  const entries = list
    .map((s) => ({
      videoCode: String(s.videoCode ?? "").trim(),
      phaseIdx:
        s.phaseIdx === null || s.phaseIdx === undefined || s.phaseIdx === ""
          ? null
          : Number(s.phaseIdx),
      retest: s.retest === "soft" || s.retest === "final" ? (s.retest as string) : null,
    }))
    .filter((s) => s.videoCode);

  const progRef = adminDb.collection("programs").doc(slug);
  const progSnap = await progRef.get();
  if (!progSnap.exists) return NextResponse.json({ error: "Ismeretlen program." }, { status: 404 });
  const prog = (progSnap.data() ?? {}) as { phases?: unknown[] };
  const phaseCount = Array.isArray(prog.phases) ? prog.phases.length : 0;

  // Even fallback distribution across phases, only for sessions without an
  // explicit phaseIdx.
  const per = phaseCount > 0 ? Math.ceil(entries.length / phaseCount) : 0;
  const derivedPhase = (i: number): number | null =>
    phaseCount > 0 && per > 0 ? Math.min(phaseCount - 1, Math.floor(i / per)) : null;

  const sessCol = progRef.collection("sessions");
  const existing = await sessCol.get();
  const batch = adminDb.batch();
  existing.forEach((d) => batch.delete(d.ref));
  entries.forEach((e, i) => {
    batch.set(sessCol.doc(String(i).padStart(2, "0")), {
      videoCode: e.videoCode,
      order: i,
      phaseIdx: e.phaseIdx != null && Number.isFinite(e.phaseIdx) ? e.phaseIdx : derivedPhase(i),
      retest: e.retest,
    });
  });
  batch.set(progRef, { totalSessions: entries.length, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();

  return NextResponse.json({ ok: true, count: entries.length });
}
