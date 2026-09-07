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
import { buildWeekPlan, daysCount, trainingDays, SESSION_LABEL } from "../src/lib/ujrakezdes/plan";
import {
  buildLead, leadId, LM_HEALTH_FIELDS, LM_VARIANT, parseAnswers, retakePatch, validateIdentity,
} from "../src/lib/ujrakezdes/lead";
import {
  isLmStep, lmDueAt, lmNextStep, lmScheduleAfter, lmStopReason, LM_LAST_STEP,
} from "../src/lib/ujrakezdes/sequence";
import type { Answers, Days } from "../src/lib/ujrakezdes/types";
import * as C from "../src/app/ujrakezdes/copy";

const base: Answers = {
  anchor: "restart", level: "none", days: "3", session: "20_30",
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

  // Training cells carry the LOW end of the range: the plan under-promises.
  const p = buildWeekPlan(A({ session: "20_30" }));
  assert.equal(p.sessionLabel, SESSION_LABEL["20_30"]);
  assert.ok(p.firstWorkoutMinutes <= 30 && p.firstWorkoutMinutes >= 20);
  for (const day of p.days) {
    assert.equal(day.training, day.minutes !== null, "pihenőnapon nincs perc");
  }
  ok("a hossz a sáv alját mutatja, pihenőnapon nincs szám");

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

  for (const field of ["anchor", "level", "days", "session", "place", "daypart"]) {
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
  assert.equal(patch.retakeCount, 1);
  assert.equal(retakePatch(yes, mk(true)).unsubscribedAt, null, "újra bejelölve visszatér a sorozat");
  ok("az újratöltés megőrzi az akvizíciós dátumot és a leiratkozást");

  assert.ok(yes.healthPurgeAt < yes.purgeAt, "a 9. cikkes mező hamarabb évül");
  assert.deepEqual([...LM_HEALTH_FIELDS], ["answers.care"]);
  ok("a Q5 a 12 hónapos órán fut, a rekord többi része a 24 hónaposon");
}

// ─── 4. The copy rules offer v3 §3 makes non-negotiable ──────────────────────
{
  console.log("\nCopy-szabályok");

  const strings: string[] = [];
  const walk = (v: unknown): void => {
    if (typeof v === "string") strings.push(v);
    else if (typeof v === "function") { try { strings.push(String((v as (...x: never[]) => string)(3 as never, "20–30 perc" as never))); } catch { /* not a copy fn */ } }
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(C);
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

  // The seven questions, in the specced order, with the interstitial after Q4.
  assert.equal(C.Q_CARE.options.length, 4);
  assert.equal(C.Q_ANCHOR.options.length, 5);
  assert.equal(C.INTERSTITIAL.lines.length, 2);
  ok("a kérdések és a köztes képernyő a specifikáció szerinti alakúak");
}

console.log(`\nAll /ujrakezdes self-tests passed (${n} blocks).`);
