import { createHash } from "node:crypto";
import { calories, steps } from "./calc";
import { recommend, resolve } from "./recommend";
import { normalizeEmail, normalizeFirstName, validateEmail, validateFirstName } from "./validate";
import {
  AGE_OF, STEPS_MID_OF,
  type QuizAnswers, type Goal, type Sex, type AgeBand, type DailyMove,
  type StepsNow, type TrainingNow, type LifeStage, type SessionMin, type Obstacle,
} from "./types";

// Lead magnet quiz - the server side of a submission.
//
// Deliberately NOT marked `server-only`, unlike the routes that use it: the
// acceptance tests import these functions directly, and `server-only` throws
// outside a Next build. The client-bundle guard is not lost - the `node:crypto`
// import below fails a browser build on its own.
//
// A lead is NOT a user: there is no Firebase uid, no login, and therefore none
// of the app's account machinery applies to them. Two consequences drive the
// shape below.
//
// 1. IDENTITY. The document id is sha256(normalised email), never the address
//    itself. That gives a free upsert key for retakes AND keeps the address out
//    of document paths - which matters because the id travels in unsubscribe
//    and erasure URLs, where a plaintext email would be a leak.
//
// 2. RETENTION IS SPLIT IN TWO. The Art. 9 body metrics expire before the rest
//    of the record (12 vs 24 months, per the privacy-policy amendment), so the
//    lead can stay on the mailing list long after we have forgotten their
//    weight. `healthPurgeAt` and `purgeAt` carry those two clocks.
//
// The client's arithmetic is never trusted: everything under `computed` is
// recalculated here from `answers`.

/** MUST match the effective date of the published privacy policy (§9 of the
 *  amendment draft). Bump this the day the amended policy goes live - the
 *  consent log is worthless if it names the wrong version. */
export const CONSENT_POLICY_VERSION = process.env.QUIZ_POLICY_VERSION ?? "2026-08-11";

export const QUIZ_VERSION = "3.0";

const MONTH_MS = 30 * 24 * 3600_000;
export const HEALTH_RETENTION_MS = 12 * MONTH_MS;
export const LEAD_RETENTION_MS = 24 * MONTH_MS;

export const leadId = (email: string): string =>
  createHash("sha256").update(normalizeEmail(email)).digest("hex");

// ─── Validation ──────────────────────────────────────────────────────────────

const IN = <T extends string>(vals: readonly T[]) => (v: unknown): v is T =>
  typeof v === "string" && (vals as readonly string[]).includes(v);

const isGoal = IN<Goal>(["fat_loss", "tone", "strength", "posture_energy", "restart"]);
const isSex = IN<Sex>(["male", "female"]);
const isAge = IN<AgeBand>(Object.keys(AGE_OF) as AgeBand[]);
const isMove = IN<DailyMove>(["desk", "mixed", "active"]);
const isSteps = IN<StepsNow>(Object.keys(STEPS_MID_OF) as StepsNow[]);
const isTraining = IN<TrainingNow>(["none", "sometimes", "regular"]);
const isStage = IN<LifeStage>(["postpartum", "menopause", "desk_strain", "none"]);
const isSession = IN<SessionMin>(["10_15", "20_30", "30_45"]);
const isObstacle = IN<Obstacle>([
  "no_time", "no_motivation", "dont_know_how", "gave_up", "bad_experience",
]);

const num = (v: unknown, lo: number, hi: number): number | null => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= lo && n <= hi ? n : null;
};

export type ValidationError = { field: string; code: string };

/** Parses and range-checks the answer block. Mirrors the client rules exactly,
 *  because the client is only a convenience - this is the real gate. */
export function parseAnswers(raw: unknown): QuizAnswers | ValidationError[] {
  const a = (raw ?? {}) as Record<string, unknown>;
  const errs: ValidationError[] = [];
  const need = (ok: boolean, field: string) => { if (!ok) errs.push({ field, code: "invalid" }); };

  need(isGoal(a.goal), "goal");
  need(isSex(a.sex), "sex");
  need(isAge(a.age_band), "age_band");
  need(isMove(a.daily_move), "daily_move");
  need(isSteps(a.steps_now), "steps_now");
  need(isTraining(a.training_now), "training_now");
  need(isStage(a.life_stage), "life_stage");
  need(isSession(a.session_min), "session_min");
  need(isObstacle(a.obstacle), "obstacle");

  const height = num(a.height_cm, 120, 230);
  const weight = num(a.weight_kg, 35, 250);
  need(height !== null, "height_cm");
  need(weight !== null, "weight_kg");

  // Only meaningful for a fat-loss goal; anything else must arrive null so a
  // back-and-changed answer cannot leave a stale target behind (spec §11.1).
  let target: number | null = null;
  if (a.goal === "fat_loss" && a.target_weight_kg != null) {
    target = num(a.target_weight_kg, 35, 250);
    need(target !== null, "target_weight_kg");
  }

  if (errs.length) return errs;
  return {
    goal: a.goal as Goal, sex: a.sex as Sex, age_band: a.age_band as AgeBand,
    height_cm: height!, weight_kg: weight!, target_weight_kg: target,
    daily_move: a.daily_move as DailyMove, steps_now: a.steps_now as StepsNow,
    training_now: a.training_now as TrainingNow, life_stage: a.life_stage as LifeStage,
    session_min: a.session_min as SessionMin, obstacle: a.obstacle as Obstacle,
  };
}

// ─── Server-side computation ─────────────────────────────────────────────────

export interface ComputedBlock {
  maintenanceKcal: number;
  goalKcal: number;
  activityMultiplier: number;
  weeklyLossKg: number | null;
  calorieNote: string;
  stepsCurrent: number;
  stepsTarget: number;
  stepNote: string;
  program: string;
  programPrimary: string;
  programRule: string;
  fallbackUsed: boolean;
  bonus: string;
  nextStep: string | null;
}

