// Finish-share overlays - the 5 directions from docs/LEXFIT Overlay Alternatives
// Adatok.html, encoded at their EXACT reference geometry. The reference frame is
// 284 × 505 px (= 9:16). All positions/sizes below are in that 284-wide space;
// the renderer scales the whole layer to the real photo width, so the proportions
// stay pixel-identical to the reference at any size. This is the single source of
// truth shared by the DOM preview (FinishOverlay) and the export canvas rasterizer.

export type OverlayDir = "A" | "F" | "B" | "C" | "E";
export const OVERLAY_DIRS: OverlayDir[] = ["A", "F", "B", "C", "E"];

export const REF_W = 284;
export const REF_H = 505;

export const OVERLAY_NAME: Record<OverlayDir, string> = {
  A: "Bal felső",
  F: "Középre",
  B: "Vágójelek",
  C: "Egy szám",
  E: "Gerinc",
};

// The interchangeable "lead" (hero) metric - the first slot / C's big number.
export type LeadKey = "reps" | "exercises" | "workoutNo";

// ── Raw workout data the overlay personalizes from (see docs/finish-share-plan.md) ──
export interface FinishData {
  reps?: number | null;     // total reps - only when authored (Phase 5); else undefined
  exercises?: number;       // derivable exercise count (blocks.items)
  workoutNo?: number;       // progress.doneCount (+1)
  mins: number;             // video.mins
  streak: number;           // result.streak
  theme?: string;           // body-part short word (Fókusz)
  title?: string;           // video.title (A/E headline)
  week?: number | null;     // Foundation program week
  milestone?: string | null;// e.g. "30 napos sorozat"
  lead?: LeadKey;           // user's chosen hero metric (data-swap); else auto
}

export interface Slot { k: string; v: string }

const LEAD_SLOT: Record<LeadKey, (d: FinishData) => Slot | null> = {
  reps: (d) => (d.reps != null && d.reps > 0 ? { k: "Ismétlés", v: String(d.reps) } : null),
  exercises: (d) => (d.exercises != null && d.exercises > 0 ? { k: "Gyakorlat", v: String(d.exercises) } : null),
  workoutNo: (d) => ({ k: "Edzésem", v: `${d.workoutNo ?? 1}.` }),
};

/** Which lead metrics have a real value for this workout (for the swap UI).
 *  workoutNo shows only when it's actually known (resultLead still uses it as a
 *  guaranteed fallback with a default of 1). */
export function availableLeads(d: FinishData): LeadKey[] {
  const out: LeadKey[] = [];
  if (LEAD_SLOT.reps(d)) out.push("reps");
  if (LEAD_SLOT.exercises(d)) out.push("exercises");
  if (d.workoutNo != null && d.workoutNo > 0) out.push("workoutNo");
  return out;
}

/** The lead "result" number - the user's chosen metric if set + available,
 *  else auto: reps → exercise count → workout #. */
export function resultLead(d: FinishData): Slot {
  if (d.lead) { const s = LEAD_SLOT[d.lead](d); if (s) return s; }
  return LEAD_SLOT.reps(d) ?? LEAD_SLOT.exercises(d) ?? LEAD_SLOT.workoutNo(d)!;
}
const timeSlot = (d: FinishData): Slot => ({ k: "Idő", v: `${d.mins} perc` });
const streakSlot = (d: FinishData): Slot => ({ k: "Sorozat", v: `${d.streak}. nap` });

/** The default 3-slot trio used by A / F / B / E. */
export function defaultTrio(d: FinishData): Slot[] {
  return [resultLead(d), timeSlot(d), streakSlot(d)];
}

/** Content for the "one big number" poster (C). */
export function posterContent(d: FinishData) {
  const lead = resultLead(d);
  return {
    headline: d.week ? `Foundation · ${d.week}. hét` : "Ma",
    big: lead.v,
    unit: lead.k.toLowerCase(),
    footnote: `${d.mins} perc · ${d.streak}. nap\nsorozatban`,
  };
}

// ── Per-template character limits (the reference's guardrail: route data to a
//    template that fits rather than shrinking it). NOT YET ENFORCED - today's
//    values (reps/exercise-count/workout-#/"NN perc"/"NN. nap") are all within
//    every limit, so overflow can't occur. Wire this into the data-swap +
//    template routing when longer data types land (total-minutes, workout name,
//    milestones) - see docs/finish-share-plan.md P5. ──
export const CHAR_LIMITS: Record<OverlayDir, { label?: number; value?: number; big?: number }> = {
  A: { label: 12, value: 11 },
  E: { label: 12, value: 11 },
  F: { value: 9 },
  B: { value: 8 },
  C: { big: 4 },
};

// ══ Geometry, in the 284×505 reference space ══
// Shared type sizing (px in ref space):
export const TYPE = {
  kSize: 13, kWeight: 600, // label (.k)
  vWeight: 700,            // value (.v), tabular-nums, tracking -0.028em
  wdWeight: 800,           // wordmark (.wd), tracking 0.055em
};

export const GEO = {
  A: {
    block: { left: 20, top: 54, width: 150 },
    lockupSize: "sm" as const, lockupGap: 16, // margin below lockup
    valueSize: 26, groupGap: 13,
  },
  F: {
    center: true, groupGap: 22, valueSize: 35,
    lockupSize: "col" as const, lockupGap: 8, // margin above lockup, stacked icon+word
  },
  B: {
    // viewfinder brackets (stroke 2, white) in the 284×505 viewBox
    brackets: ["M26 282 v-30 h30", "M178 442 v30 h-30"],
    block: { left: 46, top: 270, width: 118 },
    valueSize: 22, groupGap: 11,
    lockupSize: "sm" as const, lockupGap: 13, // margin above lockup
  },
  C: {
    block: { left: 24, bottom: 30, width: 152 },
    lockupSize: "sm" as const, lockupGap: 16, // margin below lockup
    headSize: 13, bigSize: 78, bigTrack: -0.055, bigLine: 0.84,
    unitSize: 21, footGap: 12, footLine: 1.35,
  },
  E: {
    block: { left: 26, bottom: 34, width: 150 },
    spineSize: 19, spineTrack: 0.34, spineGap: 14, // margin below vertical wordmark
    valueSize: 25, groupGap: 14,
  },
};

// Lockup (LexMark + wordmark) sizes per variant, ref px.
export const LOCKUP = {
  sm: { icon: 13, iconH: 12, word: 14, gap: 9 },
  md: { icon: 18, iconH: 17, word: 18, gap: 9 },
  col: { icon: 19, iconH: 18, word: 17, gap: 11 }, // stacked (F)
};
