// 10 edzés garancia - refund confirmed. Trigger: POST /api/admin/guarantee-refund.
//
// Deliberately NOT the withdrawal template with different numbers. This is a
// voluntary commercial guarantee: the member did the ten workouts, decided it
// was not for them, and gets back everything they paid - not a pro-rata share.
// The tone follows the promise on the page ("nem kérdezünk, nem győzködünk"),
// so there is no save attempt and no survey here.

import * as React from "react";
import { Text } from "react-email";
import { EmailLayout } from "./components/EmailLayout";
import { Facts } from "./components/Bits";
import { styles } from "./tokens";

export const subject = "Visszautaltuk a tagsági díjad";

export default function GuaranteeRefundConfirm({ refundAmount }: { refundAmount: string }) {
  return (
    <EmailLayout preview="A 10 edzés garancia alapján visszautaltuk az addig befizetett tagsági díjad.">
      <Text style={styles.eyebrow}>10 edzés garancia</Text>
      <Text style={styles.h1}>Visszautaltuk a tagsági díjad</Text>
      <Text style={styles.body}>
        Megcsináltad az első tíz edzést, és úgy döntöttél, hogy ez nem a tiéd.
        Rendben - ahogy ígértük: visszautaljuk az addig befizetett tagsági díjad,
        ugyanarra a kártyára, amivel fizettél. Nem kérdezünk semmit.
      </Text>
      <Facts
        rows={[
          { label: "Visszatérítés", value: refundAmount },
          { label: "Várható idő", value: "5–10 munkanap" },
        ]}
      />
      <Text style={styles.note}>
        A hozzáférésed lezárult, a haladásod viszont megmarad - ha valamikor
        újrakezdenéd, ott folytatod, ahol abbahagytad. A jóváíró számlát a
        Billingo külön emailben küldi. Ha kérdésed van, erre az emailre válaszolva
        elérsz minket.
      </Text>
    </EmailLayout>
  );
}

GuaranteeRefundConfirm.PreviewProps = { refundAmount: "5 990 Ft" };
