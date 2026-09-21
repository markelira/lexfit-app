// Start campaign, mail 1 of 4 - the reframe.
//
// The list's own numbers are the argument for this campaign: 456 leads, 4
// purchases, against a sequence whose D6/D9 both pointed at the 490 Ft weekly
// SUBSCRIPTION. The reasonable reading is not that they rejected the training -
// it is that they rejected a recurring charge chosen before they had seen a
// single workout. /start removes exactly that, so this mail names the objection
// out loud rather than pitching the same thing again in a new envelope.
//
// No deadline and no counter, per offer v3 §2 and the GVH AboutYou decision -
// the owner declined the shared-start mechanic, so this campaign carries no
// urgency device at all. Weaker, and honest.
import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";
import { WITHDRAWAL_DAYS } from "@/lib/pricing/config";

export const subject = "Az előfizetés volt a baj, nem a program";
const preview = "Kivettük belőle. Egyszer fizetsz, és a tiéd marad.";

export default function StartC1({ unsubHref, ctaHref }: { unsubHref: string; ctaHref: string }) {
  const price = formatHuf(PRICES.program_foundation.amountHuf);
  return (
    <EmailLayout
      preview={preview}
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az e-mailt azért kaptad, mert elkészítetted a heti tervedet a LEXFIT-en, és kérted Alexa leveleit."
    >
      <Text style={styles.eyebrow}>Lexfit Start</Text>
      <Text style={styles.h1}>{subject}</Text>

      <Text style={styles.body}>Szia,</Text>
      <Text style={styles.body}>
        pár hete kitöltötted a tervedet, aztán nem lett belőle semmi. Nem vagy
        egyedül vele - és most már azt is sejtem, miért.
      </Text>
      <Text style={styles.body}>
        Az volt a kérés, hogy csinálj fiókot, adj meg kártyát, és kösd le magad
        egy havonta megújuló előfizetésre. Egyszerre három igen, még mielőtt
        egyetlen edzést is láttál volna.
      </Text>
      <Text style={styles.body}>Kivettünk belőle kettőt.</Text>
      <Text style={styles.body}>
        A Lexfit Start mostantól megvehető egyben: {price}, egyetlen
        alkalommal. Nem előfizetés, nincs mit lemondani, és örökre a tiéd
        marad. 8 hét, 35 edzés, sorrendbe rakva - megmondja, mikor mit csinálj.
      </Text>

      <Cta href={ctaHref}>Megnézem a programot</Cta>

      <Sign />

      <Text style={styles.small}>
        PS: {WITHDRAWAL_DAYS} napig indoklás nélkül visszakérheted az árát. Nem
        azért írom, mert számítok rá, hanem mert így nem kell most eldöntened,
        hogy bejön-e.
      </Text>
    </EmailLayout>
  );
}
