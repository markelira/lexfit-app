import type { Metadata } from "next";
import Landing from "./Landing";

// Lead magnet v2 - the ad landing page.
//
// A public, anonymous marketing page that lives OUTSIDE the funnel's four
// routes, so none of the routing assertions in scripts/funnel-selftest.ts apply
// to it and none can be broken by it.

export const metadata: Metadata = {
  title: "Szeptemberi újrakezdés — kész a heti edzésterved | LEXFIT",
  description:
    "7 kérdés, és kész a heti edzésterved. Otthonra, eszköz nélkül, pihenőnapokkal — Alexával. Azoknak, akik már többször újrakezdték.",
  // Paid traffic only. A half-funnel entry point is a poor organic result and
  // must not compete with the landing page in search - same call as /terv.
  robots: { index: false, follow: true },
};

export default function UjrakezdesPage() {
  return <Landing />;
}
