// D6 - the offer mail. Lead magnet v2 §5, reconciled with offer v3.
//
// FOUR DEVIATIONS FROM THE v2 DRAFT, all forced, all listed in
// docs/lead-magnet-v2-plan.md §3:
//
//  1. The draft's workout count and its longer guarantee window are migrated
//     to offer v3's numbers - 30 edzés, and the 10 edzés garancia over five
//     weeks. That guarantee is the only one the product has.
//  2. The draft's one-off price is gone. No such product exists - LEXFIT sells
//     a subscription - and offer v3 hard rule 6 forbids a hardcoded forint
//     anywhere. Every amount below is interpolated from PRICES.
//  3. The draft's end-of-September cutoff is gone. Offer v3 §2: "Urgency:
//     none. No deadlines, no counters, ever."
//  4. The bonus-bundle framing is replaced by the all-access line, because
//     that is what the tagság actually is.
//
// The guarantee paragraph respects NEXT_PUBLIC_GUARANTEE_LIVE. While the ÁSZF
// clause is unpublished the flag is off, and the mail falls back to the
// statutory withdrawal right - which the terms do support. An email must never
// promise something the terms do not.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Panel, PanelText, Sign } from "./components/Bits";
import { OfferBox } from "./components/OfferBox";
import { APP_URL, styles } from "./tokens";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";
import { GUARANTEE_LIVE } from "@/components/landing/offer-copy";

export const subject = GUARANTEE_LIVE
  ? "30 edzés, és visszakapod a pénzed, ha nem vált be"
  : "30 edzés, a te tempódban";

const preview = GUARANTEE_LIVE
  ? "A 10 edzés garancia - öt héten belül."
  : "Egy tagság, minden benne - és bármikor lemondható.";

export default function UjrakezdesD6({
  unsubHref,
  ctaHref = `${APP_URL}/register?q=plan&plan=week_intro`,
}: {
  unsubHref: string;
  /** The plan-preselected join wizard, with the lead's ?lt= token so their
   *  quiz answers travel with them. Falls back to the tokenless URL - the
   *  funnel's hook must never depend on a field an old lead might not have. */
  ctaHref?: string;
}) {
  const intro = formatHuf(PRICES.week_intro.amountHuf);
  const weekStd = formatHuf(PRICES.week_std.amountHuf);
  const month = formatHuf(PRICES.month_std.amountHuf);
  const annual = formatHuf(PRICES.annual_std.amountHuf);

  return (
    <EmailLayout
      preview={preview}
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az e-mailt azért kaptad, mert elkészítetted a heti tervedet a LEXFIT-en, és kérted Alexa induló sorozatát."
    >
      <Text style={styles.eyebrow}>Szeptemberi újrakezdés</Text>
      <Text style={styles.h1}>{subject}</Text>

      <Text style={styles.body}>Szia,</Text>
      <Text style={styles.body}>
        a heti terv egy hét. Ha rendszert szeretnél belőle, arra való a
        tagság - és az ajánlat belefér három mondatba:
      </Text>

      {/* The offer in one breath (audit P4): price, scope, guarantee - then
          one action. The four-price paragraph parade this replaces made a
          6th grader assemble the deal from six paragraphs. */}
      <OfferBox intro={intro} weekStd={weekStd} month={month} annual={annual} ctaHref={ctaHref} />

      {GUARANTEE_LIVE && (
        <Panel>
          <PanelText>
            A garancia pontosan így szól:{" "}
            <strong>
              csináld végig az első 10 edzést öt héten belül - a könnyített
              változat is számít. Ha utána úgy érzed, ez nem a tiéd, egy
              e-mail elég, és visszautaljuk az addig befizetett tagsági díjad.
            </strong>{" "}
            Nem kérdezünk, nem győzködünk.
          </PanelText>
        </Panel>
      )}

      <Text style={styles.body}>
        Ha most nem időszerű, a heti terved akkor is a tiéd marad.
      </Text>

      <Sign />

      {GUARANTEE_LIVE && (
        <Text style={styles.small}>
          Ui. A 14 napos elállási jog a garanciától függetlenül megillet.
        </Text>
      )}
    </EmailLayout>
  );
}
