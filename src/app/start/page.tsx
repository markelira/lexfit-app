import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { START } from "./copy";
import { StartPage } from "./StartPage";

// /start - the product page for the one-time Foundation purchase (P1).
//
// Paid traffic only, and deliberately noindex: it is a single-offer landing
// page that must not compete with the marketing site in search - the same call
// as /ujrakezdes and /terv.

export const metadata: Metadata = {
  title: `${START.meta.title} | LEXFIT`,
  description: START.meta.description,
  robots: { index: false, follow: true },
};

// The session count is a live claim about the product, so it is read rather
// than written: a literal in the copy starts lying the day the programme grows.
// Revalidated hourly - the number changes when content is published, not by
// the minute, and the page must stay a static hit for an ad click.
export const revalidate = 3600;

export default async function Page() {
  const sessions = await adminDb
    .collection("programs")
    .doc(START.slug)
    .collection("sessions")
    .count()
    .get();
  return <StartPage sessionCount={sessions.data().count} />;
}
