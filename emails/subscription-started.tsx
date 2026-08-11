// §4b/4 - Subscription started / payment confirmed. Trigger: checkout.session.completed
// / first invoice.paid. Renewal facts (price, period, cancel path) are mandatory (J1/J6).
// The legal invoice comes from Billingo separately - this is the UX confirmation.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Facts, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Elindult az előfizetésed";

export default function SubscriptionStarted({
  planName,
  priceLine,
  nextChargeDate,
  oneOff = false,
}: {
  planName: string;
  priceLine: string;
  /** Recurring: next charge date. One-off: the access-until date. */
  nextChargeDate: string;
  oneOff?: boolean;
}) {
  return (
    <EmailLayout preview="Minden a tiéd - a program, a videótár, a haladásod.">
      <Text style={styles.eyebrow}>{oneOff ? "Hozzáférés" : "Előfizetés"}</Text>
      <Text style={styles.h1}>
        {oneOff ? "Megvan a hozzáférésed" : "Elindult az előfizetésed"}
      </Text>
      <Text style={styles.body}>
        Minden a tiéd: a teljes program, a videótár és a haladásod követése.
        Örülök, hogy belevágtál - kezdjük.
      </Text>
      <Facts
        rows={[
          { label: "Csomag", value: planName },
          { label: "Ár", value: priceLine },
          { label: oneOff ? "Hozzáférés eddig" : "Következő terhelés", value: nextChargeDate },
        ]}
      />
      <Text style={styles.note}>
        {oneOff
          ? "Ez egyszeri vásárlás - nem újul meg automatikusan, nem vonunk le többet. A számlát a Billingo külön emailben küldi."
          : "Az előfizetésed automatikusan megújul. Ha nem folytatnád, egy kattintással lemondhatod a profilodban. A számlát a Billingo külön emailben küldi."}
      </Text>
      <Cta href={`${APP_URL}/app`}>Kezdjük az edzést</Cta>
      <Sign />
    </EmailLayout>
  );
}

SubscriptionStarted.PreviewProps = {
  planName: "Heti - intro (első 7 nap)",
  priceLine: "490 Ft / első 7 nap, utána 1 990 Ft / hét",
  nextChargeDate: "2026. augusztus 17.",
};
