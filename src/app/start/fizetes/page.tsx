import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase-admin";
import { START } from "../copy";
import { PayPage } from "./PayPage";

// /start/fizetes - the checkout, on its own page.
//
// Separated from the landing on purpose. A panel opening in place kept the
// argument on screen behind the card form, which is exactly the wrong thing to
// have there: at the payment step every remaining element is a reason to stop.
// Its own page also makes the step a real funnel event - an arrival here is
// intent, measurable without inferring it from a click - and gives the browser
// back button something sane to do.

export const metadata: Metadata = {
  title: "Fizetés | LEXFIT",
  robots: { index: false, follow: false },
};

export const revalidate = 3600;

export default async function Page() {
  const sessions = await adminDb
    .collection("programs").doc(START.slug).collection("sessions").count().get();
  return <PayPage sessionCount={sessions.data().count} />;
}
