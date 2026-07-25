"use client";

import { auth } from "@/lib/firebase";

/**
 * Fetch an admin `/api/admin/*` route with the caller's Firebase ID token
 * attached as a Bearer header (the server re-verifies admin via isAdmin).
 * JSON bodies are stringified and the Content-Type set automatically.
 */
export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const idToken = await auth.currentUser?.getIdToken();
  const hasJsonBody = init.body != null && typeof init.body === "string";
  return fetch(path, {
    ...init,
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
}

/** adminFetch + JSON parse; throws on a non-2xx response with the server error. */
export async function adminJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await adminFetch(path, init);
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body?.error ?? `Hiba (${res.status})`);
  return body;
}
