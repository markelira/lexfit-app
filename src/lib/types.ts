// LEXFIT Firestore data model (flexible "library + programs" design).
//
// Topology:
//   videos/{code}                  — global library; a video is intrinsic and
//                                    program-agnostic, reusable by any program.
//   programs/{slug}                — rich, data-driven program metadata.
//   programs/{slug}/sessions/{id}  — the playlist: ordered references to videos.
//   filters/{key}                  — editable taxonomy (not hardcoded).
//   users/{uid}/…                  — per-user data written by the app.
//
// Content is read-only to authed users; paid gating is enforced server-side via
// Mux SIGNED playback (one membership unlocks everything).

export type ContentStatus = "draft" | "published" | "soon" | "archived";
export type MuxStatus = "none" | "uploading" | "processing" | "ready" | "error";
export type RetestKind = "soft" | "final" | null;

// ─────────────────────────────────────────────────────────────
// videos/{code} — the global library item (intrinsic, reusable)
// ─────────────────────────────────────────────────────────────

/** One block of a session (warm-up, circuit, cool-down). */
export interface VideoBlock {
  name: string;
  mins: number;
  items: string[];
}

export interface Video {
  code: string;                 // "F001" | "B001" (doc id)
  kind: "workout" | "bonus";
  series: string | null;        // bonus grouping e.g. "has-kihivas"; null for workouts
  title: string;
  theme: string;                // matches a filters/theme option
  mins: number;
  level: number;                // 1–3
  format: string;               // matches a filters/format option
  types: string[];              // matches filters/type options
  blocks: VideoBlock[];         // exercise breakdown (often empty until authored)
  // Video source — attached via Mux (Phase 3). Library docs may be readable by
  // anyone authed; playback itself is gated by signed Mux URLs.
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  muxStatus: MuxStatus;
  muxDuration: number | null;   // seconds, from Mux webhook
  thumb: string | null;
  published: boolean;           // true once a video is attached & live
  status: ContentStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

// ─────────────────────────────────────────────────────────────
// programs/{slug} — rich, data-driven program
// ─────────────────────────────────────────────────────────────

/** A program phase (optional — empty array means a non-phased program). */
export interface ProgramPhase {
  idx: number;
  icon: string;
  name: string;
  weeks: string;       // human label, e.g. "Hét 1–2"
  short: string;
  desc: string;
  colorVar: string;    // CSS var, e.g. "var(--cat-mobility)"
}

export interface ProgramFact {
  label: string;
  value: string;
}

export interface Program {
  slug: string;              // "foundation" (doc id)
  title: string;
  hu: string;
  category: string;          // e.g. "Program" | "Kihívás" | "Sorozat" (editable taxonomy)
  eyebrow: string;
  level: string;             // "Kezdő – újrakezdő"
  goal: string | null;       // focus, e.g. "Forma + szokás"
  equipment: string | null;  // "nincs (matrac)"
  synopsis: string;
  facts: ProgramFact[];
  // Structure — all nullable so varied programs (no phases, different cadence,
  // single videos) fit without code assumptions.
  weeks: number | null;
  perWeek: number | null;
  totalSessions: number;
  defaultMins: number | null;
  phases: ProgramPhase[];    // [] if the program has no phases
  // Presentation
  cover: string | null;
  trailerPlaybackId: string | null;
  // Ops — one-membership model: "members" needs a subscription, "free" is open.
  access: "members" | "free";
  status: ContentStatus;
  order: number;             // catalog ordering
  createdAt?: unknown;
  updatedAt?: unknown;
}

/** programs/{slug}/sessions/{id} — a playlist entry pointing at a video. */
export interface ProgramSession {
  id: string;                // session doc id (zero-padded order, e.g. "00")
  videoCode: string;         // → videos/{code}
  order: number;             // 0-based position in the program
  week: number | null;
  day: string | null;        // "H" | "K" | "Cs" | "P" | "Szo"
  dayName: string | null;
  phaseIdx: number | null;   // index into program.phases, or null
  retest: RetestKind;
}

// ─────────────────────────────────────────────────────────────
// filters/{key} — editable taxonomy (one doc per dimension)
// ─────────────────────────────────────────────────────────────

export interface FilterDimension {
  key: string;               // "phase" | "theme" | "dur" | "level" | "format" | "type"
  label: string;             // "Fázis"
  options: string[];
  order: number;             // display order
  editable: boolean;         // admin may add/rename options
}

// ─────────────────────────────────────────────────────────────
// users/{uid}/… — written by the app
// ─────────────────────────────────────────────────────────────

export interface UserProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  provider: string | null;
  locale: string;            // "hu"
  createdAt?: unknown;
}

export interface Onboarding {
  height: number | null;
  weight: number | null;
  goal: string | null;
  why: string;               // free text
  experience: string | null;
  completedAt?: unknown;
}

export interface Progress {
  programId: string;         // "foundation"
  joinedAt?: unknown;
  currentIndex: number;      // session order of the active workout
  doneCount: number;
  streak: number;
  completed: { code: string; at: unknown }[];
  resume: Record<string, number>;  // videoCode → seconds
}

export interface ProgressPhoto {
  milestone: 1 | 5 | 8;
  storagePath: string;
  takenAt?: unknown;
  note: string;
}

export type SubscriptionStatus =
  | "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "none";

export interface Subscription {
  status: SubscriptionStatus;
  plan: string | null;        // "monthly" | "yearly"
  stripeCustomerId: string | null;
  currentPeriodEnd: unknown | null;
}
