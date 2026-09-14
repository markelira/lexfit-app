"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import * as C from "../copy";

// Two graphics for the reveal's decision moment (mobile graphics audit
// 2026-09-14). The measurement that prompted them: the page's two offer
// blocks were 1 795px and 2 342 characters with ZERO visual elements, while
// the blocks that only have to be believed (first workout, shelf, members)
// carry 55 images between them. The page was speaking in pictures where it
// was already trusted and switching to prose where it had to be decided.
//
// Both are pure CSS/SVG - nothing downloads, nothing shifts layout. The
// device silhouettes are lifted verbatim from the home page's `castrow`
// (src/components/landing/LandingPage.tsx) so the two surfaces share one
// visual vocabulary instead of inventing a second one.

/** One programme's share of the library, as cells. */
interface Slice { n: number; label: string; accent?: boolean }

/**
 * THE LIBRARY AT A GLANCE.
 *
 * "130 edzés" is an abstraction; 130 cells are a quantity you can see. The
 * grid also does two things the sentence cannot: it shows the library has
 * STRUCTURE (eight groups, not a pile of videos), and it places the visitor
 * inside it - the very first cell is filled and labelled, because that is the
 * workout she can watch for free today. One picture answers "how much do I
 * get", "is it organised" and "where do I start".
 */
export function LibraryGrid({ slices }: { slices: readonly Slice[] }) {
  const total = slices.reduce((a, s) => a + s.n, 0);
  let seen = 0;
  return (
    <figure className="u2-lib" aria-hidden="true">
      <div className="u2-lib-groups">
        {slices.map((s) => {
          const start = seen;
          seen += s.n;
          return (
            <div key={s.label} className={`u2-lib-g${s.accent ? " on" : ""}`}>
              <div className="u2-lib-cells">
                {Array.from({ length: s.n }, (_, i) => (
                  // The single filled cell is the free first workout - the
                  // only honest way to show "you are already inside this".
                  <i key={i} className={start + i === 0 ? "first" : ""} />
                ))}
              </div>
              <span className="u2-lib-lbl">{s.label}</span>
            </div>
          );
        })}
      </div>
      <figcaption className="u2-lib-cap">
        <b>{total}</b> {C.REVEAL.offer.libTotal} · <i>{C.REVEAL.offer.libFirst}</i>
      </figcaption>
    </figure>
  );
}

/**
 * WHERE IT PLAYS.
 *
 * "Telefonon, laptopon, TV-n" is a visual claim delivered in nine words. The
 * silhouettes say it before the sentence is read - and for a 35-54 audience
 * training at home, the television is not a footnote, it is the reason the
 * living room works at all.
 */
export function DeviceRow() {
  const devices: { d: React.ReactNode; lab: string }[] = [
    { lab: "TELEFON", d: <rect x="6" y="2" width="12" height="20" rx="2" /> },
    { lab: "LAPTOP", d: <><rect x="4" y="5" width="16" height="10" rx="1" /><path d="M2 19h20" /></> },
    { lab: "TV", d: <><rect x="2" y="4" width="20" height="13" rx="1" /><path d="M8 21h8" /></> },
  ];
  return (
    <div className="u2-devrow" aria-hidden="true">
      {devices.map((x, i) => (
        <div key={x.lab} className="dev">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {x.d}
          </svg>
          <span className="lab">{x.lab}</span>
          {i < devices.length - 1 && <span className="sep" />}
        </div>
      ))}
      <span className="cast">
        <LxIcon d={lxPaths.cast} size={16} sw={1.7} />
      </span>
    </div>
  );
}
