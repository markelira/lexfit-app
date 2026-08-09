"use client";

import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProgress } from "@/lib/progress";
import type { Program, Video } from "@/lib/types";

export interface WorkoutItem extends Video {
  // session/program context merged onto the library video:
  order: number;
  phaseIdx: number;
  retest: "soft" | "final" | null;
}

export interface PhaseGroup {
  idx: number;                 // phaseIdx (or -1 for ungrouped)
  icon: string;
  name: string;
  desc: string;
  colorVar: string;
  workouts: WorkoutItem[];     // in playlist order
}

export interface FoundationData {
  program: Program;
  phases: PhaseGroup[];        // ordered, phase-grouped playlist
  playlist: WorkoutItem[];     // the flat ordered pool (source of truth)
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

  // Build the ordered playlist from sessions, merging each session's video.
  const byCode: Record<string, WorkoutItem> = {};
  const playlist: WorkoutItem[] = [];
  sessionsSnap.forEach((d) => {
    const s = d.data() as {
      videoCode: string; order: number; phaseIdx: number | null;
      retest: "soft" | "final" | null;
    };
    const v = videoByCode[s.videoCode];
    if (!v) return;
    const item: WorkoutItem = {
      ...v,
      order: s.order,
      phaseIdx: s.phaseIdx ?? -1,
      retest: s.retest ?? null,
    };
    byCode[v.code] = item;
    playlist.push(item);
  });
  playlist.sort((a, b) => a.order - b.order);

  // Group by phase (in playlist order), deriving each phase's meta from the
  // program's phases[] and its size from the workouts that carry that phaseIdx.
  const phaseMeta = new Map(program.phases.map((p) => [p.idx, p]));
  const phaseMap = new Map<number, PhaseGroup>();
  for (const w of playlist) {
    if (!phaseMap.has(w.phaseIdx)) {
      const meta = phaseMeta.get(w.phaseIdx);
      phaseMap.set(w.phaseIdx, {
        idx: w.phaseIdx,
        icon: meta?.icon ?? "",
        name: meta?.name ?? "",
        desc: meta?.desc ?? "",
        colorVar: meta?.colorVar ?? "var(--cat-teljes)",
        workouts: [],
      });
    }
    phaseMap.get(w.phaseIdx)!.workouts.push(w);
  }
  const phases = [...phaseMap.values()].sort((a, b) => a.idx - b.idx);

  // The session the user is on (preview → first session).
  const todayCode =
    playlist.find((w) => w.order === currentIndex)?.code ?? playlist[0]?.code ?? null;

  return { program, phases, playlist, byCode, joined, doneCount, currentIndex, streak, todayCode };
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
