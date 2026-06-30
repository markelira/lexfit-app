"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FilterDimension, Video } from "@/lib/types";

// A library video carries its (Foundation) phase resolved from the sessions, so
// the "Fázis" filter works even though videos are program-agnostic. Bonus
// content (not in any program) has phase null.
export interface LibVideo extends Video {
  phase: number | null;
}

export interface LibraryData {
  videos: LibVideo[];
  filters: Record<string, FilterDimension>;
}

export async function loadLibrary(): Promise<LibraryData> {
  const [videosSnap, filtersSnap, sessionsSnap] = await Promise.all([
    getDocs(collection(db, "videos")),
    getDocs(collection(db, "filters")),
    getDocs(collection(db, "programs", "foundation", "sessions")),
  ]);

  const phaseByCode: Record<string, number> = {};
  sessionsSnap.forEach((d) => {
    const s = d.data() as { videoCode: string; phaseIdx: number };
    phaseByCode[s.videoCode] = s.phaseIdx;
  });

  const videos: LibVideo[] = videosSnap.docs.map((d) => {
    const v = { code: d.id, ...(d.data() as Omit<Video, "code">) };
    return { ...v, phase: phaseByCode[v.code] ?? null };
  });
  videos.sort((a, b) => a.code.localeCompare(b.code));

  const filters: Record<string, FilterDimension> = {};
  filtersSnap.forEach((d) => {
    filters[d.id] = { key: d.id, ...(d.data() as Omit<FilterDimension, "key">) };
  });

  return { videos, filters };
}

export const durBucket = (mins: number) =>
  mins <= 15 ? "5–15 perc" : mins <= 25 ? "16–25 perc" : mins <= 35 ? "26–35 perc" : "36+ perc";

export interface ActiveFilters {
  phase: Set<string>;
  theme: Set<string>;
  dur: Set<string>;
  level: Set<string>;
  format: Set<string>;
  type: Set<string>;
}

export const emptyFilters = (): ActiveFilters => ({
  phase: new Set(), theme: new Set(), dur: new Set(),
  level: new Set(), format: new Set(), type: new Set(),
});

/** Port of the prototype's lxFilterVideos, over resolved-phase library videos. */
export function filterVideos(
  videos: LibVideo[],
  active: ActiveFilters,
  filters: Record<string, FilterDimension>,
): LibVideo[] {
  const phaseOpts = filters.phase?.options ?? [];
  const levelOpts = filters.level?.options ?? [];
  return videos.filter((v) => {
    if (active.phase.size && (v.phase === null || !active.phase.has(phaseOpts[v.phase]))) return false;
    if (active.theme.size && !active.theme.has(v.theme)) return false;
    if (active.dur.size && !active.dur.has(durBucket(v.mins))) return false;
    if (active.level.size && !active.level.has(levelOpts[v.level - 1])) return false;
    if (active.format.size && !active.format.has(v.format)) return false;
    if (active.type.size && ![...active.type].some((t) => v.types.includes(t))) return false;
    return true;
  });
}
