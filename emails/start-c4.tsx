// Start campaign, mail 4 of 4 - the close, without a deadline.
//
// The owner declined the shared-start mechanic, so there is nothing honest to
// put a clock on: the price does not change and the programme does not go
// away. This mail therefore closes on the only true scarcity left, which is
// the sender's own attention - it is the last one, and it says so. That is a
// real promise, and it must be kept: nothing further about this offer goes to
// this list.
import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { styles } from "./tokens";
import { PRICES, WITHDRAWAL_DAYS } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";

export const subject = "Ez az utolsó levelem erről";
const preview = "Az ár nem változik. Csak én nem írok többet róla.";

export default function StartC4({ unsubHref, ctaHref }: { unsubHref: string; ctaHref: string }) {
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
        ez az utolsó levelem a Startról. Nem azért, mert az ár változik - nem
        változik -, hanem mert négy levélnél többet egy ajánlatról nem
        szeretnék írni neked.
      </Text>
      <Text style={styles.body}>
        Ha eddig azon gondolkodtál, a rövid változat ennyi: 8 hét, 35 edzés,
        otthonra, eszköz nélkül. Egyszer fizetsz {price}-ot, és örökre a tiéd.
        Nem előfizetés. {WITHDRAWAL_DAYS} napig indoklás nélkül visszakérheted.
      </Text>

      <Cta href={ctaHref}>Megveszem a programot</Cta>

      <Text style={styles.body}>
        Ha nem aktuális, az teljesen rendben. A heti kihívások ingyen maradnak,
        azokhoz nem kell semmit venned.
      </Text>

      <Sign />

      <Text style={styles.small}>
        PS: A következő levelem, amit tőlem kapsz, megint edzésről fog szólni.
      </Text>
    </EmailLayout>
  );
}
