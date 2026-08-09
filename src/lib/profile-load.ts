"use client";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getOnboarding } from "@/lib/user";
import { loadFoundation, type FoundationData } from "@/lib/program";
import { getProgress } from "@/lib/progress";
import { getSubscription } from "@/lib/billing";
import { getPrefs } from "@/lib/prefs";
import { PRICES } from "@/lib/pricing/config";
import type { Plan } from "@/lib/pricing/types";
import { addDays, computeStreak, ymd } from "@/lib/streak";
import type { ProfileData, WeekCellState } from "@/lib/profile";

// loadProfile composes what already exists into ONE typed read model in a single
// round of reads — no per-component Firestore queries. (31 §P3.1)
// NB: reconciled with the Mux refactor — "perc mozgás" is the watchByDay sum (not a
// separate minutes ledger; §P3.4 is moot), and streak is computeStreak, not a
// stored value. There is no markComplete anymore.

const PLAN_LABEL: Record<Plan, string> = {
  WEEK: "Heti tagság",
  MONTH: "Havi tagság",
  ANNUAL: "Éves tagság",
  ONEOFF_WEEK: "Heti hozzáférés",
  ONEOFF_MONTH: "Havi hozzáférés",
};

function tsToMs(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const o = v as { toMillis?: () => number; seconds?: number };
  if (typeof o.toMillis === "function") return o.toMillis();
  if (typeof o.seconds === "number") return o.seconds * 1000;
  return null;
}

const priceByLookupKey = (key: string): number | null =>
  Object.values(PRICES).find((p) => p.lookupKey === key)?.amountHuf ?? null;

const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

/** 1-based position in the program playlist (which workout you're on), clamped. */
function stepFor(fnd: FoundationData | null, currentIndex: number): number {
  if (!fnd) return 1;
  const total = fnd.program?.totalSessions || fnd.playlist.length || 1;
  return Math.max(1, Math.min(total, currentIndex + 1));
}

/** The 7 week cells, Monday-first: prefs weekdays × completions of the current week. */
function buildWeek(weekdays: number[], completed: { at: string }[]): { weekday: number; state: WeekCellState }[] {
  const today = new Date();
  const todayKey = ymd(today);
  const mon = mondayOf(today);
  const done = new Set(completed.map((c) => String(c.at)));
  return Array.from({ length: 7 }, (_, i) => {
    const weekday = i + 1;
    const key = ymd(addDays(mon, i));
    const planned = weekdays.includes(weekday);
    const isPast = key < todayKey; // YYYY-MM-DD sorts lexically
    let state: WeekCellState;
    if (done.has(key)) state = "done";
    else if (key === todayKey) state = "today";
    else if (planned && isPast) state = "missed";
    else if (planned) state = "todo";
    else state = "rest";
    return { weekday, state };
  });
}

export async function loadProfile(uid: string): Promise<ProfileData> {
  const [onb, fnd, progress, sub, userSnap, prefs] = await Promise.all([
    getOnboarding(uid),
    loadFoundation(uid),
    getProgress(uid),
    getSubscription(uid),
    getDoc(doc(db, "users", uid)),
    getPrefs(uid),
  ]);

  const u = (userSnap.exists() ? userSnap.data() : {}) as Record<string, unknown>;
  const authUser = auth.currentUser;

  // identity — users/{uid} first, Auth as fallback (P4.1); first name only
  const full = String((u.displayName as string) ?? authUser?.displayName ?? "");
  const email = (u.email as string) ?? authUser?.email ?? null;
  const name = full.trim().split(/\s+/)[0] || (email ? email.split("@")[0] : "");

  const currentIndex = progress?.currentIndex ?? fnd?.currentIndex ?? 0;
  const step = stepFor(fnd, currentIndex);
  // Next visszamérés (retest) workout ahead of where you are, by playlist order.
  const nextRetestStep =
    (fnd?.playlist.find((w) => w.retest && w.order >= currentIndex)?.order ?? null) != null
      ? (fnd!.playlist.find((w) => w.retest && w.order >= currentIndex)!.order + 1)
      : null;

  // stats — watchByDay sum is "perc mozgás"; streak recomputed rest-day-aware
  const completed = progress?.completed ?? [];
  const dates = completed.map((c) => String(c.at));
  const workoutIdx = new Set<number>(progress?.workoutDays ?? prefs.plan.weekdays);
  const minutes = Math.round(Object.values(progress?.watchByDay ?? {}).reduce((a, b) => a + b, 0) / 60);
  const streak = computeStreak(dates, workoutIdx, ymd(new Date()), prefs.plan.restDayKeepsStreak);

  const whyText = (onb?.why ?? onb?.motiv) as string | undefined;

  return {
    identity: {
      name,
      photoURL: ((u.photoURL as string) ?? authUser?.photoURL ?? null),
      email,
      memberSince: tsToMs(u.createdAt) ?? tsToMs(progress?.joinedAt) ?? null,
      provider: ((u.provider as string) ?? authUser?.providerData?.[0]?.providerId ?? null),
    },
    programme: {
      slug: fnd?.program?.slug ?? "foundation",
      label: fnd?.program?.title ?? "Foundation",
      step,
      total: fnd?.program?.totalSessions || fnd?.playlist.length || 0,
      nextRetestStep,
      stepsToRetest: nextRetestStep != null ? Math.max(0, nextRetestStep - step) : null,
    },
    stats: { doneCount: progress?.doneCount ?? 0, minutes, streak },
    week: buildWeek(prefs.plan.weekdays, completed),
    why: whyText ? { text: String(whyText), at: tsToMs(onb?.completedAt) } : null,
    plan: prefs.plan,
    prefs,
    subscription: sub
      ? {
          plan: sub.plan ?? "MONTH",
          planLabel: PLAN_LABEL[sub.plan ?? "MONTH"],
          status: sub.status ?? "ACTIVE",
          priceHuf: sub.priceLookupKey ? priceByLookupKey(sub.priceLookupKey) : null,
          renewalAt: sub.currentPeriodEnd ?? null,
          accessUntil: sub.accessUntil ?? null,
        }
      : null,
  };
}
