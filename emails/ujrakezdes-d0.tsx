// D0 - the delivery mail. Lead magnet v2 §5.
//
// TRANSACTIONAL: this is the thing the person just asked for, so it ships
// whether or not the marketing box was ticked. Everything after it is
// marketing and is consent-gated (Grtv. §6 - no soft opt-in in Hungary).
//
// The "six days" paragraph renders only for consented leads: promising a
// series to somebody who declined it would be both a broken promise and an
// unlawful one.

import * as React from "react";
import { Link, Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { APP_URL, color, styles } from "./tokens";

export const subject = "A heti terved";

export default function UjrakezdesD0({
  planHref, consented,
}: { planHref: string; consented: boolean }) {
  return (
    <EmailLayout preview="Bent van minden, az első edzéssel együtt.">
      <Text style={styles.eyebrow}>Szeptemberi újrakezdés</Text>
      <Text style={styles.h1}>A heti terved</Text>

      <Text style={styles.body}>Szia,</Text>
      <Text style={styles.body}>itt a terved:</Text>

      <Cta href={planHref}>Megnyitom a tervem</Cta>

      <Text style={styles.body}>
        Három dolog van benne: a heti beosztásod pihenőnapokkal, az első edzés
        (20–30 perc, eszköz nélkül — elég egy matrac és 2×2 méter), és a
        folytatás.
      </Text>

      <Panel>
        <PanelText>
          Egy tanács az első hétre: ne a legjobb napodra időzítsd az első
          edzést. Időzítsd egy átlagosra. Ha az megvan, a többi könnyebb.
        </PanelText>
      </Panel>

      {consented && (
        <Text style={styles.body}>
          Holnaptól hat napon át küldök egy-egy rövid levelet arról, hogyan
          szokott szétesni az első hét — és mit lehet ellene tenni.
        </Text>
      )}

      <Sign />

      <Text style={styles.small}>
        Ui. TV-n néznéd? Itt a leírás:{" "}
        <Link href={`${APP_URL}/app/profile`} style={{ color: color.accentInk }}>
          TV-re kötés
        </Link>
      </Text>
    </EmailLayout>
  );
}
