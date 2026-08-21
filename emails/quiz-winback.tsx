// W1 (+45 days) - win-back, sent only to leads who never converted.
//
// E6 promised "this is the last one". Six weeks later this arrives, so it opens
// by acknowledging that rather than pretending the promise was not made - a
// sequence that quietly breaks its own word is worse than one that never made
// it. If this mail underperforms or draws complaints, it is the first thing to
// cut: the promise is worth more than the margin.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Hat hét telt el - hogy vagy?";

export default function QuizWinback({
  firstName, introPrice, unsubHref,
}: { firstName: string; introPrice: string; unsubHref: string }) {
  return (
    <EmailLayout
      preview="Egy levél, aztán tényleg csend. Ha most jobb az időzítés, itt vagyunk."
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az emailt azért kaptad, mert kitöltötted a LEXFIT tervkészítő kvízét, és kérted az ajánlatainkat."
    >
      <Text style={styles.eyebrow}>Rég beszéltünk</Text>
      <Text style={styles.h1}>Megígértük, hogy nem írunk többet. Most mégis.</Text>
      <Text style={styles.body}>Szia {firstName}!</Text>
      <Text style={styles.body}>
        Hat hete küldtük az utolsó levelünket, és azt írtuk, nem zavarunk tovább.
        Ez az egy kivétel - utána tényleg csend lesz.
      </Text>
      <Text style={styles.body}>
        Az ok egyszerű: a legtöbb terv nem azért marad el, mert rossz volt, hanem
        mert rossz héten érkezett. Lehet, hogy akkor épp sok volt minden.
      </Text>
      <Text style={styles.body}>
        Ha most más a helyzet, a terved megvan - és az első hét továbbra is{" "}
        {introPrice}. Ha nem, hagyd figyelmen kívül ezt a levelet, és köszönjük,
        hogy egyáltalán kitöltötted.
      </Text>
      <Cta href={`${APP_URL}/register`}>Újrakezdem</Cta>
      <Sign />
    </EmailLayout>
  );
}

QuizWinback.PreviewProps = {
  firstName: "Anna",
  introPrice: "490 Ft",
  unsubHref: "https://www.lexfit.hu/api/email/unsubscribe?uid=demo&kind=leadMarketing&t=demo",
};
