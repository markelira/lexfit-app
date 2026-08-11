"use client";

import type { ReactNode } from "react";
import { ProgramMark } from "@/components/ProgramMark";
import { programVisual } from "@/lib/programs";

// The program billboard - one band per program, carrying its OWN hue (--pgs-h)
// with identical lightness/chroma so the family stays cohesive; the lockup stays
// colorless. Extracted from /app/programs so the marketing homepage renders the
// exact same object: two implementations would drift the moment either changed.
//
// Styles live in src/app/app/programs/programs.css (`.lx .pgs-*`), which BOTH
// call sites import. The markup requires a `.lx` ancestor.

export const CATEGORY_WORD: Record<string, string> = {
  Program: "PROGRAM",
  Sorozat: "SOROZAT",
  Kihívás: "KIHÍVÁS",
};

/** The eyebrow parts a program band shows, in order. Falsy entries are dropped. */
export function bannerEyebrow(parts: (string | null | false | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
}

/** The standard chip row: level · length · equipment. */
export function bannerChips(p: {
  level?: string | null;
  defaultMins?: number | null;
  equipment?: string | null;
}): string[] {
  return [
    p.level ? p.level.toUpperCase() : null,
    p.defaultMins ? `~${p.defaultMins} PERC / EDZÉS` : null,
    !p.equipment || /nincs/i.test(p.equipment) ? "ESZKÖZ NÉLKÜL" : p.equipment.toUpperCase(),
  ].filter(Boolean) as string[];
}

export function ProgramBanner({
  slug,
  title,
  name,
  hue,
  eyebrow,
  synopsis,
  chips = [],
  children,
}: {
  slug: string;
  /** The English/system title - sets the giant watermark word. */
  title: string;
  /** The Hungarian display name - the visible heading. */
  name: string;
  hue: number;
  eyebrow: string;
  synopsis?: string | null;
  chips?: string[];
  /** The CTA row. Differs per surface: playback in the app, the funnel on `/`. */
  children?: ReactNode;
}) {
  const pv = programVisual(slug, name);
  return (
    <div className="pgs-hero" style={{ "--pgs-h": hue } as React.CSSProperties}>
      <span className="pgs-ring" aria-hidden="true" />
      <span className="pgs-word" aria-hidden="true">{title.toUpperCase()}</span>
      <span className="pgs-scrim" aria-hidden="true" />

      <div className="pgs-content">
        <span className="pgs-lock">
          <span className="mk"><ProgramMark shape={pv.icon} size={13} /></span>
          <span className="nm">{pv.name}</span>
        </span>
        <div className="pgs-eyebrow">{eyebrow}</div>
        <h2 className="pgs-title">{name}</h2>
        {synopsis && <p className="pgs-syn">{synopsis}</p>}
        {chips.length > 0 && (
          <div className="pgs-chips">
            {chips.map((c) => <span className="pgs-chip" key={c}>{c}</span>)}
          </div>
        )}
        {children && <div className="pgs-ctas">{children}</div>}
      </div>
    </div>
  );
}
