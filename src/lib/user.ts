"use client";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";

// The full onboarding answer set collected by the flow. The build-plan canonical
// fields (height, weight, goal, why, experience) are a subset; we persist
// everything the user told us so later screens can use it.
export interface OnboardingAnswers {
  goal: string | null;
  level: number | null;        // experience (1–3)
  age: string | null;
  height: string;
  weight: string;
  lifestage: string | null;
  focus: string[];
  motiv: string;               // the free-text "why"
  obstacle: string | null;
  days: number;
  time: string | null;
  env: string[];
}

export const BLANK_ONBOARDING: OnboardingAnswers = {
  goal: null, level: null, age: null, height: "", weight: "", lifestage: null,
  focus: [], motiv: "", obstacle: null, days: 5, time: null, env: [],
};

/** Extras captured at email registration (the OAuth path has none). */
export interface SignupExtra {
  /** First name from the register form; falls back to the Auth displayName. */
  firstName?: string;
  /** Marketing opt-in — GDPR opt-in, defaults to false when not provided. */
  marketing?: boolean;
}

/** Create users/{uid} on first sign-in (idempotent). Returns true if created. */
export async function ensureUserDoc(user: User, extra?: SignupExtra): Promise<boolean> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return false;
  await setDoc(ref, {
    displayName: extra?.firstName?.trim() || user.displayName || null,
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
    provider: user.providerData[0]?.providerId ?? null,
    locale: "hu",
    marketingOptIn: extra?.marketing ?? false,
    createdAt: serverTimestamp(),
  });
  return true;
}

/** Has this user finished onboarding? */
export async function hasOnboarded(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid, "onboarding", "profile"));
  return snap.exists() && snap.data()?.completedAt != null;
}

/** Persist onboarding answers to users/{uid}/onboarding/profile. */
export async function saveOnboarding(uid: string, answers: OnboardingAnswers): Promise<void> {
  await setDoc(
    doc(db, "users", uid, "onboarding", "profile"),
    {
      ...answers,
      // Canonical build-plan aliases for downstream screens.
      why: answers.motiv,
      experience: answers.level,
      completedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Read onboarding answers back (for the profile/Haladásom screens). */
export async function getOnboarding(uid: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(db, "users", uid, "onboarding", "profile"));
  return snap.exists() ? snap.data() : null;
}
