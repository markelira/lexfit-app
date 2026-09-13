import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { loadLandingCatalog } from "@/lib/landing-catalog.server";
import { LM_VARIANT, type LmLeadDoc } from "@/lib/ujrakezdes/lead";
import PlanWizard from "../PlanWizard";

// The PERSISTED plan - the URL D0 and D3 link to.
//
// The gate promises "a kész tervet e-mailben küldjük, hogy TV-n és laptopon is
// megnyisd". Before this route existed the emails could only link the landing
// page, where the person had to re-answer all seven questions to see their own
// plan again - the single biggest broken promise in the funnel (diagnosis
// 2026-09-13, docs/lead-conversion-diagnosis.md).
//
// The token is an unguessable 32-hex capability generated at lead creation.
// The page renders the same reveal the person saw after the quiz - including
// the offer - seeded from the stored answers; nothing here exposes the email
// address or any other identity field.

export const metadata: Metadata = {
  title: "A heti terved | LEXFIT",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TOKEN_RE = /^[0-9a-f]{32}$/;

export default async function PersistedPlanPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!TOKEN_RE.test(token)) redirect("/ujrakezdes/terv");

  const snap = await adminDb
    .collection("quizLeads")
    .where("planToken", "==", token)
    .limit(1)
    .get();
  const lead = snap.docs[0]?.data() as LmLeadDoc | undefined;
  // A missing or non-v2 lead (erased, purged, bad link) degrades to the quiz
  // itself - one minute of questions is still better than a dead end.
  if (!lead || lead.variant !== LM_VARIANT) redirect("/ujrakezdes/terv");

  const catalog = await loadLandingCatalog();
  return (
    <PlanWizard
      catalog={catalog}
      initial={{ answers: lead.answers, token }}
    />
  );
}
