"use client";

import { FinishOverlay } from "@/components/finish/FinishOverlay";
import type { FinishData, OverlayDir } from "@/lib/finish-overlays";

// Real member finish-selfies with the actual system overlays, each placed on a
// dark zone of its photo so the pure-white type reads. All five directions are
// shown across the six cards.
interface Example { name: string; img: string; dir: OverlayDir; data: FinishData; scrim: boolean; pos: string }
const EXAMPLES: Example[] = [
  { name: "Kristóf", img: "/finish-examples/kristof.jpg", dir: "E", scrim: false, pos: "50% 46%", data: { mins: 34, streak: 21, exercises: 14 } },
  { name: "Réka", img: "/finish-examples/reka.jpg", dir: "A", scrim: false, pos: "50% 40%", data: { mins: 41, streak: 7, exercises: 16 } },
  { name: "Bianka", img: "/finish-examples/bianka.jpg", dir: "F", scrim: false, pos: "50% 38%", data: { mins: 26, streak: 13, exercises: 12 } },
  { name: "Ádám", img: "/finish-examples/adam.jpg", dir: "C", scrim: false, pos: "50% 50%", data: { mins: 31, streak: 9, exercises: 11 } },
  { name: "Lilla", img: "/finish-examples/lilla.jpg", dir: "B", scrim: false, pos: "50% 42%", data: { mins: 22, streak: 34, exercises: 9 } },
  { name: "Alexa", img: "/finish-examples/alexa.jpg", dir: "F", scrim: true, pos: "50% 40%", data: { mins: 28, streak: 18, exercises: 13 } },
];

/** A grid of example finish cards — all shown at once. Tapping opens the user's flow. */
export function FinishExamples({ onPick }: { onPick: () => void }) {
  return (
    <div className="fex-grid" role="list">
      {EXAMPLES.map((e) => (
        <button key={e.name} type="button" className="fex-card" onClick={onPick} aria-label={`${e.name} megosztott edzése — készíts sajátot`}>
          <div className="fex-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.img} alt="" style={{ objectPosition: e.pos }} loading="lazy" />
            <FinishOverlay dir={e.dir} data={e.data} scrim={e.scrim} />
          </div>
          <span className="fex-name">{e.name}</span>
        </button>
      ))}
    </div>
  );
}
