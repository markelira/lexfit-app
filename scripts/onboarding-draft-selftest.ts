/**
 * Onboarding draft-store self-test (41 §P2.1). The store underpins P3 path 2
 * (resume after a close) and path 6 (return days later), so its round-trip and
 * its guards (Safari private mode, corrupt/old payloads) are worth locking down.
 * No test framework in this repo → plain assertions with a localStorage polyfill.
 *
 * Run:  node --import tsx scripts/onboarding-draft-selftest.ts
 */
import assert from "node:assert/strict";
// Static import is safe: the store only touches localStorage inside function
// bodies, and we install the polyfill below before calling any of them.
import { readDraft, writeDraft, clearDraft, hasDraft } from "../src/lib/onboarding-draft";

// ── Minimal localStorage polyfill. ──
class MemStorage {
  private m = new Map<string, string>();
  throwing = false;
  getItem(k: string) {
    if (this.throwing) throw new Error("SecurityError (private mode)");
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    if (this.throwing) throw new Error("QuotaExceededError");
    this.m.set(k, v);
  }
  removeItem(k: string) {
    if (this.throwing) throw new Error("SecurityError");
    this.m.delete(k);
  }
  raw(k: string) {
    return this.m.get(k) ?? null;
  }
}
const store = new MemStorage();
(globalThis as unknown as { localStorage: MemStorage }).localStorage = store;

function roundTrip() {
  clearDraft();
  assert.equal(readDraft(), null, "empty → null");
  assert.equal(hasDraft(), false, "empty → hasDraft false");

  const d = {
    v: 1 as const,
    idx: 3,
    answers: { goal: "ero", level: 2, days: 5, weekdays: [1, 2, 4, 5, 6], time: "reggel", env: ["csendes"], motiv: "x" },
    startedAt: 1_700_000_000_000,
  };
  writeDraft(d);
  assert.deepEqual(readDraft(), d, "round-trips exactly");
  assert.equal(hasDraft(), true, "hasDraft true after write");

  clearDraft();
  assert.equal(readDraft(), null, "cleared → null");
  console.log("✓ round-trip + clear");
}

function guards() {
  // Corrupt JSON → null, not a throw.
  store.setItem("lexfit_onb_v1", "{not json");
  assert.equal(readDraft(), null, "corrupt JSON → null");

  // Wrong version → null (a future shape change is a migration, not corruption).
  store.setItem("lexfit_onb_v1", JSON.stringify({ v: 2, idx: 1, answers: {} }));
  assert.equal(readDraft(), null, "v:2 → null (no accidental read of a future shape)");

  // Malformed shapes → null.
  store.setItem("lexfit_onb_v1", JSON.stringify({ v: 1, idx: "x", answers: {} }));
  assert.equal(readDraft(), null, "non-numeric idx → null");
  store.setItem("lexfit_onb_v1", JSON.stringify({ v: 1, idx: 0, answers: null }));
  assert.equal(readDraft(), null, "null answers → null");
  clearDraft();
  console.log("✓ guards (corrupt / wrong-version / malformed)");
}

function v2Isolation() {
  // The old auth-first key must never be touched or read (40 §40.8).
  store.setItem("lexfit_onb_v2", JSON.stringify({ idx: 4, answers: { goal: "old" } }));
  assert.equal(readDraft(), null, "v2 key is invisible to the v1 store");
  writeDraft({ v: 1, idx: 1, answers: { goal: "new" }, startedAt: 1 });
  assert.notEqual(store.raw("lexfit_onb_v2"), null, "v2 key left intact");
  assert.equal(JSON.parse(store.raw("lexfit_onb_v2")!).answers.goal, "old", "v2 payload untouched");
  clearDraft();
  store.removeItem("lexfit_onb_v2");
  console.log("✓ lexfit_onb_v2 isolation");
}

function privateMode() {
  // Safari private mode throws on every access — the store must swallow it.
  store.throwing = true;
  assert.equal(readDraft(), null, "read throws → null");
  assert.doesNotThrow(() => writeDraft({ v: 1, idx: 1, answers: {}, startedAt: 1 }), "write throws → swallowed");
  assert.doesNotThrow(() => clearDraft(), "clear throws → swallowed");
  assert.equal(hasDraft(), false, "hasDraft throws → false");
  store.throwing = false;
  console.log("✓ private-mode (localStorage throws) is non-fatal");
}

function flexibleCadence() {
  // Offer v3 moves the cadence domain to 2-4 and adds "Ahogy jön", which is not
  // a count: it plans the recommended number of sessions but pins them to no
  // weekday. The draft has to survive that round-trip, or a visitor who picked
  // it and came back a day later would silently get named weekdays instead.
  clearDraft();
  writeDraft({
    v: 1,
    idx: 4,
    answers: { days: 3, weekdays: [], flexible: true },
    startedAt: 1_700_000_000_000,
  });
  const back = readDraft();
  assert.equal(back?.answers.flexible, true, "flexible survives the round-trip");
  assert.deepEqual(back?.answers.weekdays, [], "flexible keeps an empty weekday set");

  // A fixed-cadence draft must not come back flexible.
  clearDraft();
  writeDraft({
    v: 1,
    idx: 4,
    answers: { days: 2, weekdays: [2, 5], flexible: false },
    startedAt: 1_700_000_000_000,
  });
  const fixed = readDraft();
  assert.equal(fixed?.answers.flexible, false, "fixed cadence stays fixed");
  assert.deepEqual(fixed?.answers.weekdays, [2, 5], "2-day default weekdays round-trip");

  // Drafts written BEFORE this field existed must still load - a visitor
  // mid-funnel across the deploy must not be dead-ended.
  clearDraft();
  writeDraft({ v: 1, idx: 4, answers: { days: 3, weekdays: [1, 3, 5] }, startedAt: 1 });
  const legacy = readDraft();
  assert.equal(legacy?.answers.flexible, undefined, "pre-v3 draft has no flexible field");
  assert.deepEqual(legacy?.answers.weekdays, [1, 3, 5], "pre-v3 draft still loads its weekdays");
  console.log("✓ flexible cadence round-trip + pre-v3 draft compatibility");
}

roundTrip();
guards();
v2Isolation();
privateMode();
flexibleCadence();
console.log("\nAll onboarding-draft self-tests passed.");
