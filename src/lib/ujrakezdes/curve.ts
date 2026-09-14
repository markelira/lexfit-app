// The reveal's habit-strength curve — pure math, so the selftest can pin the
// shape without rendering SVG.
//
// WHAT THE CURVE CLAIMS (and what it must never claim). The y-axis is
// "szokáserő" — habit strength, no units, no numbers, and categorically never
// kg or any body metric (docs/reveal-council-analysis.md R3; ASA/DFA
// direction on body-change projections). The shape is the asymptotic
// automaticity curve from Lally et al. 2010 (EJSP — habits plateau around
// ~66 days of repetition), which an entry programme of 30 workouts at 2-4
// sessions/week happens to span almost exactly.
//
// THE DIP IS THE POINT. Around 45% of the way in, the curve dips and then
// recovers ABOVE its pre-dip level, annotated "kihagyott hét — nem nulláz".
// Every competitor draws an unbroken ascent; LEXFIT's whole mechanism is that
// the plan survives a bad week, so the plan's own picture must contain one.
// (Council synthesis: Schwartz's mechanism-made-visible + Godin's
// remarkability test, reconciled by Sutherland.)

export const PROGRAM_WORKOUTS = 30;

/** Milestone workout numbers, mirrored from REVEAL.b1.milestones. */
export const CURVE_MILESTONES = [1, 5, 10, 15, 30] as const;

export interface CurveModel {
  /** Total weeks the 30 workouts span at this cadence (the x-domain). */
  weeks: number;
  /** Polyline in unit space — x: 0..1 (time), y: 0..1 (habit strength, up). */
  points: { x: number; y: number }[];
  /** The missed-week dip: unit-space anchor for the annotation. */
  dip: { x: number; y: number; week: number };
  /** Milestone markers on the curve: workout n at its week, y on the curve. */
  milestones: { n: number; x: number; y: number }[];
}

/** Asymptotic habit strength at week t (of `weeks`), before the dip.
 *  Starts at 0.06 (the first workout is not zero — she showed up) and reaches
 *  ~0.92 by the final week: still visibly rising at the end, because a flat
 *  tail reads as "nothing left to gain from the programme". */
const strength = (t: number, weeks: number): number => {
  const k = 2.5 / weeks;
  return 0.06 + 0.94 * (1 - Math.exp(-k * t));
};

/**
 * Build the curve for a weekly cadence. `trainingCount` is the user's
 * days/week answer (2 | 3 | 4 — flex resolves to 3 upstream).
 */
export function curveModel(trainingCount: number): CurveModel {
  const perWeek = Math.max(2, Math.min(4, Math.round(trainingCount) || 3));
  const weeks = Math.ceil(PROGRAM_WORKOUTS / perWeek);
  const dipWeek = Math.max(2, Math.round(weeks * 0.45));

  // The dip is a smooth sine valley over ~1.9 weeks (down AND up — a cliff
  // would read as an event, not a week), depth 0.14; everything after it
  // rides slightly higher than the base curve, because the recovery must end
  // ABOVE where the dip began or the annotation lies.
  const DEPTH = 0.14;
  const LIFT = 0.03;
  const vStart = dipWeek - 0.5;
  const vEnd = dipWeek + 1.4;
  const y = (t: number): number => {
    const base = strength(t, weeks);
    const u = (t - vStart) / (vEnd - vStart);
    const valley = u > 0 && u < 1 ? DEPTH * Math.sin(Math.PI * u) : 0;
    const lift =
      t >= vEnd ? LIFT : t > dipWeek ? (LIFT * (t - dipWeek)) / (vEnd - dipWeek) : 0;
    return base - valley + lift;
  };

  const STEPS = weeks * 4; // quarter-week resolution - smooth at any size
  const points = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = (i / STEPS) * weeks;
    return { x: t / weeks, y: Math.max(0, Math.min(1, y(t))) };
  });

  const dipT = (vStart + vEnd) / 2; // the valley floor (sine peak)
  const dip = { x: dipT / weeks, y: Math.max(0, y(dipT)), week: dipWeek };

  const milestones = CURVE_MILESTONES.map((n) => {
    const t = Math.min(weeks, n / perWeek);
    return { n, x: t / weeks, y: Math.max(0, Math.min(1, y(t))) };
  });

  return { weeks, points, dip, milestones };
}
