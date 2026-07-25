"use client";

import Image from "next/image";
import { WELCOME } from "@/lib/onboarding-data";

const AVATARS: [string, string][] = [
  ["R", "var(--cat-also)"],
  ["M", "var(--cat-felso)"],
  ["B", "var(--cat-cardio)"],
  ["K", "var(--cat-teljes)"],
];

/**
 * The pink gradient brand/coach panel on the left of the onboarding & login
 * shells. In welcome mode it shows the hero headline; otherwise it shows Alexa
 * the coach with a contextual line.
 */
export function OnbAside({
  welcome = false,
  alexaLine,
}: {
  welcome?: boolean;
  alexaLine?: string;
}) {
  return (
    <div className="onb-aside">
      <span className="ring" aria-hidden="true" />
      <span className="ring two" aria-hidden="true" />
      <div className="a-wm">
        <span className="hash"><Image src="/lexfit-icon.png" alt="LEXFIT" width={20} height={20} /></span> LEXFIT
      </div>

      <div className="aside-body">
        {welcome ? (
          <>
            <div className="aside-eyebrow">{WELCOME.eyebrow}</div>
            <h1 className="aside-hero-word" style={{ marginTop: 12 }}>
              {WELCOME.line1}
            </h1>
            <h1 className="aside-hero-word soft">{WELCOME.line2}</h1>
            <p className="aside-sub">{WELCOME.sub}</p>
          </>
        ) : (
          <div className="aside-guide step-in">
            <div className="g-av">
              <span>Alexa fotó</span>
            </div>
            <div className="g-name">
              Alexa{" "}
              <span style={{ fontWeight: 500, color: "oklch(1 0 0 / 0.68)", fontSize: 12.5 }}>
                · az edződ
              </span>
            </div>
            <p className="g-line">{alexaLine}</p>
          </div>
        )}
      </div>

      <div className="aside-proof">
        <div className="stack-av">
          {AVATARS.map(([l, c], i) => (
            <span key={i} style={{ background: c }}>
              {l}
            </span>
          ))}
        </div>
        <span>
          17 000+ nő · <strong style={{ color: "white" }}>ingyenes közösség</strong>
        </span>
      </div>
    </div>
  );
}

export function Check({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
