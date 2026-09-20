// P1 - programme purchase delivered. Trigger: checkout.session.completed for a
// one-time programme price. This email IS the product handover: the buyer paid
// without ever making an account, so the link below is the only way in, and it
// doubles as the password-setting step. Transactional - never consent-gated.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Facts, Sign } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "A programod elindulhat - itt a belépőd";

export default function ProgramAccess({
  programTitle,
  sessionCount,
  priceLine,
  setPasswordUrl,
  guaranteeDays,
}: {
  programTitle: string;
  sessionCount: number;
  priceLine: string;
  /** Firebase password-set link - it is also how the address gets verified. */
  setPasswordUrl: string;
  guaranteeDays: number;
}) {
  return (
    <EmailLayout preview={`${programTitle} - a tiéd, örökre. Állíts be egy jelszót, és kezdd el.`}>
      <Text style={styles.eyebrow}>Megvan</Text>
      <Text style={styles.h1}>A {programTitle} a tiéd</Text>
      <Text style={styles.body}>
        Köszönöm, hogy belevágtál. Egy dolog van hátra: állíts be egy jelszót,
        és a program azonnal megnyílik. Nem kell regisztrálnod - a fiókod már
        elkészült erre a címre.
      </Text>
      <Cta href={setPasswordUrl}>Jelszó beállítása és kezdés</Cta>
      <Facts
        rows={[
          { label: "Program", value: programTitle },
          { label: "Edzések", value: `${sessionCount} edzés` },
          { label: "Fizettél", value: priceLine },
          { label: "Meddig a tiéd", value: "Örökre - nem jár le" },
        ]}
      />
      <Text style={styles.note}>
        Ez egyszeri vásárlás: nem előfizetés, nem újul meg, soha nem vonunk le
        többet. Ha {guaranteeDays} napon belül úgy érzed, nem a tiéd, írj egy
        sort és visszautaljuk - indoklás nélkül. A számlát a Billingo küldi külön
        emailben.
      </Text>
      <Sign />
    </EmailLayout>
  );
}

ProgramAccess.PreviewProps = {
  programTitle: "Lexfit Start",
  sessionCount: 35,
  priceLine: "9 990 Ft, egyszer",
  setPasswordUrl: "https://lexfit.hu/",
  guaranteeDays: 14,
};
