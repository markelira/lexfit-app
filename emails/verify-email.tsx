// §4a/2 - Email verification. Admin SDK generateEmailVerificationLink() → SendGrid.
// Link expires in 3 days (Firebase default) - the copy says so.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Erősítsd meg az e-mail-címed";

export default function VerifyEmail({ verifyUrl }: { verifyUrl: string }) {
  return (
    <EmailLayout preview="Egy kattintás, és kész - így biztosan elérünk.">
      <Text style={styles.eyebrow}>Fiók</Text>
      <Text style={styles.h1}>Erősítsd meg az e-mail-címed</Text>
      <Text style={styles.body}>
        Egy kattintás, és kész - így biztosan eljutnak hozzád a fiókodhoz
        tartozó emailek.
      </Text>
      <Cta href={verifyUrl}>Megerősítem</Cta>
      <Text style={styles.note}>
        A link 3 napig érvényes. Ha nem te hoztad létre a fiókot, hagyd
        figyelmen kívül ezt az emailt - nem történik semmi.
      </Text>
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  verifyUrl: "https://www.lexfit.hu/auth/action?mode=verifyEmail&oobCode=demo",
};
