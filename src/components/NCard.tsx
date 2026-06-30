"use client";

import { useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { cardGrad, catWord, levelWord } from "@/lib/categories";
import { NcardModal, type CardVideo } from "@/components/NcardModal";

export function NCard({
  v, resume, isNew = false, saved, onToggleSave, onPlay, pool = [], browse = false,
}: {
  v: CardVideo;
  resume?: number; // 0–1 fraction, if in progress
  isNew?: boolean;
  saved: boolean;
  onToggleSave: () => void;
  onPlay: (code: string) => void;
  pool?: CardVideo[];
  browse?: boolean;
}) {
  const [detail, setDetail] = useState(false);
  const isResume = resume != null;
  const mode = isResume ? "resume" : isNew ? "new" : "default";
  const tags = [v.theme, v.format, ...v.types.map((t) => t.split(" ").slice(1).join(" "))]
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      <button className={`ncard is-${mode}`} onClick={() => setDetail(true)}>
        <div className="ncard-art" style={{ background: cardGrad(v.theme) }}>
          <span className="ncard-ring" />
          <div className="ncard-lockup">
            <div className="wd">{catWord(v.theme)}</div>
            <div className="un" />
          </div>
          <span className="ncard-vig" />
          {mode === "new" && <span className="ncard-badge">ÚJ EDZÉS</span>}
          <span className="ncard-chip">{v.mins} PERC</span>
          <div className="ncard-title">{v.title}</div>
          {isResume && <div className="ncard-prog"><i style={{ width: `${Math.round((resume ?? 0) * 100)}%` }} /></div>}
        </div>

        {!browse && (
          <div className="ncard-expand">
            <div className="ncard-actions">
              <span className="ncard-bplay" onClick={(e) => { e.stopPropagation(); onPlay(v.code); }}>
                <LxIcon d={lxPaths.play} size={14} fill />
              </span>
              <span
                className={`ncard-badd${saved ? " on" : ""}`}
                title={saved ? "Eltávolítás a Listámról" : "Mentés a Listámra"}
                onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
              >
                {saved ? <LxIcon d={lxPaths.check} size={13} sw={2.6} /> : "+"}
              </span>
              <span className="ncard-bmore" title="Részletek" onClick={(e) => { e.stopPropagation(); setDetail(true); }}>
                <LxIcon d={lxPaths.arrowR} size={13} style={{ transform: "rotate(90deg)" }} />
              </span>
            </div>
            {mode === "resume" && <div className="ncard-recline res">Folytatás · {Math.round((resume ?? 0) * 100)}% kész</div>}
            {mode === "new" && <div className="ncard-recline rec">Neked ajánlott</div>}
            <div className="ncard-meta">
              <span className="ncard-lvl">{levelWord(v.level)}</span>
              <span>{v.mins} perc</span>
              <span className="ncard-codebox">{v.code}</span>
            </div>
            <div className="ncard-tags">
              {tags.map((t, i) => (
                <span key={t}>{i > 0 && <i>·</i>}{t}</span>
              ))}
            </div>
          </div>
        )}
      </button>

      {detail && (
        <NcardModal
          video={v}
          pool={pool}
          saved={saved}
          onToggleSave={onToggleSave}
          onClose={() => setDetail(false)}
          onPlay={onPlay}
        />
      )}
    </>
  );
}
