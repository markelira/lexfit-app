// §4d/14 — Workout reminder. Trigger: hourly cron on plan.weekdays at the user's
// chosen time; suppressed if today's workout is already done; max one per day.
// Copy carried verbatim from src/lib/notify-templates.ts workoutReminderEmail().
// Consent: prefs.reminders.workout (must become a real opt-in — launch plan §3).

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Ma van edzésnapod 💚";

export default function WorkoutReminder() {
  return (
    <EmailLayout
      footer="reminder"
      preview="Nincs nyomás — 20–30 perc, egy matrac, és végig veled csinálom."
    >
      <Text style={styles.eyebrow}>Emlékeztető</Text>
      <Text style={styles.h1}>Ma van edzésnapod 💚</Text>
      <Text style={styles.body}>
        Ma az egyik edzésnapod — ahogy te állítottad be. Nincs nyomás, csak egy
        emlékeztető: 20–30 perc, egy matrac, és Alexa végig veled csinálja.
      </Text>
      <Text style={styles.body}>Nyisd meg a LEXFIT-et, amikor kényelmes.</Text>
      <Cta href={`${APP_URL}/app`}>Mai edzésem</Cta>
    </EmailLayout>
  );
}
