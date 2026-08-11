// §4d/17 - First workout done. Trigger: first entry in progress.completed
// (milestone doc "first-workout", sent ~1h after, same day). The activation
// milestone - celebrate, then name the next planned day.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Az első megvan 💚";

export default function FirstWorkout({
  nextDayName,
}: {
  /** e.g. "csütörtök" - the next planned training day, from the user's plan. */
  nextDayName?: string;
}) {
  return (
    <EmailLayout
      footer="reminder"
      preview="Ez volt a legnehezebb - innentől nem nulláról indulsz."
    >
      <Text style={styles.eyebrow}>Mérföldkő</Text>
      <Text style={styles.h1}>Az első megvan 💚</Text>
      <Text style={styles.body}>
        Ez volt a legnehezebb - az első edzés, amit tényleg elindítottál és
        végig is csináltál. Innentől nem nulláról indulsz.
      </Text>
      <Text style={styles.body}>
        {nextDayName
          ? `A következő edzésnapod: ${nextDayName}. Addig pihenj nyugodtan - az is a terv része.`
          : "A következő edzésnapod ott vár a tervedben. Addig pihenj nyugodtan - az is a terv része."}
      </Text>
      <Cta href={`${APP_URL}/app/progress`}>Megnézem a haladásom</Cta>
      <Sign />
    </EmailLayout>
  );
}

FirstWorkout.PreviewProps = { nextDayName: "csütörtök" };
