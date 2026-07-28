// The Profil read model. One typed shape so both surfaces (Profil + Beállítások)
// read the same thing. `loadProfile` (src/lib/profile-load.ts) composes getOnboarding
// / loadFoundation / getProgress / getSubscription / users/{uid} / prefs into this —
// no per-component Firestore queries.

import type { Plan, SubStatus } from "@/lib/pricing/types";

export type WeekCellState = "done" | "today" | "rest" | "todo" | "missed";

// ── Hungarian display helpers (shared by Profil + Beállítások) ──
const DAY_FULL = ["hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat", "vasárnap"];

/** "2025. március" from an epoch-ms date (or "" when null). */
export function monthYearHu(ms: number | null | undefined): string {
  if (ms == null) return "";
  return new Intl.DateTimeFormat("hu-HU", { year: "numeric", month: "long" }).format(new Date(ms));
}

/** [1,2,4] → "hétfő, kedd, csütörtök" (weekday values 1=Mon … 7=Sun). */
export function weekdayNamesHu(weekdays: number[]): string {
  return [...weekdays].sort((a, b) => a - b).map((w) => DAY_FULL[w - 1]).filter(Boolean).join(", ");
}

/** The user's training plan — persisted under users/{uid}/settings/prefs (P3.2). */
export interface PlanPrefs {
  daysPerWeek: number;          // 3–6
  weekdays: number[];           // 1=Mon … 7=Sun
  sessionLength: string;        // e.g. "20–30 perc"
  equipment: string[];          // e.g. ["Szőnyeg"]
  restDayKeepsStreak: boolean;  // default true
}

export interface Prefs {
  plan: PlanPrefs;
  reminders: {
    workout: { enabled: boolean; time: string /* "HH:MM" */; weekdays: number[] };
    streakRisk: boolean;
    community: boolean;
    newContent: boolean;
  };
  privacy: { nameVisible: boolean; streakVisible: boolean };
  playback: { quietDefault: boolean; captions: boolean; autoNext: boolean };
  updatedAt?: number;
}

/** Subscription, flattened for display — figures come from PRICES via formatHuf. */
export interface ProfileSubscription {
  plan: Plan;
  planLabel: string;
  status: SubStatus;
  priceHuf: number | null;
  renewalAt: number | null;   // currentPeriodEnd (epoch ms)
  accessUntil: number | null; // epoch ms
}

export interface ProfileData {
  identity: {
    name: string;
    photoURL: string | null;
    email: string | null;
    memberSince: number | null; // epoch ms
    provider: string | null;    // "google.com" | "password" | …
  };
  programme: {
    slug: string;
    label: string;              // program.title, never the literal "Foundation"
    week: number;
    nextRetestWeek: number | null;
    weeksToRetest: number | null;
  };
  stats: { doneCount: number; minutes: number; streak: number };
  week: { weekday: number; state: WeekCellState }[]; // 7 entries, Monday-first
  why: { text: string; at: number | null } | null;   // null when onboarding skipped
  plan: PlanPrefs;             // mirror of prefs.plan, pulled up for convenience
  prefs: Prefs;
  subscription: ProfileSubscription | null;
}
