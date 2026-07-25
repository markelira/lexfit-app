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
  CURRENCY,
  stripeMinorAmount,
  type PriceSpec,
} from "../src/lib/pricing/config";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is not set (run with --env-file=.env.local).");
  process.exit(1);
}
const stripe = new Stripe(key);

/** Find the catalog Product by metadata, or create it. Idempotent — uses
 *  products.list (strongly consistent) rather than products.search (index can
 *  lag right after creation, which would let a fast second run duplicate it). */
async function ensureProduct(): Promise<Stripe.Product> {
  for await (const p of stripe.products.list({ active: true, limit: 100 })) {
    if (p.metadata?.lexfit_catalog === PRODUCT.lookupId) {
      console.log(`✓ Product exists: ${p.id} (${PRODUCT.name})`);
      return p;
    }
  }
  const product = await stripe.products.create({
    name: PRODUCT.name,
    metadata: { lexfit_catalog: PRODUCT.lookupId },
  });
  console.log(`+ Product created: ${product.id} (${PRODUCT.name})`);
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
    const note = same ? "unchanged" : `LIVE DIFFERS (live=${p.unit_amount}, config=${unitAmount}) — rotate manually`;
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
  const product = await ensureProduct();
  for (const spec of PRICE_LIST) {
    await ensurePrice(product.id, spec);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
