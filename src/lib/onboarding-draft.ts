// The pre-auth onboarding draft (40 §40.8 / 41 §P2.1). Answers are held here
// through steps 1–8 and attached to Firestore on registration (P3). Every access
// is guarded - Safari private mode throws on localStorage. The `v` field is
// present from day one so a future shape change is a migration, not a corruption.
//
// Key is `lexfit_onb_v1` (the new pre-auth shape). We deliberately do NOT read or
// migrate `lexfit_onb_v2`: that key belongs to the old auth-first flow, so anyone
// holding one already has an account and never re-enters the anonymous funnel.
import type { OnboardingAnswers } from "./user";

const KEY = "lexfit_onb_v1";

// The funnel also collects specific weekdays (P0.3); OnboardingAnswers gains the
// field in P3.4, so the draft carries it as an extension until then.
export interface DraftAnswers extends Partial<OnboardingAnswers> {
  weekdays?: number[];
}

export interface Draft {
  v: 1;
  idx: number; // current step index, so a reload resumes in place
  answers: DraftAnswers;
  startedAt: number; // ms epoch, stamped by the caller
}

function isDraft(d: unknown): d is Draft {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  return o.v === 1 && typeof o.idx === "number" && typeof o.answers === "object" && o.answers !== null;
}

export function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDraft(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDraft(d: Draft): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    /* private mode / quota - the funnel still works, it just won't resume */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function hasDraft(): boolean {
  return readDraft() !== null;
}
