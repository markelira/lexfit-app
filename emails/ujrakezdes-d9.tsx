// D9 - proof, and the last mail in the sequence.
//
// This is the replacement for the v2 spec's D10, which was cut: D10 was a
// September 30 deadline and offer v3 §2 says "Urgency: none. No deadlines, no
// counters, ever." Re-dating that mail would have been the same mail.
//
// So D9 does the other job a fourth send can do. The evidence supports exactly
// one more email and no more - a 7-vs-3 sequence test gained 35% conversion
// while unsubscribes climbed 15% after email five, and fitness already carries
// the highest unsubscribe rate of any vertical (~0.40%). See
// docs/funnel-research/05-email-sequence.md.
//
// WHAT IT CLAIMS. Nothing statistical. Everything here is Alexa describing what
// the first ten workouts are like from the coaching side - which is hers to
// say - rather than a completion rate or an outcome nobody measured. There is
// no body claim, no timeframe promise, and no second-person health assumption.
//
// The guarantee half respects NEXT_PUBLIC_GUARANTEE_LIVE, same as D6: while the
// ÁSZF clause is unpublished the mail simply does not mention a refund.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";
import { GUARANTEE_LIVE } from "@/components/landing/offer-copy";

export const subject = "Mi történik az első tíz edzés alatt";

const preview = "A harmadik környékén szokott eldőlni.";

export default function UjrakezdesD9({ unsubHref }: { unsubHref: string }) {
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
        ez az utolsó levelem ebből a sorozatból. Arról szól, mi vár rád az első
        tíz edzésen — mert nem egészen az, amire a legtöbben számítanak.
      </Text>

      <Text style={styles.body}>
        <strong>Az első kettő a nehéz.</strong> Nem az erőnlét miatt, hanem
        mert még nincs meg a helye a hetedben. A harmadik körül dől el, és
        onnantól nem kell minden alkalommal újra eldöntened.
      </Text>

      <Text style={styles.body}>
        <strong>Valahol az ötödik táján jön az első kihagyott nap.</strong> Ez
        benne van a tervben. A pihenőnap nem töri meg a sorozatot, a kihagyott
        hét pedig nem nulláz — ott folytatod, ahol abbahagytad.
      </Text>

      <Text style={styles.body}>
        <strong>A tizediknél megváltozik a kérdés.</strong> Addig az, hogy
        sikerül-e. Utána az, hogy mi legyen a következő.
      </Text>

      {GUARANTEE_LIVE && (
        <Panel>
          <PanelText>
            Ez a tíz edzés egyben a garancia útvonala is:{" "}
            <strong>
              csináld végig őket öt héten belül — a könnyített változat is
              számít —, és ha utána úgy érzed, ez nem a tiéd, visszautaljuk az
              addig befizetett tagsági díjad.
            </strong>{" "}
            Nem fogadás. Egy útvonal, aminek a végén te döntesz.
          </PanelText>
        </Panel>
      )}

      <Cta href={`${APP_URL}/arak`}>Megnézem a Start programot</Cta>

      <Sign />

      <Text style={styles.small}>
        Ui. Ha most nem időszerű, a heti terved akkor is a tiéd marad. Nincs
        határidő, és több levelet nem küldök erről.
      </Text>
    </EmailLayout>
  );
}
