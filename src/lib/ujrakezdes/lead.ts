import { createHash } from "node:crypto";
import { normalizeEmail, validateEmail } from "@/lib/quiz/validate";
import {
  CONSENT_POLICY_VERSION, HEALTH_RETENTION_MS, LEAD_RETENTION_MS,
} from "@/lib/quiz/lead";
import { buildWeekPlan, type WeekPlan } from "./plan";
import {
  ANCHORS, CARES, DAYPARTS, DAYS, LEVELS, PLACES, SESSIONS,
  type Answers, type Anchor, type Care, type Daypart, type Days,
  type Level, type Place, type Session,
} from "./types";

// Lead magnet v2 - the server side of a submission.
//
// Not marked `server-only` for the same reason as src/lib/quiz/lead.ts: the
// acceptance tests import these directly, and the `node:crypto` import below
// already fails a browser build on its own.
//
// SHARED STORAGE, SEPARATE FUNNEL. These leads live in the SAME `quizLeads`
// collection as the older quiz's, tagged `variant: "lm_v2"`. That is a
// deliberate choice: the unsubscribe token, the GDPR erase/export flow and both
// retention clocks are all keyed on a document in that collection, and forking
// them for a second funnel would have created three more places for a GDPR bug
// to hide. The two funnels stay separate where separation is cheap (landing,
// wizard, reveal, emails) and share where sharing is safer.
//
// The document id is sha256(normalised email) - the same scheme, so a person
// who filled both quizzes is one lead, one unsubscribe, one erasure.

export const LM_VARIANT = "lm_v2" as const;
export const LM_QUIZ_VERSION = "lm_v2.0";

export const leadId = (email: string): string =>
  createHash("sha256").update(normalizeEmail(email)).digest("hex");

// ─── Validation ──────────────────────────────────────────────────────────────

const IN = <T extends string>(vals: readonly T[]) => (v: unknown): v is T =>
  typeof v === "string" && (vals as readonly string[]).includes(v);

const isAnchor = IN<Anchor>(ANCHORS);
const isLevel = IN<Level>(LEVELS);
const isDays = IN<Days>(DAYS);
const isSession = IN<Session>(SESSIONS);
const isPlace = IN<Place>(PLACES);
const isDaypart = IN<Daypart>(DAYPARTS);
const isCare = IN<Care>(CARES);

export type ValidationError = { field: string; code: string };

/**
 * Parses the answer block. Mirrors the client rules exactly, because the client
 * is only a convenience layer - this is the real gate.
 *
 * `care` is the only multi-select, and "Semmi különös" is exclusive: if it
 * arrives alongside a real caution the caution wins, because dropping a stated
 * knee problem in favour of "nothing in particular" is the one direction this
 * normalisation must never go.
 */
export function parseAnswers(raw: unknown): Answers | ValidationError[] {
  const a = (raw ?? {}) as Record<string, unknown>;
  const errs: ValidationError[] = [];
  const need = (ok: boolean, field: string) => { if (!ok) errs.push({ field, code: "invalid" }); };

  need(isAnchor(a.anchor), "anchor");
  need(isLevel(a.level), "level");
  need(isDays(a.days), "days");
  need(isSession(a.session), "session");
  need(isPlace(a.place), "place");
  need(isDaypart(a.daypart), "daypart");

  const rawCare = Array.isArray(a.care) ? a.care : [];
  const care = rawCare.filter(isCare);
  // An empty selection is not an error - it is "Semmi különös" by another name.
  need(care.length === rawCare.length, "care");
  const real = care.filter((c) => c !== "none");
  const normalisedCare: Care[] = real.length ? real : ["none"];

  if (errs.length) return errs;
  return {
    anchor: a.anchor as Anchor,
    level: a.level as Level,
    days: a.days as Days,
    session: a.session as Session,
    care: normalisedCare,
    place: a.place as Place,
    daypart: a.daypart as Daypart,
  };
}

export function validateIdentity(email: string): ValidationError[] {
  const em = validateEmail(email);
  return em ? [{ field: "email", code: em }] : [];
}

// ─── Document shape ──────────────────────────────────────────────────────────

export interface LmConsents {
  /** The single checkbox from spec §3. Unchecked → D0 only, no sequence. */
  marketing: boolean;
  /** Which wording they agreed to - `consent_lm_v1`. */
  textVersion: string;
  policyVersion: string;
  at: number;
  ip: string | null;
  userAgent: string | null;
}

export interface LmLeadDoc {
  variant: typeof LM_VARIANT;
  email: string;
  consents: LmConsents;
  answers: Answers;
  /** Denormalised so an email never has to re-derive the week. */
  computed: { trainingCount: number; sessionLabel: string; segment: Anchor };
  utm: Record<string, string>;
  quizVersion: string;
  retakeCount: number;
  createdAt: number;
  updatedAt: number;
  /** Q5 is health-adjacent, so it dies on the 12-month clock like the older
   *  quiz's body metrics - see docs/lead-magnet-v2-plan.md §4. */
  healthPurgeAt: number;
  purgeAt: number;
  convertedAt: number | null;
  unsubscribedAt: number | null;
  nextEmailAt: number | null;
  nextEmailStep: number | null;
  lastEmailAt?: number;
  lastEmailStep?: number;
  healthPurgedAt?: number;
}

/** The Art. 9 field paths stripped at 12 months for an `lm_v2` lead. */
export const LM_HEALTH_FIELDS = ["answers.care"] as const;

export interface BuildInput {
  email: string;
  consentMarketing: boolean;
  answers: Answers;
  utm: Record<string, string>;
  ip: string | null;
  userAgent: string | null;
  now: number;
}

/** D0 is sent inline by the route; the scheduled sequence starts at D3. */
const D3_OFFSET_MS = 3 * 24 * 3600_000;

export function buildLead(i: BuildInput): LmLeadDoc {
  const plan = buildWeekPlan(i.answers);
  return {
    variant: LM_VARIANT,
    email: normalizeEmail(i.email),
    consents: {
      marketing: i.consentMarketing,
      textVersion: "consent_lm_v1",
      policyVersion: CONSENT_POLICY_VERSION,
      at: i.now,
      ip: i.ip,
      userAgent: i.userAgent?.slice(0, 240) ?? null,
    },
    answers: i.answers,
    computed: {
      trainingCount: plan.trainingCount,
      sessionLabel: plan.sessionLabel,
      segment: i.answers.anchor,
    },
    utm: i.utm,
    quizVersion: LM_QUIZ_VERSION,
    retakeCount: 0,
    createdAt: i.now,
    updatedAt: i.now,
    healthPurgeAt: i.now + HEALTH_RETENTION_MS,
    purgeAt: i.now + LEAD_RETENTION_MS,
    convertedAt: null,
    unsubscribedAt: null,
    // No marketing consent → no sequence at all, only the transactional D0
    // (Grtv. §6: there is no soft opt-in in Hungary).
    nextEmailAt: i.consentMarketing ? i.now + D3_OFFSET_MS : null,
    nextEmailStep: i.consentMarketing ? 3 : null,
  };
}

/**
 * Merge patch for a retake. Keeps `createdAt` so acquisition date stays honest,
 * and deliberately does NOT resurrect a withdrawn consent unless they ticked
 * the box again.
 */
export function retakePatch(prev: LmLeadDoc, next: LmLeadDoc): Partial<LmLeadDoc> {
  return {
    variant: LM_VARIANT,
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

export type { WeekPlan };
