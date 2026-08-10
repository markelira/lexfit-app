"use client";

import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Challenge,
  ChallengeDay,
  ChallengeProgress,
  ChallengeState,
  ChallengeVideo,
  FilterDimension,
} from "@/lib/types";

// ── The archive card: a challenge joined with this user's progress ──
export interface ChallengeCardData extends Challenge {
  doneCount: number;               // days completed by this user
  state: ChallengeState;           // elkezdetlen | folyamatban | kesz
  progressFrac: number;            // 0..1 across the whole series (card progress bar)
  // NB: the resume target ("Folytatás — N. nap") is intentionally NOT computed
  // here — the card lacks the ordered day list, and days can be done out of
  // order (ordered, never gated), so doneCount+1 would point at the wrong day.
  // The detail page (loadChallenge → nextOrder = first incomplete) owns resume.
  completedAt: unknown | null;
}

export interface ChallengesData {
  challenges: ChallengeCardData[];
  filters: Record<string, FilterDimension>;
  fbGroupUrl: string | null;
}

// ── A day on the playlist page: the ordered ref joined with its video ──
export interface ChallengeDayItem extends ChallengeDay {
  video: ChallengeVideo | null;
  done: boolean;
  resume: number;                  // seconds
}

export interface ChallengeDetail {
  challenge: Challenge;
  days: ChallengeDayItem[];
  progress: ChallengeProgress | null;
  doneCount: number;
  state: ChallengeState;
  nextOrder: number | null;        // 0-based order of the next unwatched day
  fbGroupUrl: string | null;
}

// ── computed dimensions (not stored) ──
export const daysBucket = (days: number) =>
  days <= 5 ? "≤5 nap" : days <= 7 ? "6–7 nap" : days <= 10 ? "8–10 nap" : "11–14 nap";

/** A challenge is in progress once ≥1 day is done OR a day has been started
 *  (a saved resume position) — so "Folytatod" catches a started-but-unfinished
 *  challenge, not only ones with a completed day. */
export const challengeState = (doneCount: number, totalDays: number, started = false): ChallengeState =>
  doneCount > 0 && totalDays > 0 && doneCount >= totalDays ? "kesz"
  : doneCount > 0 || started ? "folyamatban"
  : "elkezdetlen";

const hasResume = (prog?: Pick<ChallengeProgress, "resume"> | null) =>
  !!prog && Object.values(prog.resume ?? {}).some((s) => s > 0);

const STATE_LABEL: Record<ChallengeState, string> = {
  elkezdetlen: "Elkezdetlen",
  folyamatban: "Folyamatban",
  kesz: "Kész",
};

export interface ActiveChallengeFilters {
  len: Set<string>;    // HOSSZ (daysBucket)
  theme: Set<string>;  // TESTRÉSZ (bodyPart)
  state: Set<string>;  // ÁLLAPOT (computed)
}

export const emptyChallengeFilters = (): ActiveChallengeFilters => ({
  len: new Set(), theme: new Set(), state: new Set(),
});

export function filterChallenges(
  list: ChallengeCardData[],
  active: ActiveChallengeFilters,
): ChallengeCardData[] {
  return list.filter((c) => {
    if (active.len.size && !active.len.has(daysBucket(c.durationDays))) return false;
    if (active.theme.size && !active.theme.has(c.bodyPart)) return false;
    if (active.state.size && !active.state.has(STATE_LABEL[c.state])) return false;
    return true;
  });
}

// ── reads ──

/** All challenge-progress docs for a user, keyed by slug. */
async function loadProgressBySlug(uid: string | null): Promise<Record<string, ChallengeProgress>> {
  if (!uid) return {};
  const snap = await getDocs(collection(db, "users", uid, "challengeProgress"));
  const out: Record<string, ChallengeProgress> = {};
  snap.forEach((d) => {
    out[d.id] = { slug: d.id, doneDays: [], resume: {}, ...(d.data() as Partial<ChallengeProgress>) } as ChallengeProgress;
  });
  return out;
}

function cardFrom(c: Challenge, prog: ChallengeProgress | undefined): ChallengeCardData {
  const total = c.totalDays || c.durationDays || 0;
  const doneCount = prog ? prog.doneDays.length : 0;
  const state = challengeState(doneCount, total, hasResume(prog));
  return {
    ...c,
    doneCount,
    state,
    progressFrac: total > 0 ? Math.min(1, doneCount / total) : 0,
    completedAt: prog?.completedAt ?? null,
  };
}

