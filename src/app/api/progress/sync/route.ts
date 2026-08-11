import "server-only";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { verifyRequest } from "@/lib/auth-server";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { adminApp, adminDb } from "@/lib/firebase-admin";
import { computeStreak } from "@/lib/streak";
import { COLLECTIONS, milestoneDocId } from "@/lib/pricing/keys";
import { nextTrainingDayHu, sendFirstWorkout } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Mux Data is the single source of truth for watch time + completions. ─────
// The player tags every view with viewer_user_id = Firebase uid; this route
// pulls the user's finished views from the Mux Data API and folds them into
// users/{uid}/progress/state: dated watchByDay buckets, the completed[] log
// (≥90% of the video reached), doneCount, streak, currentIndex, lastCompletedDate.
// Views are immutable once finalized, so a (view id → seen) map plus an
// overlapping time window makes the fold idempotent.

const MUX_API = "https://api.mux.com";
const RETENTION_DAYS = 90; // deepest window we ever ask Mux for
const OVERLAP_S = 24 * 3600; // re-query overlap so late-finalizing views aren't missed
const SEEN_TTL_S = 3 * 24 * 3600; // keep seen-ids long enough to cover the overlap
const COMPLETE_FRACTION = 0.9; // ≥90% of the video reached = completed workout
// …but a pure scrub-through never counts: require real playback of at least
// half the video, capped at 60s (so short clips can still complete).
const minPlayMs = (durSec: number) => Math.min(60_000, durSec * 500);

const muxAuth = () =>
  "Basic " + Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString("base64");

interface MuxViewListItem { id: string; view_end: string }
interface MuxViewDetail {
  id: string;
  video_id: string | null; // our workout code (player metadata)
  view_end: string;
  view_dropped: boolean;
  exit_before_video_start: boolean;
  view_content_playing_time: number | null; // ms actually played
  view_playing_time: string | number | null;
  view_max_playhead_position: string | number | null; // ms
  page_url: string | null;
}

