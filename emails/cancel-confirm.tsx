// §4b/9 - Cancellation / downgrade confirmed. Trigger: /api/subscription/manage
// (cancel or downgrade action). Top chargeback-prevention email: exact end date,
// no-further-charges statement, progress stays. Never a guilt-trip, never a pitch.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Facts, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subjectFor = (variant: "cancel" | "downgrade") =>
  variant === "cancel" ? "Rendben, lemondtad" : "Rendben, váltottál";

export default function CancelConfirm({
  variant,
  accessUntil,
  newPlanLine,
}: {
  variant: "cancel" | "downgrade";
  /** The date access (or the current plan) runs until. */
  accessUntil: string;
  /** Downgrade only: e.g. "Heti - 1 990 Ft / hét". */
  newPlanLine?: string;
}) {
  return (
    <EmailLayout
      preview={
        variant === "cancel"
          ? "Nem vonunk le többet - és minden haladásod megmarad."
          : "Az időszak végén automatikusan átváltunk - semmit nem kell tenned."
      }
    >
      <Text style={styles.eyebrow}>Előfizetés</Text>
      <Text style={styles.h1}>{subjectFor(variant)}</Text>
      {variant === "cancel" ? (
        <>
          <Text style={styles.body}>
            Ahogy kérted: több terhelés nem lesz. A hozzáférésed a kifizetett
            időszak végéig megmarad, és minden haladásod - a sorozatod, a
            végigcsinált edzéseid, a fotóid - megőrizzük.
          </Text>
          <Text style={styles.body}>
            Ha egyszer visszajönnél, pontosan ott folytatod, ahol abbahagytad.
            Addig is: amit eddig megcsináltál, az megvan - azt senki nem veszi
            el.
          </Text>
          <Facts
            rows={[
              { label: "Hozzáférés eddig", value: accessUntil },
              { label: "További terhelés", value: "nincs" },
            ]}
          />
        </>
      ) : (
        <>
          <Text style={styles.body}>
            Ahogy kérted: a mostani időszakod végén automatikusan átváltunk az
            új csomagra - addig minden marad a régiben, tenned semmit nem kell.
          </Text>
          <Facts
            rows={[
              { label: "Jelenlegi csomag eddig", value: accessUntil },
              { label: "Utána", value: newPlanLine ?? "új csomag" },
            ]}
          />
        </>
      )}
      <Text style={styles.note}>
        Ha meggondolnád magad, a váltásig bármikor visszavonhatod a profilodban.
      </Text>
      <Cta href={`${APP_URL}/app/membership`}>Tagságom megnyitása</Cta>
      <Sign />
    </EmailLayout>
  );
}

CancelConfirm.PreviewProps = {
  variant: "cancel" as const,
  accessUntil: "2026. szeptember 9.",
};
