import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// One-click unsubscribe tokens (RFC 8058). The URL lands on
// /api/email/unsubscribe which flips the matching pref via the Admin SDK - no
// login required, which is the point: mail clients POST it headlessly.
// HMAC-signed with CRON_SECRET so nobody can unsubscribe someone else by
// guessing ids. Tokens are deliberately non-expiring: an unsubscribe link in a
// year-old email must still work.
//
// SUBJECT IDS. The signed id is a Firebase uid for a user, or a lead id
// (sha256 of the email - see src/lib/quiz/lead.ts) for a quiz lead who has no
// account. The HMAC input format is unchanged by that widening, on purpose:
// tokens never expire, so any change here would silently break the unsubscribe
// link in every email already delivered.

export type UnsubKind =
  | "workout"
  | "streakRisk"
  | "weeklyRecap"
  | "marketing"
  /** Quiz lead, no account. Grtv. §6 requires this on every marketing send. */
  | "leadMarketing";

export const UNSUB_KINDS: readonly UnsubKind[] = [
  "workout",
  "streakRisk",
  "weeklyRecap",
  "marketing",
  "leadMarketing",
];

function secret(): string | null {
  return process.env.CRON_SECRET || null;
}

/** `id` is a Firebase uid, or a quiz lead id for `leadMarketing`. */
export function unsubToken(id: string, kind: UnsubKind): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update(`unsub:${id}:${kind}`).digest("hex").slice(0, 32);
}

export function verifyUnsubToken(id: string, kind: UnsubKind, token: string): boolean {
  const want = unsubToken(id, kind);
  if (!want || !token || token.length !== want.length) return false;
  try {
    return timingSafeEqual(Buffer.from(want), Buffer.from(token));
  } catch {
    return false;
  }
}

export function unsubUrl(id: string, kind: UnsubKind): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
  const t = unsubToken(id, kind);
  // Query key stays `uid` - old links in delivered mail must keep working.
  return `${base}/api/email/unsubscribe?uid=${encodeURIComponent(id)}&kind=${kind}&t=${t}`;
}
