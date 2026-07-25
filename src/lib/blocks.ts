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
