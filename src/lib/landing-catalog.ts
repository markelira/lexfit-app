import type { Challenge, VideoBlock } from "@/lib/types";

/**
 * The public landing page's content payload.
 *
 * `firestore.rules` gates ALL content on `isSignedIn()`, so a logged-out visitor
 * cannot read programs/videos/challenges from the client SDK. Rather than loosen
 * the rules or add a public endpoint, `/` is a server component that reads via the
 * Admin SDK and hands the result down as props.
 *
 * THIS module is client-safe: types + the empty payload only. The Admin SDK reader
 * lives in `landing-catalog.server.ts` - importing a runtime value from there into
 * a client component drags firebase-admin into the browser bundle and the build
 * fails on `fs` / `child_process`.
 *
 * Everything here must be JSON-serializable - it crosses the server→client boundary.
 * Firestore Timestamps are therefore dropped, never forwarded.
 */

/** A program card in the catalog rail. */
export interface LandingProgram {
  slug: string;
  title: string;              // system title - the giant watermark word
  hu: string;                 // Hungarian display name
  category: string;
  synopsis: string;
  level: string;
  defaultMins: number | null;
  equipment: string | null;
  sessionCount: number;
  hue: number;
}

/** A workout card - the subset `WorkoutDetail` needs, plus its program. */
export interface LandingWorkout {
  code: string;
  title: string;
  theme: string;
  mins: number;
  level: number;
  format: string;
  types: string[];
  focus: string[];
  subtitle: string | null;
  muxDuration: number | null;
  phase: number | null;
  blocks: VideoBlock[];
  program: string | null;      // slug, or null when standalone
  programName: string | null;  // wordmark
  programHue: number | null;
}

/** One Foundation (or entry-program) session, in playlist order. */
export interface LandingSession {
  code: string;
  title: string;
  theme: string;
  mins: number;
  order: number;
  phaseIdx: number | null;
}

export interface LandingPhase {
  idx: number;
  icon: string;
  name: string;
  desc: string;
}

/**
 * A challenge, minus its Firestore Timestamps.
 *
 * The landing renders the app's real `ChallengeCard`, whose prop type extends the
 * full `Challenge` - so the whole doc is forwarded rather than a hand-picked subset
 * that would need widening every time the card reads one more field. `createdAt` /
 * `updatedAt` are dropped because Timestamps do not survive the server→client hop.
 */
export type LandingChallenge = Omit<Challenge, "createdAt" | "updatedAt">;

export interface LandingCatalog {
  programs: LandingProgram[];
  workouts: LandingWorkout[];
  entry: {
    slug: string;
    title: string;
    synopsis: string;
    sessionCount: number;
    phases: LandingPhase[];
    sessions: LandingSession[];
  } | null;
  challenges: LandingChallenge[];
  /** filters/type options - the adaptation chips in §3. */
  typeOptions: string[];
  fbGroupUrl: string | null;
  counts: { programs: number; workouts: number };
}

/** The empty payload. Every section degrades to honest copy against this. */
export const EMPTY_CATALOG: LandingCatalog = {
  programs: [], workouts: [], entry: null, challenges: [],
  typeOptions: [], fbGroupUrl: null, counts: { programs: 0, workouts: 0 },
};