/**
 * Recomputes everything from the answers. `published` is the live catalogue -
 * pass the real published slugs so a lead is never promised a dead program.
 */
export function computeFor(a: QuizAnswers, published: ReadonlySet<string>): ComputedBlock {
  const c = calories(a);
  const s = steps(a);
  const r = resolve(recommend(a), published);
  return {
    maintenanceKcal: c.maintenanceKcal,
    goalKcal: c.goalKcal,
    activityMultiplier: c.activityMultiplier,
    weeklyLossKg: c.weeklyLossKg,
    calorieNote: c.note,
    stepsCurrent: s.current,
    stepsTarget: s.target,
    stepNote: s.note,
    program: r.program,
    programPrimary: r.primary,
    programRule: r.rule,
    fallbackUsed: r.fallbackUsed,
    bonus: r.bonus,
    nextStep: r.nextStep,
  };
}

// ─── Document shape ──────────────────────────────────────────────────────────

export interface LeadConsents {
  health: boolean;
  marketing: boolean;
  policyVersion: string;
  at: number;
  ip: string | null;
  userAgent: string | null;
}

export interface LeadDoc {
  email: string;
  firstName: string;
  consents: LeadConsents;
  answers: QuizAnswers;
  computed: ComputedBlock;
  utm: Record<string, string>;
  quizVersion: string;
  retakeCount: number;
  createdAt: number;
  updatedAt: number;
  /** Art. 9 data dies first - see the module header. */
  healthPurgeAt: number;
  purgeAt: number;
  convertedAt: number | null;
  unsubscribedAt: number | null;
  /** Drives the nurture sequence; null when marketing consent was withheld. */
  nextEmailAt: number | null;
  nextEmailStep: number | null;
  /** Bookkeeping for the sequence cron - what went out and when. */
  lastEmailAt?: number;
  lastEmailStep?: number;
  /** Set once the Art. 9 fields have been stripped (12-month clock). */
  healthPurgedAt?: number;
  /** True when the client's own arithmetic disagreed with ours (monitoring). */
  clientMismatch?: boolean;
}

const UTM_KEYS = ["source", "medium", "campaign", "content", "term"] as const;

export function parseUtm(raw: unknown): Record<string, string> {
  const u = (raw ?? {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = u[k];
    if (typeof v === "string" && v.trim()) out[k] = v.trim().slice(0, 120);
  }
  return out;
}

export interface BuildInput {
  firstName: string;
  email: string;
  consentHealth: boolean;
  consentMarketing: boolean;
  answers: QuizAnswers;
  utm: Record<string, string>;
  ip: string | null;
  userAgent: string | null;
  published: ReadonlySet<string>;
  now: number;
}

/** Builds the document for a first-time submission. */
export function buildLead(i: BuildInput): LeadDoc {
  return {
    email: normalizeEmail(i.email),
    firstName: normalizeFirstName(i.firstName),
    consents: {
      health: i.consentHealth,
      marketing: i.consentMarketing,
      policyVersion: CONSENT_POLICY_VERSION,
      at: i.now,
      ip: i.ip,
      userAgent: i.userAgent?.slice(0, 240) ?? null,
    },
    answers: i.answers,
    computed: computeFor(i.answers, i.published),
    utm: i.utm,
    quizVersion: QUIZ_VERSION,
    retakeCount: 0,
    createdAt: i.now,
    updatedAt: i.now,
    healthPurgeAt: i.now + HEALTH_RETENTION_MS,
    purgeAt: i.now + LEAD_RETENTION_MS,
    convertedAt: null,
    unsubscribedAt: null,
    // E1 goes out immediately from the route; the sequence starts at E2. With
    // no marketing consent there is no sequence at all - only the transactional
    // result email is ever sent (Grtv. §6: no soft opt-in in Hungary).
    nextEmailAt: i.consentMarketing ? i.now + 36 * 3600_000 : null,
    nextEmailStep: i.consentMarketing ? 2 : null,
  };
}

/**
 * Merge patch for a retake. Keeps `createdAt` and bumps `retakeCount`, and
 * deliberately does NOT resurrect a withdrawn marketing consent unless the
 * lead ticked the box again.
 */
export function retakePatch(prev: LeadDoc, next: LeadDoc): Partial<LeadDoc> {
  return {
    firstName: next.firstName,
    consents: next.consents,
    answers: next.answers,
    computed: next.computed,
    utm: Object.keys(next.utm).length ? next.utm : prev.utm,
    quizVersion: next.quizVersion,
    retakeCount: (prev.retakeCount ?? 0) + 1,
    updatedAt: next.updatedAt,
    healthPurgeAt: next.healthPurgeAt,
    purgeAt: next.purgeAt,
    unsubscribedAt: next.consents.marketing ? null : prev.unsubscribedAt,
    nextEmailAt: next.consents.marketing ? next.nextEmailAt : null,
    nextEmailStep: next.consents.marketing ? next.nextEmailStep : null,
  };
}

/** Field-level check of the identity block (the answers are parsed separately). */
export function validateIdentity(
  firstName: string, email: string, consentHealth: boolean,
): ValidationError[] {
  const errs: ValidationError[] = [];
  const fn = validateFirstName(firstName);
  if (fn) errs.push({ field: "firstName", code: fn });
  const em = validateEmail(email);
  if (em) errs.push({ field: "email", code: em });
  // The Art. 9 legal basis. A submission without it is not a consent defect -
  // it is an unlawful processing request, so it is rejected outright.
  if (consentHealth !== true) errs.push({ field: "consentHealth", code: "required" });
  return errs;
}
