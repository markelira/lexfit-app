// §4e/18 — Day-2 first-workout nudge. Trigger: daily cron, no completion 48h after
// signup (milestone doc "day2-nudge"; skipped entirely if first-workout already
// fired). Personalization goldmine: `motiv` — the user's own words from onboarding.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Az első lépés jöhet?";

export default function Day2Nudge({
  motiv,
}: {
  /** The user's own "why" from onboarding (onboarding/profile.motiv). */
  motiv?: string;
}) {
  return (
    <EmailLayout
      footer="reminder"
      preview="Az elindulás a legnehezebb rész — kezdd a legrövidebbel."
    >
      <Text style={styles.eyebrow}>Első edzés</Text>
      <Text style={styles.h1}>Az első lépés jöhet?</Text>
      <Text style={styles.body}>
        Két napja regisztráltál, és az első edzés még vár rád. Semmi gond — az
        elindulás mindig a legnehezebb rész.
      </Text>
      {motiv ? (
        <Panel>
          <PanelText>
            Te írtad: „{motiv}” — ez pont elég jó ok arra, hogy ma elkezdd.
          </PanelText>
        </Panel>
      ) : null}
      <Text style={styles.body}>
        Válaszd a legrövidebbet: 20 perc, egy matrac, és én végig veled
        csinálom.
      </Text>
      <Cta href={`${APP_URL}/app`}>Elkezdem a legrövidebbel</Cta>
      <Sign />
    </EmailLayout>
  );
}

Day2Nudge.PreviewProps = {
  motiv: "Erősebb akarok lenni, és jobban aludni.",
};
