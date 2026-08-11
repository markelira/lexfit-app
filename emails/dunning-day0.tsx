// §4b/7 - Dunning day 0. Trigger: invoice.payment_failed webhook.
// Copy carried verbatim from src/lib/pricing/templates.ts dunningDay0().
// payUrl = Stripe hosted invoice (the one sanctioned external link).

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Nem ment át a kártyád";

export default function DunningDay0({ payUrl }: { payUrl: string }) {
  return (
    <EmailLayout preview="Valószínűleg csak lejárt vagy váltott a kártya - egy perc rendbe tenni.">
      <Text style={styles.eyebrow}>Fizetés</Text>
      <Text style={styles.h1}>Nem ment át a kártyád</Text>
      <Text style={styles.body}>
        A mostani terhelés nem sikerült - valószínűleg csak lejárt vagy váltott
        a kártya.
      </Text>
      <Text style={styles.body}>Frissítsd itt, és minden megy tovább:</Text>
      <Cta href={payUrl}>Kártya frissítése</Cta>
      <Text style={styles.note}>A hozzáférésed egyelőre megmarad.</Text>
      <Sign />
    </EmailLayout>
  );
}

DunningDay0.PreviewProps = {
  payUrl: "https://invoice.stripe.com/i/demo",
};
