"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perMonthHuf, annualSavingsPct } from "@/lib/pricing/display";
import { LexMark } from "@/components/LexMark";
import { GARANCIA, GUARANTEE_LIVE, PRICING_BAND } from "@/components/landing/offer-copy";
import { trackGuaranciaView, trackPricingPlanSelect } from "@/lib/track";

// The offer v3 pricing band (§4.4). ONE component, two surfaces: the landing's
// #elofizetes section and the /arak page. Extracting it is the point - the old
// band was a `PRICING` const inside LandingPage.tsx, so /arak would have been a
// second copy of every string and every badge, free to drift.
//
// NO AMOUNT IS A LITERAL HERE. Every figure is read from PRICES and formatted by
// the display helpers, so the band cannot say something Stripe would not charge
// (offer v3 hard rule 6). That is also why the price sentences are assembled in
// this file rather than stored as finished strings in offer-copy.ts.
//
// Presentation follows §4.4, which deliberately inverts what shipped before:
// Heti "Kipróbálom" · Havi CENTRE "Legnépszerűbb" · Éves "Legjobb ár". The old
// band centred Éves. This steers to monthly; the annual card keeps the honest
// per-month derivation and the one legitimate savings comparison.

/** Where the funnel is entered from a card. `?plan=` is read at the pay step.
 *  Must be /register - /onboarding is a redirect that drops the query string. */
const planHref = (role: string) => `/register?plan=${role}`;

export type PricingSurface = "landing" | "arak";

export function PricingBand({ surface = "landing" }: { surface?: PricingSurface }) {
  const week = PRICING_BAND.cards.week;
  const month = PRICING_BAND.cards.month;
  const annual = PRICING_BAND.cards.annual;

  const introHuf = formatHuf(PRICES.week_intro.amountHuf);
  const weekStdHuf = formatHuf(PRICES.week_std.amountHuf);
  const monthHuf = formatHuf(PRICES.month_std.amountHuf);
  const annualHuf = formatHuf(PRICES.annual_std.amountHuf);
  const annualPerMonth = formatHuf(perMonthHuf());

  // The guarantee is a contractual promise. While it is dark, the Havi card
  // drops that one bullet rather than rendering a claim the ÁSZF does not yet
  // carry - the other two bullets stand on their own.
  const monthBullets = GUARANTEE_LIVE
    ? month.bullets
    : month.bullets.filter((b) => b !== "10 edzés garancia");

  const cards = [
    {
      role: "week_intro",
      plan: week.plan,
      badge: week.badge,
      featured: false,
      amt: introHuf,
      cur: "első 7 nap",
      lead: <>Az első 7 nap <b>{introHuf}</b>, utána {weekStdHuf} / hét.</>,
      body: <p className="pc-body">{week.body}</p>,
      cta: week.cta(introHuf),
    },
    {
      role: "month_std",
      plan: month.plan,
      badge: month.badge,
      featured: true,
      amt: monthHuf,
      cur: "/ hónap",
      lead: <><b>{monthHuf} / hónap</b> — {month.tagline}.</>,
      body: (
        <p className="pc-body">
          {monthBullets.map((b, i) => (
            <span key={b}>{i > 0 && " · "}{b}</span>
          ))}
        </p>
      ),
      cta: month.cta,
    },
    {
      role: "annual_std",
      plan: annual.plan,
      badge: annual.badge,
      featured: false,
      amt: annualHuf,
      cur: "/ év",
      lead: <><b>{annualHuf} / év</b> — így {annualPerMonth} / hónap (–{annualSavingsPct()}%).</>,
      body: <p className="pc-body">{annual.body}</p>,
      cta: annual.cta,
    },
  ];

  return (
    <div className="pb">
      {/* Seasonal framing, never a deadline: there is no end date and no counter
          anywhere in offer v3, deliberately (§0 "Urgency: none"). */}
      <p className="pb-banner">{PRICING_BAND.banner}</p>

      {surface === "landing" && (
        <span className="wordmark pb-mark"><LexMark />LEXFIT</span>
      )}
      <p className="pb-intro">{PRICING_BAND.intro}</p>

      <div className="price-grid pb-grid">
        {cards.map((c) => (
          <Link
            key={c.role}
            href={planHref(c.role)}
            onClick={() => trackPricingPlanSelect(c.role, surface)}
            className={`price-card pc${c.featured ? " featured" : ""}`}
            aria-label={`${c.plan} tagság kiválasztása`}
          >
            {c.badge && <div className="price-badge">{c.badge}</div>}
            <div className="plan">{c.plan}</div>
            <div className="rule" />
            <div className="amt">{c.amt}</div>
            <div className="cur">{c.cur}</div>
            <p className="pc-lead">{c.lead}</p>
            {c.body}
            <span className="pc-cta">{c.cta}</span>
          </Link>
        ))}
      </div>

      {/* All three plans are the same product - only the rhythm differs. Saying
          so kills the "which tier do I actually need" hesitation before it
          starts (the access model is all-access by decision, §0). */}
      <p className="pb-shared">{PRICING_BAND.shared}</p>

      {/* P1/P36 - "a YouTube-on ingyen is van". Answered AT the price, which is
          the only place the objection is actually live. */}
      <p className="pb-value">{PRICING_BAND.value}</p>

      {GUARANTEE_LIVE && (
        /* P13/P14 - procrastination, answered at the moment of choosing. Gated
           with the guarantee it references. */
        <p className="pb-hesitation">{PRICING_BAND.hesitation}</p>
      )}

      <div className="pb-included">
        <h3 className="pb-inc-h">{PRICING_BAND.includedHeading}</h3>
        <ul>
          {PRICING_BAND.included.map((i) => <li key={i}>{i}</li>)}
        </ul>
      </div>

      <div className="price-trust">
        {PRICING_BAND.trust.map((t) => <span key={t}>{t}</span>)}
      </div>

      {/* The honest disqualifier. It costs a few conversions and buys the right
          to every other claim on the page. */}
      <div className="pb-notfor">
        <b>{PRICING_BAND.notFor.heading}</b>
        <p>{PRICING_BAND.notFor.body}</p>
      </div>
    </div>
  );
}

/** §4.3 - the guarantee block. Lives here rather than in LandingPage because
 *  /arak renders it too, and the two must be the same words. Dark until the
 *  ÁSZF clause describing it is published. */
export function GuaranteeBlock({ surface = "landing" }: { surface?: PricingSurface }) {
  const ref = useRef<HTMLDivElement>(null);
  // 50% in view, once per session (§6 analytics table). The observer is set up
  // unconditionally so the hook order is stable, and simply finds no node when
  // the block is dark.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        trackGuaranciaView(surface);
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [surface]);

  if (!GUARANTEE_LIVE) return null;
  return (
    <div className="band-cream sec-sm" id="garancia" ref={ref}>
      <div className="wrap grc">
        <h2 className="h-bold grc-h">{GARANCIA.heading}</h2>
        <p className="cap-body grc-b">
          {GARANCIA.bodyLead}<b>{GARANCIA.bodyStrong}</b>{GARANCIA.bodyTail}
        </p>
        <p className="grc-stat">{GARANCIA.statutory}</p>
        <div className="grc-trust">
          {GARANCIA.trust.map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  );
}
