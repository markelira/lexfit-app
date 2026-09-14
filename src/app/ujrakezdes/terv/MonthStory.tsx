"use client";

import type { WeekPlan } from "@/lib/ujrakezdes/plan";
import * as C from "../copy";

// „Az első hónapod" - the plan, extended from one week to four (owner request
// 2026-09-14).
//
// Why it exists: the free plan is ONE week, and one week is a thing you can do
// without us. The month is where the product actually lives - the dip in week
// two, the missed session in week three, the tenth workout that trips the
// guarantee - and none of it was ever shown. The block is the bridge between
// „itt a heted" and „ezért éri meg tagnak lenni", told as four short beats
// rather than a feature list.
//
// Discipline: every beat is about RHYTHM, never the body. No weight, no
// centimetres, no "by week four you will look" - the page's standing guardrail
// (and the selftest's banned vocabulary) applies here more than anywhere,
// because a month is exactly the horizon where fitness copy starts lying.

export function MonthStory({ plan }: { plan: WeekPlan }) {
  const n = plan.trainingCount;
  const total = n * 4;
  // The week her 10th session lands in - the guarantee's own threshold, and
  // the only honest way to tie the month to the promise. 2/week puts it in
  // week 5, which still fits the guarantee's five-week window.
  const guarWeek = Math.ceil(10 / n);

  return (
    <section className="u2-blk u2-month">
      <p className="u2-eyebrow">{C.REVEAL.month.eyebrow}</p>
      <h2>{C.REVEAL.month.hd}</h2>

      {/* Four weeks of her own week, repeated: the month as one picture. The
          first training day is filled solid - that is the session she can
          watch today, so the calendar starts where she already is. */}
      <div className="u2-mgrid" aria-hidden="true">
        {[0, 1, 2, 3].map((w) => (
          <div key={w} className="u2-mrow">
            <span className="u2-mw">{w + 1}</span>
            {plan.days.map((d, i) => {
              const isFirst = w === 0 && d.training
                && !plan.days.slice(0, i).some((x) => x.training);
              return (
                <i
                  key={d.weekday}
                  className={`${d.training ? "on" : ""}${isFirst ? " first" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <ol className="u2-mbeats">
        {C.REVEAL.month.weeks.map((b, i) => (
          <li key={b.t}>
            <b>{b.t}</b>
            <span>{b.d(n, plan.firstWorkoutMinutes)}</span>
            {/* The guarantee lands on the week it actually lands on. */}
            {i === 3 && <em className="u2-mguar">{C.REVEAL.month.guar(guarWeek)}</em>}
          </li>
        ))}
      </ol>

      <p className="u2-xs u2-mfoot">{C.REVEAL.month.foot(total)}</p>
    </section>
  );
}
