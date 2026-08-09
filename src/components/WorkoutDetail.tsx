"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { cardGrad, catWord, levelWord } from "@/lib/categories";
import { ProgramLockup } from "@/components/ProgramLockup";
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

// The workout "preview" detail — cinematic hero (autoplaying muted preview) + description,
// meta, block breakdown, facts, and optional similar shelf. Shared 1:1 by the card detail
// modal and the program-overview spotlight; the caller supplies the surrounding shell.
export function WorkoutDetail({
  video, pool = [], saved, onToggleSave, onPlay, onClose,
  program = "foundation", programName = null, trainer = TRAINER, showClose = true, showSimilar = true,
}: {
  video: CardVideo;
  pool?: CardVideo[];
  saved: boolean;
  onToggleSave: () => void;
  onPlay: (code: string) => void;
  onClose: () => void;
  program?: string;
  programName?: string | null;
  trainer?: string | null;
  showClose?: boolean;
  showSimilar?: boolean;
}) {
  const [v, setV] = useState<CardVideo>(video);
  const [liked, setLiked] = useState(false);
  const { pb, videoReady, muted, sec, ended, playerRef, toggleMute, replay } = usePreviewClip(v.code);

  const blocks = workoutBlocks(v);
  const tags = v.types.map((t) => t.split(" ").slice(1).join(" "));
  const similar = pool
    .filter((x) => x.code !== v.code)
    .sort((a) => (a.theme === v.theme ? -1 : a.format === v.format ? 0 : 1))
    .slice(0, 3);

  return (
    <>
      <div className="nmod-hero" style={{ background: cardGrad(v.theme) }}>
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
        <span className="nmod-prevbadge">
          {ended ? "ELŐNÉZET VÉGE" : `ELŐNÉZET · 0:${String(60 - sec).padStart(2, "0")}`}
        </span>

        <div className="nmod-herobottom">
          <div className="nmod-eyebrow">LEXFIT · {v.code}</div>
          <h2 className="nmod-title">{v.title}</h2>
          <div className="nmod-actions">
            <button className="btn accent nmod-play" onClick={() => { onClose(); onPlay(v.code); }}>
              <LxIcon d={lxPaths.play} size={17} fill /> Edzés indítása
            </button>
            <button className={`nmod-rbtn${saved ? " on" : ""}`} title="Mentés a listámra" onClick={onToggleSave}>
              {saved ? <LxIcon d={lxPaths.check} size={16} sw={2.6} /> : "+"}
            </button>
            <button className={`nmod-rbtn${liked ? " on" : ""}`} title="Kedvenc" onClick={() => setLiked(!liked)}>
              ♥
            </button>
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
        <div className="nmod-prevbar"><i style={{ width: `${(sec / 60) * 100}%` }} /></div>
      </div>

      <div className="nmod-body">
        <div className="nmod-cols">
          <div className="nmod-main">
            <div className="nmod-metarow">
              <span className="nmod-match">{matchPct(v.code)}% — neked ajánlott</span>
              <span>{v.mins} perc</span>
              <span className="nmod-box">{levelWord(v.level).toUpperCase()}</span>
              <span className="nmod-box mono">{v.code}</span>
              <span className="nmod-phase">{phaseLabel(v.phase)}</span>
            </div>
            <p className="nmod-desc">{workoutDesc(v)}</p>

            <div className="nmod-secthd">Az edzés felépítése</div>
            <div className="nmod-blocks">
              {blocks.map((b, i) => (
                <div key={b.name} className="nmod-block">
                  <span className="bn">{b.name}</span>
                  <span className="bbar">
                    <i style={{ width: `${Math.round((b.mins / v.mins) * 100)}%`, background: i === 0 || i === blocks.length - 1 ? "var(--surface-2)" : "var(--accent-soft)" }}>
                      <em style={{ background: i === 0 || i === blocks.length - 1 ? "var(--ink-3)" : "var(--accent)" }} />
                    </i>
                  </span>
                  <span className="bm mono">{b.mins}′</span>
                </div>
              ))}
            </div>
          </div>

          <div className="nmod-facts">
            {[
              ["Fókusz", v.theme], ["Formátum", v.format], ["Fázis", phaseLabel(v.phase)],
              ["Nehézség", levelWord(v.level)], ["Időtartam", `${v.mins} perc`],
              ["Címkék", tags.length ? tags.join(" · ") : "—"],
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
                  <div className="ncard-art" style={{ background: cardGrad(x.theme) }}>
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
