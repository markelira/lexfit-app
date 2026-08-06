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

/** One exercise (Gyakorlat) inside a block. */
export interface VideoExercise {
  name: string;
  start?: number;      // absolute seconds into the video where this exercise begins (optional; same basis as block.start)
}

/** An exercise entry may be a bare name (legacy / unstamped) or a stamped object. */
export type VideoExerciseItem = string | VideoExercise;

/** One block of a session (warm-up, circuit, cool-down). */
export interface VideoBlock {
  name: string;
  mins: number;        // block length in minutes — auto-derived from `start` gaps when stamped
  items: VideoExerciseItem[];  // exercises; a string (legacy/unstamped) or { name, start? }
  start?: number;      // seconds into the video where this block begins (optional; enables exact player nav)
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
  // Benefit subhead (see src/lib/benefit.ts): `focus` = controlled outcome tags
  // (editable filters/focus), `subtitle` = authored free-text override. Both optional;
  // absent → the benefit is derived from theme + format/types.
  focus?: string[];
  subtitle?: string | null;
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
// Kihívások — the "Szavazz Magadra" archive (a SECOND library,
// parallel to videos/programs; see docs/kihivasok-plan.md)
//
// Topology:
//   challengeVideos/{code}          — separate 9:16 video pool; NEVER surfaces
//                                     in Videótár (that reads videos/{code}).
//   challenges/{slug}               — a challenge = an ordered 5–14 day series.
//   challenges/{slug}/days/{id}     — the playlist: ordered refs to challengeVideos.
//   challengeFilters/{key}          — editable taxonomy (HOSSZ buckets, TESTRÉSZ).
//   settings/challenges             — { fbGroupUrl } global link-out.
//   users/{uid}/challengeProgress/{slug} — per-user completion store.
// ─────────────────────────────────────────────────────────────

/** challengeVideos/{code} — a 9:16 challenge day video (own pool, Mux signed). */
export interface ChallengeVideo {
  code: string;                 // "SZM24-1" (doc id)
  title: string;
  bodyPart: string;             // matches a challengeFilters/theme option
  mins: number;
  level: number;                // 1–3
  blocks: VideoBlock[];         // exercise breakdown (reuses the workout block shape)
  orientation: "portrait";      // 9:16 reels — distinguishes the player mode
  // Video source — Mux (signed playback), mirrors Video's fields.
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  muxUploadId?: string | null;
  muxStatus: MuxStatus;
  muxDuration: number | null;   // seconds, from Mux webhook
  thumb: string | null;
  published: boolean;
  status: ContentStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Challenge {
  slug: string;                 // "7-napos-has-kihivas" (doc id)
  title: string;                // "7 napos has-kihívás"
  series: string;               // eyebrow, e.g. "Szavazz Magadra"
  monthLabel: string;           // human label, "2024. november"
  sortDate: string;             // sortable "YYYY-MM" (or ISO) — archive reads newest-first
  synopsis: string;
  bodyPart: string;             // → challengeFilters/theme (TESTRÉSZ)
  equipment: string | null;     // "eszköz nélkül"
  durationDays: number;         // 5–14; the card's "N NAP" badge (also = day count)
  perDayMinsLabel: string | null; // "napi 10–14 perc"
  participantCount: number | null; // static, admin-entered ("312-en csinálták")
  fbPostUrl: string | null;     // optional per-challenge Facebook post link
  featured: boolean;            // "A csoport választása" / ribbon
  featuredLabel: string | null; // "A CSOPORT VÁLASZTÁSA" | "ÚJ"
  cover: string | null;
  totalDays: number;            // maintained by the days route (like totalSessions)
  access: "members" | "free";
  status: ContentStatus;
  order: number;                // catalog ordering (secondary to sortDate)
  createdAt?: unknown;
  updatedAt?: unknown;
}

/** challenges/{slug}/days/{id} — a flat, ordered day pointing at a challengeVideo. */
export interface ChallengeDay {
  id: string;                   // day doc id (zero-padded order, e.g. "00")
  videoCode: string;            // → challengeVideos/{code}
  order: number;                // 0-based position (day N = order + 1)
  dayTitle: string | null;      // "Alapozás", "Kitartás" — the "6. nap · Kitartás" suffix
}

/** users/{uid}/challengeProgress/{slug} — per-user completion (separate store). */
export interface ChallengeProgress {
  slug: string;
  doneDays: string[];           // videoCodes completed (order-agnostic)
  dayDates?: Record<string, string>; // videoCode → YYYY-MM-DD completed ("Megcsináltad · márc. 2.")
  resume: Record<string, number>; // videoCode → seconds
  resumeAt?: Record<string, number>; // videoCode → epoch ms (recency)
  startedAt?: unknown;
  completedAt?: unknown;        // set when doneDays covers all days
}

/** Computed per-user challenge state (not stored) — the ÁLLAPOT filter. */
export type ChallengeState = "elkezdetlen" | "folyamatban" | "kesz";

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
  completed: { code: string; at: unknown; atTime?: string }[]; // atTime = local HH:MM
  resume: Record<string, number>;  // videoCode → seconds
  resumeAt?: Record<string, number>; // videoCode → epoch ms of last resume (recency)
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
