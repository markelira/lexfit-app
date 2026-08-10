// Register lexfit.hu with Stripe so Apple Pay / Google Pay show up in the
// EMBEDDED Checkout (hosted checkout.stripe.com gets wallets for free; a
// checkout embedded on our own domain only shows them once the domain is a
// verified "payment method domain"). Also flips Google Pay ON in the default
// payment method configuration (it ships off).
//
// Idempotent — safe to re-run. Run it:
//   node --env-file=.env.local scripts/stripe-register-payment-domains.mjs
//
// Apple Pay validation requires the association file to be LIVE at
// https://<domain>/.well-known/apple-developer-merchantid-domain-association
// (checked into public/.well-known/), so re-run this after each deploy of that
// file, and once more with the LIVE secret key at live cutover — payment
// method domains are per-mode (test/live).

const KEY = process.env.STRIPE_SECRET_KEY;
if (!KEY) {
  console.error("STRIPE_SECRET_KEY missing — run with --env-file=.env.local");
  process.exit(1);
}
const MODE = KEY.startsWith("sk_live") ? "LIVE" : "TEST";
const DOMAINS = ["www.lexfit.hu", "lexfit.hu"];

async function stripe(method, path, params) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: params ? new URLSearchParams(params) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${json.error?.message ?? res.status}`);
  return json;
}

console.log(`Stripe mode: ${MODE}\n`);

// 1. Google Pay ON in the default payment method configuration.
const configs = await stripe("GET", "/payment_method_configurations");
for (const cfg of configs.data) {
  const pref = cfg.google_pay?.display_preference?.preference;
  if (pref === "on") {
    console.log(`✓ Google Pay already on in config "${cfg.name}"`);
  } else {
    await stripe("POST", `/payment_method_configurations/${cfg.id}`, {
      "google_pay[display_preference][preference]": "on",
    });
    console.log(`✓ Google Pay turned ON in config "${cfg.name}"`);
  }
}

// 2. Register + validate each domain.
const existing = await stripe("GET", "/payment_method_domains?limit=100");
for (const domain of DOMAINS) {
  let pmd = existing.data.find((d) => d.domain_name === domain);
  if (!pmd) {
    pmd = await stripe("POST", "/payment_method_domains", { domain_name: domain });
    console.log(`✓ Registered ${domain}`);
  }
  // Re-validate (picks up a freshly deployed association file).
  try {
    pmd = await stripe("POST", `/payment_method_domains/${pmd.id}/validate`);
  } catch (err) {
    console.log(`  validate ${domain}: ${err.message}`);
  }
  const s = (k) => pmd[k]?.status ?? "n/a";
  console.log(
    `  ${domain}: apple_pay=${s("apple_pay")} google_pay=${s("google_pay")} link=${s("link")}`,
  );
  if (pmd.apple_pay?.status !== "active") {
    console.log(
      `  ↳ Apple Pay inactive — deploy public/.well-known/apple-developer-merchantid-domain-association to ${domain}, then re-run.`,
    );
  }
}
