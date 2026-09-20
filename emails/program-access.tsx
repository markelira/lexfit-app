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
  signInUrl,
  guaranteeDays,
}: {
  programTitle: string;
  sessionCount: number;
  priceLine: string;
  /** Firebase passwordless sign-in link - these buyers never set a password. */
  signInUrl: string;
  guaranteeDays: number;
}) {
  return (
    <EmailLayout preview={`${programTitle} - a tiéd, örökre. Egy koppintás, és kezdheted.`}>
      <Text style={styles.eyebrow}>Megvan</Text>
      <Text style={styles.h1}>A {programTitle} a tiéd</Text>
      <Text style={styles.body}>
        Köszönöm, hogy belevágtál. A fiókod elkészült erre a címre, és ez a link
        beléptet - jelszó nem kell, sem most, sem később. Tedd el ezt a levelet:
        ha kilépnél, innen bármikor visszajutsz.
      </Text>
      <Cta href={signInUrl}>Kezdjük az első edzést</Cta>
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
  signInUrl: "https://www.lexfit.hu/",
  guaranteeDays: 14,
};
