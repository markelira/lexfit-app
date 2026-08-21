// GDPR rights confirmation for a quiz lead (no account, so no login to gate on).
// The link proves control of the mailbox - see src/lib/quiz/lead-token.ts.
// Transactional: it answers a request the person just made, so it is never
// gated on marketing consent and carries no unsubscribe footer.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Erősítsd meg a kérésed - LEXFIT";

export default function LeadRightsConfirm({
  action,
  confirmUrl,
}: {
  action: "erase" | "export";
  confirmUrl: string;
}) {
  const erasing = action === "erase";
  return (
    <EmailLayout preview={erasing ? "Egy kattintás, és törlünk mindent." : "Egy kattintás, és elküldjük az adataid."}>
      <Text style={styles.eyebrow}>Adatkezelés</Text>
      <Text style={styles.h1}>
        {erasing ? "Töröljük az adataid?" : "Elküldjük az adataid?"}
      </Text>
      <Text style={styles.body}>
        {erasing
          ? "Azt kérted, hogy töröljük a kvíz kitöltésekor megadott adataidat. Erősítsd meg a gombbal - utána nem lehet visszavonni."
          : "Azt kérted, hogy küldjük el, milyen adatokat tárolunk rólad a kvíz kitöltése óta. Erősítsd meg a gombbal."}
      </Text>
      <Cta href={confirmUrl}>
        {erasing ? "Igen, töröljétek" : "Igen, küldjétek el"}
      </Cta>
      <Text style={styles.note}>
        A link 24 óráig érvényes. Ha nem te kérted, egyszerűen hagyd figyelmen
        kívül - magától semmi nem történik.
      </Text>
    </EmailLayout>
  );
}

LeadRightsConfirm.PreviewProps = {
  action: "erase" as const,
  confirmUrl: "https://www.lexfit.hu/api/quiz-lead/rights/confirm?id=demo",
};
