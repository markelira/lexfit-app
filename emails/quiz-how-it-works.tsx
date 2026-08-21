// E3 (+3 days) - what the product actually is.
//
// ⚠️ DELIBERATE DEVIATION FROM THE SPEC. §12 asks for a "Hungarian success
// story / social proof" here. There is no real customer story to tell yet, and
// inventing one would be a fabricated testimonial - not a copy shortcut but a
// false claim about real people, and exactly the class of thing the landing
// page purge removed (docs/landing-analysis/FIX.md).
//
// So this mail earns its place a different way: it explains what the person
// gets, using only things the product verifiably does. When real testimonials
// exist, this is the natural place to add them.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export const subject = "Mi vár rád, ha belevágsz";

export default function QuizHowItWorks({
  firstName, programTitle, unsubHref,
}: { firstName: string; programTitle: string; unsubHref: string }) {
  return (
    <EmailLayout
      preview="Vezetett program, videótár, kihívások - és egy sorozat, ami számol."
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az emailt azért kaptad, mert kitöltötted a LEXFIT tervkészítő kvízét, és kérted a tippjeinket."
    >
      <Text style={styles.eyebrow}>Hogyan működik</Text>
      <Text style={styles.h1}>Nem videók halmaza. Egy terv.</Text>
      <Text style={styles.body}>Szia {firstName}!</Text>
      <Text style={styles.body}>
        Pár napja megkaptad a terved. Most elmondjuk, mi van mögötte - hogy tudd,
        mibe vágsz bele.
      </Text>

      <Panel>
        <PanelText>
          <strong>A programod: {programTitle}.</strong> Sorrendbe rakott edzések,
          videós vezetéssel. Megnyitod, és ott a mai. Nem kell kitalálnod semmit.
        </PanelText>
      </Panel>

      <Text style={styles.body}>
        <strong>Videótár.</strong> Ha egy nap mást szeretnél - rövidebbet,
        nyugodtabbat, más testrészre -, kereshetsz hossz, fókusz és intenzitás
        szerint.
      </Text>
      <Text style={styles.body}>
        <strong>Kihívások.</strong> Néhány napos, fókuszált sorozatok, ha kell
        egy kis lendület a rutin mellé.
      </Text>
      <Text style={styles.body}>
        <strong>Haladás.</strong> Látod az elvégzett edzéseket és a sorozatod.
        Ha szeretnéd, fotókkal is követheted - de azok csak a tiéd maradnak, soha
        nem nyilvánosak.
      </Text>
      <Text style={styles.body}>
        Minden otthon, eszköz nélkül. Elég egy matrac és annyi hely, amennyibe
        elférsz.
      </Text>

      <Cta href={`${APP_URL}/register`}>Belevágok</Cta>
      <Sign />
    </EmailLayout>
  );
}

QuizHowItWorks.PreviewProps = {
  firstName: "Anna",
  programTitle: "Első Lépés - 7 napos kezdő program",
  unsubHref: "https://www.lexfit.hu/api/email/unsubscribe?uid=demo&kind=leadMarketing&t=demo",
};
