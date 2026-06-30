"use client";

import {
  arrayUnion,
  deleteField,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROGRAM_ID = "foundation";
const progressRef = (uid: string) => doc(db, "users", uid, "progress", "state");

export interface ProgressState {
  programId: string;
  joinedAt?: unknown;
  currentIndex: number;
  doneCount: number;
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
  completed: { code: string; at: unknown }[];
  resume: Record<string, number>; // code → seconds
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

/** Persist the resume position (seconds) for a workout. */
export async function saveResume(uid: string, code: string, seconds: number): Promise<void> {
  await setDoc(progressRef(uid), { resume: { [code]: Math.floor(seconds) } }, { merge: true });
}

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Mark a workout complete: bump doneCount, update streak (daily), append to the
 * completed log, advance currentIndex, and clear its resume position.
 */
export async function markComplete(
  uid: string,
  code: string,
  sessionOrder: number,
): Promise<{ doneCount: number; streak: number }> {
  const ref = progressRef(uid);
  await ensureProgress(uid);
  const snap = await getDoc(ref);
  const cur = snap.data() as ProgressState;

  const today = new Date();
  const todayStr = ymd(today);
  const yesterdayStr = ymd(new Date(today.getTime() - 86400000));

  let streak = cur.streak ?? 0;
  if (cur.lastCompletedDate === todayStr) {
    // already worked out today — streak unchanged
  } else if (cur.lastCompletedDate === yesterdayStr) {
    streak += 1;
  } else {
    streak = 1;
  }

  const doneCount = (cur.doneCount ?? 0) + 1;

  await setDoc(
    ref,
    {
      doneCount,
      streak,
      lastCompletedDate: todayStr,
      currentIndex: Math.max(cur.currentIndex ?? 0, sessionOrder + 1),
      completed: arrayUnion({ code, at: todayStr }),
      resume: { [code]: deleteField() },
    },
    { merge: true },
  );

  return { doneCount, streak };
}
