// §4a/3 - Password reset. Admin SDK generatePasswordResetLink() → SendGrid.
// Latency IS the product: hand off to SendGrid in seconds. Link expires in 1 hour.
// The requesting route must answer generically (no account enumeration).

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Új jelszó beállítása";

export default function PasswordReset({ resetUrl }: { resetUrl: string }) {
  return (
    <EmailLayout preview="Kattints, és állítsd be az új jelszavad - egy perc az egész.">
      <Text style={styles.eyebrow}>Fiók</Text>
      <Text style={styles.h1}>Új jelszó beállítása</Text>
      <Text style={styles.body}>
        Kaptunk egy kérést, hogy új jelszót szeretnél beállítani. Kattints a
        gombra - egy perc az egész.
      </Text>
      <Cta href={resetUrl}>Új jelszót állítok be</Cta>
      <Text style={styles.note}>
        A link 1 óráig érvényes, és csak egyszer használható. Ha nem te kérted,
        nyugodtan hagyd figyelmen kívül - a jelszavad nem változik.
      </Text>
    </EmailLayout>
  );
}

PasswordReset.PreviewProps = {
  resetUrl: "https://www.lexfit.hu/auth/action?mode=resetPassword&oobCode=demo",
};
