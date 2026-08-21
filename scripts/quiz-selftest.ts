/**
 * Lead magnet quiz self-test - the spec's §14 acceptance table (T1-T11) turned
 * into assertions, plus the exhaustive branch sweeps its §14.1 audit annex
 * claims to have run. No test framework is wired in this repo, so this is a
 * plain assertion script, like the funnel/pricing self-tests.
 *
 * These are ACCEPTANCE criteria: the implementation is not done until this is
 * green (spec §13).
 *
 * Run:  node --import tsx scripts/quiz-selftest.ts
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { buildLead, leadId, parseAnswers, retakePatch, validateIdentity } from "../src/lib/quiz/lead";
import { verifyRightsToken } from "../src/lib/quiz/lead-token";
import { calories, steps, round50, round500, round005, bmr, activityMultiplier } from "../src/lib/quiz/calc";
import { recommend, resolve, SLUG, PLANNED } from "../src/lib/quiz/recommend";
import {
  normalizeFirstName, validateFirstName, validateEmail, normalizeEmail, canSubmit,
} from "../src/lib/quiz/validate";
import type { QuizAnswers, Goal, Sex, TrainingNow, LifeStage, StepsNow } from "../src/lib/quiz/types";

// Everything published in production as of 2026-08-21.
const PUBLISHED = new Set<string>([
  SLUG.START, SLUG.ELSO_LEPES, SLUG.TARTAS,
  SLUG.LAB_FENEK, SLUG.HAS_TORZS, SLUG.NAPINDITO, SLUG.NAPZARO,
]);

const base: QuizAnswers = {
  goal: "fat_loss", sex: "female", age_band: "30_39",
  height_cm: 168, weight_kg: 78, target_weight_kg: 68,
  daily_move: "desk", steps_now: "4_7k", training_now: "none",
  life_stage: "none", session_min: "10_15", obstacle: "no_time",
};
const A = (o: Partial<QuizAnswers> = {}): QuizAnswers => ({ ...base, ...o });
const rec = (a: QuizAnswers) => resolve(recommend(a), PUBLISHED);

let n = 0;
const ok = (label: string) => { n++; console.log(`  ✓ ${label}`); };

// ─── Rounding: the half-up rule is the whole point ───────────────────────────
{
  assert.equal(round50(1875), 1900, "1875 → 1900 (half UP, not to-even)");
  assert.equal(round50(1867.5), 1850);
  assert.equal(round500(7500), 7500);
  assert.equal(round500(7250), 7500, "exact half rounds up");
  assert.equal(round005(0.2497), 0.25);
  ok("rounding - exact halves go up, never to-even");
}

// ─── T1 ──────────────────────────────────────────────────────────────────────
{
  const a = A();
  assert.equal(bmr("female", 78, 168, 35), 1494, "BMR 780+1050-175-161");
  assert.equal(Number(activityMultiplier(a).toFixed(2)), 1.25);
  const c = calories(a);
  assert.equal(c.maintenanceKcal, 1850);
  assert.equal(c.goalKcal, 1600);
  assert.equal(c.note, "pace");
  assert.equal(Number(c.weeklyLossKg!.toFixed(2)), 0.25, "kb. 0,25 kg/hét");

  const r = rec(a);
  assert.equal(r.program, SLUG.ELSO_LEPES, "training=none → super-beginner");
  assert.equal(r.rule, "super_beginner");
  assert.equal(r.nextStep, SLUG.START);
  assert.equal(r.bonus, SLUG.LAB_FENEK);

  const s = steps(a);
  assert.equal(s.target, 8000, "5500+2000=7500 → clamp to band min 8000");
  assert.equal(s.note, "plus_1000", "gap 2500 → +1000 first week");
  ok("T1 - nő, 30_39, desk, fat_loss");
}

// ─── T2 ──────────────────────────────────────────────────────────────────────
{
  const a = A({
    sex: "male", age_band: "40_49", height_cm: 182, weight_kg: 95,
    daily_move: "mixed", steps_now: "7_10k", training_now: "regular",
    goal: "strength", target_weight_kg: null,
  });
  assert.equal(bmr("male", 95, 182, 45), 1867.5);
  assert.equal(Number(activityMultiplier(a).toFixed(2)), 1.47);
  const c = calories(a);
  assert.equal(c.maintenanceKcal, 2750);
  assert.equal(c.goalKcal, 2950);
  assert.equal(c.note, "none", "strength → fixed one-liner, no pace maths");

  const r = rec(a);
  assert.equal(r.primary, PLANNED.OTTHONI_ERO, "ideal target recorded even though unbuilt");
  assert.equal(r.program, SLUG.START, "falls back to the main program");
  assert.equal(r.fallbackUsed, true);
  assert.equal(r.copyMode, "strength");
  assert.equal(r.bonus, SLUG.HAS_TORZS);

  const s = steps(a);
  assert.equal(s.note, "already_walker", "8500 ≥ band max 8000");
  assert.equal(s.target, 8500);
  ok("T2 - férfi, strength, fallback + already_walker");
}

// ─── T3 ──────────────────────────────────────────────────────────────────────
{
  const a = A({
    sex: "female", age_band: "50_59", height_cm: 165, weight_kg: 70,
    daily_move: "desk", steps_now: "lt4k", training_now: "sometimes",
    life_stage: "menopause", goal: "tone", target_weight_kg: null,
  });
  const r = rec(a);
  assert.equal(r.rule, "life_stage");
  assert.equal(r.primary, PLANNED.VALTOZOKOR);
  assert.equal(r.program, SLUG.START, "menopause does not short-circuit; goal branch picks");
  assert.equal(r.fallbackUsed, true);
  assert.equal(r.copyMode, "menopause");
  assert.equal(r.bonus, SLUG.LAB_FENEK);

  const s = steps(a);
  assert.equal(s.target, 7000, "3000+2000=5000 → clamp to tone band min 7000");
  assert.equal(s.note, "two_stage", "gap 4000 → two-stage");
  assert.equal(s.firstStage, 5000);
  ok("T3 - menopauza, tone, kétlépcsős lépéscél");
}

// ─── T4 ──────────────────────────────────────────────────────────────────────
{
  const r = rec(A({ life_stage: "postpartum", goal: "fat_loss", training_now: "sometimes" }));
  assert.equal(r.primary, PLANNED.ANYA);
  assert.equal(r.program, SLUG.ELSO_LEPES);
  assert.equal(r.rule, "life_stage");
  assert.equal(r.copyMode, "gentle_postpartum");
  assert.equal(r.fallbackUsed, true);
  assert.equal(r.medicalDisclaimer, true, "medical clearance is mandatory here");
  ok("T4 - postpartum → Első Lépés + orvosi jóváhagyás");
}

// ─── T5 ──────────────────────────────────────────────────────────────────────
{
  const a = A({
    sex: "male", age_band: "18_29", daily_move: "active", steps_now: "10k_plus",
    training_now: "regular", goal: "posture_energy", target_weight_kg: null,
  });
  assert.equal(Number(activityMultiplier(a).toFixed(2)), 1.57, "theoretical maximum");
  const r = rec(a);
  assert.equal(r.program, SLUG.TARTAS);
  assert.equal(r.bonus, SLUG.NAPINDITO);
  const s = steps(a);
  assert.equal(s.note, "already_walker");
  assert.equal(s.target, 11000);
  ok("T5 - maximális szorzó, tartásjavító");
}

// ─── T6 ──────────────────────────────────────────────────────────────────────
{
  const c = calories(A({
    sex: "female", age_band: "60_plus", height_cm: 158, weight_kg: 48,
    daily_move: "desk", steps_now: "lt4k", training_now: "none",
    goal: "fat_loss", target_weight_kg: null,
  }));
  assert.equal(c.maintenanceKcal, 1200);
  assert.equal(c.goalKcal, 1200, "floor branch (b): goal = maintenance, no deficit");
  assert.equal(c.note, "floor");
  assert.equal(c.weeklyLossKg, null, "pace sentence must NOT render");
  ok("T6 - alsó korlát (b) ág, kis testalkat");
}

// ─── T7: the config test - flipping a flag redirects, with no code change ────
{
  const a = A({
    sex: "male", age_band: "40_49", height_cm: 182, weight_kg: 95,
    daily_move: "mixed", steps_now: "7_10k", training_now: "regular",
    goal: "strength", target_weight_kg: null,
  });
  const withEro = resolve(
    { ...recommend(a), program: PLANNED.OTTHONI_ERO },
    new Set([...PUBLISHED, PLANNED.OTTHONI_ERO]),
  );
  assert.equal(withEro.program, PLANNED.OTTHONI_ERO, "published → recommended directly");
  ok("T7 - a katalógus élesítése önmagában átirányít");
}

// ─── T8: the reality rule ────────────────────────────────────────────────────
{
  // Sweep every combination and assert nothing unpublished is ever named.
  const goals: Goal[] = ["fat_loss", "tone", "strength", "posture_energy", "restart"];
  const sexes: Sex[] = ["male", "female"];
  const trainings: TrainingNow[] = ["none", "sometimes", "regular"];
  const stages: LifeStage[] = ["postpartum", "menopause", "desk_strain", "none"];
  let combos = 0;
  for (const goal of goals) for (const sex of sexes) for (const training_now of trainings) for (const life_stage of stages) {
    const r = rec(A({ goal, sex, training_now, life_stage, target_weight_kg: null }));
    assert.ok(PUBLISHED.has(r.program), `program must be live: ${goal}/${life_stage} → ${r.program}`);
    assert.ok(r.bonus !== "" && PUBLISHED.has(r.bonus), `every lead gets a live bonus: ${r.bonus}`);
    if (r.nextStep) assert.ok(PUBLISHED.has(r.nextStep), `next step must be live: ${r.nextStep}`);
    combos++;
  }
  assert.equal(combos, 120);
  // And with an empty catalogue nothing is promised at all.
  const dead = resolve(recommend(A()), new Set<string>());
  assert.equal(dead.bonus, "", "no catalogue → no bonus promised");
  assert.equal(dead.nextStep, null, "no catalogue → no next-step block");
  ok(`T8 - valóság-szabály mind a ${combos} ágon + üres katalógus`);
}

// ─── T9: the override rule ───────────────────────────────────────────────────
{
  const c = calories(A({ weight_kg: 65, target_weight_kg: 68 }));
  assert.equal(c.note, "maintain");
  assert.equal(c.maintenanceKcal, c.goalKcal, "target ≥ current → the two numbers match");
  assert.equal(c.weeklyLossKg, null, "no pace sentence");
  assert.equal(c.fourWeekLossKg, null, "no checkpoint line");
  ok("T9 - felülírási szabály (cél ≥ jelenlegi súly)");
}

// ─── T11: the floor paradox ──────────────────────────────────────────────────
{
  const c = calories(A({
    sex: "female", age_band: "60_plus", height_cm: 145, weight_kg: 40,
    daily_move: "desk", steps_now: "lt4k", training_now: "none",
    goal: "fat_loss", target_weight_kg: 38,
  }));
  assert.equal(c.maintenanceKcal, 1000);
  assert.equal(c.goalKcal, 1000);
  assert.equal(c.note, "floor");
  assert.ok(c.goalKcal <= c.maintenanceKcal, "FORBIDDEN: goal above maintenance on a fat-loss goal");
  ok("T11 - korlát-paradoxon (a cél soha nem lehet a szinten tartó felett)");
}

// ─── Sweep: every goal × step band reaches a sane branch ─────────────────────
{
  const goals: Goal[] = ["fat_loss", "tone", "strength", "posture_energy", "restart"];
  const bands: StepsNow[] = ["lt4k", "4_7k", "7_10k", "10k_plus"];
  const seen = new Set<string>();
  for (const goal of goals) for (const steps_now of bands) {
    const s = steps(A({ goal, steps_now }));
    seen.add(s.note);
    assert.ok(s.target > 0);
    if (s.note === "two_stage") assert.ok(s.firstStage! < s.target, "first stage below the target");
    if (s.note !== "already_walker") assert.ok(s.target >= s.current, "target never below current");
  }
  assert.equal(seen.size, 4, `all four step branches reachable, got: ${[...seen].join(", ")}`);
  ok("lépés-ágak - mind a 20 kombináció, mind a 4 ág elérhető");
}

// ─── Sweep: the goal calorie is never above maintenance for fat_loss ─────────
{
  const heights = [145, 158, 168, 182, 195];
  const weights = [40, 55, 78, 95, 130];
  let checked = 0;
  for (const sex of ["male", "female"] as Sex[]) for (const height_cm of heights) for (const weight_kg of weights) {
    const c = calories(A({ sex, height_cm, weight_kg, goal: "fat_loss", target_weight_kg: null }));
    assert.ok(c.goalKcal <= c.maintenanceKcal, `${sex} ${height_cm}/${weight_kg}: goal > maintenance`);
    assert.ok(c.goalKcal > 0);
    checked++;
  }
  ok(`szélsőértékek - ${checked} testalkat, a cél sosem lépi túl a szinten tartót`);
}

// ─── D5: the bonus must not depend on sex ────────────────────────────────────
{
  const goals: Goal[] = ["fat_loss", "tone", "strength", "posture_energy", "restart"];
  for (const goal of goals) {
    const m = rec(A({ goal, sex: "male", target_weight_kg: null })).bonus;
    const f = rec(A({ goal, sex: "female", target_weight_kg: null })).bonus;
    assert.equal(m, f, `bonus must match across sexes for goal=${goal}`);
  }
  ok("D5 - a bónusz a célból következik, nem a nemből");
}

// ─── T10: S14 field validation ───────────────────────────────────────────────
{
  assert.equal(normalizeFirstName("  anna "), "Anna", "trim + capitalise");
  assert.equal(validateFirstName(" anna "), null);
  assert.equal(validateFirstName("A"), "too_short");
  assert.equal(validateFirstName("Anna2"), "bad_chars", "digits rejected");
  assert.equal(validateFirstName("Áron-Béla"), null, "accents and hyphen accepted");
  assert.equal(validateFirstName("Anna Mária"), null, "space accepted");
  assert.equal(validateFirstName(""), "required");
  assert.equal(validateFirstName("x".repeat(31)), "too_long");
  assert.equal(normalizeFirstName("áron"), "Áron", "Hungarian upper-casing");

  assert.equal(validateEmail("anna@pelda.hu"), null);
  assert.equal(validateEmail("anna@pelda"), "bad_email", "a bare host is a typo");
  assert.equal(validateEmail("anna.pelda.hu"), "bad_email");
  assert.equal(normalizeEmail("  Anna@Pelda.HU "), "anna@pelda.hu", "upsert key is stable");

  // The CTA needs all three at once - marketing consent stays optional.
  const form = { firstName: "Anna", email: "anna@pelda.hu", consentHealth: true, consentMarketing: false };
  assert.equal(canSubmit(form), true, "marketing consent is NOT required");
  assert.equal(canSubmit({ ...form, consentHealth: false }), false, "health consent is the Art. 9 basis");
  assert.equal(canSubmit({ ...form, firstName: "A" }), false);
  assert.equal(canSubmit({ ...form, email: "nope" }), false);
  ok("T10 - S14 validáció + a CTA három együttes feltétele");
}

// ─── Server-side gate: the API must not trust the client ─────────────────────
{
  const good = { ...base } as unknown as Record<string, unknown>;
  assert.ok(!Array.isArray(parseAnswers(good)), "a valid block parses");

  // Every enum is closed - an unknown value is rejected, not coerced.
  for (const [field, bad] of [
    ["goal", "bulk"], ["sex", "other"], ["age_band", "12_17"],
    ["daily_move", "athlete"], ["steps_now", "20k"], ["training_now", "daily"],
    ["life_stage", "pregnant"], ["session_min", "60_90"], ["obstacle", "money"],
  ] as const) {
    const r = parseAnswers({ ...good, [field]: bad });
    assert.ok(Array.isArray(r) && r.some((e) => e.field === field), `${field}=${bad} rejected`);
  }

  // Ranges, not just types.
  for (const [field, bad] of [["height_cm", 119], ["height_cm", 231], ["weight_kg", 34], ["weight_kg", 251]] as const) {
    const r = parseAnswers({ ...good, [field]: bad });
    assert.ok(Array.isArray(r) && r.some((e) => e.field === field), `${field}=${bad} out of range`);
  }

  // A goal change must not leave a stale target behind (spec §11.1).
  const switched = parseAnswers({ ...good, goal: "strength", target_weight_kg: 68 });
  assert.ok(!Array.isArray(switched));
  assert.equal((switched as QuizAnswers).target_weight_kg, null, "target dropped for a non-fat_loss goal");

  ok("szerveroldali validáció - zárt enumok, tartományok, elévült cél-súly");
}

// ─── Consent is the legal basis, not a checkbox ──────────────────────────────
{
  assert.deepEqual(validateIdentity("Anna", "anna@pelda.hu", true), []);
  const withoutHealth = validateIdentity("Anna", "anna@pelda.hu", false);
  assert.ok(
    withoutHealth.some((e) => e.field === "consentHealth" && e.code === "required"),
    "Art. 9 consent missing → the submission is rejected server-side, not just UI-disabled",
  );
  ok("hozzájárulás - a 9. cikkes jogalap nélkül a szerver elutasít");
}

// ─── Lead identity + retake ──────────────────────────────────────────────────
{
  // The doc id is stable across casing/whitespace, and never contains the address.
  const a = leadId("  Anna@Pelda.HU ");
  const b = leadId("anna@pelda.hu");
  assert.equal(a, b, "upsert key survives casing and padding");
  assert.match(a, /^[0-9a-f]{64}$/, "opaque hash - no PII in the document path");
  assert.notEqual(leadId("anna@pelda.hu"), leadId("anna2@pelda.hu"));

  const published = PUBLISHED;
  const mk = (marketing: boolean, now: number) => buildLead({
    firstName: " anna ", email: "Anna@Pelda.hu", consentHealth: true,
    consentMarketing: marketing, answers: A(), utm: { source: "meta" },
    ip: "1.2.3.4", userAgent: "x", published, now,
  });

  const first = mk(true, 1_000_000);
  assert.equal(first.firstName, "Anna", "normalised on the way in");
  assert.equal(first.email, "anna@pelda.hu");
  assert.equal(first.retakeCount, 0);
  assert.ok(first.healthPurgeAt < first.purgeAt, "Art. 9 data expires before the rest");
  assert.ok(first.nextEmailAt !== null, "consented lead enters the sequence");

  // No marketing consent → no sequence at all (Grtv. §6, no soft opt-in).
  const quiet = mk(false, 1_000_000);
  assert.equal(quiet.nextEmailAt, null);
  assert.equal(quiet.nextEmailStep, null);

  // A retake keeps the acquisition date and counts up.
  const second = mk(true, 9_000_000);
  const patch = retakePatch(first, second);
  assert.equal(patch.retakeCount, 1);
  assert.equal(patch.createdAt, undefined, "createdAt is never overwritten");
  assert.ok(patch.purgeAt! > first.purgeAt, "retention clock restarts on a retake");

  // A retake WITHOUT the marketing box must not resurrect a withdrawn consent.
  const quietRetake = retakePatch({ ...first, unsubscribedAt: 5_000_000 }, mk(false, 9_000_000));
  assert.equal(quietRetake.nextEmailAt, null, "silence stays silence");
  assert.equal(quietRetake.unsubscribedAt, 5_000_000, "withdrawal is preserved");
  ok("lead - stabil upsert-kulcs, kettős megőrzési óra, retake-szabályok");
}

// ─── Rights tokens: destructive, so they expire ──────────────────────────────
{
  process.env.CRON_SECRET ||= "selftest-secret";
  const id = leadId("anna@pelda.hu");
  const now = 1_000_000_000;
  const exp = now + 3600_000;
  const t = (a: "erase" | "export") =>
    createHmac("sha256", process.env.CRON_SECRET!).update(`lead:${a}:${id}:${exp}`).digest("hex").slice(0, 40);

  assert.equal(verifyRightsToken(id, "erase", exp, t("erase"), now), true);
  assert.equal(verifyRightsToken(id, "erase", exp, t("erase"), exp + 1), false, "expired → refused");
  assert.equal(verifyRightsToken(id, "export", exp, t("erase"), now), false, "an erase token cannot export");
  assert.equal(verifyRightsToken(leadId("b@c.hu"), "erase", exp, t("erase"), now), false, "bound to one lead");
  assert.equal(verifyRightsToken(id, "erase", exp, "", now), false);
  ok("jogérvényesítési token - lejár, akcióhoz és leadhez kötött");
}

console.log(`\nAll quiz self-tests passed (${n} blocks).`);
