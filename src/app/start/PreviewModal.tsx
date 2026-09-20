"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { Cover } from "@/components/Cover";
import { START } from "./copy";
import "./preview.css";

interface Preview {
  code: string;
  title: string;
  theme: string;
  mins: number;
  format: string | null;
  poster: string;
  animation: string;
  blocks: { name: string; mins: number; items: string[] }[];
}

/**
 * The preview a visitor gets when they tap a workout card (P1).
 *
 * What it shows is deliberate. The moving clip is what Mux can serve to a
 * public page without handing out a playback token - a signed token cannot be
 * duration-limited, so a real minute of video would mean a minute of video
 * available to anyone who read the token out of a network tab, across all 35
 * workouts. The exercise list carries the weight instead, and it answers the
 * question better than footage does: not "what does this look like" but "what
 * will I actually be doing for twenty-six minutes".
 *
 * And it closes on a CTA, because a preview that ends in a dismiss button is a
 * detour. Someone who opened a workout is asking to have it.
 */
export function PreviewModal({
  code,
  onClose,
  onBuy,
}: {
  code: string | null;
  onClose: () => void;
  onBuy: () => void;
}) {
  const [data, setData] = useState<Preview | null>(null);
  const [failed, setFailed] = useState(false);
  const [moving, setMoving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!code) { setData(null); setFailed(false); setMoving(false); return; }
    let active = true;
    fetch(`/api/start/preview?code=${encodeURIComponent(code)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no"))))
      .then((d: Preview) => { if (active) setData(d); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [code]);

  // Escape closes, and the page behind must not scroll while a sheet is open -
  // a modal you can scroll past is a modal that loses its own content.
  useEffect(() => {
    if (!code) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [code, onClose]);

  // Focus stays inside while it is open.
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const f = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], [tabindex]:not([tabindex="-1"])',
    );
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, []);

  if (!code) return null;

  const total = data?.blocks.reduce((s, b) => s + b.items.length, 0) ?? 0;

  return (
    <div className="lxpv" role="presentation" onClick={onClose}>
      <div
        className="lxpv-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={data ? `${data.title} - előnézet` : "Előnézet"}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <button ref={closeRef} type="button" className="lxpv-x" onClick={onClose} aria-label="Bezárás">
          <LxIcon d={lxPaths.close} size={18} sw={2.2} />
        </button>

        <div className="lxpv-scroll">
          <div className="lxpv-media">
            {data ? (
              <>
                {/* The still is always painted; the clip fades in over it once
                    it has actually decoded, so the panel never shows an empty
                    frame while a GIF downloads. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="lxpv-still" src={data.poster} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={`lxpv-anim${moving ? " on" : ""}`}
                  src={data.animation}
                  alt={`${data.title} - mozgó előnézet`}
                  onLoad={() => setMoving(true)}
                />
                <span className="lxpv-live">{START.preview.live}</span>
                <span className="lxpv-dur">{data.mins} PERC</span>
              </>
            ) : failed ? (
              <Cover className="lxpv-fallback" theme="Teljes test" code={code} />
            ) : (
              <div className="lxpv-skel" aria-hidden="true" />
            )}
          </div>

          <div className="lxpv-body">
            {data ? (
              <>
                <p className="lxpv-eyebrow">
                  {[data.theme, data.format].filter(Boolean).join(" · ")}
                </p>
                <h2 className="lxpv-title">{data.title}</h2>
                <p className="lxpv-sub">
                  {START.preview.sub(data.mins, total)}
                </p>

                {data.blocks.length > 0 && (
                  <div className="lxpv-blocks">
                    <p className="lxpv-blockhd">{START.preview.blocksHd}</p>
                    <ol>
                      {data.blocks.map((b, i) => (
                        <li key={`${b.name}-${i}`}>
                          <div className="lxpv-bname">
                            <span>{b.name}</span>
                            {b.mins > 0 && <em>{b.mins}′</em>}
                          </div>
                          {b.items.length > 0 && (
                            <ul>
                              {b.items.map((it, j) => <li key={`${it}-${j}`}>{it}</li>)}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            ) : failed ? (
              <p className="lxpv-sub">{START.preview.failed}</p>
            ) : (
              <p className="lxpv-sub">{START.preview.loading}</p>
            )}
          </div>
        </div>

        {/* Pinned, not at the end of the scroll: the ask must be reachable from
            wherever in the list they stop reading. */}
        <div className="lxpv-foot">
          <div className="lxpv-price">
            <strong>{START.price}</strong>
            <span>{START.preview.footNote}</span>
          </div>
          <button type="button" className="lxpv-cta" onClick={onBuy}>
            {START.preview.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
