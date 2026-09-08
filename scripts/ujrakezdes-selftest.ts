/**
 * Lead magnet v2 (/ujrakezdes) self-test.
 *
 * No test framework is wired in this repo, so this is a plain assertion script,
 * like the funnel/pricing/quiz self-tests. These are ACCEPTANCE criteria: the
 * implementation is not done until this is green.
 *
 * The assertions fall into four groups, and each exists because getting it
 * wrong would be invisible in a click-through:
 *   1. the plan derivation (what the reveal draws),
 *   2. answer parsing (the server's real gate, not the client's),
 *   3. consent + sequence scheduling (the legally load-bearing part),
 *   4. the copy rules offer v3 §3 makes non-negotiable.
 *
 * Run:  node --import tsx scripts/ujrakezdes-selftest.ts
 */
import assert from "node:assert/strict";
import { buildWeekPlan, daysCount, trainingDays, DEFAULT_SESSION_MIN } from "../src/lib/ujrakezdes/plan";
import {
  buildLead, leadId, LM_BODY_FIELDS, LM_HEALTH_FIELDS, LM_VARIANT, parseAnswers,
  retakePatch, validateIdentity,
} from "../src/lib/ujrakezdes/lead";
import {
  isLmStep, lmDueAt, lmNextStep, lmScheduleAfter, lmStopReason, LM_LAST_STEP,
} from "../src/lib/ujrakezdes/sequence";
import type { Answers, Days, Focus } from "../src/lib/ujrakezdes/types";
import * as C from "../src/app/ujrakezdes/copy";
import {
  activityMultiplier, bmr, computeEnergy, macros, parseBody, targetCalories,
  tdee, tempoCorrection, waterLitres, stepTarget, CALORIE_FLOOR,
  recommendPrograms, PROGRAM,
  type BodyInput,
} from "../src/lib/ujrakezdes/energy";
import { PRICING_BAND } from "../src/components/landing/offer-copy";
import { CAT } from "../src/lib/categories";
import { CAT_HEX, CAT_WORD, catHex, catWordOf } from "../emails/components/WorkoutCards";

const ENERGY_CONSENT = C.ENERGY.consent;

const base: Answers = {
  anchor: "restart", level: "none", days: "3", focus: "teljes",
  care: ["none"], place: "living_room", daypart: "evening",
};
const A = (o: Partial<Answers> = {}): Answers => ({ ...base, ...o });

let n = 0;
const ok = (label: string) => { n++; console.log(`  ✓ ${label}`); };

// ─── 1. Plan derivation ──────────────────────────────────────────────────────
{
  console.log("\nA terv levezetése");

  for (const [d, want] of [["2", 2], ["3", 3], ["4", 4], ["flex", 3]] as [Days, number][]) {
    assert.equal(daysCount(d), want, `${d} → ${want}`);
    assert.equal(trainingDays(d).length, want, `${d} → ${want} edzésnap`);
  }
  ok("a napszám minden válaszra levezethető - a rugalmas is hármat kap, nem nullát");

  // Rest days are the product's differentiator, so a week must never be full.
  for (const d of ["2", "3", "4", "flex"] as Days[]) {
    const plan = buildWeekPlan(A({ days: d }));
    assert.equal(plan.days.length, 7, "a hét mindig hét napból áll");
    const rest = plan.days.filter((x) => !x.training).length;
    assert.ok(rest >= 3, `${d}: legalább 3 pihenőnap, kapott ${rest}`);
    assert.ok(plan.days[0]!.training, "a hét hétfőn indul edzéssel");
  }
  ok("minden tervben marad pihenőnap, és hétfőn kezdődik");

  // The session length is NOT asked - the Start programme's workouts are ~30
  // minutes and that is not a dial we can turn. The grid must print the
  // programme's real length, never a number invented from an answer.
  const p = buildWeekPlan(A());
  assert.equal(p.firstWorkoutMinutes, DEFAULT_SESSION_MIN, "az alapértelmezett a program valós hossza");
  assert.equal(p.sessionLabel, `${DEFAULT_SESSION_MIN} perc`);
  const fromCatalog = buildWeekPlan(A(), 26);
  assert.equal(fromCatalog.firstWorkoutMinutes, 26, "a katalógus valós hossza felülírja");
  for (const day of p.days) {
    assert.equal(day.training, day.minutes !== null, "pihenőnapon nincs perc");
  }
  ok("a hossz a programból jön, nem egy meg nem válaszolható kérdésből");

  // Q5 drives the reveal's care notes, and "none" must never produce one.
  assert.deepEqual(buildWeekPlan(A({ care: ["none"] })).care, []);
  assert.deepEqual(buildWeekPlan(A({ care: ["knee", "quiet"] })).care, ["knee", "quiet"]);
  ok("a testre figyelő megjegyzések csak valódi választásra jelennek meg");
}

