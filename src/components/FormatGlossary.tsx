"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import "./format-glossary.css";

// The 10 workout formats the Foundation program uses — [name, short tag, plain-Hungarian explainer].
const PROG_FORMATS: [string, string, string][] = [
  ["Klasszikus circuit", "Kör", "Több gyakorlat egymás után, körönként ismételve — pihenő a körök között."],
  ["EMOM", "Perc", "Every Minute On the Minute: minden perc elején új gyakorlat. Ami a percből marad, az pihenő."],
  ["Tabata", "20/10", "20 mp munka / 10 mp pihenő × 8 = egy 4 perces blokk. Rövid, de intenzív."],
  ["AMRAP", "Kör", "As Many Rounds As Possible: adott idő alatt minél több kör — a saját tempóddal."],
  ["Pyramid", "10→1", "Ismétlés-csökkentés vagy -növelés (pl. 10-9-8…1). Lépcsőzetes terhelés."],
  ["Ladder", "1→5", "Fokozó ismétlésszám (pl. 1-2-3-4-5) — fokozatosan melegszel bele."],
  ["50/50", "30/30", "Fél perc munka / fél perc pihenő — kiszámítható, tartható ritmus."],
  ["Folyamatos flow", "Flow", "Átmenetek szünet nélkül, a légzésed vezet — egy folyamatos mozgássor."],
  ["Steady-state", "Egyenletes", "Egyenletes, nyugodt tempó az elejétől a végéig."],
  ["Időzített tartások", "Tartás", "Statikus tartások időre — a mély, tartó izmok dolgoznak."],
];

/** The entry bar that opens the glossary. */
export function FormatBar({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="gfmt-bar" onClick={onOpen}>
      <span className="ic">📖</span>
      <span className="tx">
        <b>Edzés-formátumok — mi az az EMOM, Tabata, AMRAP?</b>
        <span>10 formátum egyszerűen elmagyarázva — nyisd meg, ha elakadnál egy névnél.</span>
      </span>
      <LxIcon d={lxPaths.arrowR} size={18} className="arr" />
    </button>
  );
}

/** The full-screen glossary modal. */
export function FormatGlossary({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="lx gfmt-back" onClick={onClose}>
      <div className="gfmt-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="gfmt-hd">
          <div className="ey">EDZÉS-FORMÁTUMOK</div>
          <h2>Mit jelentenek a nevek?</h2>
          <p>A Foundation 10 formátumot használ. Mindegyik csak más ritmus — a gyakorlatok ugyanazok maradnak.</p>
          <button className="gfmt-close" onClick={onClose} aria-label="Bezárás">
            ✕
          </button>
        </div>
        <div className="gfmt-list">
          {PROG_FORMATS.map(([name, tag, desc]) => (
            <div className="gfmt-item" key={name}>
              <div className="fn">
                {name} <em>{tag}</em>
              </div>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
