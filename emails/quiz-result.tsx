// E1 - the quiz result, mailed the moment the lead submits.
//
// TRANSACTIONAL, and that classification is load-bearing: this is the thing the
// person asked for by handing over their email, so it goes out whether or not
// they ticked the marketing box. Everything after E1 in the sequence is
// marketing and needs that tick (Grtv. §6 - Hungary has no soft opt-in).
//
// The numbers here are the SERVER's, never the client's.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Facts, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Itt a személyes terved";

export default function QuizResult({
  firstName,
  maintenanceKcal,
  goalKcal,
  programTitle,
  stepsTarget,
  bonusTitle,
}: {
  firstName: string;
  maintenanceKcal: number;
  goalKcal: number;
  programTitle: string;
  stepsTarget: number;
  bonusTitle?: string | null;
}) {
  const hu = (n: number) => n.toLocaleString("hu-HU");
  return (
    <EmailLayout preview={`A programod: ${programTitle}. Itt a kalória- és lépéscélod is.`}>
      <Text style={styles.eyebrow}>A terved</Text>
      <Text style={styles.h1}>Szia {firstName}, itt a terved!</Text>
      <Text style={styles.body}>
        Ahogy ígértük, elküldjük írásban is - hogy meglegyen, amikor kell.
      </Text>

      <Facts
        rows={[
          { label: "Szinten tartó kalóriád", value: `kb. ${hu(maintenanceKcal)} kcal/nap` },
          { label: "A célodhoz ajánlott", value: `kb. ${hu(goalKcal)} kcal/nap` },
          { label: "Napi lépéscélod", value: hu(stepsTarget) },
          { label: "A programod", value: programTitle },
          ...(bonusTitle ? [{ label: "Ajándékba", value: bonusTitle }] : []),
        ]}
      />

      <Text style={styles.body}>
        A kalóriaszám becslés a megadott adataid alapján - iránymutatásnak
        tökéletes, nem kell grammra követni.
      </Text>
      <Text style={styles.body}>
        A többihez ott leszünk minden edzésnél. Neked már csak el kell kezdened.
      </Text>

      <Cta href={`${APP_URL}/register`}>Kezdem a programom - az első hét 490 Ft</Cta>

      <Text style={styles.small}>
        A kvíz eredménye tájékoztató jellegű, nem minősül orvosi tanácsnak. Ha
        krónikus betegséged van, edzés előtt konzultálj orvosoddal.
      </Text>
      <Sign />
    </EmailLayout>
  );
}

QuizResult.PreviewProps = {
  firstName: "Anna",
  maintenanceKcal: 1850,
  goalKcal: 1600,
  programTitle: "Első Lépés - 7 napos kezdő program",
  stepsTarget: 8000,
  bonusTitle: "Láb & Fenék Challenge",
};
