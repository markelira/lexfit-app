import type { Metadata } from "next";
import { loadQuizCatalog } from "@/lib/quiz/catalog.server";
import QuizWizard from "./QuizWizard";

// The lead magnet quiz. A public, anonymous marketing page: it lives OUTSIDE
// the funnel's four routes, so none of the twenty routing assertions in
// scripts/funnel-selftest.ts apply to it and none can be broken by it.
//
// The programme catalogue is read here, on the server, and handed down as a
// plain object: the recommender must never name a programme that is not live,
// and the client has no business talking to Firestore for it.

export const metadata: Metadata = {
  title: "Készítsd el a személyes edzésterved | LEXFIT",
  description:
    "Válaszolj pár kérdésre, és megkapod a napi kalória-célod, a rád szabott LexFit programot és a napi lépéscélod — ingyen, kb. 1 perc alatt.",
  // Paid traffic only: this page should not compete with the landing page in
  // search, and a half-funnel entry point is a poor organic result.
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function TervPage() {
  const catalog = await loadQuizCatalog();
  return <QuizWizard programs={catalog.bySlug} />;
}
