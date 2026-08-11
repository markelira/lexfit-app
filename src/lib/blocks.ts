// Helpers for reading block exercise items, which may be legacy plain strings or
// stamped { name, start? } objects. Every read site should route through these so
// downstream code sees a single shape.

import type { VideoExercise, VideoExerciseItem } from "./types";

/** Collapse a legacy string OR object exercise into a normalized { name, start? }. */
export function normalizeExercise(it: VideoExerciseItem): VideoExercise {
  if (typeof it === "string") return { name: it };
  return { name: it.name, ...(typeof it.start === "number" ? { start: it.start } : {}) };
}

/** The display name of an exercise, whichever shape it is. */
export function exerciseName(it: VideoExerciseItem): string {
  return typeof it === "string" ? it : it.name;
}

/**
 * Infer missing block start stamps so ONE forgotten field can never collapse the
 * player's chapter math (found live 2026-08-09: F001's first block had no start
 * → the all-or-nothing "stamped" check failed → all mins 0 → NaN bounds → dead
 * seekbar, wrong active block, broken HUD).
 *
 * Rules, in order:
 *  1. a block keeps its authored start when present;
 *  2. a missing start becomes the block's FIRST stamped exercise's start;
 *  3. the first block, still missing, becomes 0:00 (the natural author intent).
 * Blocks that remain unstamped after these rules stay as they are - callers keep
 * their fallback path, but with these rules a fully-exercise-stamped video always
 * ends up fully block-stamped.
 */
export function inferBlockStarts<T extends { start?: number; items?: VideoExerciseItem[] }>(
  blocks: T[],
): T[] {
  return blocks.map((b, i) => {
    if (typeof b.start === "number") return b;
    const firstStamped = (b.items ?? [])
      .map((it) => (typeof it === "string" ? undefined : it.start))
      .find((s): s is number => typeof s === "number");
    if (typeof firstStamped === "number") return { ...b, start: firstStamped };
    if (i === 0) return { ...b, start: 0 };
    return b;
  });
}
