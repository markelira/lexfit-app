// Grandfathering guard (pricing tracker checklist #5 — "must not slip").
//
// Read-only audit of every Stripe subscription against the current catalog
// (lookup_key binding, src/lib/pricing/config.ts). Any subscription whose
// price is NOT in the catalog is a LEGACY / grandfathered sub — those must
// never be touched by price rotations or migrations. Run this BEFORE any
// price change goes live, and after, to prove no legacy sub was affected.
//
// Usage:
//   npm run audit:stripe            (uses STRIPE_SECRET_KEY from .env.local)
//   npm run audit:stripe -- --json  (machine-readable output)
//
// This script never mutates anything. If a migration is ever actually needed,
// write it as a separate, explicit script — do not extend this one.
import Stripe from "stripe";
import { PRICES } from "../src/lib/pricing/config";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY missing (run via npm script with --env-file=.env.local).");
  process.exit(1);
}
const stripe = new Stripe(key);
const live = key.startsWith("sk_live");
const catalogKeys = new Set(Object.values(PRICES).map((p) => p.lookupKey));
const json = process.argv.includes("--json");

async function main() {
  const rows: {
    sub: string;
    status: string;
    customer: string;
    priceId: string;
    lookupKey: string | null;
    inCatalog: boolean;
    cancelAtPeriodEnd: boolean;
  }[] = [];

  for await (const sub of stripe.subscriptions.list({ limit: 100, status: "all" })) {
    for (const item of sub.items.data) {
      const price = item.price;
      rows.push({
        sub: sub.id,
        status: sub.status,
        customer: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        priceId: price.id,
        lookupKey: price.lookup_key ?? null,
        inCatalog: !!price.lookup_key && catalogKeys.has(price.lookup_key),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      });
    }
  }

  const legacy = rows.filter((r) => !r.inCatalog);
  if (json) {
    console.log(JSON.stringify({ mode: live ? "LIVE" : "TEST", total: rows.length, legacy }, null, 2));
    return;
  }

  console.log(`Stripe mode: ${live ? "LIVE" : "TEST"} · subscriptions items scanned: ${rows.length}`);
  console.log(`Catalog lookup_keys: ${[...catalogKeys].join(", ")}`);
  if (!legacy.length) {
    console.log("✅ No legacy/grandfathered subscriptions — every sub is on the current catalog.");
  } else {
    console.log(`\n⚠️  ${legacy.length} LEGACY subscription item(s) — grandfathered, do NOT migrate/touch:`);
    for (const r of legacy) {
      console.log(`  ${r.sub} [${r.status}] customer=${r.customer} price=${r.priceId} lookup_key=${r.lookupKey ?? "—"}`);
    }
    process.exitCode = 2; // visible failure in CI/manual runs so it can't be missed
  }
}

main().catch((e) => {
  console.error("audit failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
