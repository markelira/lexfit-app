"use client";

import { BottomSheet } from "@/components/BottomSheet";
import { Button } from "@/components/Button";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { cardGrad, levelWord } from "@/lib/categories";
import { programGrad } from "@/lib/programs";
import type { VideoBlock } from "@/lib/types";

export interface SheetVideo {
  code: string;
  title: string;
  theme: string;
  mins: number;
  level?: number;
  format?: string;
  blocks?: VideoBlock[];
}

const WHISPER = `„Ha egy perc túl sok, hagyd ki a felét — a lényeg, hogy itt vagy.”`;

// Derive the "Mit fogsz csinálni" segments. Real blocks if authored, else a sensible
// warm-up / main / cool-down split from the total minutes.
function segments(v: SheetVideo): { name: string; mins: number; main?: boolean }[] {
  if (v.blocks?.length) {
    return v.blocks.map((b, i) => ({ name: b.name, mins: b.mins, main: i === Math.floor(v.blocks!.length / 2) }));
  }
  const warm = Math.max(2, Math.round(v.mins * 0.15));
  const cool = Math.max(2, Math.round(v.mins * 0.15));
  return [
    { name: "Bemelegítés", mins: warm },
    { name: "Fő blokk", mins: Math.max(1, v.mins - warm - cool), main: true },
    { name: "Levezetés", mins: cool },
  ];
}

/** Mobile card-tap detail sheet (§M4). Dismiss returns the user in place. */
export function MobileWorkoutSheet({
  v,
  saved,
  onPlay,
  onToggleSave,
  onClose,
  programHue = null,
}: {
  v: SheetVideo | null;
  saved: boolean;
  onPlay: (code: string) => void;
  onToggleSave: (code: string) => void;
  onClose: () => void;
  /** Program brand hue — overrides the category gradient on the art band. */
  programHue?: number | null;
}) {
  if (!v) return null;
  const segs = segments(v);
  const total = segs.reduce((n, s) => n + s.mins, 0) || 1;

  return (
    <BottomSheet open onClose={onClose} ariaLabel={v.title}>
      <div className="mws-art" style={{ background: programHue != null ? programGrad(programHue) : cardGrad(v.theme) }}>
        <h2 className="mws-title">{v.title}</h2>
      </div>

      <div className="mws-chips">
        <span className="mws-chip"><LxIcon d={lxPaths.clock} size={12} /> {v.mins} PERC</span>
        {v.level != null && <span className="mws-chip">{levelWord(v.level).toUpperCase()}</span>}
        <span className="mws-chip">ESZKÖZ NÉLKÜL</span>
      </div>

      <div className="mws-whisper">
        <LxIcon d={lxPaths.check} size={13} sw={2.4} />
        <span>{WHISPER}</span>
      </div>

      <div className="bsheet-sec">
        <span className="lbl">Mit fogsz csinálni</span>
        <div className="mws-blocks">
          {segs.map((s, i) => (
            <div key={i} className={`mws-block${s.main ? " main" : ""}`} style={{ flexGrow: s.mins / total }}>
              {s.name} {s.mins}′
            </div>
          ))}
        </div>
      </div>

      <div className="mws-cta bsheet-foot">
        <Button size="l" variant="primary" fullWidth iconLeft={lxPaths.play} onClick={() => onPlay(v.code)}>
          Indítás
        </Button>
        <button
          className={`mws-save${saved ? " on" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? "Eltávolítás a Listámról" : "Mentés a Listámra"}
          onClick={() => onToggleSave(v.code)}
        >
          {saved ? <LxIcon d={lxPaths.check} size={16} sw={2.6} /> : <LxIcon d={lxPaths.plus} size={16} sw={2.4} />}
        </button>
      </div>
    </BottomSheet>
  );
}
