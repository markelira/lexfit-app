"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { Cover } from "@/components/Cover";
import { ProgramMark } from "@/components/ProgramMark";
import { benefitOf } from "@/lib/benefit";
import { programGrad, programVisual } from "@/lib/programs";

export interface WorkoutCardVideo {
  code: string;
  title: string;
  theme: string;
  mins: number;
  format?: string;
  types?: string[];
  level?: number;
  focus?: string[];
  subtitle?: string | null;
  thumb?: string | null;
  muxDuration?: number | null;
}

// Today's date as YYYY-MM-DD (local) - for the "ma" vs dated completion label.
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// The trainer avatar is always Alexa (README §4 #4).
// eslint-disable-next-line @next/next/no-img-element
const ALEXA_FACE = <img className="wc-ava-img" src="/alexa-av.jpg" alt="" />;

/**
 * Variant B card (README §4) - YouTube geometry, LEXFIT content.
 * The whole card plays; the save "+" is an independent nested-safe control.
 * Completed workouts are NOT dimmed - they gain a check + a timestamp line.
 */
export function WorkoutCard({
  v,
  isToday = false,
  isProgram = false,
  programStep = null,
  programTotal = null,
  programBadge = null,
  programHue = null,
  resume,
  completedAt = null,
  completedTime = null,
  saved,
  onPlay,
  onToggleSave,
}: {
  v: WorkoutCardVideo;
  isToday?: boolean;
  isProgram?: boolean;
  programStep?: number | null; // this workout's 1-based position in the program
  programTotal?: number | null; // total workouts in the program
  /** Program membership eyebrow for MIXED contexts (home rows, Videótár, search).
   *  Omit on a program's own page where every card shares one program. */
  programBadge?: { slug: string; name: string } | null;
  /** The program's UNIQUE brand hue - colors the cover in place of the category
   *  gradient. Pass for every program-member card; standalone videos omit it. */
  programHue?: number | null;
  resume?: number; // 0–1 fraction, if in progress
  completedAt?: string | null; // YYYY-MM-DD, if completed
  completedTime?: string | null; // local HH:MM, if recorded
  saved: boolean;
  onPlay: (code: string) => void;
  onToggleSave: (code: string) => void;
}) {
  const done = completedAt != null;
  const frac = done ? 1 : resume;
  const showBar = frac != null && frac > 0;

  // Avatar ring encodes progress THROUGH the program by workout position (§4 #4);
  // plain outside a program. Cadence-neutral - no week assumption.
  const ringPct =
    isProgram && programStep && programTotal ? Math.round((Math.min(programStep, programTotal) / programTotal) * 100) : null;

  // state line - rendered ONLY when there is state to report (§4 #5)
  let state: { text: string; done?: boolean } | null = null;
  if (done) {
    const when = completedAt ? (completedAt === todayStr() ? "ma" : completedAt) : "";
    const stamp = [when, completedTime].filter(Boolean).join(" ");
    state = { text: stamp ? `Megcsináltad · ${stamp}` : "Megcsináltad", done: true };
  } else if (resume != null && resume > 0 && resume < 1) {
    const left = Math.max(1, Math.ceil(v.mins * (1 - resume)));
    state = { text: `${left} perc van hátra` };
  }

  return (
    <div className="wc">
      <div className="wc-thumb">
        <Cover className="wc-cover-art" theme={v.theme} code={v.code} grad={programHue != null ? programGrad(programHue) : undefined} />
        {isToday && <span className="wc-ribbon">MAI EDZÉSED</span>}
        <span className="wc-play" aria-hidden="true">
          <LxIcon d={lxPaths.play} size={16} fill />
        </span>
        <span className="wc-dur">{v.mins} PERC</span>
        {showBar && (
          <span className="wc-prog" role="progressbar" aria-valuenow={Math.round((frac ?? 0) * 100)} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${Math.round((frac ?? 0) * 100)}%` }} />
          </span>
        )}
      </div>

      <button className="wc-cover" onClick={() => onPlay(v.code)} aria-label={`${v.title} lejátszása`} />

      <div className="wc-body">
        {ringPct != null ? (
          <span
            className="wc-ava ring"
            style={{ "--wp": ringPct } as React.CSSProperties}
            aria-hidden="true"
            title={`${programBadge?.name ?? "Program"} · ${programStep}/${programTotal}. edzés`}
          >
            <span className="inner">{done ? <LxIcon d={lxPaths.check} size={14} sw={2.6} /> : ALEXA_FACE}</span>
          </span>
        ) : (
          <span className={`wc-ava${done ? " on" : ""}`} aria-hidden="true">
            {done ? <LxIcon d={lxPaths.check} size={15} sw={2.6} /> : ALEXA_FACE}
          </span>
        )}
        <div className="wc-txt">
          {programBadge &&
            (() => {
              const pv = programVisual(programBadge.slug, programBadge.name);
              return (
                <div className="wc-program">
                  <ProgramMark shape={pv.icon} size={8} />
                  <span>{pv.name}</span>
                </div>
              );
            })()}
          <div className="wc-name">{v.title}</div>
          {state ? (
            <div className={`wc-state${state.done ? " done" : ""}`}>{state.text}</div>
          ) : (
            <div className="wc-sub">{benefitOf(v)}</div>
          )}
        </div>
        <button
          className={`wc-save${saved ? " on" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? "Eltávolítás a Listámról" : "Mentés a Listámra"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(v.code);
          }}
        >
          <span className="dot">
            {saved ? <LxIcon d={lxPaths.check} size={13} sw={2.6} /> : <LxIcon d={lxPaths.plus} size={14} sw={2.4} />}
          </span>
        </button>
      </div>
    </div>
  );
}