/** Archive list: challenges + editable filters + this user's progress + FB link. */
export async function loadChallenges(uid: string | null): Promise<ChallengesData> {
  const [challengesSnap, filtersSnap, settingsSnap, progressBySlug] = await Promise.all([
    getDocs(collection(db, "challenges")),
    getDocs(collection(db, "challengeFilters")),
    getDoc(doc(db, "settings", "challenges")),
    loadProgressBySlug(uid),
  ]);

  const challenges = challengesSnap.docs
    .map((d) => cardFrom({ slug: d.id, ...(d.data() as Omit<Challenge, "slug">) }, progressBySlug[d.id]))
    // Only published challenges reach the archive — drafts/soon/archived stay
    // admin-only (challenges have an explicit publish workflow, unlike the library).
    .filter((c) => c.status === "published")
    // newest first (the archive is read backwards from now); order is a legacy
    // same-date tiebreak only — new challenges sort purely by sortDate
    .sort((a, b) => (b.sortDate || "").localeCompare(a.sortDate || "") || (a.order ?? 0) - (b.order ?? 0));

  const filters: Record<string, FilterDimension> = {};
  filtersSnap.forEach((d) => {
    filters[d.id] = { key: d.id, ...(d.data() as Omit<FilterDimension, "key">) };
  });

  const fbGroupUrl = settingsSnap.exists() ? ((settingsSnap.data() as { fbGroupUrl?: string }).fbGroupUrl ?? null) : null;
  return { challenges, filters, fbGroupUrl };
}

/** Playlist page: one challenge + its ordered days (joined with videos) + progress. */
export async function loadChallenge(slug: string, uid: string | null): Promise<ChallengeDetail | null> {
  const cSnap = await getDoc(doc(db, "challenges", slug));
  if (!cSnap.exists()) return null;
  const challenge: Challenge = { slug: cSnap.id, ...(cSnap.data() as Omit<Challenge, "slug">) };
  // Draft/soon/archived challenges are not reachable from the user app (deep links included).
  if (challenge.status !== "published") return null;

  const [daysSnap, progSnap, settingsSnap] = await Promise.all([
    getDocs(query(collection(db, "challenges", slug, "days"), orderBy("order"))),
    uid ? getDoc(doc(db, "users", uid, "challengeProgress", slug)) : Promise.resolve(null),
    getDoc(doc(db, "settings", "challenges")),
  ]);

  // Fetch only THIS challenge's day videos (≤14), not the whole library.
  const codes = [...new Set(daysSnap.docs.map((d) => (d.data() as { videoCode?: string }).videoCode).filter(Boolean) as string[])];
  const videoSnaps = await Promise.all(codes.map((c) => getDoc(doc(db, "challengeVideos", c))));
  const videoByCode: Record<string, ChallengeVideo> = {};
  videoSnaps.forEach((s) => {
    if (s.exists()) videoByCode[s.id] = { code: s.id, ...(s.data() as Omit<ChallengeVideo, "code">) };
  });

  const progress: ChallengeProgress | null =
    progSnap && progSnap.exists()
      ? ({ slug, doneDays: [], resume: {}, ...(progSnap.data() as Partial<ChallengeProgress>) } as ChallengeProgress)
      : null;
  const doneSet = new Set(progress?.doneDays ?? []);

  const days: ChallengeDayItem[] = daysSnap.docs.map((d) => {
    const day: ChallengeDay = { id: d.id, ...(d.data() as Omit<ChallengeDay, "id">) };
    return {
      ...day,
      video: videoByCode[day.videoCode] ?? null,
      done: doneSet.has(day.videoCode),
      resume: progress?.resume?.[day.videoCode] ?? 0,
    };
  });

  const total = challenge.totalDays || days.length;
  const doneCount = days.filter((d) => d.done).length;
  const nextOrder = days.find((d) => !d.done)?.order ?? null;
  const fbGroupUrl = settingsSnap.exists() ? ((settingsSnap.data() as { fbGroupUrl?: string }).fbGroupUrl ?? null) : null;

  return {
    challenge,
    days,
    progress,
    doneCount,
    state: challengeState(doneCount, total, hasResume(progress)),
    nextOrder,
    fbGroupUrl,
  };
}
