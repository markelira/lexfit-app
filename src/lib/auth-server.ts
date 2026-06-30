import "server-only";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { adminApp } from "@/lib/firebase-admin";

/** Verify the Firebase ID token from the Authorization header. */
export async function verifyRequest(req: Request): Promise<DecodedIdToken | null> {
  const authz = req.headers.get("authorization") ?? "";
  const match = authz.match(/^Bearer (.+)$/);
  if (!match) return null;
  try {
    return await getAuth(adminApp).verifyIdToken(match[1]);
  } catch {
    return null;
  }
}

// Admin allowlist — the owner account. The Phase 7 dashboard will use this.
const ADMIN_EMAILS = new Set(["gorgeimarko@gmail.com"]);

export function isAdmin(token: DecodedIdToken): boolean {
  return token.email != null && ADMIN_EMAILS.has(token.email);
}
