import Image from "next/image";

// The step-aware left column for the /register wizard. Graphic-led (skill:
// apple-design): each step is a built illustration — one strong visual, almost
// no words — inside the constant frame (LEXFIT mark top · Alexa foot bottom).
// Green geometric SVG art (we have few photos). Static per step, cross-fades.
// docs/onboarding-left-panels.md
//
// Slogan rule: default "A változás otthon kezdődik" (welcome); "Egyedül nehéz.
// Együtt muszáj." is reserved for community/belonging panels.

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

// ── The illustrations. Geometric, thin-stroke, green; colors via CSS vars. ──
const G = "var(--accent-2)"; // deep green
const G1 = "var(--accent)"; // light green
const INK = "var(--ink)";

function Art({ k }: { k: PanelKey }) {
  switch (k) {
    case "welcome": // sunrise over the horizon — a beginning
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="bpSun" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={G1} /><stop offset="1" stopColor={G} />
            </linearGradient>
          </defs>
          {Array.from({ length: 9 }).map((_, i) => {
            const a = (-90 + (i - 4) * 20) * (Math.PI / 180);
            return <line key={i} x1={160 + Math.cos(a) * 66} y1={150 + Math.sin(a) * 66} x2={160 + Math.cos(a) * 84} y2={150 + Math.sin(a) * 84} stroke={G1} strokeWidth="3" strokeLinecap="round" opacity="0.55" />;
          })}
          <path d="M96 150 A64 64 0 0 1 224 150" fill="url(#bpSun)" />
          <line x1="40" y1="150" x2="280" y2="150" stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity="0.22" />
          <g stroke={INK} strokeWidth="3.4" strokeLinejoin="round" opacity="0.85">
            <path d="M132 150 V116 L160 96 L188 116 V150" fill="#fff" />
          </g>
          <rect x="152" y="128" width="16" height="22" rx="2" fill={G} />
        </svg>
      );
    case "community": { // a warm network of members
      const nodes = [
        [70, 60, 6, 1], [130, 40, 5, 0], [190, 66, 7, 1], [250, 52, 5, 0],
        [50, 120, 5, 0], [110, 104, 8, 1], [172, 120, 6, 0], [232, 108, 7, 1], [278, 140, 5, 0],
        [88, 168, 6, 0], [150, 176, 7, 1], [212, 166, 5, 0],
      ] as const;
      const links = [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [7, 8], [9, 10], [10, 11], [0, 4], [5, 1], [6, 2], [7, 2], [10, 5], [10, 6], [11, 7]];
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          {links.map(([a, b], i) => (
            <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={G} strokeWidth="1.4" opacity="0.28" />
          ))}
          {nodes.map(([x, y, r, fill], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={fill ? G : "#fff"} stroke={G} strokeWidth="2" />
          ))}
        </svg>
      );
    }
    case "focus": { // a target with the areas ringed around it
      const cx = 160, cy = 105;
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          {[70, 48, 26].map((r, i) => <circle key={i} cx={cx} cy={cy} r={r} stroke={G} strokeWidth="2" opacity={0.35 + i * 0.12} />)}
          <circle cx={cx} cy={cy} r="9" fill={G} />
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (-90 + i * 60) * (Math.PI / 180);
            return <circle key={i} cx={cx + Math.cos(a) * 70} cy={cy + Math.sin(a) * 70} r={i === 0 ? 8 : 5.5} fill={i === 0 ? G : "#fff"} stroke={G} strokeWidth="2" />;
          })}
        </svg>
      );
    }
    case "level": // three ascending bars — the pace adapts
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          <defs><linearGradient id="bpBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={G1} /><stop offset="1" stopColor={G} /></linearGradient></defs>
          <line x1="70" y1="170" x2="250" y2="170" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.18" />
          {[[92, 52], [148, 92], [204, 132]].map(([x, h], i) => (
            <rect key={i} x={x} y={170 - h} width="44" height={h} rx="10" fill={i === 2 ? "url(#bpBar)" : "#fff"} stroke={G} strokeWidth="2.5" />
          ))}
        </svg>
      );
    case "days": { // a week: 5 training bars + 2 rest
      const rest = [2, 6];
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, i) => {
            const x = 34 + i * 38, isRest = rest.includes(i), h = isRest ? 30 : 96;
            return <rect key={i} x={x} y={150 - h} width="26" height={h} rx="8" fill={isRest ? "none" : G} stroke={G} strokeWidth="2.4" strokeDasharray={isRest ? "4 5" : undefined} opacity={isRest ? 0.5 : 1} />;
          })}
          <line x1="24" y1="150" x2="296" y2="150" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.18" />
        </svg>
      );
    }
    case "player": // a device screen — follow without sound + cast
      return (
        <div className="bp-device" aria-hidden="true">
          <div className="bp-screen">
            <span className="bp-scr-rep mono">3 / 12 · FŐ RÉSZ</span>
            <span className="bp-scr-now">Guggolás</span>
            <div className="bp-scr-cd"><span className="mono">Hátra van</span><b className="tabular">00:42</b></div>
            <span className="bp-scr-next mono">Következik: Kitörés</span>
          </div>
          <svg className="bp-cast" viewBox="0 0 40 34" fill="none">
            <rect x="3" y="3" width="34" height="24" rx="3" stroke={G} strokeWidth="2.4" />
            <path d="M3 30h34" stroke={G} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M9 15a8 8 0 0 1 8 8M9 20a3 3 0 0 1 3 3" stroke={G1} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "env": // a home corner — a mat, wall, plant
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          <line x1="40" y1="150" x2="280" y2="150" stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity="0.22" />
          <line x1="60" y1="150" x2="60" y2="66" stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity="0.22" />
          <rect x="78" y="132" width="150" height="18" rx="9" fill={G} opacity="0.9" transform="skewX(-16)" />
          <g stroke={G} strokeWidth="2.6" strokeLinecap="round">
            <path d="M242 150 V120" />
            <path d="M242 128 q-14 -8 -18 -22 q16 2 18 16" fill={G1} fillOpacity="0.5" />
            <path d="M242 132 q14 -8 18 -22 q-16 2 -18 16" fill={G1} fillOpacity="0.5" />
          </g>
          <rect x="234" y="150" width="16" height="4" rx="2" fill={INK} opacity="0.3" />
        </svg>
      );
    case "alone": { // one → many: from alone to together
      const cluster = [[214, 78], [252, 96], [230, 118], [270, 130], [246, 146]] as const;
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          <circle cx="66" cy="108" r="12" fill="#fff" stroke={G} strokeWidth="2.6" />
          <path d="M86 108 H190" stroke={G} strokeWidth="2" strokeDasharray="3 7" strokeLinecap="round" opacity="0.6" />
          {cluster.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="12" fill={i === 0 ? "#fff" : G} stroke={G} strokeWidth="2.6" />)}
        </svg>
      );
    }
    case "story": // Alexa — the founder, portrait-led
      return (
        <div className="bp-portrait" aria-hidden="true">
          <span className="bp-ring" />
          <Image src="/alexa-av.jpg" alt="" width={168} height={168} />
        </div>
      );
    case "promise": // plan ready — a seal / check
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          <defs><linearGradient id="bpSeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={G1} /><stop offset="1" stopColor={G} /></linearGradient></defs>
          <circle cx="160" cy="105" r="58" stroke={G} strokeWidth="2" opacity="0.35" />
          <circle cx="160" cy="105" r="44" fill="url(#bpSeal)" />
          <path d="M140 106 l14 14 l26 -30" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "reassure": // a shield — safe to start
      return (
        <svg className="bp-svg" viewBox="0 0 320 210" fill="none" aria-hidden="true">
          <path d="M160 44 l46 18 v40 c0 34 -22 52 -46 62 c-24 -10 -46 -28 -46 -62 v-40 z" fill="#fff" stroke={G} strokeWidth="3" strokeLinejoin="round" />
          <path d="M142 106 l12 12 l24 -26" stroke={G} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

// Per-panel: a tiny label + an optional one-line caption (numbers, a quote).
const META: Record<PanelKey, { eyebrow: string; cap?: React.ReactNode }> = {
  welcome: { eyebrow: "", cap: <span className="bp-slogan">A változás<br /><b>otthon kezdődik.</b></span> },
  community: { eyebrow: "A közösség", cap: <span className="bp-cap"><b>1 200+</b> csoporttag — akik már csinálják</span> },
  focus: { eyebrow: "Minden területre", cap: <span className="bp-cap">Fenék · has · kar · hát · teljes test</span> },
  level: { eyebrow: "Minden szint", cap: <span className="bp-cap">Kezdőtől haladóig — a szint hozzád igazodik</span> },
  days: { eyebrow: "A heted", cap: <span className="bp-cap"><b>5</b> edzés · <b>2</b> pihenő · napi 30 perc</span> },
  player: { eyebrow: "A lejátszó", cap: <span className="bp-cap">Hang nélkül is végigvezet — TV-re is</span> },
  env: { eyebrow: "Minden helyzetre", cap: <span className="bp-cap">Csendes és ízület-kímélő változatokkal</span> },
  alone: { eyebrow: "Nem vagy egyedül", cap: <span className="bp-cap">1 200+ társsal, akik ugyanitt kezdték</span> },
  story: { eyebrow: "Az alapító", cap: <span className="bp-slogan bp-quote"><b>„Egyedül nem megy.”</b></span> },
  promise: { eyebrow: "A terved kész", cap: <span className="bp-cap">Innentől együtt csináljuk</span> },
  reassure: { eyebrow: "Nyugodt szívvel", cap: <span className="bp-cap">Bármikor lemondható · 14 napos garancia</span> },
};

export function BrandPanel({ step }: { step: string }) {
  const k = panelFor(step);
  const m = META[k];
  return (
    <aside className="authx-brand bp">
      <div className="bmark">
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

      <div className="bbody bp-graphic" key={k}>
        {m.eyebrow && <span className="bp-eyebrow mono">{m.eyebrow}</span>}
        <div className="bp-art"><Art k={k} /></div>
        {m.cap}
      </div>

      <div className="bfoot">
        <div className="bav">
          <Image src="/trainer-underlayer.jpg" alt="Alexa, a LEXFIT alapítója és edzője" width={44} height={44} />
        </div>
        <div className="t">
          <b>Alexa</b>
          <span>Alapító · minden edzést ő vezet</span>
        </div>
      </div>
    </aside>
  );
}
