import "server-only";
import { inferBlockStarts } from "@/lib/blocks";

// Shared block/exercise sanitization for admin video writes (workout videos in
// videos/ and Kihívások day videos in challengeVideos/). Kept in one place so the
// stamping rules (auto-derive block `mins` from `start` gaps, clamp to duration)
// never drift between the two content types.

export interface RawExercise {
  name?: string;
  start?: number;
}

export interface CleanExercise {
  name: string;
  start?: number;
}

export interface CleanBlock {
  name: string;
  mins: number;
  items: CleanExercise[];
  start?: number;
}

export interface RawBlock {
  name?: string;
  mins?: number;
  items?: (string | RawExercise)[];
  start?: number;
}

/**
 * Sanitize a block's exercises. Each entry may arrive as a legacy string or as
 * { name, start? }. Empty-name entries are dropped. `start` (absolute seconds) is
 * kept only when finite and non-negative, clamped to the duration when known.
 */
export function buildItems(raw: unknown, dur: number): CleanExercise[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): CleanExercise => {
      const src = typeof entry === "string" ? { name: entry } : (entry ?? {});
      const ex: CleanExercise = { name: String((src as RawExercise).name ?? "").trim() };
      const s = Number((src as RawExercise).start);
      if (Number.isFinite(s) && s >= 0) ex.start = dur > 0 ? Math.min(s, dur) : s;
      return ex;
    })
    .filter((ex) => ex.name);
}

/**
 * Sanitize blocks. When EVERY block carries a numeric `start` (seconds), the video
 * is "stamped": sort by start and auto-derive each block's `mins` from the gap to
 * the next start (last block runs to the video duration). `start` is only ever
 * attached when finite (Firestore rejects `undefined`).
 */
export function buildBlocks(raw: RawBlock[] | undefined, dur: number): CleanBlock[] {
  if (!Array.isArray(raw)) return [];
  let blocks: CleanBlock[] = raw
    .map((bl) => {
      const block: CleanBlock = {
        name: String(bl.name ?? "").trim(),
        mins: Math.max(0, Math.round(Number(bl.mins) || 0)),
        items: buildItems(bl.items, dur),
      };
      const s = Number(bl.start);
      if (Number.isFinite(s) && s >= 0) block.start = dur > 0 ? Math.min(s, dur) : s;
      return block;
    })
    .filter((bl) => bl.name);

  // Heal missing block starts before the all-or-nothing check - the SAME
  // helper the player uses (lib/blocks.ts), so the rules (and its NaN-stamp
  // rejection) can never drift between admin writes and player reads. One
  // forgotten field must never zero out every block's mins.
  blocks = inferBlockStarts(blocks);

  const allStamped =
    blocks.length > 0 && blocks.every((bl) => typeof bl.start === "number" && Number.isFinite(bl.start));
  if (allStamped) {
    blocks.sort((a, b) => a.start! - b.start!);
    blocks = blocks.map((bl, i) => {
      const next = i + 1 < blocks.length ? blocks[i + 1].start! : dur > 0 ? dur : null;
      const mins = next != null ? Math.max(0, Math.round((next - bl.start!) / 60)) : bl.mins;
      return { ...bl, mins };
    });
  }
  return blocks;
}
