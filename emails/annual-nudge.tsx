// §4c/13 - Annual nudge (days 10–18, non-earners). Copy carried verbatim from
// pricing/templates.ts annualNudge(). "Comparison, not discount" - but genuinely
// promotional, so it is a MARKETING email: gate on marketingOptIn (Grtv. §6),
// carry unsubscribe.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Ugyanaz, csak okosabban";

export default function AnnualNudge({
  weekStd,
  annualPerWeek,
}: {
  weekStd: string;
  annualPerWeek: string;
}) {
  return (
    <EmailLayout
      footer="marketing"
      preview="Ugyanaz a hozzáférés - csak jóval kevesebbe kerül, ha egyben nézed."
    >
      <Text style={styles.eyebrow}>Éves tagság</Text>
      <Text style={styles.h1}>Ugyanaz, csak okosabban</Text>
      <Panel>
        <PanelText>
          Hetente <strong>{weekStd}/hét</strong> - évesben{" "}
          <strong>{annualPerWeek}/hét</strong>.
        </PanelText>
      </Panel>
      <Text style={styles.body}>
        Ugyanaz a hozzáférés, csak jóval kevesebbe kerül, ha egyben nézed.
      </Text>
      <Text style={styles.body}>
        Ha kiszámoltad magadnak, az éves ott vár az appban.
      </Text>
      <Cta href={`${APP_URL}/app/membership`}>Megnézem az évest</Cta>
      <Sign />
    </EmailLayout>
  );
}

AnnualNudge.PreviewProps = { weekStd: "1 990 Ft", annualPerWeek: "767 Ft" };
