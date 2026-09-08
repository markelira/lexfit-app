import type { Metadata } from "next";
import Landing from "./Landing";
import { lpVariantFor } from "./copy";

// Lead magnet v2 - the ad landing page.
//
// A public, anonymous marketing page that lives OUTSIDE the funnel's four
// routes, so none of the routing assertions in scripts/funnel-selftest.ts apply
// to it and none can be broken by it.

export const metadata: Metadata = {
  title: "7 kérdés, és kész a heti edzésterved | LEXFIT",
  description:
    "7 kérdés, és kész a heti edzésterved. Otthonra, eszköz nélkül, pihenőnapokkal — Alexával. Azoknak, akik már többször újrakezdték.",
  // Paid traffic only. A half-funnel entry point is a poor organic result and
  // must not compete with the landing page in search - same call as /terv.
  robots: { index: false, follow: true },
};

export default async function UjrakezdesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // The hero variant is chosen HERE, on the server, from the ad's utm_content
  // (design handoff §7 S1b) - so the right headline is in the first byte of
  // HTML and there is no client-side flash. Unknown or missing → base.
  const sp = await searchParams;
  const utm = typeof sp.utm_content === "string" ? sp.utm_content : undefined;
  return <Landing variant={lpVariantFor(utm)} />;
}
