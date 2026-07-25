"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { WorkoutDetail, type CardVideo } from "@/components/WorkoutDetail";

export type { CardVideo };

const TRAINER = "/trainer-underlayer.jpg";

// Card detail modal — the shared WorkoutDetail in a full-screen backdrop + panel.
export function NcardModal({
  video, pool = [], saved, onToggleSave, onClose, onPlay, program = "foundation", trainer = TRAINER,
}: {
  video: CardVideo; pool?: CardVideo[]; saved: boolean;
  onToggleSave: () => void; onClose: () => void; onPlay: (code: string) => void;
  program?: string; trainer?: string | null;
}) {
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
    <div className="lx nmod-backdrop" onClick={onClose}>
      <div className="nmod" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <WorkoutDetail
          video={video}
          pool={pool}
          saved={saved}
          onToggleSave={onToggleSave}
          onPlay={onPlay}
          onClose={onClose}
          program={program}
          trainer={trainer}
        />
      </div>
    </div>,
    document.body,
  );
}
