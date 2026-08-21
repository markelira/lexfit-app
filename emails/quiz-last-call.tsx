// E6 (+14 days) - the last mail of the nurture sequence.
//
// It is the last one on purpose, and it says so. A sequence that never admits
// it is over trains people to ignore the sender; naming the end is both more
// honest and better for deliverability - the alternative to an unsubscribe is
// usually a spam complaint, and that lands on the domain our paying customers'
// invoices go out from.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Ez az utolsó levelünk";

export default function QuizLastCall({
  firstName, programTitle, introPrice, unsubHref,
}: { firstName: string; programTitle: string; introPrice: string; unsubHref: string }) {
  return (
    <EmailLayout
      preview="Nem írunk többet. A terved viszont marad, ha kell."
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az emailt azért kaptad, mert kitöltötted a LEXFIT tervkészítő kvízét, és kérted a tippjeinket."
    >
      <Text style={styles.eyebrow}>Utolsó levél</Text>
      <Text style={styles.h1}>Nem szeretnénk a terhedre lenni.</Text>
      <Text style={styles.body}>Szia {firstName}!</Text>
      <Text style={styles.body}>
        Két hete kitöltötted a kvízt, és azóta küldtünk néhány levelet. Ez az
        utolsó - utána nem írunk többet, hacsak te nem kezdeményezed.
      </Text>
      <Text style={styles.body}>
        Ha most nem aktuális, az teljesen rendben van. Az időzítés legalább annyit
        számít, mint a szándék.
      </Text>
      <Text style={styles.body}>
        Ha viszont még megvan benned - a <strong>{programTitle}</strong> ott vár,
        és az első hét {introPrice}.
      </Text>
      <Cta href={`${APP_URL}/register`}>Mégis belevágok</Cta>
      <Text style={styles.small}>
        Ha esetleg nem szeretnéd, hogy a kvíznél megadott adataidat tovább
        tároljuk, azt is elintézzük - írj az info@amstudios.hu címre.
      </Text>
      <Sign />
    </EmailLayout>
  );
}

QuizLastCall.PreviewProps = {
  firstName: "Anna",
  programTitle: "Első Lépés",
  introPrice: "490 Ft",
  unsubHref: "https://www.lexfit.hu/api/email/unsubscribe?uid=demo&kind=leadMarketing&t=demo",
};
