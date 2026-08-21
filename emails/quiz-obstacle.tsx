// E2 (+36h) - the first nurture mail, answering the obstacle the lead named
// themselves. Five variants, one per answer.
//
// The whole point is that this is NOT a generic newsletter: they told us what
// stopped them before, so this mail addresses that and nothing else. Every
// claim here is about how the product actually works - no statistics, no
// invented stories.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";

export type Obstacle =
  | "no_time" | "no_motivation" | "dont_know_how" | "gave_up" | "bad_experience";

const V: Record<Obstacle, { subject: string; h1: string; body: string[] }> = {
  no_time: {
    subject: "Tíz perc is edzés",
    h1: "„Nincs időm\" - értjük. És pont ezért rövidek.",
    body: [
      "A legtöbb terv azért bukik el, mert olyan időt kér, ami nincs meg. Nálad ez volt a fő akadály - szóval nézzük meg őszintén.",
      "A programjaink edzései 8-30 percesek, eszköz nélkül, otthon. Nem azért, mert kevesebbet ér, hanem mert amit tényleg megcsinálsz, az többet ér, mint amit kihagysz.",
      "És ha egy nap tényleg nincs meg a teljes edzés: a pihenőnap nálunk nem kudarc, hanem a terv része.",
    ],
  },
  no_motivation: {
    subject: "Amikor nincs kedved - pont akkor számít",
    h1: "A motiváció nem jön magától. Nem is kell, hogy jöjjön.",
    body: [
      "Azt írtad, a kedv hiánya tartott vissza. Ez a leggyakoribb válasz - és a legőszintébb.",
      "Nem fogunk azzal jönni, hogy „csak akard jobban\". Ehelyett: rövid, változatos blokkok, hetente más fókusszal, hogy ne ugyanaz a három gyakorlat menjen körbe-körbe.",
      "És van egy sorozatszámlálód. Nem verseny - csak egy szám, ami emlékeztet, hogy már elkezdted.",
    ],
  },
  dont_know_how: {
    subject: "Sosem kell kitalálnod, mi jön",
    h1: "„Nem tudom, hol kezdjem\" - ezt vesszük le rólad.",
    body: [
      "Azt írtad, az volt a gond, hogy nem tudtad, hol kezdj. Ez nem tudáshiány - ez tervezési feladat, és az a mi dolgunk.",
      "A programod sorrendbe van rakva: megnyitod, és ott a mai edzés. Videós vezetéssel, végig mondjuk, mit csinálj, meddig, és mire figyelj.",
      "Nem kell gyakorlatot válogatnod, ismétlésszámot számolnod, se eldöntened, mi jön holnap.",
    ],
  },
  gave_up: {
    subject: "Ezúttal ne az elején égj ki",
    h1: "Elkezdted már, és abbamaradt. Nézzük, miért.",
    body: [
      "A legtöbb újrakezdés azon bukik el, hogy az első hét túl kemény. Lelkesedésből sokat vállalunk, aztán három nap múlva minden fáj, és a negyediket már kihagyjuk.",
      "A programjaink fokozatosan terhelnek: az első hét szándékosan könnyebb, mint amit bírnál. Nem azért, hogy kíméljünk - azért, hogy legyen második heted is.",
      "A pihenőnap be van tervezve. Nem lemaradás, hanem a program része.",
    ],
  },
  bad_experience: {
    subject: "Senki nem néz, senki nem értékel",
    h1: "A rossz élmények nem rólad szóltak.",
    body: [
      "Azt írtad, rossz élmények tartottak vissza - tesióra, edzőterem, tükrök, tekintetek. Sokan pont emiatt nem kezdenek bele újra.",
      "Otthon edzel, a saját tempódban. Nincs csoport, nincs sorakozó, nincs teljesítménymérés másokhoz képest.",
      "Ha egy gyakorlat nem megy, ott a könnyebb változat - és nem kell magyarázkodnod érte senkinek.",
    ],
  },
};

export const subjectFor = (o: Obstacle) => V[o].subject;

export default function QuizObstacle({
  firstName, obstacle, unsubHref,
}: { firstName: string; obstacle: Obstacle; unsubHref: string }) {
  const v = V[obstacle];
  return (
    <EmailLayout preview={v.h1} footer="marketing" unsubHref={unsubHref}
      reason="Ezt az emailt azért kaptad, mert kitöltötted a LEXFIT tervkészítő kvízét, és kérted a tippjeinket.">
      <Text style={styles.eyebrow}>A te akadályod</Text>
      <Text style={styles.h1}>{v.h1}</Text>
      <Text style={styles.body}>Szia {firstName}!</Text>
      {v.body.map((p) => (
        <Text key={p} style={styles.body}>{p}</Text>
      ))}
      <Cta href={`${APP_URL}/register`}>Megnézem a programom</Cta>
      <Sign />
    </EmailLayout>
  );
}

QuizObstacle.PreviewProps = {
  firstName: "Anna",
  obstacle: "no_time" as Obstacle,
  unsubHref: "https://www.lexfit.hu/api/email/unsubscribe?uid=demo&kind=leadMarketing&t=demo",
};
