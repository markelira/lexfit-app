// §4b/5 - Intro step-up reminder (F2.2, day 5 of the 490 Ft intro week).
// Copy carried verbatim from src/lib/pricing/templates.ts weeklyDay5Reminder().
// The legally load-bearing renewal email: price, auto-renew, one-click cancel.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Két nap múlva indul a rendes heted";

export default function WeeklyDay5Reminder({ stdPrice }: { stdPrice: string }) {
  return (
    <EmailLayout preview={`Onnantól ${stdPrice}/hét, automatikusan megújul - vagy egy kattintás, és lemondod.`}>
      <Text style={styles.eyebrow}>Előfizetés</Text>
      <Text style={styles.h1}>Két nap múlva indul a rendes heted</Text>
      <Text style={styles.body}>
        Két nap múlva lejár az első heted, és onnantól {stdPrice}/hét,
        automatikusan megújul.
      </Text>
      <Text style={styles.body}>
        Ha most nem folytatnád, egy kattintással lemondhatod a profilodban.
      </Text>
      <Text style={styles.body}>Ha maradsz: hétfőn új kihívás vár. Ki van benne? 💪</Text>
      <Cta href={`${APP_URL}/app/membership`}>Megnézem a profilomban</Cta>
      <Sign />
    </EmailLayout>
  );
}

WeeklyDay5Reminder.PreviewProps = { stdPrice: "1 990 Ft" };
