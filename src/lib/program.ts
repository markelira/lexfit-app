"use client";

import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProgress } from "@/lib/progress";
import type { Program, Video } from "@/lib/types";

export interface WorkoutItem extends Video {
  // session/program context merged onto the library video:
  order: number;
  week: number;
  day: string;
  dayName: string;
  phaseIdx: number;
  retest: "soft" | "final" | null;
}

export interface WeekGroup {
  num: number;
  phaseIdx: number;
  retest: "soft" | "final" | null;
  workouts: WorkoutItem[];
}

export interface FoundationData {
  program: Program;
  weeks: WeekGroup[];
  byCode: Record<string, WorkoutItem>;
  // user state
  joined: boolean;
  doneCount: number;
  currentIndex: number;
  streak: number;
  todayCode: string | null; // the session the user is on (or the first, preview)
}

/** Load the Foundation program, its sessions+videos, and the user's progress. */
export async function loadFoundation(uid: string): Promise<FoundationData | null> {
  const progSnap = await getDoc(doc(db, "programs", "foundation"));
  if (!progSnap.exists()) return null;
  const program = { slug: progSnap.id, ...(progSnap.data() as Omit<Program, "slug">) };

  const [sessionsSnap, videosSnap, userProgress] = await Promise.all([
    getDocs(query(collection(db, "programs", "foundation", "sessions"), orderBy("order"))),
    getDocs(collection(db, "videos")),
    getProgress(uid),
  ]);

  const videoByCode: Record<string, Video> = {};
  videosSnap.forEach((d) => {
    videoByCode[d.id] = { code: d.id, ...(d.data() as Omit<Video, "code">) };
  });

  const joined = !!userProgress?.joinedAt || (userProgress?.doneCount ?? 0) > 0;
  const doneCount = userProgress?.doneCount ?? 0;
  const currentIndex = userProgress?.currentIndex ?? 0;
  const streak = userProgress?.streak ?? 0;

  // Build week groups from sessions, merging each session's video metadata.
  const byCode: Record<string, WorkoutItem> = {};
  const weekMap = new Map<number, WeekGroup>();
  sessionsSnap.forEach((d) => {
    const s = d.data() as {
      videoCode: string; order: number; week: number; day: string; dayName: string;
      phaseIdx: number; retest: "soft" | "final" | null;
    };
    const v = videoByCode[s.videoCode];
    if (!v) return;
    const item: WorkoutItem = {
      ...v,
      order: s.order, week: s.week, day: s.day, dayName: s.dayName,
      phaseIdx: s.phaseIdx, retest: s.retest,
    };
    byCode[v.code] = item;
    if (!weekMap.has(s.week)) {
      weekMap.set(s.week, { num: s.week, phaseIdx: s.phaseIdx, retest: s.retest, workouts: [] });
    }
    weekMap.get(s.week)!.workouts.push(item);
  });

  const weeks = [...weekMap.values()].sort((a, b) => a.num - b.num);
  weeks.forEach((w) => w.workouts.sort((a, b) => a.order - b.order));

  // The session the user is on (preview → first session).
  const todayCode =
    weeks.flatMap((w) => w.workouts).find((w) => w.order === currentIndex)?.code ??
    weeks[0]?.workouts[0]?.code ??
    null;

  return { program, weeks, byCode, joined, doneCount, currentIndex, streak, todayCode };
}

/** Per-workout state for the cards. */
export function dayState(
  order: number,
  joined: boolean,
  doneCount: number,
  currentIndex: number,
): "preview" | "done" | "today" | "todo" {
  if (!joined) return "preview";
  if (order < doneCount) return "done";
  if (order === currentIndex) return "today";
  return "todo";
}
