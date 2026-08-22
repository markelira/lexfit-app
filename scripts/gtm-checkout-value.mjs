// Adds the checkout price to both ad platforms' InitiateCheckout events.
//
// TikTok's Test Events flagged "Purchase value is invalid" on InitiateCheckout,
// and it was right: the event carried no value at all. Meta accepts it silently
// but cannot do value-based bidding without one either.
//
// The number is NOT written here. src/lib/track.ts resolves it from PRICES and
// pushes `value` + `currency` onto the dataLayer, and these variables read it
// back - so a price change stays a one-line edit in the pricing config and can
// never drift into the tag manager.
//
// Run: node --env-file=.env.local scripts/gtm-checkout-value.mjs [--apply]

import { JWT } from "google-auth-library";

const CONTAINER_PATH = "accounts/6370552280/containers/260779505";
// Resolved at run time, never hardcoded: publishing FREEZES a workspace ("already
// submitted") and GTM opens a fresh one, so a pinned id breaks on the next run.
let WS;
const APPLY = process.argv.includes("--apply");

const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const client = new JWT({
  email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  key,
  scopes: ["https://www.googleapis.com/auth/tagmanager.edit.containers"],
});
const { token } = await client.getAccessToken();

async function api(path, method = "GET", body) {
  const res = await fetch(`https://tagmanager.googleapis.com/tagmanager/v2/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}


// Pick the workspace GTM is currently accepting edits into.
{
  const list = await api(`${CONTAINER_PATH}/workspaces`);
  const w = (list.workspace ?? [])[0];
  if (!w) throw new Error("Nincs szerkeszthető workspace — hozz létre egyet a GTM-ben.");
  WS = `${CONTAINER_PATH}/workspaces/${w.workspaceId}`;
  console.log(`workspace: "${w.name}" (id=${w.workspaceId})`);
}

const plan = (m) => console.log(`${APPLY ? "▸" : "·"} ${m}`);
const done = (m) => console.log(`✓ ${m}`);

const variables = (await api(`${WS}/variables`)).variable ?? [];
const tags = (await api(`${WS}/tags`)).tag ?? [];
const byName = (l, n) => l.find((x) => x.name === n);

console.log(`\n=== ${APPLY ? "VÉGREHAJTÁS" : "TERV (szárazon)"} ===\n`);

// ─── Data Layer variables ───────────────────────────────────────────────────

const dlv = async (name, dlKey) => {
  const existing = byName(variables, name);
  if (existing) {
    done(`változó már létezik: ${name}`);
    return existing;
  }
  plan(`létrehozás: ${name} → ${dlKey}`);
  if (!APPLY) return null;
  const v = await api(`${WS}/variables`, "POST", {
    name,
    type: "v",
    parameter: [
      { type: "integer", key: "dataLayerVersion", value: "2" },
      { type: "boolean", key: "setDefaultValue", value: "false" },
      { type: "template", key: "name", value: dlKey },
    ],
  });
  done(`létrehozva (id=${v.variableId})`);
  return v;
};

await dlv("DLV - value", "value");
await dlv("DLV - currency", "currency");

// ─── TikTok InitiateCheckout: value + currency ──────────────────────────────

const ttTag = byName(tags, "TikTok — InitiateCheckout");
if (!ttTag) {
  console.log("⚠ nem található: TikTok — InitiateCheckout");
} else if ((ttTag.parameter ?? []).some((p) => p.key === "value")) {
  done("a TikTok tag már küld value-t");
} else {
  plan("bővítés: TikTok — InitiateCheckout  (+ value, + currency)");
  if (APPLY) {
    await api(`${WS}/tags/${ttTag.tagId}`, "PUT", {
      ...ttTag,
      parameter: [
        ...(ttTag.parameter ?? []),
        { type: "template", key: "value", value: "{{DLV - value}}" },
        { type: "template", key: "currency", value: "{{DLV - currency}}" },
      ],
    });
    done("frissítve");
  }
}

// ─── Meta InitiateCheckout: value + currency ────────────────────────────────
//
// Custom HTML, so the parameters go into the fbq call itself. Meta wants the
// currency as an ISO code and the value as a number, not a formatted string -
// hence the raw dataLayer figures rather than anything display-formatted.

const fbTag = byName(tags, "Meta Pixel — InitiateCheckout");
if (!fbTag) {
  console.log("⚠ nem található: Meta Pixel — InitiateCheckout");
} else {
  const current = (fbTag.parameter ?? []).find((p) => p.key === "html")?.value ?? "";
  const next =
    `<script>fbq('track', 'InitiateCheckout', ` +
    `{value: {{DLV - value}}, currency: '{{DLV - currency}}'});</script>`;
  if (current.includes("value:")) {
    done("a Meta tag már küld value-t");
  } else {
    plan("bővítés: Meta Pixel — InitiateCheckout");
    plan(`    ${current.replace(/\s+/g, " ")}`);
    plan(`  → ${next}`);
    if (APPLY) {
      await api(`${WS}/tags/${fbTag.tagId}`, "PUT", {
        ...fbTag,
        parameter: (fbTag.parameter ?? []).map((p) =>
          p.key === "html" ? { ...p, value: next } : p,
        ),
      });
      done("frissítve");
    }
  }
}

console.log(
  APPLY
    ? "\n=== KÉSZ. A GTM-ben Submit szükséges, és a kód is deployolandó. ===\n"
    : "\n=== Ez csak terv volt. Végrehajtás: --apply ===\n",
);
process.exit(0);
