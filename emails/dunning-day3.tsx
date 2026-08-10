// §4b/8 — Dunning day 3. Trigger: daily cron, 3 days into PAST_DUE.
// Copy carried verbatim from src/lib/pricing/templates.ts dunningDay3().

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Emlékeztető: frissítsd a kártyád";

export default function DunningDay3({ payUrl }: { payUrl: string }) {
  return (
    <EmailLayout preview="Pár napig még megtartjuk a hozzáférésed — egy perc az egész.">
      <Text style={styles.eyebrow}>Fizetés</Text>
      <Text style={styles.h1}>Emlékeztető: frissítsd a kártyád</Text>
      <Text style={styles.body}>
        Még mindig nem sikerült a terhelés. Pár napig megtartjuk a
        hozzáférésed, de utána szünetel.
      </Text>
      <Text style={styles.body}>Egy perc az egész:</Text>
      <Cta href={payUrl}>Kártya frissítése</Cta>
      <Sign />
    </EmailLayout>
  );
}

DunningDay3.PreviewProps = {
  payUrl: "https://invoice.stripe.com/i/demo",
};