// ─── 2. Answer parsing - the server's real gate ──────────────────────────────
{
  console.log("\nVálaszok ellenőrzése");

  assert.deepEqual(parseAnswers(base), base);
  ok("érvényes válaszblokk átmegy");

  for (const field of ["anchor", "level", "days", "focus", "place", "daypart"]) {
    const bad = { ...base, [field]: "nonsense" };
    const res = parseAnswers(bad);
    assert.ok(Array.isArray(res), `${field}: a hibás érték elutasítva`);
    assert.ok(res.some((e) => e.field === field), `${field}: a hibás mező megnevezve`);
  }
  ok("minden kérdés szerver oldalon is ellenőrzött - a kliens nem megbízható");

  // "Semmi különös" is exclusive, and normalisation must never go the direction
  // that DROPS a stated caution.
  const mixed = parseAnswers({ ...base, care: ["none", "back"] });
  assert.ok(!Array.isArray(mixed));
  assert.deepEqual(mixed.care, ["back"], "a valódi kímélet nyer a »semmi különös« ellen");
  const empty = parseAnswers({ ...base, care: [] });
  assert.ok(!Array.isArray(empty));
  assert.deepEqual(empty.care, ["none"], "az üres választás »semmi különös«, nem hiba");
  ok("a Q5 többes választása normalizálva, kímélet-veszteség nélkül");

  assert.deepEqual(validateIdentity("nem-email"), [{ field: "email", code: "bad_email" }]);
  assert.deepEqual(validateIdentity("a@b.hu"), []);
  ok("a kapuban csak az e-mail cím kötelező");
}

// ─── 3. Consent and scheduling ───────────────────────────────────────────────
{
  console.log("\nHozzájárulás és ütemezés");

  const now = 1_700_000_000_000;
  const mk = (marketing: boolean) => buildLead({
    email: " Teszt@Example.HU ", consentMarketing: marketing, answers: base,
    utm: {}, ip: null, userAgent: null, now,
  });

  const yes = mk(true);
  const no = mk(false);

  assert.equal(yes.email, "teszt@example.hu", "az e-mail normalizálva tárolódik");
  assert.equal(leadId("TESZT@example.hu"), leadId("teszt@example.hu "), "az azonosító a normalizált címből");
  assert.equal(yes.variant, LM_VARIANT, "a rekord megjelöli, melyik tölcsérből jött");
  assert.equal(yes.consents.textVersion, "consent_lm_v1", "a hozzájárulás szövegverziója rögzítve");
  assert.equal(yes.consents.textVersion, C.CONSENT_TEXT_VERSION, "a copy és a rekord ugyanazt a verziót mondja");
  ok("a lead rekord azonosítója, változata és hozzájárulás-verziója rögzített");

  // Grtv. §6: no soft opt-in in Hungary. No box, no sequence - ever.
  assert.equal(no.nextEmailAt, null, "hozzájárulás nélkül nincs ütemezett levél");
  assert.equal(no.nextEmailStep, null);
  assert.equal(yes.nextEmailStep, 3, "hozzájárulással a D3 az első ütemezett lépés");
  assert.equal(yes.nextEmailAt, now + 3 * 24 * 3600_000, "a D3 a 3. napon esedékes");
  ok("hozzájárulás nélkül csak a tranzakciós D0 megy ki");

  // Timed from createdAt, so a missed cron run catches up instead of drifting.
  assert.equal(lmDueAt(now, 6), now + 6 * 24 * 3600_000, "a D6 a 6. napon esedékes");
  assert.equal(lmNextStep(3), 6);
  assert.equal(lmNextStep(6), null, "a sorozat a D6 után véget ér");
  assert.equal(LM_LAST_STEP, 6, "nincs D10 - határidős levelet nem küldünk");
  assert.deepEqual(lmScheduleAfter(yes, 6), { nextEmailAt: null, nextEmailStep: null });
  ok("a sorozat D0 · D3 · D6, createdAt-hoz kötve, D10 nélkül");

  assert.ok(!isLmStep(2) && !isLmStep(7) && isLmStep(3) && isLmStep(6));
  ok("a cron csak az ehhez a változathoz tartozó lépéseket küldi");

  // Every stop reason, because each one is a mail somebody must not receive.
  assert.equal(lmStopReason(yes, 3), null);
  assert.equal(lmStopReason({ ...yes, unsubscribedAt: now }, 3), "unsubscribed");
  assert.equal(lmStopReason({ ...yes, convertedAt: now }, 6), "converted");
  assert.equal(lmStopReason(no, 3), "no_consent");
  assert.equal(lmStopReason(yes, 9), "finished");
  ok("leiratkozás, vásárlás és visszavont hozzájárulás mind megállítja a sorozatot");

  // A retake must not resurrect a withdrawn consent.
  const again = mk(false);
  const patch = retakePatch({ ...yes, unsubscribedAt: now }, again);
  assert.equal(patch.nextEmailAt, null, "újratöltés nem támasztja fel a visszavont hozzájárulást");
  assert.equal(patch.unsubscribedAt, now, "a leiratkozás megmarad");
  // Same answers → not a retake. The counter measures re-ANSWERING, not
  // re-saving; see the energy-module block below for why that matters.
  assert.equal(patch.retakeCount, 0, "azonos válaszok nem növelik a számlálót");
  assert.equal(retakePatch(yes, mk(true)).unsubscribedAt, null, "újra bejelölve visszatér a sorozat");
  ok("az újratöltés megőrzi az akvizíciós dátumot és a leiratkozást");

  assert.ok(yes.healthPurgeAt < yes.purgeAt, "a 9. cikkes mező hamarabb évül");
  assert.deepEqual([...LM_HEALTH_FIELDS], ["answers.care", "body", "energy"]);
  ok("a Q5 a 12 hónapos órán fut, a rekord többi része a 24 hónaposon");
}

