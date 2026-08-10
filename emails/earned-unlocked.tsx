// §4c/12 — Earned annual ("Kiérdemelt Ár") unlocked: 5 check-ins in the first 7 days.
// Copy carried from pricing/templates.ts earnedUnlocked(), with the pink-era 💗
// corrected to 💚. Status, not sale (J4). The 72h deadline is real and final.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Feloldottad az Alapító Éves árat 💚";

export default function EarnedUnlocked({
  earnedPrice,
  perWeek,
  windowHours,
}: {
  earnedPrice: string;
  perWeek: string;
  windowHours: number;
}) {
  return (
    <EmailLayout preview="Az első heted mind az 5 kihívás-napját kipipáltad.">
      <Text style={styles.eyebrow}>Kiérdemelt ár</Text>
      <Text style={styles.h1}>Megcsináltad.</Text>
      <Text style={styles.body}>
        Az első heted mind az 5 kihívás-napját kipipáltad. Ezzel feloldottad a
        te árad:
      </Text>
      <Panel>
        <PanelText>
          <strong>{earnedPrice}</strong> az első évre — {perWeek}/hét.
        </PanelText>
      </Panel>
      <Text style={styles.body}>
        Ez {windowHours} órán át elérhető, utána a szokásos éves ár marad.
      </Text>
      <Cta href={`${APP_URL}/app/membership`}>Megnézem az appban</Cta>
      <Sign />
    </EmailLayout>
  );
}

EarnedUnlocked.PreviewProps = {
  earnedPrice: "34 900 Ft",
  perWeek: "671 Ft",
  windowHours: 72,
};
