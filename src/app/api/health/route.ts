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
    return NextResponse.json({
      ok: true,
      firestore: "connected",
      project: process.env.FIREBASE_ADMIN_PROJECT_ID ?? null,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
