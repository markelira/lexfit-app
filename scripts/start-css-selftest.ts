/**
 * /start self-test - every class the purchase funnel names must exist in a
 * stylesheet it actually loads.
 *
 * Written after the receipt screen shipped unstyled: rebuilding the landing on
 * a different layer replaced `start.css` wholesale, and every `.s-*` class the
 * thank-you page named went with it. Nothing failed - not the build, not the
 * types, not a route check - because a missing CSS rule is silent. A paying
 * customer's confirmation rendered as bare text.
 *
 * Run:  node --import tsx scripts/start-css-selftest.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/** Classes that are deliberate markup hooks with no rules of their own. */
const HOOKS = new Set(["lxs-ax", "lxf-pay", "lxs-cat"]);

/** Classes that come from a stylesheet an ANCESTOR loads (the page shell), not
 *  from this component's own imports. */
const FROM_SHELL = new Set(["lp-col-wide", "lp-col", "lx"]);

/** Only these families are ours to check; `lx`-prefixed app classes and the
 *  funnel's own `lp-`/`u2-` namespaces. Anything else is a utility. */
const OURS = /^(lx[a-z]*-|s-|lp-|u2?-|wc|pgs-|fex-)/;

const PAGES: Record<string, string[]> = {
  "src/app/start/StartPage.tsx": [
    "src/app/ujrakezdes/ujrakezdes.css", "src/app/start/start.css",
    "src/app/workout-card.css", "src/app/app/programs/programs.css",
    "src/app/cards.css", "src/app/course-cards.css",
    "src/app/lexfit-tokens.css", "src/app/lx-atoms.css",
  ],
  "src/app/start/koszonjuk/ThankYou.tsx": ["src/app/start/koszonjuk/koszonjuk.css"],
  "src/app/start/fizetes/PayPage.tsx": [
    "src/app/ujrakezdes/ujrakezdes.css", "src/app/start/start.css",
    "src/app/start/fizetes/fizetes.css",
  ],
  "src/app/start/ProgramShelf.tsx": [
    "src/app/start/start.css", "src/app/workout-card.css",
    "src/app/app/programs/programs.css",
  ],
  "src/app/start/PreviewModal.tsx": ["src/app/start/preview.css", "src/app/course-cards.css"],
  "src/components/UpsellModal.tsx": ["src/components/UpsellModal.css"],
  "src/components/onboarding/OnboardingSheet.tsx": ["src/components/onboarding/OnboardingSheet.css"],
};

const sheetCache = new Map<string, Set<string>>();
const classesIn = (p: string): Set<string> => {
  if (!sheetCache.has(p)) {
    sheetCache.set(p, new Set(readFileSync(p, "utf8").match(/\.[a-zA-Z][\w-]*/g)?.map((c) => c.slice(1)) ?? []));
  }
  return sheetCache.get(p)!;
};

function usedIn(page: string): Set<string> {
  const src = readFileSync(page, "utf8");
  const out = new Set<string>();
  for (const m of src.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    for (const chunk of [m[1], m[2]]) {
      if (!chunk) continue;
      for (const c of chunk.split(/[\s${}?:()'"]+/)) if (c && !c.startsWith("$")) out.add(c);
    }
  }
  return out;
}

let checked = 0;
for (const [page, sheets] of Object.entries(PAGES)) {
  const known = new Set<string>();
  for (const s of sheets) for (const c of classesIn(s)) known.add(c);
  for (const c of usedIn(page)) {
    if (!OURS.test(c) || HOOKS.has(c) || FROM_SHELL.has(c)) continue;
    checked++;
    assert.ok(
      known.has(c),
      `${page} names ".${c}", which no stylesheet it loads defines. ` +
        `Either the rule was deleted, or the class is a typo.`,
    );
  }
}
console.log(`✓ /start stylesheets (${checked} class references resolved)`);
console.log("\nAll self-tests passed.");
