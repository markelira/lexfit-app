import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest, isAdmin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Canonical "am I an admin?" check for the admin shell gate. */
export async function GET(req: Request) {
  const token = await verifyRequest(req);
  const admin = !!token && isAdmin(token);
  return NextResponse.json({ admin }, { status: admin ? 200 : 403 });
}
