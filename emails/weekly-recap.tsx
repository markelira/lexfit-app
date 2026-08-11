// §4d/16 - Weekly recap ("A heted, ahogy volt"). Trigger: Monday 08:00 cron,
// covering Mon–Sun. Data MUST come from lib/week-progress computeWeekProgress +
// lib/streak computeStreak (both pure) or the numbers diverge from the app.
// Zero-activity week → restart variant, never a 0/N scoreboard.
// Consent: prefs.reminders.weeklyRecap (new field).

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Facts, Sign, WeekDots, type DayState } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subjectFor = (zeroWeek: boolean) =>
  zeroWeek ? "Új hét, tiszta lap" : "A heted, ahogy volt";

export default function WeeklyRecap({
  doneThisWeek,
  target,
  streak,
  days,
  nextWeekDays,
  newContentLine,
}: {
  doneThisWeek: number;
  target: number;
  streak: number;
  /** Mon–Sun, from computeWeekProgress - label = H/K/Sz/Cs/P/Szo/V. */
  days: { label: string; state: DayState }[];
  /** e.g. "hétfő, kedd, csütörtök, péntek" - from weekdayNamesHu(). */
  nextWeekDays: string;
  /** Optional "Új ezen a héten" line - content news rides here, never separately. */
  newContentLine?: string;
}) {
  const zeroWeek = doneThisWeek === 0;
  return (
    <EmailLayout
      footer="reminder"
      preview={
        zeroWeek
          ? "A múlt hét kimaradt - előfordul. A terved változatlanul megvan."
          : `${doneThisWeek}/${target} edzésnap - így nézett ki a heted.`
      }
    >
      <Text style={styles.eyebrow}>Heti összefoglaló</Text>
      {zeroWeek ? (
        <>
          <Text style={styles.h1}>Új hét, tiszta lap</Text>
          <Text style={styles.body}>
            A múlt hét kimaradt - előfordul, és nem történt semmi
            visszafordíthatatlan. A terved változatlanul megvan: {nextWeekDays}.
          </Text>
          <Text style={styles.body}>
            Ma pont jó nap újrakezdeni. Egy 20 perces edzés elég ahhoz, hogy
            visszatalálj a ritmusba - a többit majd hozza magával.
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.h1}>A heted, ahogy volt</Text>
          <WeekDots days={days} />
          <Facts
            rows={[
              { label: "Edzésnap", value: `${doneThisWeek} / ${target}` },
              { label: "Sorozat", value: `${streak} nap` },
            ]}
          />
          <Text style={{ ...styles.body, margin: "18px 0 16px" }}>
            {doneThisWeek >= target
              ? "Minden betervezett napot kipipáltál - ez volt a terv, és megcsináltad. 💚"
              : "Ami megvolt, az megvolt - a kimaradt nap nem tartozás, csak egy nap. Új hét, ugyanaz a terv."}
          </Text>
          <Text style={styles.body}>Ezen a héten: {nextWeekDays}.</Text>
        </>
      )}
      {newContentLine ? (
        <Text style={styles.note}>Új ezen a héten: {newContentLine}</Text>
      ) : null}
      <Cta href={`${APP_URL}/app`}>{zeroWeek ? "Újrakezdem ma" : "Indítom a hetet"}</Cta>
      <Sign />
    </EmailLayout>
  );
}

WeeklyRecap.PreviewProps = {
  doneThisWeek: 4,
  target: 5,
  streak: 12,
  days: [
    { label: "H", state: "done" as DayState },
    { label: "K", state: "done" as DayState },
    { label: "Sz", state: "rest" as DayState },
    { label: "Cs", state: "done" as DayState },
    { label: "P", state: "missed" as DayState },
    { label: "Szo", state: "done" as DayState },
    { label: "V", state: "rest" as DayState },
  ],
  nextWeekDays: "hétfő, kedd, csütörtök, péntek, szombat",
  newContentLine: "3 új alsótest-edzés a videótárban",
};