// ─── 4. The copy rules offer v3 §3 makes non-negotiable ──────────────────────
{
  console.log("\nCopy-szabályok");

  const strings: string[] = [];
  // The energy module carries a SCOPED waiver of hard rule 3.2 (a calorie
  // target is a weight-management number). It is excluded from the sweep below
  // and asserted separately, so the waiver cannot quietly widen into the rest
  // of the funnel.
  const { ENERGY, ...CORE } = C as Record<string, unknown>;
  const walk = (v: unknown): void => {
    if (typeof v === "string") strings.push(v);
    else if (typeof v === "function") { try { strings.push(String((v as (...x: never[]) => string)(3 as never, "20–30 perc" as never))); } catch { /* not a copy fn */ } }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(CORE);
  assert.ok(strings.length > 40, "a copy modul bejárása értelmes mennyiséget talált");

  // Rule 1: no exclamation marks. Anywhere.
  for (const s of strings) assert.ok(!s.includes("!"), `felkiáltójel: ${s.slice(0, 60)}`);
  ok("nincs felkiáltójel egyetlen stringben sem");

  // Rule 2: no weight-loss vocabulary or body-transformation promises.
  const banned = ["fogyás", "fogyni", "zsírégetés", "kockás has", "testsúly", "kalória", "kilo", "before/after"];
  for (const s of strings) {
    const low = s.toLowerCase();
    for (const b of banned) assert.ok(!low.includes(b), `tiltott szó "${b}": ${s.slice(0, 60)}`);
  }
  ok("nincs fogyás-szókincs és testsúly-ígéret");

  // Offer v3 §7 migrations must not reappear through this surface.
  const migrated = ["12 990", "40 edzés", "12 edzés", "hat héten belül", "szeptember 30", "alapító"];
  for (const s of strings) {
    const low = s.toLowerCase();
    for (const m of migrated) assert.ok(!low.includes(m), `visszaszivárgott: "${m}" — ${s.slice(0, 60)}`);
  }
  ok("egyik migrált szám és határidő sem szivárgott vissza");

  // Hard rule 6: no forint amount may be written into copy - the offer block
  // renders PricingBand, which interpolates from PRICES.
  for (const s of strings) {
    assert.ok(!/\d[\d\s ]*Ft/.test(s), `beégetett összeg: ${s.slice(0, 60)}`);
  }
  ok("nincs beégetett forintösszeg - az árak a PRICES-ből jönnek");

  // The segment postscripts drive D3, so each anchor must resolve predictably.
  for (const seg of ["careful", "no_energy", "stronger", "browsing"] as const) {
    assert.ok(C.SEGMENT_PS[seg], `${seg}: hiányzó utóirat`);
  }
  assert.equal(C.SEGMENT_PS.restart, undefined, "az »újrakezdenék« szegmensnek szándékosan nincs utóirata");
  ok("a Q1 szegmensek utóiratai megvannak");

  // ── The energy module: the waiver, held to its stated limits ──
  const en: string[] = [];
  const walkEn = (v: unknown): void => {
    if (typeof v === "string") en.push(v);
    else if (Array.isArray(v)) v.forEach(walkEn);
    else if (v && typeof v === "object") Object.values(v).forEach(walkEn);
  };
  walkEn(ENERGY);
  assert.ok(en.length > 20, "a modul copy bejárása értelmes mennyiséget talált");

  for (const s2 of en) assert.ok(!s2.includes("!"), `felkiáltójel a modulban: ${s2.slice(0, 60)}`);

  // Waived: "kalória", "testsúly", "fogyás" - the arithmetic needs them.
  // NOT waived, and asserted here so the exemption cannot creep:
  const stillBanned = [
    "zsírégetés", "kockás has", "bikini", "before", "after",
    "túlsúlyos", "elhízott", "alulsúlyos", "bmi",   // no body-labelling
    "garantál", "garantált",                        // no outcome guarantee
    "hét alatt", "kg-ot fogysz",                    // no timeline projection
  ];
  for (const s2 of en) {
    const low = s2.toLowerCase();
    for (const b of stillBanned) {
      assert.ok(!low.includes(b), `a felmentés nem terjed ki erre: "${b}" — ${s2.slice(0, 60)}`);
    }
  }
  ok("az energia-modul felmentése szűk marad: nincs testcímkézés, ígéret és időzítés");

  // The health consent must name the exact fields it covers - a consent that
  // does not say what it collects is not informed.
  for (const field of ["nem", "kor", "magasság", "testsúly"]) {
    assert.ok(ENERGY_CONSENT.toLowerCase().includes(field), `a hozzájárulás nem nevezi meg: ${field}`);
  }
  assert.ok(ENERGY_CONSENT.toLowerCase().includes("töröltethetem"), "a törlés joga nincs megemlítve");
  ok("a 9. cikkes hozzájárulás megnevezi a kezelt adatokat és a törlés jogát");

  assert.ok(C.ENERGY.disclaimer.includes("nem minősülnek orvosi"), "hiányzik az orvosi tanács kizárása");
  ok("az eredmény tájékoztató jellege ki van mondva");

  // ── Sections ──
  // The chrome names sections rather than counting questions, so each label has
  // to be short enough to sit in the counter slot and specific enough to mean
  // something. Two words is the ceiling.
  assert.ok(C.SECTIONS.length >= 3 && C.SECTIONS.length <= 5, "3-5 szekció, különben nem szekció");
  for (const sec of C.SECTIONS) {
    assert.ok(sec.label.length <= 14, `túl hosszú szekciónév: ${sec.label}`);
    assert.ok(sec.label.split(" ").length <= 2, `több mint két szó: ${sec.label}`);
    assert.ok(!sec.label.includes("!"), "felkiáltójel a szekciónévben");
  }
  assert.equal(new Set(C.SECTIONS.map((x) => x.key)).size, C.SECTIONS.length, "egyedi kulcsok");
  assert.equal(new Set(C.SECTIONS.map((x) => x.label)).size, C.SECTIONS.length, "egyedi címkék");
  ok("a szekciók rövidek, egyediek, és nem kérdésszámot mondanak");

  // The body step must name its OUTCOME, not its fields - that was the whole
  // complaint about "Alapadatok".
  assert.ok(/kalória/i.test(C.ENERGY.formHeading), "a fejléc nem mondja meg, mire jó");
  assert.ok(/lépéscélod|fehérje/i.test(C.ENERGY.formSub), "az alcím nem sorolja fel, mit kapsz");
  ok("a testadat-képernyő az eredményt nevezi meg, nem a mezőket");

  // The seven questions, in the specced order, with the interstitial after Q4.
  assert.equal(C.Q_CARE.options.length, 4);
  assert.equal(C.Q_ANCHOR.options.length, 5);
  assert.equal(C.INTERSTITIAL.lines.length, 2);
  ok("a kérdések és a köztes képernyő a specifikáció szerinti alakúak");
}

// ─── 5. The energy module's arithmetic ───────────────────────────────────────
{
  console.log("\nEnergia-modul");

  // Mifflin-St Jeor, checked against the source implementation by hand.
  // Female 70kg/170cm/40y: 10*70 + 6.25*170 - 5*40 - 161 = 700 + 1062.5 - 200 - 161
  assert.equal(bmr("female", 70, 170, 40), 1401.5);
  // Male, same body: the +5 constant instead of -161, a 166 kcal spread.
  assert.equal(bmr("male", 70, 170, 40), 1567.5);
  assert.equal(bmr("male", 70, 170, 40) - bmr("female", 70, 170, 40), 166);
  ok("Mifflin-St Jeor a forrásimplementációval egyező értéket ad");

  // Activity is DERIVED from the quiz, never asked twice.
  assert.equal(activityMultiplier("none", "2"), 1.2, "a legalacsonyabb kombináció a padló");
  assert.ok(activityMultiplier("regular", "4") <= 1.725, "a szorzó a táblázat tetejét nem lépi túl");
  assert.ok(
    activityMultiplier("none", "2") < activityMultiplier("none", "4"),
    "több edzésnap magasabb szorzót ad",
  );
  assert.ok(
    activityMultiplier("none", "3") < activityMultiplier("regular", "3"),
    "aktívabb kiindulás magasabb szorzót ad",
  );
  // `flex` resolves to 3 in the plan, so it must resolve to 3 here too.
  assert.equal(activityMultiplier("rare", "flex"), activityMultiplier("rare", "3"));
  ok("az aktivitás a Q2/Q3 válaszokból származik, és a rugalmas hét itt is 3 nap");

  // The tempo table, value for value against the source.
  assert.equal(tempoCorrection("fogyas", "kozepes"), -400);
  assert.equal(tempoCorrection("fogyas", "intenziv"), -600);
  assert.equal(tempoCorrection("tonus", "laza"), 0);
  assert.equal(tempoCorrection("tomeg", "intenziv"), 400);
  ok("a tempó-korrekciós tábla megegyezik a forrással");

  // THE SAFETY FLOOR - the one deliberate divergence from the source.
  const tiny: BodyInput = {
    sex: "female", age: 60, heightCm: 150, weightKg: 45,
    goal: "fogyas", tempo: "intenziv",
  };
  const low = computeEnergy(tiny, "none", "2");
  assert.ok(low.kcal >= CALORIE_FLOOR.female, "a női padló alá nem megy");
  assert.equal(low.floored, true, "a padlózás jelezve van, nem elhallgatva");
  const raw = Math.round(tdee(bmr("female", 45, 150, 60), 1.2) - 600);
  assert.ok(raw < CALORIE_FLOOR.female, "a teszt tényleg a padló alatti esetet vizsgálja");
  ok("a kalóriacél nem megy a biztonsági padló alá, és ezt meg is mondja");

  const normal = computeEnergy(
    { sex: "male", age: 35, heightCm: 182, weightKg: 88, goal: "tonus", tempo: "kozepes" },
    "weekly", "3",
  );
  assert.equal(normal.floored, false, "átlagos testalkatnál nincs padlózás");
  assert.ok(normal.kcal > 1800 && normal.kcal < 3500, "az érték hihető tartományban van");
  ok("átlagos bemenetre hihető, nem padlózott célt ad");

  // Macros must reconstruct the target, or the plate does not add up.
  const m = macros(80, 2000, "fogyas");
  assert.equal(m.proteinG, 160, "fehérje 2,0 g/kg fogyásnál");
  const kcalFromMacros = m.proteinG * 4 + m.carbsG * 4 + m.fatG * 9;
  assert.ok(Math.abs(kcalFromMacros - 2000) < 25, `a makrók visszaadják a célt (${kcalFromMacros})`);
  assert.ok(macros(80, 2000, "tonus").proteinG > m.proteinG, "tónusosodásnál több fehérje");
  ok("a makrók kiadják a kalóriacélt, és a fehérje a cél szerint változik");

  assert.equal(stepTarget("fogyas"), 8000);
  assert.equal(stepTarget("tomeg"), 6000, "izomépítésnél alacsonyabb lépéscél");
  assert.ok(waterLitres(80, 1.55) > waterLitres(80, 1.2), "aktívabbnak több víz");
  ok("a lépés- és vízcélok a forrás szerint alakulnak");

  // Server-side validation is the real gate.
  const good = { sex: "female", age: 33, heightCm: 168, weightKg: 64, goal: "tonus", tempo: "laza" };
  assert.ok(!Array.isArray(parseBody(good)));
  for (const [field, bad] of [
    ["age", { ...good, age: 8 }], ["age", { ...good, age: 120 }],
    ["heightCm", { ...good, heightCm: 60 }], ["weightKg", { ...good, weightKg: 500 }],
    ["sex", { ...good, sex: "egyeb" }], ["goal", { ...good, goal: "nonsense" }],
  ] as [string, unknown][]) {
    const r = parseBody(bad);
    assert.ok(Array.isArray(r) && r.includes(field), `${field}: a tartományon kívüli érték elutasítva`);
  }
  ok("a testadatok tartománya szerver oldalon is ellenőrzött");

  // Consent is what makes storage lawful, so it gates storage - not the UI.
  const base = {
    email: "a@b.hu", answers: A(), utm: {}, ip: null, userAgent: null, now: 1_700_000_000_000,
  };
  const withBody = buildLead({ ...base, consentMarketing: false, body: good as BodyInput, consentHealth: true });
  const noConsent = buildLead({ ...base, consentMarketing: false, body: good as BodyInput, consentHealth: false });
  assert.ok(withBody.body && withBody.energy, "hozzájárulással tárolódik a testadat");
  assert.equal(withBody.consents.health, true);
  assert.equal(withBody.consents.healthTextVersion, "consent_lm_health_v1");
  assert.equal(noConsent.body, undefined, "hozzájárulás nélkül nem tárolódik testadat");
  assert.equal(noConsent.energy, undefined, "és a belőle számolt érték sem");
  assert.equal(noConsent.consents.health, false,
    "a hozzájárulás hiánya kiírva, nem csak kihagyva - különben a régi true megmarad");
  assert.equal(noConsent.consents.healthAt, undefined, "meg nem adott hozzájáruláshoz nincs időbélyeg");
  ok("testadat kizárólag kifejezett 9. cikkes hozzájárulással tárolódik");

  // Withdrawing it must actually remove the data.
  const dropped = retakePatch(withBody, noConsent);
  assert.equal(dropped.body, undefined, "visszavonás után a patch nem írja vissza a testadatot");
  assert.deepEqual([...LM_BODY_FIELDS], ["body", "energy"], "a törlendő mezők listája teljes");
  assert.ok(LM_HEALTH_FIELDS.includes("body") && LM_HEALTH_FIELDS.includes("energy"),
    "a testadat és a belőle számolt érték a 12 hónapos órán fut");
  ok("a hozzájárulás visszavonása törli a testadatot, és a 12 hónapos óra is vonatkozik rá");

  // ── The workout half ──
  // Every programme named must actually exist on the offer surfaces. A rename
  // there would otherwise leave the calculator recommending something the
  // pricing band no longer lists.
  const included = PRICING_BAND.included.join(" | ");
  for (const name of Object.values(PROGRAM)) {
    assert.ok(included.includes(name), `a katalógus nem tartalmazza: ${name}`);
  }
  ok("a modul csak létező, az ajánlatban is szereplő programokat nevez meg");

  // A true beginner is opened with the 7-day programme whatever their goal is.
  for (const g of ["fogyas", "tonus", "tomeg"] as const) {
    const picks = recommendPrograms(g, "none");
    assert.equal(picks[0]!.program, PROGRAM.KEZDO, `${g}: kezdőnek a 7 napos az első`);
    assert.ok(picks.length >= 1 && picks.length <= 2);
    // Never the same programme twice.
    assert.equal(new Set(picks.map((p) => p.program)).size, picks.length, `${g}: nincs ismétlés`);
  }
  ok("nulláról indulónál a 7 napos kezdő az első, céltól függetlenül");

  for (const lvl of ["rare", "weekly", "regular"] as const) {
    const picks = recommendPrograms("fogyas", lvl);
    assert.equal(picks[0]!.program, PROGRAM.START, `${lvl}: a Start a belépő`);
    assert.equal(picks.length, 2);
    assert.equal(new Set(picks.map((p) => p.program)).size, 2, `${lvl}: nincs ismétlés`);
    for (const p of picks) assert.ok(p.why.length > 10 && !p.why.includes("!"), "indoklás megvan, felkiáltójel nélkül");
  }
  ok("mozgásbázissal a Start a belépő, mellé a célhoz illő második program");

  // The goal changes the second pick when there is no focus answer.
  const second = (g: "fogyas" | "tonus" | "tomeg") => recommendPrograms(g, "weekly")[1]!.program;
  assert.equal(new Set([second("fogyas"), second("tonus"), second("tomeg")]).size, 3,
    "mindhárom cél más második programot ad");
  ok("a cél ténylegesen más programot ad, nem csak más szöveget");

  // ...but Q4 wins when it names a programme of its own. The quiz asks where
  // they want to get stronger; answering that from a calorie goal instead would
  // make the question decorative.
  const byFocus = (f: Focus) => recommendPrograms("fogyas", "weekly", f)[1]!.program;
  assert.equal(byFocus("fenek"), PROGRAM.LAB, "fenék/comb → Láb & Fenék");
  assert.equal(byFocus("core"), PROGRAM.HAS, "has/törzs → Has & Mély Törzs");
  assert.equal(byFocus("tartas"), PROGRAM.TARTAS, "hát/tartás → Tartásjavító");
  for (const f of ["fenek", "core", "tartas"] as Focus[]) {
    const picks = recommendPrograms("fogyas", "weekly", f);
    assert.equal(new Set(picks.map((x) => x.program)).size, picks.length, `${f}: nincs ismétlés`);
  }
  ok("a fókusz-válasz dönti el a második programot, nem a kalóriacél");

  // The session count is the PLAN's, never the calculator's - the module must
  // not restate it, or the two can disagree on screen.
  const en = computeEnergy(
    { sex: "female", age: 30, heightCm: 165, weightKg: 60, goal: "fogyas", tempo: "laza" },
    "weekly", "2",
  );
  assert.ok(!("exerciseCount" in en), "a modul nem közöl saját edzésszámot");
  assert.ok(en.programs.length > 0, "viszont ad programajánlást");
  ok("az edzésszám a tervből jön, a modul nem mond rá másik számot");

  // Using the calculator is not "filling the quiz twice".
  const sameAgain = buildLead({ ...base, consentMarketing: false, body: good as BodyInput, consentHealth: true });
  assert.equal(retakePatch(withBody, sameAgain).retakeCount, 0, "azonos válaszok nem számítanak újratöltésnek");
  const changed = buildLead({ ...base, consentMarketing: false, answers: A({ days: "4" }) });
  assert.equal(retakePatch(withBody, changed).retakeCount, 1, "megváltozott válaszok igen");
  ok("az újratöltés-számláló a válaszok változását méri, nem a mentéseket");
}

// ─── 6. The email card system ────────────────────────────────────────────────
{
  console.log("\nE-mail kártyák");

  // Email cannot resolve CSS custom properties or oklch(), so the category
  // colours are frozen as hex. That freeze is the risk: a new theme added to the
  // app would silently fall back here. Pin the two together.
  for (const theme of Object.keys(CAT)) {
    assert.ok(CAT_HEX[theme], `hiányzó e-mail szín: ${theme}`);
    assert.ok(CAT_WORD[theme], `hiányzó e-mail borítószó: ${theme}`);
    assert.match(CAT_HEX[theme]!, /^#[0-9a-f]{6}$/, `${theme}: nem hex szín`);
    assert.equal(CAT_WORD[theme], CAT[theme]!.word, `${theme}: a borítószó eltér az appétól`);
  }
  ok("minden app-kategóriának van e-mail-biztos színe és a borítószó egyezik");

  // An unknown theme must still render a card, not a hole.
  assert.equal(catHex("ilyen nincs"), CAT_HEX["Teljes test"]);
  assert.equal(catWordOf("ilyen nincs"), CAT_WORD["Teljes test"]);
  ok("ismeretlen kategória is renderel, a teljes test visszaesésre");
}

console.log(`\nAll /ujrakezdes self-tests passed (${n} blocks).`);
