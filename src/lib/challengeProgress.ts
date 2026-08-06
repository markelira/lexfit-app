"use client";

import { deleteField, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ymd } from "@/lib/streak";
import type { ChallengeProgress } from "@/lib/types";

// Per-user challenge completion — a SEPARATE store from Foundation progress
// (users/{uid}/progress/state), so a challenge never disturbs currentIndex /
// doneCount. Completing a challenge day still feeds the shared flame streak:
// the server Mux sync folds challenge-video completion dates into computeStreak
// (see /api/progress/sync). These client writes are the optimistic bridge over
// Mux's finalization delay — same pattern as notePendingCompletion for workouts.

const ref = (uid: string, slug: string) => doc(db, "users", uid, "challengeProgress", slug);

export async function getChallengeProgress(uid: string, slug: string): Promise<ChallengeProgress | null> {
  const snap = await getDoc(ref(uid, slug));
  if (!snap.exists()) return null;
  return { slug, doneDays: [], resume: {}, ...(snap.data() as Partial<ChallengeProgress>) } as ChallengeProgress;
}

/**
 * Optimistically mark a challenge day complete. Read-modify-write so we can set
 * `completedAt` exactly when the last day lands. `totalDays` decides completion.
 * Idempotent: replaying the same code is a no-op beyond refreshing the date.
 */
export async function markDayDone(
  uid: string,
  slug: string,
  code: string,
  totalDays: number,
): Promise<{ doneCount: number; completed: boolean }> {
  const cur = await getChallengeProgress(uid, slug);
  const done = new Set(cur?.doneDays ?? []);
  const wasCompleted = !!cur?.completedAt;
  done.add(code);
  const doneDays = [...done];
  const completed = totalDays > 0 && doneDays.length >= totalDays;
  const at = ymd(new Date());

  await setDoc(
    ref(uid, slug),
    {
      slug,
      doneDays,
      dayDates: { [code]: at },
      resume: { [code]: deleteField() },
      resumeAt: { [code]: deleteField() },
      ...(cur?.startedAt ? {} : { startedAt: serverTimestamp() }),
      ...(completed && !wasCompleted ? { completedAt: serverTimestamp() } : {}),
    },
    { merge: true },
  );
  return { doneCount: doneDays.length, completed };
}

/** Persist a challenge day's resume position (seconds) + a recency stamp. */
export async function saveChallengeResume(uid: string, slug: string, code: string, seconds: number): Promise<void> {
  await setDoc(
    ref(uid, slug),
    { slug, resume: { [code]: Math.floor(seconds) }, resumeAt: { [code]: Date.now() } },
    { merge: true },
  );
}

/** Clear a challenge day's resume position (on finish). */
export async function clearChallengeResume(uid: string, slug: string, code: string): Promise<void> {
  await setDoc(
    ref(uid, slug),
    { resume: { [code]: deleteField() }, resumeAt: { [code]: deleteField() } },
    { merge: true },
  );
}
