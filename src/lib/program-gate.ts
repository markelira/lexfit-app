import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { subscriptionRef } from "@/lib/pricing/subscription";
import { hasAccessFromData, hasProgramAccessFromData, type SubscriptionDoc } from "@/lib/pricing/types";

/**
 * Server-side answer to "may this account stream this video?" (P1).
 *
 * Before programme purchases existed the answer was one boolean for the whole
 * library. Now a video can be reachable two ways: an active membership, or
 * owning a programme whose playlist contains it. The playlist is the ONLY
 * membership signal - the same rule `lib/program-index` uses on the client -
 * so nothing has to be re-tagged on the video documents.
 */

const TTL_MS = 5 * 60_000;
let cache: { at: number; map: Map<string, string[]> } | null = null;
let inflight: Promise<Map<string, string[]>> | null = null;

/** video code → every published programme whose playlist contains it. */
async function videoProgramMap(): Promise<Map<string, string[]>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map;
  // Collapse concurrent misses onto one read - a cold lambda serving a burst of
  // token requests would otherwise fan out one full programme scan per request.
  inflight ??= (async () => {
    const map = new Map<string, string[]>();
    const progs = await adminDb.collection("programs").where("status", "==", "published").get();
    await Promise.all(
      progs.docs.map(async (p) => {
        const sessions = await p.ref.collection("sessions").get();
        for (const s of sessions.docs) {
          const code = s.data()?.videoCode as string | undefined;
          if (!code) continue;
          const list = map.get(code);
          if (list) list.push(p.id);
          else map.set(code, [p.id]);
        }
      }),
    );
    cache = { at: Date.now(), map };
    inflight = null;
    return map;
  })().catch((e) => {
    inflight = null;
    throw e;
  });
  return inflight;
}

/** Which published programmes contain this video (empty = standalone). */
export async function programsOfVideo(code: string): Promise<string[]> {
  return (await videoProgramMap()).get(code) ?? [];
}

/**
 * The gate the Mux token route calls.
 *
 * `challenge` videos live outside every programme playlist, so a programme
 * purchase never reaches them - only a membership does. That is not an
 * oversight: the challenge archive is what the membership upsell is FOR.
 */
export async function canPlayVideo(
  uid: string,
  code: string,
  kind: "video" | "challenge",
): Promise<boolean> {
  const sub = (await subscriptionRef(uid).get()).data() as SubscriptionDoc | undefined;
  const now = Date.now();
  if (hasAccessFromData(sub, now)) return true;
  if (kind === "challenge") return false;
  const owned = sub?.programs;
  if (!owned || Object.keys(owned).length === 0) return false;
  const slugs = await programsOfVideo(code);
  return slugs.some((slug) => hasProgramAccessFromData(sub, slug, now));
}
