import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { upsertFilterDimension } from "@/lib/admin-taxonomy";
import { DEFAULT_CHALLENGE_FILTERS } from "@/lib/filter-defaults";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: upsert a Kihívások taxonomy dimension (challengeFilters/{key}).
 *  Creates the doc when missing — previously unauthorable on empty prod. */
export async function PUT(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { key } = await params;
  const body = (await req.json().catch(() => ({}))) as { options?: unknown; label?: unknown };
  return upsertFilterDimension("challengeFilters", DEFAULT_CHALLENGE_FILTERS, key, body);
}