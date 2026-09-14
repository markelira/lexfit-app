// Orphan-rescue (CRO sprint P0-2, 2026-09-13): the Meta INSTANT FORM captured
// leads who never reached the site - they asked for the weekly plan on
// Facebook and got nothing. This one-time mail FULFILS that request
// (transactional service delivery, not marketing: no sequence enrolment, no
// unsubscribe theatre - the mail itself promises there will be no more), by
// walking them to the 7 questions the plan is built from.
//
// The CTA carries ?e= (base64url email) so the gate arrives pre-filled, and
// src=form_recovery + utm_content=orphan_rescue so every click is separable
// in GA.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "A heti terved - egy lépés van hátra";

const preview = "7 rövid kérdés, és kész a terved - pihenőnapokkal.";

export default function FormRecovery({ ctaHref }: { ctaHref: string }) {
  return (
    <EmailLayout preview={preview}>
      <Text style={styles.eyebrow}>Szeptemberi Újrakezdés</Text>
      <Text style={styles.h1}>{subject}</Text>

      <Text style={styles.body}>Szia,</Text>
      <Text style={styles.body}>
        a Facebookon kérted a heti edzéstervedet. Ahhoz, hogy tényleg a tiéd
        legyen, 7 rövid kérdésre kell válaszolnod - abból áll össze a terv,
        pihenőnapokkal, a te szintedhez igazítva. Két percnél nem tart tovább.
      </Text>

      <Cta href={ctaHref}>Kérem a tervem</Cta>

      <Text style={styles.body}>
        Ha mégsem aktuális, ne foglalkozz vele - több levelet nem küldünk
        ebben az ügyben.
      </Text>

      <Sign />
    </EmailLayout>
  );
}
