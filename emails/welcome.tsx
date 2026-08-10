// §4a/1 — Welcome. Trigger: first ensureUserDoc() (milestone doc "welcome").
// One job: get them to the first workout. No feature tour, no pricing.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Üdvözöllek a LEXFIT-ben 💚";

export default function Welcome({ name }: { name?: string | null }) {
  return (
    <EmailLayout
      preview="Alexa vagyok. Egy terv, egy matrac — és nem egyedül csinálod."
      reason="Ezt az emailt azért kaptad, mert fiókot hoztál létre a LEXFIT-ben."
    >
      <Text style={styles.eyebrow}>Üdvözlünk</Text>
      <Text style={styles.h1}>{name ? `Szia, ${name}!` : "Szia!"} Örülök, hogy itt vagy.</Text>
      <Text style={styles.body}>
        Alexa vagyok. Innentől nem egyedül csinálod — 20–30 perc, egy matrac, és
        egy terv, amit te állítottál össze.
      </Text>
      <Text style={styles.body}>
        Az első lépés a legnehezebb, ezért csak egyet kérek: nyisd meg az appot,
        és indítsd el az első edzésed. A többit együtt csináljuk.
      </Text>
      <Cta href={`${APP_URL}/app`}>Indítom az első edzésem</Cta>
      <Sign />
    </EmailLayout>
  );
}

Welcome.PreviewProps = { name: "Anna" };
