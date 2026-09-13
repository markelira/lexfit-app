// Checkout-abandonment recovery (P0-2 of docs/lead-conversion-diagnosis.md).
//
// Fired by the Stripe webhook when a Checkout session EXPIRES for a user who
// still has no access: they picked a plan, created the account, and stalled at
// the card form. In this funnel that is very often not a decision but a
// browser: the Facebook in-app webview breaks embedded checkout (no Google
// Pay, no autofill, iframe/cookie failures). An email is the escape hatch -
// it opens in the person's REAL browser, where the same checkout just works.
//
// TONE. Not a discount, not urgency (offer v3 §2: none, ever), no guilt. One
// job: reopen the door and name the price they already chose. The browser hint
// is phrased as help, not as an excuse.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Cta, Panel, PanelText, Sign } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Egy lépésre álltál meg";

const preview = "A terved és a választott csomagod is megvan még.";

export default function CheckoutResume({
  ctaHref, roleName, introLine,
}: {
  /** The plan-preselected join wizard - lands on the pay step's plan picker. */
  ctaHref: string;
  /** The chosen plan's display name, e.g. „Heti". */
  roleName: string;
  /** The price sentence for the chosen plan, composed by the mailer from
   *  PRICES - no forint literal lives in a template (F0.5 hard rule). */
  introLine: string;
}) {
  return (
    <EmailLayout preview={preview}>
      <Text style={styles.eyebrow}>LEXFIT</Text>
      <Text style={styles.h1}>{subject}</Text>

      <Text style={styles.body}>Szia,</Text>
      <Text style={styles.body}>
        elindítottad a csatlakozást ({roleName}), de a fizetés végül nem ment
        át. Semmi gond — a fiókod és a terved is megvan, ott folytathatod, ahol
        abbahagytad.
      </Text>

      <Panel>
        <PanelText>
          Egy gyakori ok: a Facebook és az Instagram beépített böngészője
          sokszor elakad a kártyás fizetésnél. Ez a levél már a saját
          böngésződben nyílik meg, onnan simán megy.
        </PanelText>
      </Panel>

      <Text style={styles.body}>{introLine}</Text>

      <Cta href={ctaHref}>Folytatom a fizetést</Cta>

      <Text style={styles.body}>
        Ha közben meggondoltad magad, az is rendben van — a heti terved akkor
        is a tiéd marad.
      </Text>

      <Sign />
    </EmailLayout>
  );
}
