"use client";

import { catWord, dayGrad } from "@/lib/categories";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { Video } from "@/lib/types";

export function VideoCard({
  v,
  saved,
  onToggleSave,
  onClick,
}: {
  v: Video;
  saved: boolean;
  onToggleSave: () => void;
  onClick: () => void;
}) {
  return (
    <div className="lvcard">
      <button className="lvcard-art" style={{ background: dayGrad(v.theme) }} onClick={onClick}>
        <span className="ring" />
        <span className="word">{catWord(v.theme)}</span>
        <span className="lvcard-dur">{v.mins} PERC</span>
        <span className="lvcard-play">
          <LxIcon d={lxPaths.play} size={18} fill />
        </span>
        <span className="lvcard-title">{v.title}</span>
      </button>
      <button
        className={`lvcard-save${saved ? " on" : ""}`}
        onClick={onToggleSave}
        title={saved ? "Eltávolítás a Listámról" : "Mentés a Listámra"}
        aria-label={saved ? "Eltávolítás" : "Mentés"}
      >
        {saved ? <LxIcon d={lxPaths.check} size={13} sw={2.6} /> : <LxIcon d={lxPaths.plus} size={14} sw={2.4} />}
      </button>
    </div>
  );
}
