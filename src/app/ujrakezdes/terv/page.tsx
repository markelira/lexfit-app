import type { Metadata } from "next";
import { loadLandingCatalog } from "@/lib/landing-catalog.server";
import PlanWizard from "./PlanWizard";

// The lead magnet v2 wizard. Same posture as the landing above it: public,
// anonymous, paid traffic only, and outside the funnel's four routes.

export const metadata: Metadata = {
  title: "A heti terved — 7 kérdés | LEXFIT",
  description:
    "Hét kérdés, nagyjából egy perc, és kész a heti edzésterved — pihenőnapokkal, otthonra, eszköz nélkül.",
  robots: { index: false, follow: true },
};

// The catalogue is read HERE, on the server, and handed down as a plain object:
// the reveal shows the real Foundation programme, and an anonymous visitor has
// no business talking to Firestore for it. `loadLandingCatalog` never throws -
// an outage degrades the reveal to the plan alone rather than 500-ing mid-funnel.
export const dynamic = "force-dynamic";

export default async function UjrakezdesTervPage() {
  const catalog = await loadLandingCatalog();
  return <PlanWizard catalog={catalog} />;
}
