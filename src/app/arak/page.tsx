import type { Metadata } from "next";
import Link from "next/link";
import "../landing.css";
import { PricingBand, GuaranteeBlock } from "@/components/landing/PricingBand";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FaqJsonLd } from "@/components/landing/FaqJsonLd";
import { ArakView } from "@/components/landing/ArakView";
import { LexMark } from "@/components/LexMark";
import { ARAK_FAQ_KEYS, FAQ_ALL } from "@/components/landing/offer-copy";

const TITLE = "Árak - LEXFIT";
const DESCRIPTION =
  "Egy tagság, minden benne: a LEXFIT Start 30 vezetett edzése, az összes többi " +
  "program, és minden héten 5 új kihívás-videó. Heti, havi vagy éves ritmusban - " +
  "bármikor lemondható.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/arak" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "hu_HU",
    siteName: "LEXFIT",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Same caching contract as `/` - the band reads amounts from config, not
// Firestore, so an hour of staleness is invisible and nothing here needs the
// Admin SDK on the hot path.
export const revalidate = 3600;

// The three questions this page repeats (garancia · lemondás · szünet).
// Referenced BY TEXT against the one FAQ array, so the subset cannot drift from
// #gyik; scripts/schema-selftest.ts asserts every key still resolves.
const faqSubset = ARAK_FAQ_KEYS
  .map((k) => FAQ_ALL.find(([q]) => q === k))
  .filter((e): e is [string, string] => !!e);

export default function ArakPage() {
  return (
    <div className="lxl">
      <ArakView />
      <FaqJsonLd entries={faqSubset} />

      <header className="arak-head">
        <div className="wrap">
          <Link href="/" className="wordmark arak-mark" aria-label="LEXFIT főoldal">
            <LexMark />LEXFIT
          </Link>
          <h1 className="h-bold arak-h1">Árak</h1>
        </div>
      </header>

      <div className="band-sage pricing-band arak-band">
        <div className="wrap">
          <PricingBand surface="arak" />
        </div>
      </div>

      <GuaranteeBlock surface="arak" />

      <div className="band-cream sec-sm">
        <div className="wrap">
          <h2 className="cap-title arak-faq-h">Kérdések</h2>
          <div className="faq">
            {faqSubset.map(([q, a]) => (
              <details key={q} className="faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className="arak-more">
            Több kérdés? <Link href="/#gyik">A teljes GYIK a főoldalon.</Link>
          </p>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
