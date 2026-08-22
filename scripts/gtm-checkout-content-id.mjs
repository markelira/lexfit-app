// Supplies content_id on InitiateCheckout, clearing TikTok's "Content ID is
// missing" diagnostic.
//
// Established by measurement rather than assumption (see the session notes in
// docs/gtm-setup-tiktok-kviz.md): calling the TikTok SDK directly with the
// fields the template's "single" mode produces showed content_id, content_type,
// price and quantity all arriving intact, while the current "empty" mode sends
// neither. The template gates content_id behind single_multi_product == "single"
// - it is not reachable in "empty" mode at all, so the mode has to change.
//
// The identifier is the pricing role already on the dataLayer (week_intro,
// month_std, annual_std). It is catalogue data, not personal data, and it makes
// TikTok's reporting break down by package for free.
//
// Run: node --env-file=.env.local scripts/gtm-checkout-content-id.mjs [--apply]

import { JWT } from "google-auth-library";

const CONTAINER_PATH = "accounts/6370552280/containers/260779505";
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

{
  const list = await api(`${CONTAINER_PATH}/workspaces`);
  const w = (list.workspace ?? [])[0];
  if (!w) throw new Error("Nincs szerkeszthető workspace.");
  WS = `${CONTAINER_PATH}/workspaces/${w.workspaceId}`;
  console.log(`workspace: "${w.name}" (id=${w.workspaceId})`);
}

const plan = (m) => console.log(`${APPLY ? "▸" : "·"} ${m}`);
const done = (m) => console.log(`✓ ${m}`);

const variables = (await api(`${WS}/variables`)).variable ?? [];
const tags = (await api(`${WS}/tags`)).tag ?? [];
const byName = (l, n) => l.find((x) => x.name === n);

console.log(`\n=== ${APPLY ? "VÉGREHAJTÁS" : "TERV (szárazon)"} ===\n`);

// ─── The plan variable ──────────────────────────────────────────────────────

let planVar = byName(variables, "DLV - plan");
if (planVar) {
  done("változó már létezik: DLV - plan");
} else {
  plan("létrehozás: DLV - plan → dataLayer 'plan'");
  if (APPLY) {
    planVar = await api(`${WS}/variables`, "POST", {
      name: "DLV - plan",
      type: "v",
      parameter: [
        { type: "integer", key: "dataLayerVersion", value: "2" },
        { type: "boolean", key: "setDefaultValue", value: "true" },
        // A blank content_id is what TikTok complains about, so never send one.
        { type: "template", key: "defaultValue", value: "lexfit_subscription" },
        { type: "template", key: "name", value: "plan" },
      ],
    });
    done(`létrehozva (id=${planVar.variableId})`);
  }
}

// ─── TikTok InitiateCheckout: switch mode, add the product identity ─────────

const tt = byName(tags, "TikTok — InitiateCheckout");
if (!tt) {
  console.log("⚠ nincs meg: TikTok — InitiateCheckout");
} else {
  const params = new Map((tt.parameter ?? []).map((p) => [p.key, p]));
  const mode = params.get("single_multi_product")?.value;

  if (mode === "single" && params.has("content_id")) {
    done("a tag már 'single' módban van, content_id-vel");
  } else {
    plan(`TikTok — InitiateCheckout`);
    plan(`    single_multi_product: "${mode}" → "single"   (a content_id csak így érhető el)`);
    plan(`    + content_id   = {{DLV - plan}}`);
    plan(`    + content_type = product`);
    if (APPLY) {
      params.set("single_multi_product", {
        type: "template", key: "single_multi_product", value: "single",
      });
      params.set("content_id", { type: "template", key: "content_id", value: "{{DLV - plan}}" });
      params.set("content_type", { type: "template", key: "content_type", value: "product" });
      await api(`${WS}/tags/${tt.tagId}`, "PUT", {
        ...tt,
        parameter: [...params.values()],
      });
      done("frissítve");
    }
  }
}

console.log(
  APPLY
    ? "\n=== KÉSZ. GTM-ben Submit szükséges.\n" +
      "    Ellenőrző jel a publikálás után: a TikTok payload gtm_version mezője\n" +
      "    ':01'-ről ':02'-re vált (a sablon single módú konfigurációs kódja).\n"
    : "\n=== Terv. Végrehajtás: --apply ===\n",
);
process.exit(0);
