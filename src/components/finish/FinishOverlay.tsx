"use client";

import "./FinishOverlay.css";
import { useLayoutEffect, useRef, useState } from "react";
import {
  GEO, LOCKUP, REF_W, REF_H,
  defaultTrio, posterContent,
  type FinishData, type OverlayDir, type Slot,
} from "@/lib/finish-overlays";

/** The LEXFIT lockup mark (arc + dot), pure white. */
function LexMark({ w, h }: { w: number; h: number }) {
  return (
    <svg viewBox="0 0 680 616" width={w} height={h} aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <g transform="translate(-192,-152)">
        <path d="M248 712A400 400 0 0 1 648 312" fill="none" stroke="#fff" strokeWidth="112" strokeLinecap="round" />
        <circle cx="800" cy="224" r="72" fill="#fff" />
      </g>
    </svg>
  );
}

function Lockup({ variant, column }: { variant: keyof typeof LOCKUP; column?: boolean }) {
  const l = LOCKUP[variant];
  return (
    <div className="fs-lk" style={{ flexDirection: column ? "column" : "row", gap: l.gap }}>
      <LexMark w={l.icon} h={l.iconH} />
      <span className="fs-wd" style={{ fontSize: l.word }}>LEXFIT</span>
    </div>
  );
}

function Group({ s, valueSize, center }: { s: Slot; valueSize: number; center?: boolean }) {
  return (
    <div style={{ textAlign: center ? "center" : "left" }}>
      <div className="fs-k" style={{ fontSize: GEO_K }}>{s.k}</div>
      <div className="fs-v" style={{ fontSize: valueSize, marginTop: 2 }}>{s.v}</div>
    </div>
  );
}
const GEO_K = 13; // shared label size

/**
 * A finish-share overlay layer, rendered at the reference's exact geometry
 * (284×505 space) and scaled to fill its 9:16 parent. Presentational only.
 */
export function FinishOverlay({
  dir, data, scrim = false, offset,
}: {
  dir: OverlayDir;
  data: FinishData;
  scrim?: boolean;
  offset?: { x: number; y: number }; // drag-nudge, in reference-space px
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / REF_W));
    ro.observe(el);
    setScale(el.clientWidth / REF_W);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="fs-ol" ref={ref} aria-hidden="true">
      {scrim && <div className={`fs-scrim d-${dir}`} />}
      <div
        className="fs-layer"
        style={{
          width: REF_W,
          height: REF_H,
          transform: `translate(${(offset?.x ?? 0) * scale}px, ${(offset?.y ?? 0) * scale}px) scale(${scale})`,
        }}
      >
        {renderDir(dir, data)}
      </div>
    </div>
  );
}

function renderDir(dir: OverlayDir, data: FinishData) {
  switch (dir) {
    case "A": {
      const g = GEO.A;
      const trio = defaultTrio(data);
      return (
        <div className="fs-blk" style={{ left: g.block.left, top: g.block.top, width: g.block.width }}>
          <div style={{ marginBottom: g.lockupGap }}><Lockup variant="sm" /></div>
          {trio.map((s, i) => (
            <div key={i} style={{ marginTop: i ? g.groupGap : 0 }}><Group s={s} valueSize={g.valueSize} /></div>
          ))}
        </div>
      );
    }
    case "F": {
      const g = GEO.F;
      const trio = defaultTrio(data);
      return (
        <div className="fs-blk fs-center" style={{ gap: g.groupGap }}>
          {trio.map((s, i) => (
            <Group key={i} s={s} valueSize={g.valueSize} center />
          ))}
          <div style={{ marginTop: g.lockupGap }}><Lockup variant="col" column /></div>
        </div>
      );
    }
    case "B": {
      const g = GEO.B;
      const trio = defaultTrio(data);
      return (
        <>
          <svg className="fs-brackets" viewBox={`0 0 ${REF_W} ${REF_H}`} aria-hidden="true">
            {g.brackets.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#fff" strokeWidth={2} />
            ))}
          </svg>
          <div className="fs-blk" style={{ left: g.block.left, top: g.block.top, width: g.block.width }}>
            {trio.map((s, i) => (
              <div key={i} style={{ marginTop: i ? g.groupGap : 0 }}><Group s={s} valueSize={g.valueSize} /></div>
            ))}
            <div style={{ marginTop: g.lockupGap }}><Lockup variant="sm" /></div>
          </div>
        </>
      );
    }
    case "C": {
      const g = GEO.C;
      const c = posterContent(data);
      return (
        <div className="fs-blk" style={{ left: g.block.left, bottom: g.block.bottom, width: g.block.width }}>
          <div style={{ marginBottom: g.lockupGap }}><Lockup variant="sm" /></div>
          <div className="fs-k" style={{ fontSize: g.headSize, marginBottom: 2 }}>{c.headline}</div>
          <div className="fs-v" style={{ fontSize: g.bigSize, letterSpacing: `${g.bigTrack}em`, lineHeight: g.bigLine }}>{c.big}</div>
          <div className="fs-v" style={{ fontSize: g.unitSize, marginTop: 3 }}>{c.unit}</div>
          <div className="fs-k" style={{ fontSize: g.headSize, marginTop: g.footGap, lineHeight: g.footLine }}>
            {c.footnote.split("\n").map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </div>
        </div>
      );
    }
    case "E": {
      const g = GEO.E;
      const trio = defaultTrio(data);
      return (
        <div className="fs-blk" style={{ left: g.block.left, bottom: g.block.bottom, width: g.block.width }}>
          <div style={{ marginBottom: g.spineGap }}>
            <span className="fs-wd fs-spine" style={{ fontSize: g.spineSize, letterSpacing: `${g.spineTrack}em` }}>LEXFIT</span>
          </div>
          {trio.map((s, i) => (
            <div key={i} style={{ marginTop: i ? g.groupGap : 0 }}><Group s={s} valueSize={g.valueSize} /></div>
          ))}
        </div>
      );
    }
  }
}
