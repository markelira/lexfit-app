import type { Metadata } from "next";
import PlanWizard from "./PlanWizard";

// The lead magnet v2 wizard. Same posture as the landing above it: public,
// anonymous, paid traffic only, and outside the funnel's four routes.

export const metadata: Metadata = {
  title: "A heti terved — 7 kérdés | LEXFIT",
  description:
    "Hét kérdés, nagyjából egy perc, és kész a heti edzésterved — pihenőnapokkal, otthonra, eszköz nélkül.",
  robots: { index: false, follow: true },
};

export default function UjrakezdesTervPage() {
  return <PlanWizard />;
}
