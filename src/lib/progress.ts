"use client";

import {
  arrayUnion,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ymd } from "@/lib/streak";

const PROGRAM_ID = "foundation";
const progressRef = (uid: string) => doc(db, "users", uid, "progress", "state");

export interface ProgressState {
  programId: string;
  joinedAt?: unknown;
  currentIndex: number;
  doneCount: number;
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  completed: { code: string; at: string; atTime?: string }[]; // at = YYYY-MM-DD, atTime = HH:MM
  resume: Record<string, number>; // code → seconds
  resumeAt?: Record<string, number>; // code → epoch ms of last resume write (recency)
  // Non-scale wins ("Amit észrevettél") - the user's own words, dated by program week.
  observations?: { text: string; week: number; at: string }[];
  // Visszamérés benchmark results, keyed by program week (e.g. "1" baseline, "4" retest).
  benchmark?: Record<string, { rounds: number; at: string }>;
  // Watched seconds bucketed by calendar day (YYYY-MM-DD, Europe/Budapest).
  // Written ONLY by the server-side Mux Data sync (/api/progress/sync) - the
  // player no longer accumulates watch time client-side.
  watchByDay?: Record<string, number>;
  // Monday-first weekday indices of the program's scheduled workout days,
  // stamped by the sync so any screen can derive a rest-day-aware streak.
  workoutDays?: number[];
  // Sync bookkeeping: last sync epoch (s) + recently processed Mux view ids
  // (id → view_end epoch s) so overlapping windows never double-count.
  muxSync?: { lastSyncAt: number; seen: Record<string, number> };
}

/** Record the benchmark rounds for a program week (Haladásom · visszamérés). */
export async function saveBenchmark(uid: string, week: number, rounds: number): Promise<void> {
  const r = Math.max(0, Math.round(rounds));
  const at = ymd(new Date());
  await setDoc(progressRef(uid), { benchmark: { [String(week)]: { rounds: r, at } } }, { merge: true });
}

/** Append a non-scale win in the user's words (Haladásom · H4). `at` is YYYY-MM-DD. */
export async function addObservation(uid: string, text: string, week: number): Promise<void> {
  const clean = text.trim().slice(0, 140);
  if (!clean) return;
  await setDoc(
    progressRef(uid),
    { observations: arrayUnion({ text: clean, week, at: ymd(new Date()) }) },
    { merge: true },
  );
}

/** Create the progress doc on first join (idempotent). */
export async function ensureProgress(uid: string): Promise<void> {
  const ref = progressRef(uid);
  if ((await getDoc(ref)).exists()) return;
  await setDoc(ref, {
    programId: PROGRAM_ID,
    joinedAt: serverTimestamp(),
    currentIndex: 0,
    doneCount: 0,
    streak: 0,
    lastCompletedDate: null,
    completed: [],
    resume: {},
  });
}

export async function getProgress(uid: string): Promise<ProgressState | null> {
  const snap = await getDoc(progressRef(uid));
  return snap.exists() ? (snap.data() as ProgressState) : null;
}

/** Persist the resume position (seconds) for a workout, plus a recency stamp so the
 *  Kezdőlap "Folytatod" row can order most-recent-first. */
export async function saveResume(uid: string, code: string, seconds: number): Promise<void> {
  await setDoc(
    progressRef(uid),
    { resume: { [code]: Math.floor(seconds) }, resumeAt: { [code]: Date.now() } },
    { merge: true },
  );
}

/** Clear a workout's resume position optimistically (the sync also clears it). */
export async function clearResume(uid: string, code: string): Promise<void> {
  await setDoc(
    progressRef(uid),
    { resume: { [code]: deleteField() }, resumeAt: { [code]: deleteField() } },
    { merge: true },
  );
}

// ── Mux Data sync (the single source of truth for watch time + completions) ──

const SYNC_AT_KEY = "lx-mux-sync-at";
const SYNC_THROTTLE_MS = 15 * 60 * 1000;

/**
 * Ask the server to pull this user's finished Mux views and fold them into the
 * progress doc (watchByDay buckets, completions, streak, currentIndex). Runs on
 * app-shell load, throttled - `force` bypasses the throttle (Haladásom always
 * forces; a pending completion marker also forces). Best-effort by design: the
 * UI reads whatever is in Firestore either way.
 */
export async function syncMuxProgress(opts?: { force?: boolean }): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    const force = opts?.force || getPendingCompletions().length > 0;
    const last = Number(localStorage.getItem(SYNC_AT_KEY) ?? 0);
    if (!force && Date.now() - last < SYNC_THROTTLE_MS) return;
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;
    const res = await fetch("/api/progress/sync", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) localStorage.setItem(SYNC_AT_KEY, String(Date.now()));
  } catch {
    // sync is best-effort; the next shell load retries
  }
}

// ── Pending completions (optimistic bridge over Mux's finalization delay) ────
// Mux only exposes a view seconds-to-minutes after the player unloads. When a
// workout visibly finishes client-side we drop a local marker so the finish
// screen and Haladásom can show it immediately; the marker dies once the synced
// doc contains the completion (or after 48h).

const PENDING_KEY = "lx-pending-completions";
export interface PendingCompletion { code: string; at: string; ts: number }

function readPending(): PendingCompletion[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    const list = raw ? (JSON.parse(raw) as PendingCompletion[]) : [];
    return list.filter((p) => Date.now() - p.ts < 48 * 3600_000);
  } catch {
    return [];
  }
}

export function getPendingCompletions(): PendingCompletion[] {
  if (typeof window === "undefined") return [];
  return readPending();
}

/** Note a completion the player just witnessed (video ended / ≥90% reached). */
export function notePendingCompletion(code: string): void {
  if (typeof window === "undefined") return;
  const at = ymd(new Date());
  const list = readPending();
  if (list.some((p) => p.code === code && p.at === at)) return;
  list.push({ code, at, ts: Date.now() });
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch { /* full/blocked */ }
}

/** Drop pending markers the synced doc now confirms. */
export function clearConfirmedPending(completed: { code: string; at: string }[]): void {
  if (typeof window === "undefined") return;
  const list = readPending().filter(
    (p) => !completed.some((c) => c.code === p.code && String(c.at) === p.at),
  );
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch { /* full/blocked */ }
}
