// Start campaign, mail 2 of 4 - show, do not tell.
//
// 63% of the mailable list trains rarely or never. For them the open question
// is not which features exist but what the next eight weeks will actually be
// like, so this mail describes the shape of the thing and sends them to look
// at the full list before paying anything.
import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "35 edzés, sorrendben";
const preview = "Nem videótár. Program, ami megmondja, mi a következő.";

export default function StartC2({ unsubHref, ctaHref }: { unsubHref: string; ctaHref: string }) {
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
        tegnap írtam, hogy a Start már egyben megvehető. Ma inkább megmutatom,
        mit kapsz, mert egy edzésprogramról nehéz bármit elhinni szövegből.
      </Text>
      <Text style={styles.body}>
        35 edzés, nyolc hétre elosztva. Nem egy videótár, amiből neked kell
        válogatnod - sorrendbe van rakva. Minden nap tudod, mi jön.
      </Text>
      <Text style={styles.body}>
        Minden edzést Alexa vezet végig. Otthon, eszköz nélkül; egy szőnyegnyi
        hely elég. Bármelyik nap, bármelyik órában.
      </Text>
      <Text style={styles.body}>
        A teljes listát végignézheted, mielőtt bármit fizetsz.
      </Text>

      <Cta href={ctaHref}>Megnézem mind a 35-öt</Cta>

      <Sign />

      <Text style={styles.small}>
        PS: A heti kihívásokat nem kell megvenned. Azok minden fióknak
        ingyenesek, akkor is, ha a Startot sosem veszed meg.
      </Text>
    </EmailLayout>
  );
}
