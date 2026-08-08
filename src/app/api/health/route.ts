import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Node runtime (firebase-admin needs Node, not Edge) and never statically
// cached — this must run live so it actually proves prod credentials + reach.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Lightweight admin read: proves the service-account key parses at runtime
    // and Firestore is reachable from this environment (e.g. Vercel).
    await adminDb.listCollections();
    // Public endpoint: never expose project ids or raw error internals here.
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
