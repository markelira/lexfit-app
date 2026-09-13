import * as React from "react";
import { Text } from "react-email";
import { Cta, Panel, PanelText } from "./Bits";
import { styles } from "../tokens";
import { GUARANTEE_LIVE } from "@/components/landing/offer-copy";

// The offer, in one breath (email audit 2026-09-13, F4: D6 asked the reader
// to assemble four prices and two constructs before the 490 appeared).
// Three facts a 6th grader can repeat - price, scope, guarantee - then ONE
// action. Every amount arrives interpolated from PRICES via the caller
// (F0.5: no forint literal lives in a template).
//
// While the guarantee flag is off, the third line falls back to the
// statutory cancel/withdrawal facts - the box must never promise something
// the terms don't hold.

export function OfferBox({
  intro,
  weekStd,
  month,
  annual,
  ctaHref,
}: {
  intro: string;
  weekStd: string;
  month: string;
  annual: string;
  ctaHref: string;
}) {
  return (
    <>
      <Panel>
        <PanelText>
          <strong>Az első heted {intro}.</strong>
          <br />
          Benne van minden edzés és minden program.
          <br />
          {GUARANTEE_LIVE ? (
            <>
              Csináld végig az első 10 edzést — ha nem vált be,{" "}
              <strong>visszakapod a pénzed.</strong>
            </>
          ) : (
            <>Bármikor lemondhatod, egy kattintással.</>
          )}
        </PanelText>
      </Panel>

      <Cta href={ctaHref}>Kezdem — az első hét {intro}</Cta>

      <Text style={styles.small}>
        Utána {weekStd} / hét — a pontos dátumot a fizetés előtt kiírjuk, és a
        megújulás előtt e-mailben szólunk. Ha tudod, hogy maradsz: havi {month},
        vagy {annual} egy évre — a fizetés után egy kattintással váltasz.
      </Text>
    </>
  );
}
