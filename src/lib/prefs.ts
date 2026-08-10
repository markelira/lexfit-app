"use client";

import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getOnboarding } from "@/lib/user";
import { WEEK } from "@/lib/onboarding-data";
import type { Prefs, PlanPrefs } from "@/lib/profile";

// users/{uid}/settings/prefs — one merge-written doc, so a single onSnapshot covers
// every toggle. Seeded once (idempotently) from onboarding on first read; we NEVER
// render a default without persisting it, or the reminder cron and the UI would
// disagree about what the user chose. (31 §P3.2)
const prefsRef = (uid: string) => doc(db, "users", uid, "settings", "prefs");

// The canonical weekly split (onboarding-data WEEK): Mon/Tue/Thu/Fri/Sat work,
// Wed/Sun rest → workout weekday numbers [1,2,4,5,6], rest [3,7].
const WORK_WEEKDAYS = WEEK.map((w, i) => (w.work ? i + 1 : 0)).filter((n) => n > 0);
const REST_WEEKDAYS = WEEK.map((w, i) => (!w.work ? i + 1 : 0)).filter((n) => n > 0);

// onboarding `time` is time-of-DAY (reggel/napközben/este), not a duration — it
// seeds the reminder hour, not the session length (which onboarding never asks).
const REMINDER_HOUR: Record<string, string> = { reggel: "07:15", napkozben: "12:30", este: "18:00" };

export const DEFAULT_PREFS: Prefs = {
  plan: {
    daysPerWeek: 5,
    weekdays: [1, 2, 4, 5, 6],
    sessionLength: "20–30 perc",
    equipment: ["Szőnyeg"],
    restDayKeepsStreak: true,
  },
  reminders: {
    // Workout reminders are a real OPT-IN (GDPR/launch-plan fix): seeded OFF,
    // switched on by the FirstEntry card ("Beállítanál egy emlékeztetőt?") or
    // the Beállítások toggle. Existing docs with an explicit true are untouched.
    workout: { enabled: false, time: "07:15", weekdays: [1, 2, 4, 5, 6] },
    streakRisk: true,
    weeklyRecap: true,
    community: false,
    newContent: false,
  },
  privacy: { nameVisible: true, streakVisible: false },
  playback: { quietDefault: true, captions: false, autoNext: true },
};

const clampDays = (d: unknown) => {
  const n = typeof d === "number" ? d : Number(d);
  return Number.isFinite(n) ? Math.max(3, Math.min(6, Math.round(n))) : 5;
};

/** Workout weekdays for a given count: work days first, then rest days if needed. */
function pickWeekdays(days: number): number[] {
  return [...WORK_WEEKDAYS, ...REST_WEEKDAYS].slice(0, days).sort((a, b) => a - b);
}

/** Sanitise a stored weekday array to unique 1–7 ints, Monday-first. */
function cleanWeekdays(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  const set = new Set<number>();
  for (const x of v) {
    const n = typeof x === "number" ? x : Number(x);
    if (Number.isInteger(n) && n >= 1 && n <= 7) set.add(n);
  }
  return [...set].sort((a, b) => a - b);
}

/** Derive a full prefs doc from the onboarding answers (idempotent seed source). */
function deriveFromOnboarding(onb: Record<string, unknown> | null): Prefs {
  // Honour the specific weekdays the user picked in the funnel (P0.3); only fall
  // back to the count-derived canonical split when none were stored (legacy onb).
  const chosen = cleanWeekdays(onb?.weekdays);
  const days = chosen.length ? chosen.length : clampDays(onb?.days);
  const weekdays = chosen.length ? chosen : pickWeekdays(days);
  const time = REMINDER_HOUR[String(onb?.time ?? "")] ?? DEFAULT_PREFS.reminders.workout.time;
  const env = Array.isArray(onb?.env) ? (onb!.env as string[]) : [];
  const quietDefault = env.includes("csendes") ? true : DEFAULT_PREFS.playback.quietDefault;
  return {
    ...DEFAULT_PREFS,
    plan: { ...DEFAULT_PREFS.plan, daysPerWeek: days, weekdays },
    // enabled stays FALSE at seed time — the FirstEntry card is the opt-in; the
    // onboarding answers only pre-fill the time + days it will use once asked.
    reminders: { ...DEFAULT_PREFS.reminders, workout: { enabled: false, time, weekdays } },
    playback: { ...DEFAULT_PREFS.playback, quietDefault },
  };
}

/** Fill any fields a stored doc is missing (forward-compat when we add prefs). */
function withDefaults(data: Partial<Prefs> | undefined): Prefs {
  const d = data ?? {};
  return {
    plan: { ...DEFAULT_PREFS.plan, ...(d.plan ?? {}) },
    reminders: {
      ...DEFAULT_PREFS.reminders,
      ...(d.reminders ?? {}),
      workout: { ...DEFAULT_PREFS.reminders.workout, ...(d.reminders?.workout ?? {}) },
    },
    privacy: { ...DEFAULT_PREFS.privacy, ...(d.privacy ?? {}) },
    playback: { ...DEFAULT_PREFS.playback, ...(d.playback ?? {}) },
    updatedAt: d.updatedAt,
  };
}

/** Read prefs; on first access seed from onboarding and persist (idempotent). */
export async function getPrefs(uid: string): Promise<Prefs> {
  const ref = prefsRef(uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return withDefaults(snap.data() as Partial<Prefs>);
  const seeded = deriveFromOnboarding(await getOnboarding(uid));
  await setDoc(ref, { ...seeded, updatedAt: Date.now() });
  return seeded;
}

/** Live prefs (one subscription covers every toggle). Returns the unsubscribe. */
export function watchPrefs(uid: string, cb: (p: Prefs) => void): () => void {
  return onSnapshot(prefsRef(uid), (snap) => {
    cb(snap.exists() ? withDefaults(snap.data() as Partial<Prefs>) : DEFAULT_PREFS);
  });
}

// A partial patch — nested maps deep-merge in Firestore under setDoc({merge:true});
// arrays (weekdays, equipment) replace wholesale, which is what we want.
export type PrefsPatch = {
  plan?: Partial<PlanPrefs>;
  reminders?: {
    workout?: Partial<Prefs["reminders"]["workout"]>;
    streakRisk?: boolean;
    weeklyRecap?: boolean;
    community?: boolean;
    newContent?: boolean;
  };
  privacy?: Partial<Prefs["privacy"]>;
  playback?: Partial<Prefs["playback"]>;
};

/** Merge-write a prefs patch, stamping updatedAt. */
export async function updatePrefs(uid: string, patch: PrefsPatch): Promise<void> {
  await setDoc(prefsRef(uid), { ...patch, updatedAt: Date.now() }, { merge: true });
}
