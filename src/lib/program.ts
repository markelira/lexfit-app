"use client";

import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getProgress } from "@/lib/progress";
import { isPublishedVideo } from "@/lib/library";
import { programPosition } from "@/lib/program-index";
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

export type ProgramData = FoundationData;

/** Load the Foundation program, its sessions+videos, and the user's progress. */
export const loadFoundation = (uid: string): Promise<FoundationData | null> =>
  loadProgram("foundation", uid);

/**
 * Load any program, its sessions+videos, and the user's position in it.
 * Foundation keeps the guided stored cursor (progress.currentIndex, advanced by
 * the Mux sync); every other program derives its position from the global
 * per-video completions: done = completed playlist codes, current = first
 * uncompleted index. Draft programs return null (users never see them).
 */
export async function loadProgram(slug: string, uid: string): Promise<ProgramData | null> {
  const progSnap = await getDoc(doc(db, "programs", slug));
  if (!progSnap.exists()) return null;
  const program = { slug: progSnap.id, ...(progSnap.data() as Omit<Program, "slug">) };
  if (program.status !== "published") return null;

  const [sessionsSnap, videosSnap, userProgress] = await Promise.all([
    getDocs(query(collection(db, "programs", slug, "sessions"), orderBy("order"))),
    getDocs(collection(db, "videos")),
    getProgress(uid),
  ]);

  const videoByCode: Record<string, Video> = {};
  videosSnap.forEach((d) => {
    const v = { code: d.id, ...(d.data() as Omit<Video, "code">) };
    // Draft videos drop out of the playlist entirely — they can't stream anyway
    // (the Mux token route 404s them), so showing a dead card would be worse.
    if (isPublishedVideo(v)) videoByCode[d.id] = v;
  });

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

  // Position: foundation = stored guided cursor; others = derived from completions.
  let joined: boolean;
  let doneCount: number;
  let currentIndex: number;
  if (slug === "foundation") {
    joined = !!userProgress?.joinedAt || (userProgress?.doneCount ?? 0) > 0;
    doneCount = userProgress?.doneCount ?? 0;
    currentIndex = userProgress?.currentIndex ?? 0;
  } else {
    const completedSet = new Set((userProgress?.completed ?? []).map((c) => c.code));
    const pos = programPosition(playlist.map((w) => w.code), completedSet);
    doneCount = pos.doneCount;
    currentIndex = playlist[pos.currentIndex]?.order ?? 0;
    joined = doneCount > 0;
  }

  // Group by phase (in playlist order), deriving each phase's meta from the
  // program's phases[] and its size from the workouts that carry that phaseIdx.
  const phaseMeta = new Map((program.phases ?? []).map((p) => [p.idx, p]));
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
