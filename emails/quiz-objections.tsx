// E5 (+10 days) - the honest objection mail.
//
// ⚠️ DELIBERATE DEVIATION FROM THE SPEC. §12 asks for "objection handling +
// guarantee". We must NOT market a guarantee: our own ÁSZF §10.3 says, in so
// many words, that the refund "nem »pénzvisszafizetési garanciaként« hirdeti:
// ez a Fogyasztót jogszabály alapján megillető jog" - it is a statutory right
// (45/2014. Korm. r.), not a promise we invented. Dressing it up as a
// guarantee would contradict our own terms and overstate what the buyer gets:
// the refund is PROPORTIONAL to the unused period, not the full amount back.
//
// So the withdrawal right is stated accurately, and the reassurance comes from
// the parts that are genuinely ours: cancel in one click, no lock-in.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, styles } from "./tokens";
import type { Obstacle } from "./quiz-obstacle";

export const subject = "Ami még visszatarthat";

const REASSURANCE: Record<Obstacle, string> = {
  no_time:
    "Ha egy héten csak kétszer fér bele, az is előrelépés. A program nem esik szét attól, ha kihagysz egy napot.",
  no_motivation:
    "Nem kell lelkesnek lenned hozzá. Elég megnyitni, és hagyni, hogy a videó vezessen - a lendület utána jön.",
  dont_know_how:
    "Nem kell tudnod semmit előre. Az első edzés az alapoktól indul, és végig mondjuk, mit csinálj.",
  gave_up:
    "Ha korábban abbamaradt, az nem rólad szólt. A fokozatos terhelés pont azért van, hogy legyen második heted is.",
  bad_experience:
    "Otthon, egyedül, a saját tempódban. Nincs, aki nézzen, és nincs, akihez mérned kellene magad.",
};

export default function QuizObjections({
  firstName, obstacle, unsubHref,
}: { firstName: string; obstacle: Obstacle; unsubHref: string }) {
  return (
    <EmailLayout
      preview="Bármikor lemondhatod, és 14 napon belül el is állhatsz."
      footer="marketing"
      unsubHref={unsubHref}
      reason="Ezt az emailt azért kaptad, mert kitöltötted a LEXFIT tervkészítő kvízét, és kérted a tippjeinket."
    >
      <Text style={styles.eyebrow}>Őszintén</Text>
      <Text style={styles.h1}>Mi történik, ha mégsem válik be?</Text>
      <Text style={styles.body}>Szia {firstName}!</Text>
      <Text style={styles.body}>
        A legtöbben nem azért nem kezdenek bele, mert nem hiszik el, hogy
        működik. Hanem mert nem akarnak beleragadni valamibe.
      </Text>

      <Text style={styles.body}>
        <strong>Bármikor lemondhatod.</strong> Egy kattintás a profilodban, nem
        kell emailt írnod és nem kérdezünk vissza. A lemondás után a már
        kifizetett időszak végéig marad a hozzáférésed.
      </Text>

      <Panel>
        <PanelText>
          <strong>14 napos elállási jog.</strong> A vásárlástól számított 14
          napon belül indokolás nélkül felmondhatod. Ilyenkor a fel nem használt
          időszakra eső díjat időarányosan visszatérítjük - a már eltelt napokra
          eső rész levonásával. Ez nem a mi „garanciánk\", hanem a jogszabály
          szerint téged megillető jog (45/2014. Korm. rendelet).
        </PanelText>
      </Panel>

      <Text style={styles.body}>{REASSURANCE[obstacle]}</Text>

      <Cta href={`${APP_URL}/register`}>Kipróbálom</Cta>
      <Sign />
    </EmailLayout>
  );
}

QuizObjections.PreviewProps = {
  firstName: "Anna",
  obstacle: "gave_up" as Obstacle,
  unsubHref: "https://www.lexfit.hu/api/email/unsubscribe?uid=demo&kind=leadMarketing&t=demo",
};
