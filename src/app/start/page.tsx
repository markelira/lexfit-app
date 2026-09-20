import type { Metadata } from "next";
import { adminDb } from "@/lib/firebase-admin";
import type { WorkoutCardVideo } from "@/components/WorkoutCard";
import { START } from "./copy";
import { StartPage } from "./StartPage";

// /start - the product page for the one-time Foundation purchase (P1).
//
// Paid traffic only, and deliberately noindex: a single-offer landing page must
// not compete with the marketing site in search - the same call as /ujrakezdes
// and /terv.

export const metadata: Metadata = {
  title: `${START.meta.title} | LEXFIT`,
  description: START.meta.description,
  robots: { index: false, follow: true },
};

// The programme is READ, never described from memory. Its own document still
// says "20 edzés" in a synopsis written before the playlist grew to 35, which
// is exactly why nothing on this page may quote it: the playlist is the truth,
// and it is what the buyer actually receives.
//
// Revalidated hourly - the list changes when content is published, not by the
// minute, and an ad click must still hit a static page.
export const revalidate = 3600;

async function loadProgramme(): Promise<WorkoutCardVideo[]> {
  const progRef = adminDb.collection("programs").doc(START.slug);
  const sessions = (await progRef.collection("sessions").get()).docs
    .map((d) => d.data() as { videoCode?: string; order?: number })
    .filter((s): s is { videoCode: string; order: number } => !!s.videoCode)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const docs = await adminDb.getAll(
    ...sessions.map((s) => adminDb.collection("videos").doc(s.videoCode)),
  );

  return docs.flatMap((d) => {
    const v = d.data();
    // Draft or archived content must not be advertised as part of what is
    // being sold. (Docs without a status predate the admin CMS - allowed.)
    if (!v || (v.status !== undefined && v.status !== "published")) return [];
    return [{
      code: d.id,
      title: String(v.title ?? d.id),
      theme: String(v.theme ?? ""),
      mins: Number(v.mins ?? 0),
      format: v.format ? String(v.format) : undefined,
      types: Array.isArray(v.types) ? (v.types as string[]) : undefined,
      level: typeof v.level === "number" ? v.level : undefined,
      thumb: null,          // covers are generated from theme + code, not fetched
      muxDuration: null,    // no playback data reaches a public page
    }];
  });
}

export default async function Page() {
  const workouts = await loadProgramme();
  return <StartPage workouts={workouts} />;
}
