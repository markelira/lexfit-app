import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// One-click unsubscribe tokens (RFC 8058). The URL lands on
// /api/email/unsubscribe which flips the matching pref via the Admin SDK - no
// login required, which is the point: mail clients POST it headlessly.
// HMAC-signed with CRON_SECRET so nobody can unsubscribe someone else by
// guessing uids. Tokens are deliberately non-expiring: an unsubscribe link in a
// year-old email must still work.

export type UnsubKind = "workout" | "streakRisk" | "weeklyRecap" | "marketing";

export const UNSUB_KINDS: readonly UnsubKind[] = [
  "workout",
  "streakRisk",
  "weeklyRecap",
  "marketing",
];

function secret(): string | null {
  return process.env.CRON_SECRET || null;
}

export function unsubToken(uid: string, kind: UnsubKind): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update(`unsub:${uid}:${kind}`).digest("hex").slice(0, 32);
}

export function verifyUnsubToken(uid: string, kind: UnsubKind, token: string): boolean {
  const want = unsubToken(uid, kind);
  if (!want || !token || token.length !== want.length) return false;
  try {
    return timingSafeEqual(Buffer.from(want), Buffer.from(token));
  } catch {
    return false;
  }
}

export function unsubUrl(uid: string, kind: UnsubKind): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
  const t = unsubToken(uid, kind);
  return `${base}/api/email/unsubscribe?uid=${encodeURIComponent(uid)}&kind=${kind}&t=${t}`;
}
