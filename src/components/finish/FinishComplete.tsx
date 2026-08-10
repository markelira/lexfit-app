"use client";

import "./FinishComplete.css";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { FinishExamples } from "@/components/finish/FinishExamples";

/**
 * The redesigned workout-completion moment. Fills the whole screen; everything —
 * the celebration, the full grid of real member finish-cards, and the CTA — is
 * visible at once, no scrolling. Apple-design: restraint, materials, a quiet
 * materialize-in.
 */
export function FinishComplete({
  title, mins, streak, onShare, onSkip,
}: {
  title: string;
  mins: number;
  streak: number;
  onShare: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fc">
      <div className="fc-inner">
        <span className="fc-badge"><LxIcon d={lxPaths.check} size={24} sw={2.4} /></span>
        <h1 className="fc-title">Megcsináltad.</h1>
        <p className="fc-stat">{title} · {mins} perc · <b>{streak}. napos</b> sorozat</p>

        <div className="fc-eyebrow">Oszd meg egy szelfivel — így néz ki</div>
        <FinishExamples onPick={onShare} />

        <button className="fc-cta" onClick={onShare}>
          <LxIcon d={lxPaths.camera} size={17} /> Elkészítem a sajátomat
        </button>

        <div className="fc-foot">
          <button type="button" className="fc-skip" onClick={onSkip}>Most nem · kihagyom</button>
        </div>
      </div>
    </div>
  );
}
