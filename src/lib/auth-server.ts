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

// Admin allowlist — the owner account.
const ADMIN_EMAILS = new Set(["gorgeimarko@gmail.com"]);

/**
 * Admin = allowlisted email that signed in with GOOGLE. Pinning the provider
 * blocks a future risk (Phase 2 adds Facebook/Apple, where a non-Google account
 * could present an unverified email matching the allowlist). The owner always
 * uses Google, in dev (emulator) and prod alike.
 */
export function isAdmin(token: DecodedIdToken): boolean {
  return (
    token.firebase?.sign_in_provider === "google.com" &&
    token.email != null &&
    ADMIN_EMAILS.has(token.email)
  );
}
