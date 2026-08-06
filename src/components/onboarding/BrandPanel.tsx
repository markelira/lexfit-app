import Image from "next/image";

// The step-aware left column for the /register wizard — Apple-style, image-led:
// a full-bleed photo per step, a dark bottom scrim, the LEXFIT wordmark top, and
// one short caption. Images live in public/onboarding/{key}.jpg (placeholders now;
// replace with real photos — see public/onboarding/README.md). Static per step,
// cross-fades. docs/onboarding-left-panels.md
//
// Slogan rule: default "A változás otthon kezdődik" (welcome); "Egyedül nehéz.
// Együtt muszáj." is reserved for the community/belonging captions.

type PanelKey =
  | "welcome" | "community" | "focus" | "level" | "days" | "player" | "env"
  | "alone" | "story" | "promise" | "reassure";

function panelFor(step: string): PanelKey {
  switch (step) {
    case "goal": return "community";
    case "focus": return "focus";
    case "level": return "level";
    case "days": return "days";
    case "time": return "player";
    case "env": return "env";
    case "obstacle": return "alone";
    case "why": return "story";
    case "reveal": return "promise";
    case "plan": case "account": case "pay": return "reassure";
    default: return "welcome";
  }
}

const CAP: Record<PanelKey, { eyebrow?: string; line: React.ReactNode; slogan?: boolean }> = {
  welcome: { line: <>A változás<br /><b>otthon kezdődik.</b></>, slogan: true },
  community: { eyebrow: "A közösség", line: <>1 200+ csoporttag,<br />akik már csinálják.</> },
  focus: { eyebrow: "Minden területre", line: "Van edzés arra, ahol erősödni akarsz." },
  level: { eyebrow: "Minden szint", line: "A szint hozzád igazodik — kezdőtől haladóig." },
  days: { eyebrow: "A heted", line: "Heti 5 edzés, napi 30 perc." },
  player: { eyebrow: "A lejátszó", line: "Hang nélkül is végigvezet — TV-re is." },
  env: { eyebrow: "Minden helyzetre", line: "Bármi is az — van rá változat." },
  alone: { eyebrow: "Nem vagy egyedül", line: <>Egyedül nehéz. <b>Együtt muszáj.</b></>, slogan: true },
  story: { eyebrow: "Az alapító", line: <>„Egyedül nem megy.” <span className="bp-by">— Alexa</span></>, slogan: true },
  promise: { eyebrow: "A terved kész", line: "Innentől együtt csináljuk." },
  reassure: { eyebrow: "Itt a helyed", line: <>A terved kész — <b>már csak te hiányzol.</b></>, slogan: true },
};

export function BrandPanel({ step }: { step: string }) {
  const k = panelFor(step);
  const c = CAP[k];
  return (
    <aside className="authx-brand bp-img">
      <div className="bp-stage" key={k}>
        <Image
          className="bp-photo"
          src={`/onboarding/${k}.jpg`}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={k === "welcome"}
          unoptimized /* hero photos are pre-sized (1200×1600); skip the optimizer
            so a replaced file shows immediately, no dev image-cache staleness */
        />
        <div className="bp-scrim" aria-hidden="true" />
        <div className="bp-cap">
          {c.eyebrow && <span className="bp-eyebrow mono">{c.eyebrow}</span>}
          <span className={c.slogan ? "bp-slogan" : "bp-line"}>{c.line}</span>
        </div>
      </div>

      <div className="bmark bp-mark">
        <span className="bmark-ico">
          <svg viewBox="0 0 680 616" aria-hidden="true">
            <g transform="translate(-192,-152)">
              <path d="M248 712A400 400 0 0 1 648 312" fill="none" stroke="#ffffff" strokeWidth="112" strokeLinecap="round" />
              <circle cx="800" cy="224" r="72" fill="#ffffff" />
            </g>
          </svg>
        </span>
        <span className="wm">LEXFIT</span>
      </div>
    </aside>
  );
}
