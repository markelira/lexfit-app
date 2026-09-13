// Adds `checkout.session.expired` to the Stripe webhook endpoint's enabled
// events - the trigger for the checkout-abandonment recovery email
// (docs/lead-conversion-diagnosis.md P0-2). Without it Stripe never delivers
// the event and the recovery email silently never sends.
//
// Run against TEST:  node --env-file=.env.local scripts/stripe-enable-expired-event.mjs
// Run against LIVE:  STRIPE_SECRET_KEY=sk_live_… node scripts/stripe-enable-expired-event.mjs
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) { console.error("STRIPE_SECRET_KEY missing"); process.exit(1); }
const stripe = new Stripe(key);
console.log(`Mode: ${key.startsWith("sk_live") ? "LIVE" : "test"}`);

const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
const targets = endpoints.data.filter((e) => e.url.includes("/api/stripe/webhook"));
if (!targets.length) {
  console.error("No webhook endpoint matching /api/stripe/webhook found.");
  process.exit(1);
}

for (const ep of targets) {
  const events = ep.enabled_events ?? [];
  console.log(`\n${ep.url}\n  current: ${events.join(", ")}`);
  if (events.includes("*") || events.includes("checkout.session.expired")) {
    console.log("  ✓ already delivers checkout.session.expired — nothing to do");
    continue;
  }
  const updated = await stripe.webhookEndpoints.update(ep.id, {
    enabled_events: [...events, "checkout.session.expired"],
  });
  console.log(`  ✓ added — now: ${updated.enabled_events.join(", ")}`);
}
process.exit(0);
