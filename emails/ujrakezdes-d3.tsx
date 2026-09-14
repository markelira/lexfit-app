// D3 - the belief mail. Lead magnet v2 §5.
//
// MARKETING: consented leads only, one-click opt-out in the footer keyed on the
// LEAD id, because these people have no account to unsubscribe in.
//
// The postscript is picked by the Q1 anchor - the one place this sequence
// segments. `restart` deliberately has none: the body is already written to
// them, and a postscript restating it would be filler.

import * as React from "react";
import { Link, Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { color, styles } from "./tokens";
import type { Anchor } from "@/lib/ujrakezdes/types";
import { SEGMENT_PS } from "@/app/ujrakezdes/copy";

export const subject = "Mi esik szét a 9. napon";

export default function UjrakezdesD3({
  planHref, segment, unsubHref, watchHref,
}: {
  planHref: string; segment: Anchor; unsubHref: string;
  /** The free first workout (guest player) - the belief mail's postscript
   *  is the watch push (audit P3). */
  watchHref?: string;
}) {
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
        egy rossz hét. Túlóra, betegség, vendégek - és a sorozat nulláról indul.
        Onnan pedig ritkán indul újra.
      </Text>

      <Panel>
        <PanelText>
          Ezért van a LEXFIT-ben két szabály. A pihenőnap nem töri meg a
          sorozatot. A kihagyott hét pedig nem nulláz - ott folytatod, ahol
          abbahagytad.
        </PanelText>
      </Panel>

      {/* The month, picked up from the reveal's second beat. The timing is the
          point: this mail lands on day 3, when she is standing inside week one
          and week two - the flat one - is what happens next. Naming it before
          it arrives is what turns "elfogyott a lendület" from a personal
          failure into a scheduled, survivable part of the plan. */}
      <Text style={styles.body}>
        Így néz ki innen a hónapod:
      </Text>
      <Text style={styles.body}>
        <strong>2. hét:</strong> a lendület már nincs meg, a rutin még nincs. A
        terved ezért nem lesz nehezebb - ugyanaz a ritmus, ugyanaz a hossz.
        <br />
        <strong>3. hét:</strong> ez az a hét, amikor általában közbejön valami.
        Ha kihagysz, ott folytatod.
        <br />
        <strong>4. hét:</strong> innentől nem eldöntöd, hogy megcsináld -
        egyszerűen jön a soros nap.
      </Text>

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
      {watchHref && (
        <Text style={styles.small}>
          Ui. Az első edzésedet <strong>ingyen megnézheted</strong> - 20–30
          perc, akár ma este:{" "}
          <Link href={watchHref} style={{ color: color.accentInk }}>
            Megnézem az első edzést
          </Link>
        </Text>
      )}
    </EmailLayout>
  );
}
