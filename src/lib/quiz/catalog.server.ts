import "server-only";
import { adminDb } from "@/lib/firebase-admin";
import { SLUG } from "./recommend";

// The live programme catalogue, as the quiz sees it: which slugs are published,
// and the title/synopsis to render for each. Read at request time so publishing
// in /admin redirects the recommender with no deploy (spec T7).
//
// NEVER throws. A Firestore hiccup must not take the quiz down mid-funnel, so a
// failed read degrades to the known-good entry programme rather than a 500 -
// the same fail-safe posture as the landing catalogue loader.

export interface QuizProgram {
  slug: string;
  title: string;
  synopsis: string;
  facts: { label: string; value: string }[];
}

export interface QuizCatalog {
  published: Set<string>;
  bySlug: Record<string, QuizProgram>;
  /** True when the read failed and we are running on the fallback below. */
  degraded: boolean;
}

/** Last-resort catalogue: the entry programme only, so something always renders. */
const FALLBACK: QuizCatalog = {
  published: new Set([SLUG.START]),
  bySlug: {
    [SLUG.START]: {
      slug: SLUG.START,
      title: "Lexfit Start",
      synopsis: "A LexFit fő programja - otthon, eszköz nélkül, a saját tempódban.",
      facts: [],
    },
  },
  degraded: true,
};

export async function loadQuizCatalog(): Promise<QuizCatalog> {
  try {
    const snap = await adminDb
      .collection("programs")
      .where("status", "==", "published")
      .get();

    if (snap.empty) return FALLBACK;

    const bySlug: Record<string, QuizProgram> = {};
    const published = new Set<string>();
    for (const d of snap.docs) {
      const v = d.data() as Partial<QuizProgram> & { facts?: unknown };
      published.add(d.id);
      bySlug[d.id] = {
        slug: d.id,
        title: typeof v.title === "string" ? v.title : d.id,
        // The programme's own marketing copy IS the pitch - we deliberately do
        // not keep a second description in the quiz, so the two can never drift.
        synopsis: typeof v.synopsis === "string" ? v.synopsis : "",
        facts: Array.isArray(v.facts) ? (v.facts as QuizProgram["facts"]) : [],
      };
    }
    return { published, bySlug, degraded: false };
  } catch (e) {
    console.error("[quiz-catalog]", e);
    return FALLBACK;
  }
}
