"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { cardGrad, catWord, levelWord } from "@/lib/categories";
import { ProgramLockup } from "@/components/ProgramLockup";
import { programGrad } from "@/lib/programs";
import { usePreviewClip } from "@/components/use-preview-clip";
import { phaseLabel, matchPct, workoutDesc, workoutBlocks } from "@/lib/workout-desc";
import type { VideoBlock } from "@/lib/types";

const TRAINER = "/trainer-underlayer.jpg";

export interface CardVideo {
  code: string;
  title: string;
  theme: string;
  mins: number;
  level: number;
  format: string;
  types: string[];
  blocks?: VideoBlock[];
  phase?: number | null;
}

// The workout "preview" detail - cinematic hero (autoplaying muted preview) + description,
// meta, block breakdown, facts, and optional similar shelf. Shared 1:1 by the card detail
// modal and the program-overview spotlight; the caller supplies the surrounding shell.
export function WorkoutDetail({
  video, pool = [], saved, onToggleSave, onPlay, onClose,
  program = "foundation", programName = null, programHue = null, trainer = TRAINER, showClose = true, showSimilar = true,
  publicMode = false, publicCta = "Ezzel kezdenék →",
}: {
  video: CardVideo;
  pool?: CardVideo[];
  saved: boolean;
  onToggleSave: () => void;
  onPlay: (code: string) => void;
  onClose: () => void;
  program?: string;
  programName?: string | null;
  programHue?: number | null;
  trainer?: string | null;
  showClose?: boolean;
  showSimilar?: boolean;
  /** Logged-out landing use: no preview clip, no personalized match, no account-only
   *  actions, and the primary button starts the funnel instead of playback. */
  publicMode?: boolean;
  publicCta?: string;
}) {
  const [v, setV] = useState<CardVideo>(video);
  const [liked, setLiked] = useState(false);
  const { pb, videoReady, muted, sec, ended, playerRef, toggleMute, replay } = usePreviewClip(v.code, !publicMode);

  const blocks = workoutBlocks(v);
  // The first block with content opens by default: the breakdown should show what
  // it means without a click, and the rest stay collapsed so the modal stays short.
  const firstOpen = blocks.findIndex((b) => b.items.length > 0);
  const tags = v.types.map((t) => t.split(" ").slice(1).join(" "));
  const similar = pool
    .filter((x) => x.code !== v.code)
    .sort((a) => (a.theme === v.theme ? -1 : a.format === v.format ? 0 : 1))
    .slice(0, 3);

  return (
    <>
      <div className="nmod-hero" style={{ background: programHue != null ? programGrad(programHue) : cardGrad(v.theme) }}>
        {trainer && <div className="nmod-photo" style={{ backgroundImage: `url(${trainer})` }} aria-hidden="true" />}
        <div className={`nmod-kb${ended ? " paused" : ""}`} key={v.code}>
          <span className="nmod-ring" />
          <span className="nmod-word">{catWord(v.theme)}</span>
        </div>
        {pb && (
          <div className={`nmod-video${videoReady ? " on" : ""}`} aria-hidden="true">
            <MuxPlayer
              key={v.code}
              ref={playerRef}
              playbackId={pb.playbackId}
              tokens={pb.tokens}
              streamType="on-demand"
              autoPlay
              muted={muted}
              preload="auto"
              startTime={0}
              nohotkeys
            />
          </div>
        )}
        <span className="nmod-vig" />
        {showClose && <button className="nmod-close" onClick={onClose} aria-label="Bezárás">✕</button>}
        <ProgramLockup program={program} name={programName} variant="top-left" />
        {!publicMode && (
          <span className="nmod-prevbadge">
            {ended ? "ELŐNÉZET VÉGE" : `ELŐNÉZET · 0:${String(60 - sec).padStart(2, "0")}`}
          </span>
        )}

        <div className="nmod-herobottom">
          <div className="nmod-eyebrow">LEXFIT · {v.code}</div>
          <h2 className="nmod-title">{v.title}</h2>
          <div className="nmod-actions">
            {publicMode ? (
              // No playback without auth + entitlement - a primary action that fails
              // is worse than none, so it starts the funnel instead.
              <button className="btn accent nmod-play" onClick={() => onPlay(v.code)}>
                {publicCta}
              </button>
            ) : (
              <button className="btn accent nmod-play" onClick={() => { onClose(); onPlay(v.code); }}>
                <LxIcon d={lxPaths.play} size={17} fill /> Edzés indítása
              </button>
            )}
            {!publicMode && (
              <button className={`nmod-rbtn${saved ? " on" : ""}`} title="Mentés a listámra" onClick={onToggleSave}>
                {saved ? <LxIcon d={lxPaths.check} size={16} sw={2.6} /> : "+"}
              </button>
            )}
            {!publicMode && (
              <button className={`nmod-rbtn${liked ? " on" : ""}`} title="Kedvenc" onClick={() => setLiked(!liked)}>
                ♥
              </button>
            )}
            {pb && (
              <button className="nmod-rbtn" title={muted ? "Hang bekapcsolása" : "Hang némítása"} onClick={toggleMute}>
                {muted ? "🔇" : "🔊"}
              </button>
            )}
            <span style={{ flex: 1 }} />
            {ended && (
              <button className="nmod-rbtn" title="Előnézet újra" onClick={replay}>↺</button>
            )}
          </div>
        </div>
        {!publicMode && <div className="nmod-prevbar"><i style={{ width: `${(sec / 60) * 100}%` }} /></div>}
      </div>

      <div className="nmod-body">
        <div className="nmod-cols">
          <div className="nmod-main">
            <div className="nmod-metarow">
              {/* The match score is personalized - meaningless before onboarding, and
                  an invented percentage shown to a stranger is exactly the kind of
                  claim the landing truth-purge removed. */}
              {!publicMode && <span className="nmod-match">{matchPct(v.code)}% - neked ajánlott</span>}
              <span>{v.mins} perc</span>
              <span className="nmod-box">{levelWord(v.level).toUpperCase()}</span>
              <span className="nmod-box mono">{v.code}</span>
              <span className="nmod-phase">{phaseLabel(v.phase)}</span>
            </div>
            <p className="nmod-desc">{workoutDesc(v)}</p>

            <div className="nmod-secthd">Az edzés felépítése</div>
            <div className="nmod-blocks">
              {blocks.map((b, i) => {
                const edge = i === 0 || i === blocks.length - 1;
                const row = (
                  <>
                    <span className="bn">{b.name}</span>
                    <span className="bbar">
                      <i style={{ width: `${Math.round((b.mins / v.mins) * 100)}%`, background: edge ? "var(--surface-2)" : "var(--accent-soft)" }}>
                        <em style={{ background: edge ? "var(--ink-3)" : "var(--accent)" }} />
                      </i>
                    </span>
                    <span className="bm mono">{b.mins}′</span>
                  </>
                );
                // A block only opens when it actually has exercises to show - a
                // disclosure that reveals nothing is worse than no disclosure.
                return b.items.length ? (
                  <details key={b.name} className="nmod-blockx" open={i === firstOpen}>
                    <summary className="nmod-block">
                      {row}
                      <span className="bchev" aria-hidden="true">
                        <LxIcon d={lxPaths.arrowR} size={13} sw={2} />
                      </span>
                    </summary>
                    <ol className="nmod-ex">
                      {b.items.map((name, n) => (
                        <li key={`${name}-${n}`}><span className="exn">{n + 1}</span>{name}</li>
                      ))}
                    </ol>
                  </details>
                ) : (
                  <div key={b.name} className="nmod-block">{row}</div>
                );
              })}
            </div>
          </div>

          <div className="nmod-facts">
            {[
              ["Fókusz", v.theme], ["Formátum", v.format], ["Fázis", phaseLabel(v.phase)],
              ["Nehézség", levelWord(v.level)], ["Időtartam", `${v.mins} perc`],
              ["Címkék", tags.length ? tags.join(" · ") : "-"],
            ].map(([k, val]) => (
              <div key={k} className="nmod-fact"><span>{k}:</span> {val}</div>
            ))}
          </div>
        </div>

        {showSimilar && similar.length > 0 && (
          <>
            <div className="nmod-secthd" style={{ marginTop: 22 }}>Hasonló edzések</div>
            <div className="nmod-simgrid">
              {similar.map((x) => (
                <button key={x.code} className="ncard" onClick={() => { setV(x); setLiked(false); }}>
                  <div className="ncard-art" style={{ background: programHue != null ? programGrad(programHue) : cardGrad(x.theme) }}>
                    {trainer && <div className="ncard-photo" style={{ backgroundImage: `url(${trainer})` }} aria-hidden="true" />}
                    <span className="ncard-ring" />
                    <ProgramLockup program={program} name={programName} variant="corner-tab" />
                    <div className="ncard-lockup"><div className="ey">LEXFIT · {x.code}</div><div className="wd">{catWord(x.theme)}</div><div className="un" /></div>
                    <span className="ncard-vig" />
                    <span className="ncard-chip">{x.mins} PERC</span>
                    <div className="ncard-title">{x.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
