"use client";

import { FinishOverlay } from "@/components/finish/FinishOverlay";
import type { FinishData, OverlayDir } from "@/lib/finish-overlays";

// Example finish-cards showing how the share overlay looks. The photos are
// consented (owner-confirmed 2026-08-08); the overlay STATS are illustrative
// sample values, so every card is explicitly labelled "minta" — never present
// these numbers as real member results.
interface Example { name: string; img: string; dir: OverlayDir; data: FinishData; scrim: boolean; pos: string }
// A different overlay per card — the real FinishOverlay directions (no vertical
// spine), each placed on a workable zone of its photo. Scrim on the brighter
// shots keeps the pure-white type legible.
const EXAMPLES: Example[] = [
  { name: "Kristóf", img: "/finish-examples/kristof.jpg", dir: "F", scrim: false, pos: "50% 46%", data: { mins: 34, streak: 21, exercises: 14 } },
  { name: "Réka", img: "/finish-examples/reka.jpg", dir: "A", scrim: true, pos: "50% 26%", data: { mins: 41, streak: 7, exercises: 16 } },
  { name: "Bianka", img: "/finish-examples/bianka.jpg", dir: "C", scrim: true, pos: "50% 34%", data: { mins: 26, streak: 13, exercises: 12 } },
  { name: "Ádám", img: "/finish-examples/adam.jpg", dir: "F", scrim: true, pos: "50% 44%", data: { mins: 31, streak: 9, exercises: 11 } },
  { name: "Lilla", img: "/finish-examples/lilla.jpg", dir: "B", scrim: true, pos: "50% 38%", data: { mins: 22, streak: 34, exercises: 9 } },
  { name: "Alexa", img: "/finish-examples/alexa.jpg", dir: "A", scrim: true, pos: "50% 30%", data: { mins: 28, streak: 18, exercises: 13 } },
];

// Duplicated so the marquee loops seamlessly (translateX(-50%) = exactly one set).
const LOOP = [...EXAMPLES, ...EXAMPLES];

/** An infinite, auto-scrolling row of example finish cards. Tapping one (or the
 *  row while it's paused on hover) opens the user's own share flow. */
export function FinishExamples({ onPick }: { onPick: () => void }) {
  return (
    <div className="fex-marquee">
      <div className="fex-track">
        {LOOP.map((e, i) => (
          <button
            key={`${e.name}-${i}`}
            type="button"
            className="fex-card"
            onClick={onPick}
            aria-hidden={i >= EXAMPLES.length}
            tabIndex={i >= EXAMPLES.length ? -1 : 0}
            aria-label={`Minta megosztókép (${e.name}) — készíts sajátot`}
          >
            <div className="fex-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.img} alt="" style={{ objectPosition: e.pos }} loading="lazy" />
              <FinishOverlay dir={e.dir} data={e.data} scrim={e.scrim} />
            </div>
            <span className="fex-name">{e.name} · minta</span>
          </button>
        ))}
      </div>
    </div>
  );
}
