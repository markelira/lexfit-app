// Small time helpers shared by the player and the admin block editor.

/** Seconds → "m:ss" (or "h:mm:ss" past an hour). */
export function secToClock(s: number): string {
  const t = Math.max(0, Math.floor(s));
  const sec = t % 60;
  const min = Math.floor(t / 60) % 60;
  const hr = Math.floor(t / 3600);
  const ss = String(sec).padStart(2, "0");
  return hr > 0 ? `${hr}:${String(min).padStart(2, "0")}:${ss}` : `${min}:${ss}`;
}

/**
 * Parse a "m:ss" / "h:mm:ss" / "90" clock string to seconds. Returns null for
 * empty/invalid input so callers can distinguish "unset" from 0.
 */
export function clockToSec(v: string): number | null {
  const s = v.trim();
  if (!s) return null;
  const parts = s.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  let total = 0;
  for (const n of nums) total = total * 60 + n;
  return Number.isFinite(total) ? total : null;
}
