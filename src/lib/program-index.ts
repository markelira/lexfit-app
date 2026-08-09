"use client";

// The data-driven program index — the single source for "which programs exist"
// and "which program does this video belong to". Replaces the old hardcoded
// registry guesses: programs come from programs/ (published only) and
// membership from each program's sessions playlist. A video in no playlist is
// standalone (no badge). A video in several playlists belongs to the first by
// catalog order.
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assignProgramHues } from "@/lib/programs";
import type { Program, ProgramSession } from "@/lib/types";

export interface ProgramEntry extends Program {
  codes: string[]; // the playlist, in order
  hue: number; // UNIQUE brand hue among live programs (assignProgramHues)
}

export interface ProgramIndex {
  programs: ProgramEntry[];                 // published, sorted by order then title
  bySlug: Record<string, ProgramEntry>;
  programOfVideo: Record<string, string>;   // video code → program slug
}

let cache: Promise<ProgramIndex> | null = null;

export function loadProgramIndex(): Promise<ProgramIndex> {
  cache ??= (async () => {
    const snap = await getDocs(query(collection(db, "programs"), where("status", "==", "published")));
    const programs: ProgramEntry[] = [];
    for (const d of snap.docs) {
      const sess = await getDocs(collection(db, "programs", d.id, "sessions"));
      const ordered = sess.docs
        .map((s) => s.data() as ProgramSession)
        .sort((a, b) => a.order - b.order);
      programs.push({ slug: d.id, ...(d.data() as Omit<Program, "slug">), codes: ordered.map((s) => s.videoCode), hue: 0 });
    }
    programs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title));
    const hues = assignProgramHues(programs.map((p) => p.slug));
    for (const p of programs) p.hue = hues[p.slug];

    const bySlug: Record<string, ProgramEntry> = {};
    const programOfVideo: Record<string, string> = {};
    for (const p of programs) {
      bySlug[p.slug] = p;
      for (const code of p.codes) programOfVideo[code] ??= p.slug;
    }
    return { programs, bySlug, programOfVideo };
  })();
  return cache;
}

/** Derived position in a program from the user's per-video completions —
 *  no extra storage: done = # of playlist codes completed, current = the first
 *  uncompleted playlist index. */
export function programPosition(codes: string[], completedCodes: Set<string>) {
  const doneCount = codes.filter((c) => completedCodes.has(c)).length;
  const firstOpen = codes.findIndex((c) => !completedCodes.has(c));
  return {
    doneCount,
    currentIndex: firstOpen === -1 ? Math.max(0, codes.length - 1) : firstOpen,
    completed: codes.length > 0 && firstOpen === -1,
  };
}
