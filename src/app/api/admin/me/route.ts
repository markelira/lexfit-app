import "server-only";
import { NextResponse } from "next/server";
import { verifyRequest, isAdmin } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Canonical "am I an admin?" check for the admin shell gate. Also reports
 *  which backend this server writes to — the layout shows a PROD/EMULATOR
 *  badge so `npm run dev` can never be mistaken for `dev:local`. */
export async function GET(req: Request) {
  const token = await verifyRequest(req);
  const admin = !!token && isAdmin(token);
  return NextResponse.json(
    { admin, emulator: !!process.env.FIRESTORE_EMULATOR_HOST },
    { status: admin ? 200 : 403 },
  );
}
