// §4b/10 — Withdrawal (14-day elállás) confirmed. Trigger: /api/withdrawal success
// (route currently only notifies the admin — the user send is the missing piece,
// consumer-law relevant). Billingo issues the credit note separately.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Facts } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Elállásod megerősítve";

export default function WithdrawalConfirm({
  refundAmount,
  zeroRefund = false,
}: {
  refundAmount: string;
  /** True when the used period left nothing to refund. */
  zeroRefund?: boolean;
}) {
  return (
    <EmailLayout preview="Megkaptuk az elállási nyilatkozatodat — ezúton megerősítjük.">
      <Text style={styles.eyebrow}>Elállás</Text>
      <Text style={styles.h1}>Elállásod megerősítve</Text>
      <Text style={styles.body}>
        {zeroRefund
          ? "A 14 napos elállási jogoddal éltél — rendben, ezúton megerősítjük. A már felhasznált időszak alapján visszatérítendő összeg nem keletkezett."
          : "A 14 napos elállási jogoddal éltél — rendben, ezúton megerősítjük. A fel nem használt időszak árát visszatérítjük ugyanarra a kártyára, amivel fizettél."}
      </Text>
      {!zeroRefund && (
        <Facts
          rows={[
            { label: "Visszatérítés", value: refundAmount },
            { label: "Várható idő", value: "5–10 munkanap" },
          ]}
        />
      )}
      <Text style={styles.note}>
        A hozzáférésed lezárult; a fiókod és a haladásod megmarad, ha egyszer
        újrakezdenéd. A jóváíró számlát a Billingo külön emailben küldi. Ha
        kérdésed van, erre az emailre válaszolva elérsz minket.
      </Text>
    </EmailLayout>
  );
}

WithdrawalConfirm.PreviewProps = { refundAmount: "490 Ft" };
