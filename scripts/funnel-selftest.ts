/**
 * Funnel routing self-test (40 §40.8 / 41 §P2.2). Every user state × every
 * funnel route — the twenty assertions that prevent the two worst bugs in the
 * plan: a loop between /onboarding and /subscribe, and a paying user sent back
 * through the questions. No test framework in this repo, so plain assertions.
 *
 * Run:  node --import tsx scripts/funnel-selftest.ts
 */
import assert from "node:assert/strict";
import {
  funnelDestination,
  type FunnelState,
  type FunnelRoute,
} from "../src/lib/funnel";

const ROUTES: FunnelRoute[] = ["/onboarding", "/register", "/subscribe", "/app"];

// The §40.8 truth table, transcribed independently of funnel.ts so the test is
// a real second source, not a mirror of the implementation. null = allowed.
const EXPECTED: Record<FunnelState, Record<FunnelRoute, string | null>> = {
  anon: { "/onboarding": null, "/register": null, "/subscribe": "/register", "/app": "/onboarding" },
  anon_draft: { "/onboarding": null, "/register": null, "/subscribe": "/register", "/app": "/onboarding" },
  auth_new: { "/onboarding": null, "/register": "/onboarding", "/subscribe": null, "/app": "/onboarding" },
  auth_unpaid: { "/onboarding": "/subscribe", "/register": "/subscribe", "/subscribe": null, "/app": "/subscribe" },
  auth_ready: { "/onboarding": "/app", "/register": "/app", "/subscribe": null, "/app": null },
};

function fullMatrix() {
  let n = 0;
  for (const state of Object.keys(EXPECTED) as FunnelState[]) {
    for (const route of ROUTES) {
      const got = funnelDestination(state, route);
      assert.equal(got, EXPECTED[state][route], `${state} @ ${route} → ${got}`);
      n++;
    }
  }
  assert.equal(n, 20, "expected 5 states × 4 routes = 20 assertions");
  console.log(`✓ full truth table — ${n} assertions`);
}

function diagonalGuards() {
  // No loop between /onboarding and /subscribe for an unpaid user: /onboarding
  // sends to /subscribe, and /subscribe stays (does not bounce back).
  assert.equal(funnelDestination("auth_unpaid", "/onboarding"), "/subscribe", "unpaid: onboarding → subscribe");
  assert.equal(funnelDestination("auth_unpaid", "/subscribe"), null, "unpaid: subscribe stays (no loop)");

  // A paying user is never sent through the questions or checkout again.
  assert.equal(funnelDestination("auth_ready", "/onboarding"), "/app", "paid: onboarding → app, never re-asked");
  assert.equal(funnelDestination("auth_ready", "/app"), null, "paid: app stays");
  assert.equal(funnelDestination("auth_ready", "/subscribe"), null, "paid: subscribe shows aktív panel, no loop");

  // An anonymous user cannot reach checkout without an account first.
  assert.equal(funnelDestination("anon", "/subscribe"), "/register", "anon: subscribe → register");
  assert.equal(funnelDestination("anon_draft", "/subscribe"), "/register", "anon_draft: subscribe → register");

  // The app is gated behind the whole funnel for the not-yet-onboarded.
  assert.equal(funnelDestination("anon", "/app"), "/onboarding", "anon: app → onboarding");
  assert.equal(funnelDestination("auth_new", "/app"), "/onboarding", "auth_new: app → onboarding");
  console.log("✓ diagonal guards — loop-free, no re-asking");
}

fullMatrix();
diagonalGuards();
console.log("\nAll funnel self-tests passed.");
