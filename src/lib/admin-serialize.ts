// Recursively convert Firestore Timestamps (Admin SDK) to ISO strings so the
// result is JSON-serializable for admin API responses. Pure - server or client.
export function serialize<T = unknown>(v: unknown): T {
  if (v == null) return v as T;
  if (typeof v === "object") {
    const maybeTs = v as { toDate?: () => Date };
    if (typeof maybeTs.toDate === "function") return maybeTs.toDate().toISOString() as T;
    if (Array.isArray(v)) return v.map((x) => serialize(x)) as T;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(v)) out[k] = serialize((v as Record<string, unknown>)[k]);
    return out as T;
  }
  return v as T;
}
