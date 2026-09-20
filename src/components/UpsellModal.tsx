"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { formatHuf } from "@/lib/pricing/display";
import { PRICES } from "@/lib/pricing/config";
import { trackUpsellView, trackUpsellClick } from "@/lib/track";
import "./UpsellModal.css";

/**
 * The upsell a programme owner meets when they reach for content their
 * purchase does not cover (P1).
 *
 * Before this, that moment was a full-page redirect to /subscribe: they tapped
 * a workout and the app threw them onto a pricing page with no explanation of
 * what had just happened. The modal keeps them where they were and answers the
 * only question they are actually asking - why not this one?
 *
 * Three rules it follows deliberately:
 *
 *  - **It opens what they already own first.** Someone who paid is not a
 *    stranger to convert; leading with "you own X" before "this needs Y" is the
 *    difference between an offer and a tollbooth.
 *  - **One ask.** A membership. No plan grid, no second-guessing - the pricing
 *    page is one tap away for anyone who wants to compare.
 *  - **Dismiss is free and obvious.** A modal that fights to stay is a modal
 *    people learn to close without reading.
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="lxup" role="presentation" onClick={onClose}>
      <div
        className="lxup-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lxup-hd"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="lxup-x" onClick={onClose} aria-label="Bezárás">
          <LxIcon d={lxPaths.close} size={18} sw={2.2} />
        </button>

        <span className="lxup-ic"><LxIcon d={lxPaths.lock} size={24} sw={1.7} /></span>

        {/* What they own comes first. They paid; the app should say so before
            it asks for anything. */}
        {ownedLabel && (
          <p className="lxup-owned">
            <LxIcon d={lxPaths.check} size={14} sw={2.6} />
            A(z) <strong>{ownedLabel}</strong> a tiéd - az marad.
          </p>
        )}

        <h2 id="lxup-hd">Ez a videó a tagsághoz tartozik</h2>
        <p className="lxup-sub">
          {ownedLabel
            ? "A megvásárolt programod minden edzése megy. Ez a videó egy másik programhoz tartozik - azokat és a heti kihívásokat a tagság nyitja meg."
            : "A teljes videótárhoz és a heti kihívásokhoz tagság kell."}
        </p>

        <ul className="lxup-gets">
          {[
            "Mind a 7 program, nem csak egy",
            "Heti kihívások, új tartalom folyamatosan",
            "Bármikor lemondható",
          ].map((t) => (
            <li key={t}><LxIcon d={lxPaths.check} size={14} sw={2.6} />{t}</li>
          ))}
        </ul>

        <button type="button" className="lxup-cta" onClick={go}>
          Megnézem a tagságot
        </button>
        <p className="lxup-from">
          {formatHuf(PRICES.week_intro.amountHuf)}-tól · bármikor lemondható
        </p>
        <button type="button" className="lxup-later" onClick={onClose}>
          {ownedLabel ? "Vissza a programomhoz" : "Most nem"}
        </button>
      </div>
    </div>
  );
}
