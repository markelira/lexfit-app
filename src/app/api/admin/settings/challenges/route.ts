import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyRequest, isAdmin } from "@/lib/auth-server";
import { adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: settings/challenges (fbGroupUrl — the Kihívások community link).
 *  Previously unauthorable on prod: nothing ever created this doc. */
export async function PUT(req: Request) {
  const token = await verifyRequest(req);
  if (!token || !isAdmin(token)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { fbGroupUrl?: unknown };
  const raw = typeof body.fbGroupUrl === "string" ? body.fbGroupUrl.trim() : "";
  if (raw && !/^https:\/\//.test(raw)) {
    return NextResponse.json({ error: "https:// linket adj meg (vagy hagyd üresen)." }, { status: 400 });
  }

  await adminDb.collection("settings").doc("challenges").set(
    { fbGroupUrl: raw || null, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  return NextResponse.json({ ok: true, fbGroupUrl: raw || null });
}