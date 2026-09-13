"use client";

import { useState } from "react";
import * as C from "../copy";
import { curveModel } from "@/lib/ujrakezdes/curve";
import { useSectionView } from "./useSectionView";

// R3 · the habit-strength curve — the reveal's centerpiece.
//
// Pure inline SVG, no chart library: the FB in-app webview is the median
// client and every dependency is a tax on it. The math lives in
// src/lib/ujrakezdes/curve.ts (selftested); this file only draws.
//
// The draw animation is a stroke-dashoffset transition armed when the section
// first scrolls into view — the same crossing that fires the analytics event,
// via useSectionView's onFirstView, so "seen" and "drawn" can never disagree.
// prefers-reduced-motion renders the finished curve (CSS kills the
// transition; the `on` class is applied either way).

const W = 640;
const H = 260;
const PAD = { l: 20, r: 30, t: 30, b: 34 };

const px = (x: number) => PAD.l + x * (W - PAD.l - PAD.r);
const py = (y: number) => H - PAD.b - y * (H - PAD.t - PAD.b);

export default function HabitCurve({ trainingCount }: { trainingCount: number }) {
  const [on, setOn] = useState(false);
  const ref = useSectionView("curve", () => setOn(true));

  const m = curveModel(trainingCount);
  const d = m.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`)
    .join(" ");
  // The area fill under the curve, closed along the baseline.
  const area = `${d} L${px(1).toFixed(1)} ${py(0)} L${px(0)} ${py(0)} Z`;
  // Generous overestimate of the path length for the dash trick — exactness
  // is irrelevant, it only has to be ≥ the real length.
  const dash = Math.round(W * 1.6);

  return (
    <section className="u2-blk u2-curveblk" ref={ref} aria-label={C.REVEAL.curve.aria(m.weeks)}>
      <p className="u2-eyebrow">{C.REVEAL.curve.eyebrow}</p>
      <h2>{C.REVEAL.curve.hd(m.weeks)}</h2>

      <div className={`u2-curve${on ? " on" : ""}`}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-hidden="true" focusable="false">
          {/* baseline + faint mid gridline */}
          <line className="u2-cv-grid" x1={px(0)} y1={py(0)} x2={px(1)} y2={py(0)} />
          <line className="u2-cv-grid dim" x1={px(0)} y1={py(0.5)} x2={px(1)} y2={py(0.5)} />

          <path className="u2-cv-area" d={area} />
          <path
            className="u2-cv-line"
            d={d}
            pathLength={dash}
            style={{ strokeDasharray: dash, strokeDashoffset: on ? 0 : dash }}
          />

          {/* milestone markers — the same chain as the plan card's */}
          {m.milestones.map((mi, i) => (
            <g
              key={mi.n}
              className="u2-cv-mile"
              style={{ transitionDelay: `${1.1 + i * 0.14}s` }}
            >
              <circle cx={px(mi.x)} cy={py(mi.y)} r={mi.n === 30 ? 5 : 3.5} />
              <text x={px(mi.x)} y={py(mi.y) - 10} textAnchor={mi.x > 0.92 ? "end" : "middle"}>
                {mi.n}.
              </text>
            </g>
          ))}

          {/* the dip annotation — the page's one deliberate extravagance */}
          <g className="u2-cv-dip" style={{ transitionDelay: "1.5s" }}>
            <line
              x1={px(m.dip.x)} y1={py(m.dip.y) + 6}
              x2={px(m.dip.x)} y2={py(0.06)}
            />
            <text x={px(m.dip.x)} y={py(0.06) + 14} textAnchor="middle">
              {C.REVEAL.curve.dip}
            </text>
          </g>

          {/* axes labels — the y-label sits top-left, clear of the curve's
              endpoint and the 30 marker (it clipped on the right edge). */}
          <text className="u2-cv-ax" x={px(0)} y={H - 8}>{C.REVEAL.curve.xStart}</text>
          <text className="u2-cv-ax" x={px(1)} y={H - 8} textAnchor="end">
            {C.REVEAL.curve.xEnd(m.weeks)}
          </text>
          <text className="u2-cv-y" x={px(0)} y={18}>
            {C.REVEAL.curve.yLabel} ↑
          </text>
        </svg>
      </div>

      <p className="u2-body u2-cv-cap">{C.REVEAL.curve.caption}</p>
    </section>
  );
}
