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
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perMonthHuf } from "@/lib/pricing/display";
import { GUARANTEE_LIVE } from "@/components/landing/offer-copy";

export const subject = GUARANTEE_LIVE
  ? "30 edzés, és visszakapod a pénzed, ha nem vált be"
  : "30 edzés, a te tempódban";

const preview = GUARANTEE_LIVE
  ? "A 10 edzés garancia — öt héten belül."
  : "Egy tagság, minden benne — és bármikor lemondható.";

export default function UjrakezdesD6({ unsubHref }: { unsubHref: string }) {
  const month = formatHuf(PRICES.month_std.amountHuf);
  const annual = formatHuf(PRICES.annual_std.amountHuf);
  const annualPerMonth = formatHuf(perMonthHuf());

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
        a heti terv egy hét. Ha rendszert szeretnél belőle, arra való a{" "}
        <strong>LEXFIT Start</strong>: 30 edzés a te tempódban, mindet én
        vezetem, és úgy épül, hogy egy rossz hét ne döntse el.
      </Text>

      {GUARANTEE_LIVE ? (
        <>
          <Text style={styles.body}>Van hozzá egy vállalásom.</Text>
          <Panel>
            <PanelText>
              <strong>
                Csináld végig az első 10 edzést öt héten belül — a könnyített
                változat is számít. Ha utána úgy érzed, ez nem a tiéd, egy
                e-mail elég, és visszautaljuk az addig befizetett tagsági díjad.
              </strong>{" "}
              Nem kérdezünk, nem győzködünk.
            </PanelText>
          </Panel>
        </>
      ) : (
        <Panel>
          <PanelText>
            A lemondás bármikor egy kattintás, és a 14 napos elállási jog a
            vásárlástól számítva megillet — ilyenkor a fel nem használt
            időszakra eső díjat időarányosan visszatérítjük.
          </PanelText>
        </Panel>
      )}

      <Text style={styles.body}>
        Egy tagság, minden benne: a Start program, az összes többi program, és
        minden héten 5 új kihívás-videó. Havi {month}, vagy {annual} egy évre —
        így {annualPerMonth} havonta.
      </Text>

      <Text style={styles.body}>
        Ha most nem időszerű, a heti terved akkor is a tiéd marad.
      </Text>

      <Cta href={`${APP_URL}/arak`}>Megnézem a Start programot</Cta>

      <Sign />

      {GUARANTEE_LIVE && (
        <Text style={styles.small}>
          Ui. A 14 napos elállási jog a garanciától függetlenül megillet.
        </Text>
      )}
    </EmailLayout>
  );
}
