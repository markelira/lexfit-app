"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { dayState, type FoundationData, type WeekGroup } from "@/lib/program";
import { CourseCardShelf } from "@/components/CourseCardShelf";
import { WorkoutDetail } from "@/components/WorkoutDetail";

const TRAINER = "/trainer-underlayer.jpg";

// Program overview — the current/next workout spotlighted with the SAME WorkoutDetail
// design the course-card preview uses (1:1), then the whole program sorted into weeks,
// each rendered with the course-card (shelf) cards.
export function ProgramOverviewModal({
  program, weeks, joined, doneCount, currentIndex, curWeek, total, myList, onToggleSave, onPlay, onClose,
}: {
  program: FoundationData["program"];
  weeks: WeekGroup[];
  joined: boolean;
  doneCount: number;
  currentIndex: number;
  curWeek: number;
  total: number;
  myList: Set<string>;
  onToggleSave: (code: string) => void;
  onPlay: (code: string) => void;
  onClose: () => void;
}) {
  const allWorkouts = weeks.flatMap((w) => w.workouts);
  // current/next unfinished workout (order === currentIndex), else the first one.
  const current = allWorkouts.find((w) => w.order === currentIndex) ?? allWorkouts[0];

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return createPortal(
    <div className="lx pov-backdrop" onClick={onClose}>
      <div className="pov" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {current && (
          <WorkoutDetail
            video={{ ...current, phase: current.phaseIdx }}
            saved={myList.has(current.code)}
            onToggleSave={() => onToggleSave(current.code)}
            onPlay={onPlay}
            onClose={onClose}
            program="foundation"
            trainer={TRAINER}
            showClose
            showSimilar={false}
          />
        )}

        <div className="pov-weeks">
          <div className="pov-headrow">
            <div>
              <div className="pov-eyebrow">A PROGRAM FELÉPÍTÉSE</div>
              <h2>{program.hu}</h2>
            </div>
            {joined && <span className="pov-count">{doneCount} / {total} kész · {curWeek}. hét</span>}
          </div>

          {weeks.map((wk) => {
            const phase = program.phases[wk.phaseIdx];
            return (
              <section key={wk.num} className="pov-week">
                <div className="pov-week-hd">
                  <span className="wn">Hét {wk.num}</span>
                  {phase && <span className="ph">{phase.icon} {phase.name}</span>}
                  {wk.retest && <span className="rt">📊 Visszamérés</span>}
                </div>
                <div className="pov-week-row">
                  {wk.workouts.map((w) => {
                    const st = dayState(w.order, joined, doneCount, currentIndex);
                    return (
                      <div key={w.code} className={`pov-card is-${st}`}>
                        <CourseCardShelf
                          v={{ code: w.code, title: w.title, theme: w.theme, mins: w.mins }}
                          program="foundation"
                          trainer={TRAINER}
                          resume={st === "done" ? 1 : undefined}
                          onClick={() => onPlay(w.code)}
                        />
                        {st === "today" && <span className="pov-card-now">MOST</span>}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
