// E4 (+6 days) - the offer.
//
// ⚠️ TWO DELIBERATE DEVIATIONS FROM THE SPEC.
//
// 1. §12 says "free trial / discounted first month". There is no free trial in
//    the product and no monthly discount - the real entry offer is 490 Ft for
//    the first week, then the standard weekly price, auto-renewing. Promising
//    otherwise would be a false price claim, which is both a consumer-law
//    problem and the exact thing D7 was decided to stop.
//
// 2. §12 says "with a deadline". We do not have a real deadline: the intro
//    price is the standing entry offer, not a campaign that expires. A
//    countdown we do not honour is a dark pattern, so the urgency here is
//    honest instead - the cost of not starting, not a fake clock.
//
// If marketing wants a genuine time-boxed offer, that is a pricing change
// first (a new Stripe price with real dates), and this copy follows it.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Facts, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Az első heted 490 Ft";

export default function QuizOffer({
  firstName, introPrice, stdPrice, unsubHref,
}: { firstName: string; introPrice: string; stdPrice: string; unsubHref: string }) {
  return (
    <EmailLayout
      preview={`${introPrice} az első hét. Utána ${stdPrice}/hét, bármikor lemondható.`}
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az emailt azért kaptad, mert kitöltötted a LEXFIT tervkészítő kvízét, és kérted az ajánlatainkat."
    >
      <Text style={styles.eyebrow}>Ajánlat</Text>
      <Text style={styles.h1}>Egy hét {introPrice}. Ennyi a belépő.</Text>
      <Text style={styles.body}>Szia {firstName}!</Text>
      <Text style={styles.body}>
        Egy hete megvan a terved. Ha még nem kezdted el, valószínűleg nem azért,
        mert rossz a terv - hanem mert a kezdés a nehéz.
      </Text>
      <Text style={styles.body}>
        Ezért van az első hét {introPrice}: hogy a döntés kicsi legyen.
      </Text>

      <Facts
        rows={[
          { label: "Első hét", value: introPrice },
          { label: "Utána", value: `${stdPrice}/hét` },
          { label: "Lemondás", value: "bármikor, a profilodban" },
        ]}
      />

      <Text style={styles.body}>
        Az előfizetés automatikusan megújul, és egy kattintással lemondható -
        nem kell emailt írnod, nem kell indokolnod.
      </Text>
      <Text style={styles.body}>
        Nem sürgetünk határidővel, mert nincs ilyen. Csak annyi: minden héttel,
        amit kihagysz, ugyanott maradsz.
      </Text>

      <Cta href={`${APP_URL}/register`}>Kezdem az első hetem</Cta>
      <Sign />
    </EmailLayout>
  );
}

QuizOffer.PreviewProps = {
  firstName: "Anna",
  introPrice: "490 Ft",
  stdPrice: "1 990 Ft",
  unsubHref: "https://www.lexfit.hu/api/email/unsubscribe?uid=demo&kind=leadMarketing&t=demo",
};
