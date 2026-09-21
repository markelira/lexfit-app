// Start campaign, mail 3 of 4 - their own obstacle.
//
// The opening two paragraphs switch on `computed.segment`, which the lead
// chose themselves in the quiz - this is recall, not profiling, and it is the
// cheapest relevance available: same body, different door. Distribution across
// the 223 mailable leads: restart 96, stronger 57, no_energy 39, careful 23,
// browsing 8. `browsing` falls back to the restart text rather than getting a
// mail written for a segment of eight.
import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { styles } from "./tokens";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";
import type { Anchor } from "@/lib/ujrakezdes/types";
import { segmentOf } from "@/lib/start-campaign/sequence";

type Seg = Exclude<Anchor, "browsing">;

const OPENERS: Record<Seg, { subject: string; preview: string; lines: [string, string] }> = {
  restart: {
    subject: "Nem a harmadik hét a hibás",
    preview: "Az elakadás ritkán lustaság.",
    lines: [
      "Azt írtad, hogy újra neki akarsz futni. Ez azt is jelenti, hogy volt már legalább egy előző futás, ami elakadt.",
      "A legtöbb elakadás nem lustaság. A harmadik hét környékén egyszerűen elfogy az, ami eddig vitte: az újdonság. Ami utána tart, az egy terv, amit nem neked kell fejben tartanod.",
    ],
  },
  no_energy: {
    subject: "Este hatkor már nincs mit eldönteni",
    preview: "A döntés fáraszt, nem a harminc perc.",
    lines: [
      "Azt írtad, hogy az energia a szűk keresztmetszet. Ez nem kifogás, hanem a nap végi valóság.",
      "Ezért van a Startban minden sorrendbe rakva. Nem kell eldöntened, mit csinálj ma - megnyitod, elindítod, kész. A döntés az, ami fárasztó, nem a harminc perc.",
    ],
  },
  careful: {
    subject: "Ha a térded vagy a derekad szól bele",
    preview: "A listánkon tízből majdnem hatan írtak ilyet.",
    lines: [
      "Azt jelezted, hogy óvatosan kell edzened. Ez a leggyakoribb dolog a listánkon: tízből majdnem hatan írtak térdet, derekat, vagy azt, hogy halkan kell mozogniuk.",
      "A Start otthoni, eszköz nélküli program. Nincs benne teremgép, ami egy méretre van állítva, és nem kell hozzá senkinek a szeme előtt edzened.",
    ],
  },
  stronger: {
    subject: "Az erő nem a súlyokon múlik",
    preview: "Hanem azon, hogy ne kelljen minden nap újra eldöntened.",
    lines: [
      "Azt írtad, erősebb akarsz lenni. Ehhez nem terem kell, hanem következetesség - és az jön a legnehezebben, amikor minden edzés előtt újra el kell dönteni, mi legyen.",
      "A Start ezt a részt oldja meg: nyolc hétre kész a sorrend.",
    ],
  },
};

export { segmentOf };

export const subjectFor = (seg: Seg) => OPENERS[seg].subject;

export default function StartC3({
  unsubHref,
  ctaHref,
  segment,
}: {
  unsubHref: string;
  ctaHref: string;
  segment: Seg;
}) {
  const o = OPENERS[segment];
  const price = formatHuf(PRICES.program_foundation.amountHuf);
  return (
    <EmailLayout
      preview={o.preview}
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az e-mailt azért kaptad, mert elkészítetted a heti tervedet a LEXFIT-en, és kérted Alexa leveleit."
    >
      <Text style={styles.eyebrow}>Lexfit Start</Text>
      <Text style={styles.h1}>{o.subject}</Text>

      <Text style={styles.body}>Szia,</Text>
      <Text style={styles.body}>{o.lines[0]}</Text>
      <Text style={styles.body}>{o.lines[1]}</Text>
      <Text style={styles.body}>
        8 hét, 35 edzés, otthonra. Egyszer fizetsz: {price}. Nem előfizetés.
      </Text>

      <Cta href={ctaHref}>Megnézem a programot</Cta>

      <Sign />

      <Text style={styles.small}>
        PS: Ha most nem aktuális, nyugodtan hagyd. Még egy levelet írok erről,
        aztán nem térek vissza rá.
      </Text>
    </EmailLayout>
  );
}
