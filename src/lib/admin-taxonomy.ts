import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { FilterDimension } from "@/lib/types";

/**
 * Shared upsert for taxonomy dimensions (filters/ and challengeFilters/).
 * Creates the doc when missing - on empty prod the first admin save
 * bootstraps the dimension using the canonical defaults for label/order.
 */
export async function upsertFilterDimension(
  collection: "filters" | "challengeFilters",
  defaults: FilterDimension[],
  key: string,
  body: { options?: unknown; label?: unknown },
): Promise<NextResponse> {
  const options = Array.isArray(body.options)
    ? [...new Set(body.options.map((o) => String(o).trim()).filter(Boolean))]
    : null;
  if (!options || options.length === 0) {
    return NextResponse.json({ error: "Legalább egy értéket meg kell adni." }, { status: 400 });
  }

  const def = defaults.find((d) => d.key === key);
  const ref = adminDb.collection(collection).doc(key);
  const snap = await ref.get();
  if (!snap.exists && !def) {
    return NextResponse.json({ error: `Ismeretlen szűrő: ${key}` }, { status: 404 });
  }

  const patch: Record<string, unknown> = { options, updatedAt: FieldValue.serverTimestamp() };
  if (typeof body.label === "string" && body.label.trim()) patch.label = body.label.trim();
  if (!snap.exists && def) {
    Object.assign(patch, {
      key,
      label: patch.label ?? def.label,
      order: def.order,
      editable: true,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  await ref.set(patch, { merge: true });
  return NextResponse.json({ ok: true, key, options });
}
