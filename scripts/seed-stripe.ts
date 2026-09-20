/**
 * F0.1 — Stripe catalog seed.
 *
 * Creates every price from the pricing config (the single source of truth) under
 * one Product ("Lexfit teljes hozzáférés"). Idempotent by `lookup_key`: running
 * it twice creates nothing the second time. It never mutates an existing price's
 * amount (Stripe prices are immutable) — change an amount in config, and this
 * logs that the live price differs so you can rotate it deliberately.
 *
 * Run:  node --env-file=.env.local --import tsx scripts/seed-stripe.ts
 * Uses STRIPE_SECRET_KEY (test key in dev). Talks only to Stripe — no Firestore.
 */
import Stripe from "stripe";
import {
  PRICE_LIST,
  PRODUCT,
  PROGRAM_PRODUCTS,
  CURRENCY,
  isProgramRole,
  stripeMinorAmount,
  type PriceSpec,
} from "../src/lib/pricing/config";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set (run with --env-file=.env.local).");
  process.exit(1);
}
const stripe = new Stripe(key);

/** Find a catalog Product by metadata, or create it. Idempotent — uses
 *  products.list (strongly consistent) rather than products.search (index can
 *  lag right after creation, which would let a fast second run duplicate it). */
async function ensureProduct(name: string, lookupId: string): Promise<Stripe.Product> {
  for await (const p of stripe.products.list({ active: true, limit: 100 })) {
    if (p.metadata?.lexfit_catalog === lookupId) {
      console.log(`✓ Product exists: ${p.id} (${name})`);
      return p;
    }
  }
  const product = await stripe.products.create({
    name,
    metadata: { lexfit_catalog: lookupId },
  });
  console.log(`+ Product created: ${product.id} (${name})`);
  return product;
}

/** Create one price if no price with its lookup_key exists yet. */
async function ensurePrice(productId: string, spec: PriceSpec): Promise<void> {
  const existing = await stripe.prices.list({
    lookup_keys: [spec.lookupKey],
    limit: 1,
  });
  const unitAmount = stripeMinorAmount(spec.amountHuf);

  if (existing.data[0]) {
    const p = existing.data[0];
    const same = p.unit_amount === unitAmount && p.currency === CURRENCY;
    let note = same ? "unchanged" : `LIVE DIFFERS (live=${p.unit_amount}, config=${unitAmount}) — rotate manually`;

    // Sync the NICKNAME when it has drifted from the catalog. An amount can
    // never be edited on a live Stripe price (that is a rotation, flagged
    // above), but the nickname is dashboard-facing metadata with no billing
    // effect - and without this the script reports "unchanged" while Stripe
    // keeps showing a name the config no longer uses. lookup_key, amount,
    // currency and interval are untouched.
    if (p.nickname !== spec.nickname) {
      await stripe.prices.update(p.id, { nickname: spec.nickname });
      note += ` · nickname → "${spec.nickname}"`;
    }

    console.log(`✓ ${spec.lookupKey.padEnd(28)} exists (${p.id}) — ${note}`);
    return;
  }

  const price = await stripe.prices.create({
    product: productId,
    currency: CURRENCY,
    unit_amount: unitAmount,
    lookup_key: spec.lookupKey,
    nickname: spec.nickname,
    metadata: { role: spec.role },
    ...(spec.type === "recurring"
      ? {
          recurring: {
            interval: spec.interval as Stripe.PriceCreateParams.Recurring.Interval,
            interval_count: spec.intervalCount,
          },
        }
      : {}),
  });
  console.log(`+ ${spec.lookupKey.padEnd(28)} created (${price.id}) — ${spec.amountHuf} Ft`);
}

async function main() {
  console.log(`Seeding Stripe catalog (${PRICE_LIST.length} prices)…\n`);
  const membership = await ensureProduct(PRODUCT.name, PRODUCT.lookupId);
  for (const spec of PRICE_LIST) {
    // Programme purchases live under their own product so the payment page and
    // the receipt name the one programme being bought, not the whole library.
    if (isProgramRole(spec.role)) {
      const meta = PROGRAM_PRODUCTS[spec.role];
      const product = await ensureProduct(meta.name, meta.lookupId);
      await ensurePrice(product.id, spec);
      continue;
    }
    await ensurePrice(membership.id, spec);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
