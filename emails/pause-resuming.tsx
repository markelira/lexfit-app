// §4b/11 - Pause resuming soon. Trigger: daily cron, PAUSE_RESUME_REMINDER_DAYS (3)
// before auto-resume. Copy carried verbatim from pricing/templates.ts pauseResumingSoon().

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Hamarosan újraindul a tagságod";

export default function PauseResuming() {
  return (
    <EmailLayout preview="Pár nap, és ott folytatod, ahol abbahagytad - semmi nem veszett el.">
      <Text style={styles.eyebrow}>Előfizetés</Text>
      <Text style={styles.h1}>Hamarosan újraindul a tagságod</Text>
      <Text style={styles.body}>
        Pár nap múlva letelik a szüneted, és ott folytatod, ahol abbahagytad -
        a kifizetett idődből semmi nem veszett el.
      </Text>
      <Text style={styles.body}>
        Ha még maradnál szüneten, egy kattintással meghosszabbíthatod a
        profilodban.
      </Text>
      <Text style={styles.body}>Jó újrakezdést! 💪</Text>
      <Cta href={`${APP_URL}/app/membership`}>Profilom megnyitása</Cta>
      <Sign />
    </EmailLayout>
  );
}
