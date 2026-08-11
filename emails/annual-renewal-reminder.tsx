// §4b/6 - Annual renewal reminder. Trigger: invoice.upcoming (webhook branch is a
// deliberate no-op today - M11 config: recapDaysBefore 30, reminderDaysBefore 7).
// Two variants from one template: −30 days = year-recap framing, −7 days = plain facts.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Facts, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subjectFor = (variant: "recap30" | "final7") =>
  variant === "recap30"
    ? "Egy hónap múlva megújul az éves tagságod"
    : "Egy hét múlva megújul az éves tagságod";

export default function AnnualRenewalReminder({
  variant,
  renewDate,
  price,
  doneCount,
}: {
  variant: "recap30" | "final7";
  renewDate: string;
  price: string;
  /** Workouts completed in the past year - recap30 variant only. */
  doneCount?: number;
}) {
  return (
    <EmailLayout
      preview={
        variant === "recap30"
          ? "Nézd meg, mit hoztál össze egy év alatt - és mi jön most."
          : `Megújulás: ${renewDate}. Minden marad, ahogy beállítottad.`
      }
    >
      <Text style={styles.eyebrow}>Éves tagság</Text>
      <Text style={styles.h1}>{subjectFor(variant)}</Text>
      {variant === "recap30" && typeof doneCount === "number" && doneCount > 0 ? (
        <Text style={styles.body}>
          Mielőtt bármi más: az elmúlt évben {doneCount} edzést csináltál végig.
          Ez a te éved volt - én csak szóltam, hogy mikor.
        </Text>
      ) : null}
      <Text style={styles.body}>
        {variant === "recap30"
          ? "Az éves tagságod egy hónap múlva automatikusan megújul - semmit nem kell tenned, minden megy tovább."
          : "Az éves tagságod egy hét múlva automatikusan megújul - semmit nem kell tenned, minden megy tovább."}
      </Text>
      <Facts
        rows={[
          { label: "Megújulás", value: renewDate },
          { label: "Ár", value: `${price} / év` },
        ]}
      />
      <Text style={styles.note}>
        Ha nem szeretnéd folytatni, a megújulásig bármikor lemondhatod egy
        kattintással a profilodban - a hozzáférésed a kifizetett időszak végéig
        akkor is megmarad.
      </Text>
      <Cta href={`${APP_URL}/app/membership`}>Tagságom kezelése</Cta>
      <Sign />
    </EmailLayout>
  );
}

AnnualRenewalReminder.PreviewProps = {
  variant: "recap30" as const,
  renewDate: "2026. szeptember 9.",
  price: "34 900 Ft",
  doneCount: 142,
};
