import { createHash } from "node:crypto";
import { normalizeEmail, validateEmail } from "@/lib/quiz/validate";
import {
  CONSENT_POLICY_VERSION, HEALTH_RETENTION_MS, LEAD_RETENTION_MS,
} from "@/lib/quiz/lead";
import { buildWeekPlan, type WeekPlan } from "./plan";
import { computeEnergy, type BodyInput, type EnergyResult } from "./energy";
import {
  ANCHORS, CARES, DAYPARTS, DAYS, FOCUSES, LEVELS, PLACES,
  type Answers, type Anchor, type Care, type Daypart, type Days,
  type Focus, type Level, type Place,
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
const isFocus = IN<Focus>(FOCUSES);
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
  need(isFocus(a.focus), "focus");
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
    focus: a.focus as Focus,
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
  /**
   * SEPARATE, EXPLICIT Art. 9 consent for the body metrics in the energy
   * module. Never implied by the marketing box and never bundled with it: the
   * two cover different data for different purposes, and one checkbox cannot
   * lawfully carry both. Absent entirely for a lead who skipped the module.
   */
  health?: boolean;
  healthTextVersion?: string;
  healthAt?: number;
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
  /** The energy module, when it was completed. Optional by construction: the
   *  funnel works identically without it. */
  body?: BodyInput;
  energy?: EnergyResult;
}

/**
 * The Art. 9 field paths stripped at 12 months for an `lm_v2` lead.
 *
 * The whole `body` block goes, and so does `energy` - a calorie target and a
 * protein target are derived from body metrics, so keeping them would retain
 * the health data by another name. What survives is the non-health answers that
 * drive segmentation, exactly as on the older quiz.
 */
export const LM_HEALTH_FIELDS = ["answers.care", "body", "energy"] as const;

/** The body-block fields the submit route deletes when a retake arrives without
 *  the energy module. Withdrawing the consent has to remove the data. */
export const LM_BODY_FIELDS = ["body", "energy"] as const;

export interface BuildInput {
  email: string;
  consentMarketing: boolean;
  /** Present only when the optional energy module was completed. */
  body?: BodyInput | null;
  consentHealth?: boolean;
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
  // The body block is only ever stored alongside an affirmative health consent.
  // Without it the metrics are simply dropped - there is no lawful basis to
  // keep them, so there is no branch where they are written "just in case".
  const withBody = i.body != null && i.consentHealth === true;
  return {
    variant: LM_VARIANT,
    email: normalizeEmail(i.email),
    consents: {
      marketing: i.consentMarketing,
      // Always written, never merely omitted. A merge write leaves absent keys
      // untouched, so omitting this on a submission without the module would
      // leave an old `health: true` standing over data that has just been
      // deleted - a consent record asserting something untrue. The grant
      // timestamp is kept either way, because when consent WAS given is a fact
      // the audit trail should retain.
      health: withBody,
      ...(withBody ? { healthTextVersion: "consent_lm_health_v1", healthAt: i.now } : {}),
      textVersion: "consent_lm_v1",
      policyVersion: CONSENT_POLICY_VERSION,
      at: i.now,
      ip: i.ip,
      userAgent: i.userAgent?.slice(0, 240) ?? null,
    },
    answers: i.answers,
    ...(withBody
      ? { body: i.body!, energy: computeEnergy(i.body!, i.answers.level, i.answers.days, i.answers.focus) }
      : {}),
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

/** Answer-set equality, order-insensitive on the one multi-select. */
export function sameAnswers(a: Answers | undefined, b: Answers): boolean {
  if (!a) return false;
  const care = (x: Answers) => [...x.care].sort().join(",");
  return (
    a.anchor === b.anchor && a.level === b.level && a.days === b.days &&
    a.focus === b.focus && a.place === b.place && a.daypart === b.daypart &&
    care(a) === care(b)
  );
}

/**
 * Merge patch for a retake. Keeps `createdAt` so acquisition date stays honest,
 * and deliberately does NOT resurrect a withdrawn consent unless they ticked
 * the box again.
 */
export function retakePatch(prev: LmLeadDoc, next: LmLeadDoc): Partial<LmLeadDoc> {
  return {
    // A retake is a RE-ANSWERING, not a re-save. Completing the optional energy
    // module posts the same answers again with a body block attached; counting
    // that as a retake would make the metric mean "filled the quiz twice" and
    // "used the calculator" at the same time, which is no metric at all.
    retakeCount: (prev.retakeCount ?? 0) + (sameAnswers(prev.answers, next.answers) ? 0 : 1),
    variant: LM_VARIANT,
    consents: next.consents,
    answers: next.answers,
    // A retake that skipped the module must not resurrect the previous body
    // block. The keys are OMITTED here rather than set to undefined - the admin
    // SDK rejects undefined - and the route deletes them via LM_BODY_FIELDS, so
    // re-answering without the health box actually erases the metrics.
    ...(next.body ? { body: next.body, energy: next.energy } : {}),
    computed: next.computed,
    utm: Object.keys(next.utm).length ? next.utm : prev.utm,
    quizVersion: next.quizVersion,
    updatedAt: next.updatedAt,
    healthPurgeAt: next.healthPurgeAt,
    purgeAt: next.purgeAt,
    unsubscribedAt: next.consents.marketing ? null : prev.unsubscribedAt,
    nextEmailAt: next.consents.marketing ? next.nextEmailAt : null,
    nextEmailStep: next.consents.marketing ? next.nextEmailStep : null,
  };
}

export type { WeekPlan };
export type { BodyInput, EnergyResult };
