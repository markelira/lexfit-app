// §4d/15 - Streak risk. Trigger: 20:00 cron pass on a missed planned day, streak ≥ 3.
// Copy carried verbatim from notify-templates.ts streakRiskEmail() - already the
// forgiveness-framed version (rest days keep the streak, and we say so).
// Consent: prefs.reminders.streakRisk.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subjectFor = (streak: number) =>
  `A ${streak} napos sorozatod ma megtartható`;

export default function StreakRisk({ streak }: { streak: number }) {
  return (
    <EmailLayout
      footer="reminder"
      preview="Egy rövid edzés is elég - és ha ma pihensz, az is rendben."
    >
      <Text style={styles.eyebrow}>Sorozat</Text>
      <Text style={styles.h1}>A {streak} napos sorozatod ma megtartható</Text>
      <Text style={styles.body}>
        Ma még nem mozogtál, és a {streak} napos sorozatod ma tartható meg. Egy
        rövid edzés is elég - a pihenőnapok nem törik meg, csak a betervezett
        napok.
      </Text>
      <Text style={styles.body}>
        Ha ma pihensz, az is rendben. Holnap újra itt vagyunk.
      </Text>
      <Cta href={`${APP_URL}/app`}>Egy rövid edzés</Cta>
    </EmailLayout>
  );
}

StreakRisk.PreviewProps = { streak: 12 };
