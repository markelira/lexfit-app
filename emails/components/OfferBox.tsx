import * as React from "react";
import { Text } from "react-email";
import { Cta, Panel, PanelText } from "./Bits";
import { styles } from "../tokens";
import { GUARANTEE_LIVE } from "@/components/landing/offer-copy";
import { REVEAL } from "@/app/ujrakezdes/copy";

// The offer, in one breath (email audit 2026-09-13, F4: D6 asked the reader
// to assemble four prices and two constructs before the 490 appeared).
// Three facts a 6th grader can repeat - price, scope, guarantee - then ONE
// action. Every amount arrives interpolated from PRICES via the caller
// (F0.5: no forint literal lives in a template).
//
// ALIGNED TO THE REVEAL (2026-09-14). The mail and the page she lands on must
// make the same offer in the same order, or the click feels like a bait: the
// scope line quotes REVEAL.cinema.libLine verbatim (one source, so 130 can
// never mean something else here), the verb matches the reveal's CTA, and the
// trust row closes it for the same reason it does there - on a phone, "is this
// safe" is the last unasked question.
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
          {REVEAL.cinema.libLine} - az első naptól mind.
          <br />
          {GUARANTEE_LIVE ? (
            <>
              Csináld végig az első 10 edzést - ha nem vált be,{" "}
              <strong>visszakapod a pénzed.</strong>
            </>
          ) : (
            <>Bármikor lemondhatod, egy kattintással.</>
          )}
        </PanelText>
      </Panel>

      {/* Same verb as every CTA on the reveal: for a fifth restart the fear is
          the stopping, not the starting. */}
      <Cta href={ctaHref}>Csináljuk végig - az első hét {intro}</Cta>

      <Text style={styles.small}>
        Utána {weekStd} / hét - a pontos dátumot a fizetés előtt kiírjuk, és a
        megújulás előtt e-mailben szólunk. Ha tudod, hogy maradsz: havi {month},
        vagy {annual} egy évre - a fizetés után egy kattintással váltasz.
      </Text>

      <Text style={styles.small}>{REVEAL.cinema.trust.join(" · ")}</Text>
    </>
  );
}
