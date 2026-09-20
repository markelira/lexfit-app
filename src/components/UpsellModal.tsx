"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LxIcon } from "@/components/LxIcon";
import { ProgramMark } from "@/components/ProgramMark";
import { lxPaths } from "@/lib/icons";
import { formatHuf } from "@/lib/pricing/display";
import { PRICES } from "@/lib/pricing/config";
import { programGrad, programVisual } from "@/lib/programs";
import { loadProgramIndex } from "@/lib/program-index";
import { trackUpsellView, trackUpsellClick } from "@/lib/track";
import "./UpsellModal.css";

interface Tile { slug: string; title: string; hue: number; count: number }

/**
 * The membership upsell, shown the moment someone reaches for content their
 * purchase does not cover (P1).
 *
 * The first version led with the refusal - "ez a videó a tagsághoz tartozik" -
 * and then listed features. That is a tollbooth: it names what you cannot have
 * and asks you to pay for the absence. It also showed nothing. A person
 * deciding whether to widen their access is deciding about CONTENT, and the
 * only way to make that decision is to see some.
 *
 * So it leads with the count of what is waiting, shows those programmes as a
 * fanned stack built from their own brand hues and marks, and states the price
 * beside the button rather than under it in grey. The refusal, which is a fact
 * and not an argument, is demoted to one quiet line.
 *
 * What did NOT change, because it was already right:
 *  - what they own is said BEFORE anything is asked of them;
 *  - one ask, no plan grid - the pricing page is a tap away for comparers;
 *  - dismissing is free and obvious, because a modal that fights to stay is
 *    one people learn to close without reading.
 */
export function UpsellModal({
  open,
  ownedLabel,
  onClose,
}: {
  open: boolean;
  /** What they already own, named. Null when nothing is owned (a lapsed member). */
  ownedLabel?: string | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [total, setTotal] = useState<number | null>(null);

  // The programmes on the other side of the ask, loaded only when the ask is
  // actually made. Their own hues and marks, so the stack is the real catalogue
  // rather than a picture of one.
  useEffect(() => {
    if (!open) return;
    let active = true;
    loadProgramIndex()
      .then((idx) => {
        if (!active) return;
        const mine = ownedLabel?.trim().toLowerCase();
        const others = idx.programs.filter((p) => (p.title ?? "").trim().toLowerCase() !== mine);
        setTotal(others.length);
        setTiles(
          others.slice(0, 4).map((p) => ({
            slug: p.slug,
            title: p.hu || p.title,
            hue: p.hue,
            count: p.codes.length,
          })),
        );
      })
      .catch(() => { /* the ask still stands without the picture */ });
    return () => { active = false; };
  }, [open, ownedLabel]);

  useEffect(() => {
    if (!open) return;
    trackUpsellView(ownedLabel ? "program_owner" : "no_access");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, ownedLabel, onClose]);

  if (!open) return null;

  const go = () => {
    trackUpsellClick(ownedLabel ? "program_owner" : "no_access");
    router.push("/subscribe");
  };

  const n = total ?? 0;
  const hd = n > 0 ? `Még ${n} program vár` : "Nyisd ki az egészet";

  return (
    <div className="lxup" role="presentation" onClick={onClose}>
      <div
        className="lxup-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lxup-hd"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="lxup-x" onClick={onClose} aria-label="Bezárás">
          <LxIcon d={lxPaths.close} size={17} sw={2.2} />
        </button>

        {/* The goods, fanned. Built from each programme's own hue and mark, so
            this IS the catalogue rather than an illustration of it. */}
        {tiles.length > 0 && (
          <div className="lxup-fan" aria-hidden="true">
            {tiles.map((t, i) => {
              const pv = programVisual(t.slug, t.title);
              return (
                <div
                  key={t.slug}
                  className="lxup-tile"
                  style={{ background: programGrad(t.hue), ["--i" as string]: i }}
                >
                  <span className="mk"><ProgramMark shape={pv.icon} size={13} /></span>
                  <span className="nm">{t.title}</span>
                  <span className="ct">{t.count} edzés</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="lxup-body">
          {/* Said before anything is asked. They paid; the app should lead with
              that, not with what is missing. */}
          {ownedLabel && (
            <p className="lxup-owned">
              <LxIcon d={lxPaths.check} size={13} sw={2.8} />
              A(z) <strong>{ownedLabel}</strong> a tiéd - az marad.
            </p>
          )}

          <h2 id="lxup-hd">{hd}</h2>
          <p className="lxup-sub">
            {ownedLabel
              ? "A tagság a teljes videótárat nyitja: minden programot, minden új edzést. Amit megvettél, az ettől függetlenül a tiéd marad."
              : "A tagság a teljes videótárat nyitja: minden programot, minden új edzést."}
          </p>

          <ul className="lxup-gets">
            {[
              ["layers", "Minden program, nem csak egy"],
              ["plus", "Új edzések folyamatosan"],
              ["shield", "Bármikor lemondható, kötöttség nélkül"],
            ].map(([ic, t]) => (
              <li key={t}>
                <span className="ic"><LxIcon d={lxPaths[ic]} size={15} sw={1.9} /></span>
                {t}
              </li>
            ))}
          </ul>

          <button type="button" className="lxup-cta" onClick={go}>
            <span className="tx">Megnézem a tagságot</span>
            <span className="pr">{formatHuf(PRICES.week_intro.amountHuf)}-tól</span>
          </button>

          {/* The refusal is a fact, not an argument - so it sits here, quietly,
              instead of being the headline. */}
          <p className="lxup-note">
            Ez az edzés is ebben van. A heti kihívások közben ingyen mennek.
          </p>

          <button type="button" className="lxup-later" onClick={onClose}>
            {ownedLabel ? "Vissza a programomhoz" : "Most nem"}
          </button>
        </div>
      </div>
    </div>
  );
}