async function muxGet<T>(path: string, params: URLSearchParams): Promise<T> {
  const res = await fetch(`${MUX_API}${path}?${params}`, {
    headers: { Authorization: muxAuth() },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`mux ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** All finished views for this viewer in [fromSec, toSec] (paged). */
async function listViews(uid: string, fromSec: number, toSec: number): Promise<MuxViewListItem[]> {
  const out: MuxViewListItem[] = [];
  for (let page = 1; page <= 10; page++) {
    // NB: viewer_id is a dedicated query param on the list endpoint -
    // `filters[]=viewer_id:…` is rejected as an invalid dimension.
    const params = new URLSearchParams({ limit: "100", page: String(page), viewer_id: uid });
    params.append("timeframe[]", String(fromSec));
    params.append("timeframe[]", String(toSec));
    const body = await muxGet<{ data: MuxViewListItem[] }>("/data/v1/video-views", params);
    out.push(...body.data);
    if (body.data.length < 100) break;
  }
  return out;
}

async function viewDetail(id: string, fromSec: number, toSec: number): Promise<MuxViewDetail> {
  const params = new URLSearchParams();
  params.append("timeframe[]", String(fromSec));
  params.append("timeframe[]", String(toSec));
  const body = await muxGet<{ data: MuxViewDetail }>(`/data/v1/video-views/${id}`, params);
  return body.data;
}

// Calendar day + clock time of a UTC instant in the app's home timezone.
const BUDA_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Budapest",
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hour12: false,
});
function budapest(iso: string): { day: string; time: string } {
  const parts = Object.fromEntries(BUDA_FMT.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour === "24" ? "00" : parts.hour}:${parts.minute}` };
}

interface Completion { code: string; at: string; atTime: string }

export async function POST(req: Request) {
  const token = await verifyRequest(req);
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = token.uid;

  // One call fans out to up to ~100 Mux Data fetches - cap per uid well above
  // legit usage (client throttles to 15 min, force paths are user actions).
  if (!(await allowRequest("progressSync", uid, 30, HOUR_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const ref = adminDb.doc(`users/${uid}/progress/state`);
  const snap = await ref.get();
  const cur = (snap.exists ? snap.data() : {}) as Record<string, unknown>;

  const nowSec = Math.floor(Date.now() / 1000);
  const muxSync = cur.muxSync as { lastSyncAt: number; seen: Record<string, number> } | undefined;
  const firstSync = !muxSync;
  const fromSec = Math.max(
    nowSec - RETENTION_DAYS * 86400,
    firstSync ? 0 : (muxSync!.lastSyncAt ?? nowSec) - OVERLAP_S,
  );
  const seen: Record<string, number> = { ...(muxSync?.seen ?? {}) };

  // 1 · Pull the new finished views from Mux.
  let views: MuxViewListItem[] = [];
  try {
    views = await listViews(uid, fromSec, nowSec);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "mux unavailable" }, { status: 502 });
  }
  const fresh = views.filter((v) => !(v.id in seen));

  // 2 · Detail-fetch each fresh view; keep only real playback.
  const details: MuxViewDetail[] = [];
  for (const v of fresh.slice(0, 100)) {
    try { details.push(await viewDetail(v.id, fromSec, nowSec)); } catch { /* retried next sync via overlap */ }
  }
  const prod = process.env.NODE_ENV === "production";
  const usable = details.filter((d) => {
    if (d.view_dropped || d.exit_before_video_start) return false;
    if (!d.video_id) return false;
    // Local-dev playback beacons to the same Mux env; keep prod stats clean.
    if (prod && /^https?:\/\/(localhost|127\.)/.test(d.page_url ?? "")) return false;
    return true;
  });

  // 3 · Program context: code → session order (playlist position). The streak's
  // workout-day set comes from the USER's chosen training days (their cadence),
  // NOT an authored program calendar - a program is an ordered pool.
  const sessionsSnap = await adminDb.collection("programs/foundation/sessions").get();
  const orderByCode: Record<string, number> = {};
  sessionsSnap.forEach((d) => {
    const s = d.data() as { videoCode?: string; order?: number };
    if (s.videoCode != null && s.order != null) orderByCode[s.videoCode] = s.order;
  });
  const prefsPlan = (await adminDb.doc(`users/${uid}/settings/prefs`).get()).data()?.plan ?? {};
  const workoutIdx = new Set<number>(((prefsPlan.weekdays ?? []) as number[]).map((w) => w - 1)); // 1..7 → 0..6 (Mon-first)
  const restDayKeepsStreak = (prefsPlan.restDayKeepsStreak ?? true) as boolean;

  // 4 · Fold views into watch seconds and completions. Kihívások membership is
  // detected lazily (a code missing from videos/ but present in challengeVideos/)
  // so the global collectionGroup("days") slug scan below is paid ONLY by syncs
  // that actually complete a challenge day, not by every Foundation-only sync.
  const watchAdd: Record<string, number> = {};
  const completions: Completion[] = [];
  const challengeCodes = new Set<string>();
  const rawChallengeCompletions: { code: string; at: string }[] = [];
  const durationCache: Record<string, number> = {};
  for (const d of usable) {
    const code = d.video_id!;
    const playedMs = Number(d.view_content_playing_time ?? d.view_playing_time ?? 0);
    const { day, time } = budapest(d.view_end);
    if (playedMs > 0) watchAdd[day] = (watchAdd[day] ?? 0) + Math.round(playedMs / 1000);

    if (!(code in durationCache)) {
      let vs = await adminDb.doc(`videos/${code}`).get();
      if (!vs.exists) {
        const cvs = await adminDb.doc(`challengeVideos/${code}`).get();
        if (cvs.exists) { challengeCodes.add(code); vs = cvs; }
      }
      durationCache[code] = Number(vs.data()?.muxDuration ?? 0);
    }
    const durSec = durationCache[code];
    const playheadMs = Number(d.view_max_playhead_position ?? 0);
    if (durSec > 0 && playheadMs / 1000 >= durSec * COMPLETE_FRACTION && playedMs >= minPlayMs(durSec)) {
      if (challengeCodes.has(code)) rawChallengeCompletions.push({ code, at: day });
      else completions.push({ code, at: day, atTime: time });
    }
    seen[d.id] = Math.floor(new Date(d.view_end).getTime() / 1000);
  }

  // Resolve challenge slug + per-challenge day count only when a day completed.
  const challengeCompletions: { slug: string; code: string; at: string }[] = [];
  const challengeDaysCount: Record<string, number> = {};
  if (rawChallengeCompletions.length) {
    const slugByCode: Record<string, string> = {};
    try {
      const daysSnap = await adminDb.collectionGroup("days").get();
      daysSnap.forEach((d) => {
        const slug = d.ref.parent.parent?.id;
        const code = (d.data() as { videoCode?: string }).videoCode;
        if (slug && code) { slugByCode[code] = slug; challengeDaysCount[slug] = (challengeDaysCount[slug] ?? 0) + 1; }
      });
    } catch { /* ignore - completions just won't be attributed this sync */ }
    for (const c of rawChallengeCompletions) {
      const slug = slugByCode[c.code];
      if (slug) challengeCompletions.push({ slug, code: c.code, at: c.at });
    }
  }
  // Views we listed but didn't (or couldn't) detail-fetch stay un-seen and are
  // retried inside the overlap window next sync.
  for (const d of details) if (!(d.id in seen)) seen[d.id] = Math.floor(new Date(d.view_end).getTime() / 1000);
  for (const id of Object.keys(seen)) if (seen[id] < nowSec - SEEN_TTL_S) delete seen[id];

  // 5 · Rebuild derived state. First sync starts clean: legacy client-collected
  // completions/watch time are discarded - Mux is the only source from cutover.
  const baseCompleted = firstSync
    ? []
    : ([...((cur.completed as Completion[] | undefined) ?? [])] as Completion[]);
  const baseWatch = firstSync ? {} : { ...((cur.watchByDay as Record<string, number> | undefined) ?? {}) };

  for (const c of completions) {
    if (!baseCompleted.some((b) => b.code === c.code && b.at === c.at)) baseCompleted.push(c);
  }
  for (const [day, s] of Object.entries(watchAdd)) baseWatch[day] = (baseWatch[day] ?? 0) + s;

  // 5b · Kihívások completions → the separate store, and their dates → the flame.
  // Read every challengeProgress doc so the streak sees ALL past challenge days
  // (prior syncs stored them here, not in Foundation completed[]).
  const challengeDates: string[] = [];
  const cpBySlug: Record<string, { doneDays: Set<string>; dayDates: Record<string, string>; completedAt: boolean }> = {};
  try {
    const cpSnap = await adminDb.collection(`users/${uid}/challengeProgress`).get();
    cpSnap.forEach((d) => {
      const data = d.data() as { doneDays?: string[]; dayDates?: Record<string, string>; completedAt?: unknown };
      cpBySlug[d.id] = { doneDays: new Set(data.doneDays ?? []), dayDates: { ...(data.dayDates ?? {}) }, completedAt: !!data.completedAt };
      for (const dd of Object.values(data.dayDates ?? {})) challengeDates.push(dd);
    });
  } catch { /* none yet */ }
  const touchedSlugs = new Set<string>();
  for (const c of challengeCompletions) {
    const cur = cpBySlug[c.slug] ?? (cpBySlug[c.slug] = { doneDays: new Set(), dayDates: {}, completedAt: false });
    if (!cur.dayDates[c.code]) { cur.dayDates[c.code] = c.at; challengeDates.push(c.at); }
    cur.doneDays.add(c.code);
    touchedSlugs.add(c.slug);
  }
  await Promise.all([...touchedSlugs].map((slug) => {
    const cur = cpBySlug[slug];
    const total = challengeDaysCount[slug] ?? 0;
    const nowComplete = total > 0 && cur.doneDays.size >= total;
    // arrayUnion (not a full-array write) so a completion the client marks
    // mid-sync composes instead of being clobbered by our stale snapshot.
    // dayDates is a map → merge:true deep-unions its keys, also non-destructive.
    const newCodes = challengeCompletions.filter((c) => c.slug === slug).map((c) => c.code);
    return adminDb.doc(`users/${uid}/challengeProgress/${slug}`).set({
      slug,
      doneDays: FieldValue.arrayUnion(...newCodes),
      dayDates: cur.dayDates,
      ...(nowComplete && !cur.completedAt ? { completedAt: FieldValue.serverTimestamp() } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }));

  // restDayKeepsStreak + workoutIdx read once from prefs (step 3 above).
  const dates = baseCompleted.map((c) => c.at);
  const distinct = new Set(baseCompleted.map((c) => c.code));
  const todayStr = budapest(new Date().toISOString()).day;
  const doneCount = distinct.size;
  const lastCompletedDate = dates.length ? [...dates].sort().at(-1)! : null;
  // Foundation doneCount/completed[] stay challenge-free; the flame counts both.
  const streak = computeStreak([...dates, ...challengeDates], workoutIdx, todayStr, restDayKeepsStreak);
  let currentIndex = firstSync ? 0 : Number(cur.currentIndex ?? 0);
  for (const code of distinct) {
    const order = orderByCode[code];
    if (order != null) currentIndex = Math.max(currentIndex, order + 1);
  }

  const derived = {
    programId: (cur.programId as string) ?? "foundation",
    completed: baseCompleted,
    watchByDay: baseWatch,
    doneCount,
    streak,
    lastCompletedDate,
    currentIndex,
    workoutDays: [...workoutIdx].sort(),
    muxSync: { lastSyncAt: nowSec, seen },
  };
  if (!snap.exists) {
    await ref.set({ ...derived, joinedAt: FieldValue.serverTimestamp(), resume: {} });
  } else {
    // update(): top-level map values (watchByDay, muxSync) replace wholesale -
    // set+merge would deep-merge and resurrect pruned/wiped keys - and dotted
    // paths delete just the completed codes' resume positions.
    const update: Record<string, unknown> = { ...derived };
    for (const c of completions) {
      update[`resume.${c.code}`] = FieldValue.delete();
      update[`resumeAt.${c.code}`] = FieldValue.delete();
    }
    await ref.update(update);
  }

  // "Az első megvan" - the activation-milestone email, fired the first time a
  // completion ever lands for this user (§4d/17). Best-effort + milestone-
  // gated: a send failure or a double sync can never break or repeat it.
  const hadCompletionsBefore =
    !firstSync && (((cur.completed as Completion[] | undefined)?.length ?? 0) > 0);
  if (!hadCompletionsBefore && baseCompleted.length > 0) {
    void (async () => {
      const mRef = adminDb
        .collection(COLLECTIONS.milestones)
        .doc(milestoneDocId(uid, "first_workout_email_sent"));
      if ((await mRef.get()).exists) return;
      const email = (await getAuth(adminApp).getUser(uid).catch(() => null))?.email;
      if (!email) return;
      const todayWeekday = ((new Date(todayStr).getDay() + 6) % 7) + 1; // 1=Mon … 7=Sun
      const nextDay = nextTrainingDayHu(
        ((prefsPlan.weekdays ?? []) as number[]),
        todayWeekday,
      );
      await sendFirstWorkout(email, uid, nextDay);
      await mRef.set({ userId: uid, kind: "first_workout_email_sent", firedAt: Date.now() });
    })().catch((e) => console.error("[first workout email]", e));
  }

  return NextResponse.json({
    synced: usable.length,
    completions: completions.map((c) => ({ code: c.code, at: c.at })),
    doneCount,
    streak,
  });
}
