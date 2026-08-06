"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perWeekHuf, annualSavingsPct } from "@/lib/pricing/display";

// Shared "A teljes LEXFIT" paywall pieces — used by the onboarding funnel (plan +
// pay steps) AND by /subscribe, so the paywall is one design everywhere.
// docs/onboarding-left-panels.md · docs/LEXFIT Elofizetes iOS.html

export interface PayPlan {
  role: string;
  name: string;
  price: string;
  unit: string;
  sub: string;
  badge?: string;
  cta: string;
}

// USPs: [0] is the hero (full-width, emphasised); [1..] are the 2-col chip grid.
export const PAYWALL_FEATURES: { icon: string | string[]; title: string; sub: string }[] = [
  { icon: lxPaths.calendarCheck, title: "Vezetett programok", sub: "Foundation és több — végigvezetve, a te tempódban" },
  { icon: lxPaths.layoutGrid, title: "Teljes videótár", sub: "200+ edzés" },
  { icon: lxPaths.users, title: "Heti kihívások", sub: "Szavazz Magadra" },
  { icon: lxPaths.chartColumn, title: "Haladáskövetés", sub: "hétről hétre" },
  { icon: lxPaths.house, title: "Otthon, bárhol", sub: "eszköz nélkül" },
];

// Reference-format plan rows; Heti is the highlighted default (490 Ft entry).
export const PAYWALL_PLANS: PayPlan[] = [
  {
    role: "week_intro", name: "Heti",
    sub: `Első hét ${formatHuf(PRICES.week_intro.amountHuf)} · utána ${formatHuf(PRICES.week_std.amountHuf)} / hét`,
    price: formatHuf(PRICES.week_intro.amountHuf), unit: "első hét",
    badge: "Ajánlott indulás", cta: `${formatHuf(PRICES.week_intro.amountHuf)} · első hét`,
  },
  {
    role: "month_std", name: "Havi", sub: "Havonta megújul",
    price: formatHuf(PRICES.month_std.amountHuf), unit: "/ hó",
    cta: `${formatHuf(PRICES.month_std.amountHuf)} / hó`,
  },
  {
    role: "annual_std", name: "Éves",
    sub: `${formatHuf(PRICES.annual_std.amountHuf)} / év · −${annualSavingsPct()}% · a legjobb ár`,
    price: formatHuf(perWeekHuf(PRICES.annual_std.amountHuf)), unit: "/ hét",
    cta: `${formatHuf(PRICES.annual_std.amountHuf)} / év`,
  },
];

// The LEXFIT mark as a filled green tile (paywall header).
export function LexMark({ size = 56 }: { size?: number }) {
  return (
    <span className="pw-mark" style={{ width: size, height: size, borderRadius: size * 0.24 }}>
      <svg viewBox="0 0 680 616" width={size * 0.52} height={size * 0.47} aria-hidden="true">
        <g transform="translate(-192,-152)">
          <path d="M248 712A400 400 0 0 1 648 312" fill="none" stroke="#fff" strokeWidth="112" strokeLinecap="round" />
          <circle cx="800" cy="224" r="72" fill="#fff" />
        </g>
      </svg>
    </span>
  );
}

// The offer header + feature list (hero + 2-col chip grid). Shared by the funnel
// plan step and /subscribe.
export function PaywallOffer({ headRef }: { headRef?: React.Ref<HTMLHeadingElement> }) {
  return (
    <>
      <div className="pw-head">
        <LexMark size={46} />
        <h1 className="pw-title" ref={headRef} tabIndex={-1}>A teljes LEXFIT</h1>
        <p className="pw-sub">Egy előfizetés, minden funkció.</p>
      </div>
      <div className="pw-feats">
        <div className="pw-hero">
          <span className="pw-fic"><LxIcon d={PAYWALL_FEATURES[0].icon} size={20} /></span>
          <span className="pw-ftx"><b>{PAYWALL_FEATURES[0].title}</b><span>{PAYWALL_FEATURES[0].sub}</span></span>
        </div>
        <div className="pw-grid">
          {PAYWALL_FEATURES.slice(1).map((f) => (
            <div className="pw-tile" key={f.title}>
              <span className="pw-fic"><LxIcon d={f.icon} size={17} /></span>
              <span className="pw-ftx"><b>{f.title}</b><span>{f.sub}</span></span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
