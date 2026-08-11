"use client";

import "./ChallengeCard.css";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { challengeCatOf, challengeGrad } from "@/lib/categories";
import type { ChallengeCardData } from "@/lib/challenges";

/**
 * The Kihívások series card - a 9:16-leaning portrait poster that reads as a
 * multi-day commitment at thumbnail size: a stack mark + part count (top-left),
 * an engraved day badge (bottom-right), a progress bar across the whole series,
 * an optional ribbon, and a state line that appears only when there's state.
 */
export function ChallengeCard({
  c,
  saved,
  ribbon,
  onOpen,
  onToggleSave,
}: {
  c: ChallengeCardData;
  saved: boolean;
  ribbon?: string; // overrides the featured label (e.g. "ÚJ")
  onOpen: (slug: string) => void;
  onToggleSave: (slug: string) => void;
}) {
  const total = c.totalDays || c.durationDays || 0;
  const word = challengeCatOf(c.bodyPart).word;
  const done = c.state === "kesz";
  const ribbonLabel = ribbon ?? (c.featured ? c.featuredLabel ?? "A CSOPORT VÁLASZTÁSA" : null);

  const stateLine =
    done ? "Megcsináltad"
    : c.state === "folyamatban" ? `${c.doneCount} / ${total} nap kész`
    : c.monthLabel;

  return (
    <button type="button" className="chc" onClick={() => onOpen(c.slug)}>
      <div className="chc-art" style={{ background: challengeGrad(c.bodyPart) }}>
        <span className="chc-ring" aria-hidden="true" />
        <span className="chc-word">{word}</span>

        {total > 0 && (
          <span className="chc-stack">
            <LxIcon d={lxPaths.layers} size={11} /> {total} RÉSZ
          </span>
        )}
        {ribbonLabel && <span className="chc-ribbon">{ribbonLabel}</span>}

        <span className="chc-days">{c.durationDays} NAP</span>

        {c.progressFrac > 0 && (
          <span className="chc-prog">
            <i style={{ width: `${Math.round(c.progressFrac * 100)}%` }} />
          </span>
        )}
      </div>

      <div className="chc-body">
        <div className="chc-txt">
          <div className="chc-name">{c.title}</div>
          {stateLine && <div className={`chc-state${done ? " done" : ""}`}>{stateLine}</div>}
        </div>
        <span
          className={`chc-save${saved || done ? " on" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={saved ? "Levétel a listáról" : "Listámhoz"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(c.slug);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(c.slug);
            }
          }}
        >
          <LxIcon d={saved || done ? lxPaths.check : lxPaths.plus} size={13} />
        </span>
      </div>
    </button>
  );
}
