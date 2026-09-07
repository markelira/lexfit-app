// D3 - the belief mail. Lead magnet v2 §5.
//
// MARKETING: consented leads only, one-click opt-out in the footer keyed on the
// LEAD id, because these people have no account to unsubscribe in.
//
// The postscript is picked by the Q1 anchor - the one place this sequence
// segments. `restart` deliberately has none: the body is already written to
// them, and a postscript restating it would be filler.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { styles } from "./tokens";
import type { Anchor } from "@/lib/ujrakezdes/types";
import { SEGMENT_PS } from "@/app/ujrakezdes/copy";

export const subject = "Mi esik szét a 9. napon";

export default function UjrakezdesD3({
  planHref, segment, unsubHref,
}: { planHref: string; segment: Anchor; unsubHref: string }) {
  const ps = SEGMENT_PS[segment];
  return (
    <EmailLayout
      preview="Nem az akaraterő. A terv."
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az e-mailt azért kaptad, mert elkészítetted a heti tervedet a LEXFIT-en, és kérted Alexa induló sorozatát."
    >
      <Text style={styles.eyebrow}>Szeptemberi újrakezdés</Text>
      <Text style={styles.h1}>Mi esik szét a 9. napon</Text>

      <Text style={styles.body}>Szia,</Text>
      <Text style={styles.body}>
        a legtöbb újrakezdés nem az első napokban esik szét, hanem amikor jön
        egy rossz hét. Túlóra, betegség, vendégek — és a sorozat nulláról indul.
        Onnan pedig ritkán indul újra.
      </Text>

      <Panel>
        <PanelText>
          Ezért van a LEXFIT-ben két szabály. A pihenőnap nem töri meg a
          sorozatot. A kihagyott hét pedig nem nulláz — ott folytatod, ahol
          abbahagytad.
        </PanelText>
      </Panel>

      <Text style={styles.body}>
        Én tíz évig versenyszerűen tornáztam, aztán évekig semmit. Nem az edzés
        hiányzott, hanem egy rendszer, ami kibírja az életet. Ezt építettem meg.
      </Text>

      <Text style={styles.body}>
        A heti terved itt van, ha ezen a héten még nem nyitottad meg:
      </Text>

      <Cta href={planHref}>A tervem</Cta>

      <Sign />

      {ps && <Text style={styles.small}>{ps}</Text>}
    </EmailLayout>
  );
}
