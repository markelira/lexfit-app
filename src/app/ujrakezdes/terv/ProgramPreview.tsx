"use client";

import { useMemo, useState } from "react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { NcardModal } from "@/components/NcardModal";
import type { CardVideo } from "@/components/WorkoutDetail";
import type { LandingCatalog, LandingWorkout } from "@/lib/landing-catalog";
import * as C from "../copy";

// The Foundation programme, in full, on the reveal.
//
// Same cards and the same detail modal as the app (`WorkoutCard` +
// `NcardModal`), deliberately: the point of this block is to show somebody what
// they are about to join, and a bespoke marketing rendering of it would be
// showing them something they will never actually see again. Reusing the real
// components also means a change to the card system reaches this surface for
// free, which a copy never would.
//
// The modal runs in `publicMode` - the flag the landing page already uses for
// exactly this: no preview clip, no account-only actions, and the primary
// button enters the funnel instead of starting playback.

export default function ProgramPreview({
  catalog, onCta, skip = 0,
}: {
  catalog: LandingCatalog;
  /** Workouts already shown by <WeekWorkouts> above. Skipping them is what
   *  stops the reveal listing the same three cards twice. */
  skip?: number;
  /** Taking a workout is intent, so the card CTA enters the funnel. */
  onCta: () => void;
}) {
  const [open, setOpen] = useState<LandingWorkout | null>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | undefined>();

  const { entry, workouts } = catalog;

  // Sessions carry the running order and the phase; the workout record carries
  // everything the card and the modal need. Joining them here keeps both honest.
  const byCode = useMemo(
    () => new Map(workouts.map((w) => [w.code, w])),
    [workouts],
  );

  // The running number is assigned HERE, while the playlist order is still in
  // hand, rather than by a counter mutated during render - that reads fine on
  // the first pass and then drifts the moment React re-renders a subtree.
  const phases = useMemo(() => {
    // A degraded catalogue (Firestore outage, or nothing published yet) has no
    // entry programme. The reveal then shows the plan alone rather than an
    // empty "Ez vár rád" shell promising content that is not there.
    if (!entry) return [];
    const groups = new Map<
      number,
      { name: string; desc: string; icon: string; items: (LandingWorkout & { step: number })[] }
    >();
    for (const s of entry.sessions) {
      const w = byCode.get(s.code);
      if (!w) continue;                       // unpublished video - skip, never a dead card
      const idx = s.phaseIdx ?? -1;
      if (!groups.has(idx)) {
        const meta = entry.phases.find((p) => p.idx === idx);
        groups.set(idx, {
          name: meta?.name ?? "", desc: meta?.desc ?? "", icon: meta?.icon ?? "", items: [],
        });
      }
      groups.get(idx)!.items.push({ ...w, step: 0 });
    }
    let n = 0;
    const ordered = [...groups.entries()].sort((a, b) => a[0] - b[0]);
    for (const [, g] of ordered) for (const item of g.items) item.step = ++n;
    return ordered.map(([idx, g]) => ({ idx, ...g }));
  }, [entry, byCode]);

  const total = phases.reduce((n, p) => n + p.items.length, 0);
  if (!total) return null;                    // degraded catalogue - show nothing rather than an empty shell

  // Owner decision 2026-09-08: preview the OPENING of the programme, not all of
  // it. The reveal is already long, the first workouts are the ones that answer
  // „mivel kezdem", and the running numbers stay honest because `programTotal`
  // still carries the real count - card 3 of 30 says 3/30, not 3/6.
  const PREVIEW_N = 6;
  const shown: typeof phases = [];
  let drop = skip;                            // workouts the week section showed
  let left = PREVIEW_N;
  for (const ph of phases) {
    if (left <= 0) break;
    const items = ph.items.slice(drop);
    drop = Math.max(0, drop - ph.items.length);
    if (!items.length) continue;
    shown.push({ ...ph, items: items.slice(0, left) });
    left -= Math.min(left, items.length);
  }
  const shownCount = shown.reduce((n, p) => n + p.items.length, 0);
  const hidden = Math.max(0, total - skip - shownCount);
  // The week above may already have shown the whole (small) programme. An
  // empty „Ez vár rád" shell promising content that is not there is worse than
  // no section at all.
  if (!shownCount) return null;

  const toCard = (w: LandingWorkout): CardVideo => ({
    code: w.code, title: w.title, theme: w.theme, mins: w.mins, level: w.level,
    format: w.format, types: w.types, blocks: w.blocks, phase: w.phase,
  });

  const openCard = (w: LandingWorkout) => (code: string) => {
    void code;
    const el = document.getElementById(`u-w-${w.code}`);
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
    <section className="u-prog" aria-labelledby="u-prog-h">
      <div className="eyebrow">{C.PROGRAM_PREVIEW.eyebrow}</div>
      <h2 className="h-bold" id="u-prog-h">{C.PROGRAM_PREVIEW.heading}</h2>
      <p className="cap-body u-prog-lead">{C.PROGRAM_PREVIEW.lead(shownCount, total)}</p>

      {shown.map((ph) => (
        <div className="u-prog-phase" key={ph.idx}>
          {ph.name && (
            <div className="u-prog-phead">
              <h3>{ph.icon ? `${ph.icon} ${ph.name}` : ph.name}</h3>
              {ph.desc && <p>{ph.desc}</p>}
            </div>
          )}
          {/* `.lx` because the card system is scoped to it (src/app/workout-card.css
              and course-cards.css both key off `.lx`). NcardModal applies the class
              to its own root already, so only the grid needs it here. */}
          <div className="u-prog-grid lx">
            {ph.items.map((w) => (
                <div id={`u-w-${w.code}`} key={w.code}>
                  <WorkoutCard
                    v={w}
                    isProgram
                    programStep={w.step}
                    programTotal={total}
                    programHue={w.programHue}
                    saved={false}
                    onPlay={openCard(w)}
                    onToggleSave={() => {}}
                  />
                </div>
            ))}
          </div>
        </div>
      ))}

      {hidden > 0 && <p className="u-prog-more">{C.PROGRAM_PREVIEW.more(hidden)}</p>}

      <p className="u-prog-foot">{C.PROGRAM_PREVIEW.foot}</p>

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
