"use client";

import { useMemo, useState } from "react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { NcardModal } from "@/components/NcardModal";
import type { CardVideo } from "@/components/WorkoutDetail";
import type { LandingCatalog, LandingWorkout } from "@/lib/landing-catalog";
import { exerciseName } from "@/lib/blocks";
import type { WeekPlan } from "@/lib/ujrakezdes/plan";
import * as C from "../copy";

// The week, workout by workout.
//
// The plan card above this answers WHEN. This answers WHAT - and it does so with
// the same <WorkoutCard> the app itself uses, not a marketing rendering of one,
// so nobody is shown a card here that they will never see again.
//
// The FIRST training day is expanded with its real exercise list. That is the
// workout somebody is actually deciding about at this moment; days two and three
// are a promise about next week, and a promise does not need its contents listed.
// Expanding all of them would also bury the offer under four exercise lists.
//
// Pairing is by ORDER, which is the only honest mapping available: the plan says
// which weekdays are training days, the programme says which workout is first,
// second, third. Nothing here re-sequences the programme.

export default function WeekWorkouts({
  catalog, plan, startDay, onCta,
}: {
  catalog: LandingCatalog;
  plan: WeekPlan;
  /** The day picked in S2, or null. Live wiring, Nielsen #1: the pick visibly
   *  recomputes this section. */
  startDay: number | null;
  onCta: () => void;
}) {
  const [open, setOpen] = useState<LandingWorkout | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | undefined>();

  const { entry, workouts } = catalog;

  const rows = useMemo(() => {
    if (!entry) return [];
    const byCode = new Map(workouts.map((w) => [w.code, w]));
    const trainingDays = plan.days.filter((d) => d.training);

    // The itinerary starts on the day they picked in S2. Workout #1 is ALWAYS
    // workout #1 - the programme's order never changes - so the day LABELS
    // rotate instead: pick Friday and the rows read Friday, then next week's
    // Monday and Wednesday. `nextWeek` marks the wrapped days, because a
    // Monday listed after a Friday without saying „jövő" would claim time
    // travel. No pick → the plan's own order, no prefixes.
    const si = startDay == null ? -1 : trainingDays.findIndex((d) => d.weekday === startDay);
    const ordered = si > 0
      ? [...trainingDays.slice(si), ...trainingDays.slice(0, si)]
      : trainingDays;

    const out: {
      day: (typeof trainingDays)[number]; w: LandingWorkout; step: number; nextWeek: boolean;
    }[] = [];
    let step = 0;
    for (const s of entry.sessions) {
      const w = byCode.get(s.code);
      if (!w) continue;                       // unpublished video - never a dead card
      step += 1;
      const day = ordered[out.length];
      if (!day) break;                        // the week is full
      out.push({ day, w, step, nextWeek: si > 0 && out.length >= trainingDays.length - si });
    }
    return out;
  }, [entry, workouts, plan, startDay]);

  if (!rows.length) return null;              // degraded catalogue - show nothing

  const total = entry?.sessions.length ?? 0;

  const toCard = (w: LandingWorkout): CardVideo => ({
    code: w.code, title: w.title, theme: w.theme, mins: w.mins, level: w.level,
    format: w.format, types: w.types, blocks: w.blocks, phase: w.phase,
  });

  const openCard = (w: LandingWorkout) => (code: string) => {
    void code;
    const el = document.getElementById(`u-wd-${w.code}`);
    if (el) {
      const r = el.getBoundingClientRect();
      setOrigin({
        x: ((r.left + r.width / 2) / window.innerWidth) * 100,
        y: ((r.top + r.height / 2) / window.innerHeight) * 100,
      });
    }
    setOpen(w);
  };

  return (
    <section className="u-week" aria-labelledby="u-week-h">
      <div className="eyebrow">{C.WEEK_WORKOUTS.eyebrow}</div>
      <h2 className="h-bold" id="u-week-h">{C.WEEK_WORKOUTS.heading}</h2>
      <p className="cap-body">{C.WEEK_WORKOUTS.lead(rows.length)}</p>

      <ol className="u-wdays">
        {rows.map((r, i) => (
          <li key={r.w.code} className={`u-wday${i === 0 ? " first" : ""}`}>
            <div className="u-wday-head">
              <span className="u-wday-day">
                {(r.nextWeek ? `jövő ${r.day.full}` : r.day.full).replace(/^./, (c) => c.toUpperCase())}
              </span>
              {i === 0 && <span className="u-wday-tag">{C.WEEK_WORKOUTS.firstTag}</span>}
            </div>

            {/* `.lx` because the card system is scoped to it (workout-card.css
                and course-cards.css both key off `.lx`). */}
            <div className="u-wday-card lx" id={`u-wd-${r.w.code}`}>
              <WorkoutCard
                v={r.w}
                isProgram
                programStep={r.step}
                programTotal={total}
                programHue={r.w.programHue}
                saved={false}
                onPlay={openCard(r.w)}
                onToggleSave={() => {}}
              />
            </div>

            {/* Only the first day opens. The blocks are the real ones off the
                video record - if a workout has none stamped yet, the list simply
                does not render rather than showing an empty shell. */}
            {i === 0 && r.w.blocks.length > 0 && (
              <div className="u-wex">
                <p className="u-wex-lead">{C.WEEK_WORKOUTS.exercisesLead}</p>
                <ul>
                  {r.w.blocks.map((b) => (
                    <li key={b.name}>
                      <b>{b.name}</b>
                      <span>{b.items.map(exerciseName).join(" · ")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ol>

      {rows.length < plan.trainingCount && (
        <p className="u-fine">{C.WEEK_WORKOUTS.short}</p>
      )}

      {open && (
        <NcardModal
          video={toCard(open)}
          pool={workouts.filter((w) => w.code !== open.code).map(toCard)}
          saved={false}
          onToggleSave={() => {}}
          onClose={() => setOpen(null)}
          onPlay={onCta}
          origin={origin}
          program={open.program ?? "foundation"}
          programName={open.programName}
          programHue={open.programHue}
          publicMode
          publicCta={C.PROGRAM_PREVIEW.modalCta}
        />
      )}
    </section>
  );
}
