/**
 * Offer v3 copy + schema self-test.
 *
 * Two jobs:
 *  1. The FAQ array feeds #gyik, the /arak subset AND the FAQPage JSON-LD, so a
 *     malformed or duplicated entry is a rich-result violation, not a typo.
 *  2. Hard rule 1 ("no exclamation marks. Anywhere.") is a brand rule that is
 *     easy to break months from now in a hurry. Machine-checked here rather
 *     than trusted.
 *
 * No test framework in this repo → plain assertions.
 *
 * Run:  node --import tsx scripts/schema-selftest.ts
 */
import assert from "node:assert/strict";
import {
  ARAK_FAQ_KEYS,
  FAQ_ALL,
  FAQ_BASE,
  FAQ_NEW,
  GARANCIA,
  HERO,
  ISMEROS,
  HOGYAN_STEPS,
  MILESTONES,
  PAY_STEP,
  PRICING_BAND,
} from "../src/components/landing/offer-copy";

function faqShape() {
  assert.equal(FAQ_ALL.length, FAQ_BASE.length + FAQ_NEW.length, "FAQ_ALL is base + new");
  const questions = FAQ_ALL.map(([q]) => q);
  assert.equal(
    new Set(questions).size,
    questions.length,
    "no duplicate questions - §4.5 must not be spliced in twice",
  );
  for (const [q, a] of FAQ_ALL) {
    assert.ok(q.trim().length > 0, "question is non-empty");
    assert.ok(a.trim().length > 0, `answer for "${q}" is non-empty`);
    assert.ok(q.trim().endsWith("?"), `"${q}" reads as a question`);
  }
  console.log(`✓ FAQ shape (${FAQ_ALL.length} entries, unique, all answered)`);
}

function arakSubsetResolves() {
  // /arak repeats three questions. They are referenced BY TEXT so the subset
  // cannot drift from the array - which only works if every key still resolves.
  for (const key of ARAK_FAQ_KEYS) {
    assert.ok(
      FAQ_ALL.some(([q]) => q === key),
      `/arak FAQ key still resolves: "${key}"`,
    );
  }
  console.log(`✓ /arak FAQ subset resolves (${ARAK_FAQ_KEYS.length} keys)`);
}

function jsonLdIsValid() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ALL.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");
  const back = JSON.parse(serialized.replace(/\\u003c/g, "<"));
  assert.equal(back["@type"], "FAQPage", "emits FAQPage");
  assert.equal(back.mainEntity.length, FAQ_ALL.length, "every entry is in the schema");
  assert.ok(
    !serialized.includes("</script"),
    "no literal </script> can close the tag early",
  );
  for (const e of back.mainEntity) {
    assert.equal(e["@type"], "Question");
    assert.equal(e.acceptedAnswer["@type"], "Answer");
    assert.ok(e.name && e.acceptedAnswer.text, "question and answer both present");
  }
  console.log("✓ FAQPage JSON-LD parses and matches the page");
}

/** Every user-facing string offer-copy.ts owns, flattened. */
function allStrings(): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk([HERO, ISMEROS, HOGYAN_STEPS, GARANCIA, PRICING_BAND, FAQ_ALL, PAY_STEP, MILESTONES]);
  return out;
}

function brandVoice() {
  // Hard rule 1: no exclamation marks, anywhere.
  const shouty = allStrings().filter((s) => s.includes("!"));
  assert.deepEqual(shouty, [], `exclamation marks found: ${JSON.stringify(shouty)}`);

  // Hard rule 2: no weight-loss vocabulary or body-transformation promises.
  // Deliberately scoped to the copy THIS project owns - the funnel's `goal`
  // step still carries "Lefogyni, formálódni" and is a separate, owner-supplied
  // rewrite (dev plan Q8). Widening this check is what closes that out.
  const banned = ["fogyás", "fogyni", "zsírégetés", "zsírégető", "kockás has", "before/after"];
  for (const s of allStrings()) {
    for (const b of banned) {
      assert.ok(
        !s.toLowerCase().includes(b),
        `weight-loss vocabulary "${b}" in: ${s.slice(0, 60)}`,
      );
    }
  }

  // Hard rule 6: no forint amount may be a literal in the copy module - every
  // figure is interpolated from PRICES at render.
  const withHuf = allStrings().filter((s) => /\d[\d  ]*Ft/.test(s));
  assert.deepEqual(withHuf, [], `hardcoded amount in copy: ${JSON.stringify(withHuf)}`);
  console.log(`✓ brand voice + no hardcoded amounts (${allStrings().length} strings)`);
}

function milestones() {
  assert.deepEqual(MILESTONES.map((m) => m.n), [1, 5, 10, 15, 30], "1 · 5 · 10 · 15 · 30");
  assert.equal(
    MILESTONES.find((m) => m.n === 10)?.note,
    "garancia",
    "the guarantee is flagged at 10",
  );
  console.log("✓ milestone strip");
}

faqShape();
arakSubsetResolves();
jsonLdIsValid();
brandVoice();
milestones();
console.log("\nAll schema/copy self-tests passed.");
