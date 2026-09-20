// Passwordless sign-in link. Trigger: someone asks to get back into their
// account from /belepes.
//
// Programme buyers (P1) never set a password - they paid, the account was built
// from the receipt, and they were signed in on the spot. This email is the only
// way back in after a sign-out or on a second device, so it is transactional in
// the strictest sense and carries no unsubscribe.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "A belépő linked";

export default function LoginLink({
  signInUrl,
  validMinutes,
}: {
  signInUrl: string;
  validMinutes: number;
}) {
  return (
    <EmailLayout preview="Egy koppintás, és bent vagy. Nem kell jelszó.">
      <Text style={styles.eyebrow}>Belépés</Text>
      <Text style={styles.h1}>Egy koppintás, és bent vagy</Text>
      <Text style={styles.body}>
        Nincs jelszavad, és nem is kell - ez a link beléptet. Ugyanarról az
        eszközről nyisd meg, ahonnan kérted.
      </Text>
      <Cta href={signInUrl}>Belépek</Cta>
      <Text style={styles.note}>
        A link {validMinutes} percig él, és csak egyszer használható. Ha nem te
        kérted, nyugodtan hagyd figyelmen kívül - amíg nem nyitod meg, nem
        történik semmi.
      </Text>
      <Sign />
    </EmailLayout>
  );
}

LoginLink.PreviewProps = {
  signInUrl: "https://www.lexfit.hu/auth/action",
  validMinutes: 60,
};
