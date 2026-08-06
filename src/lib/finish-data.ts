"use client";

import { catShort } from "@/lib/categories";
import type { FinishData } from "@/lib/finish-overlays";

/**
 * Assemble the overlay's FinishData from whatever the finish moment has in scope.
 * Pure + defensive: every field is optional at the call site, and the overlay's
 * resultLead() degrades reps → exercise-count → workout-# on its own.
 */
export function buildFinishData(i: {
  title?: string;
  mins: number;
  theme?: string;       // raw theme/body-part (mapped to a short Fókusz word)
  streak: number;
  exercises?: number;   // derivable exercise count (blocks.items)
  workoutNo?: number;   // progress.doneCount (+1 optimistic)
  week?: number | null; // Foundation program week
  reps?: number | null; // only when authored (Phase 5)
  milestone?: string | null;
}): FinishData {
  return {
    reps: i.reps ?? undefined,
    exercises: i.exercises,
    workoutNo: i.workoutNo,
    mins: Math.max(0, Math.round(i.mins || 0)),
    streak: Math.max(0, Math.round(i.streak || 0)),
    theme: i.theme ? catShort(i.theme) : undefined,
    title: i.title,
    week: i.week ?? undefined,
    milestone: i.milestone ?? undefined,
  };
}
