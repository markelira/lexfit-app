// Follow-up fix: the first attempt set `value`/`currency` on the TikTok tag but
// they never reached TikTok. Two separate faults, both found by capturing the
// real outgoing request rather than trusting the UI.
//
// 1. TIKTOK. The gallery template only reads value/currency inside a branch
//    gated on `single_multi_product`:
//
//        if (data.single_multi_product == "empty") {
//          if (data.currency) parameters.currency = data.currency;
//          if (data.value) parameters.value = makeNumber(data.value);
//        }
//
//    Our tag never set that field, so no branch matched and both values were
//    silently dropped. "empty" is the right mode here: we send a value with no
//    product contents.
//
// 2. META. `{value: {{DLV - value}}, ...}` is unquoted substitution. If the
//    variable is ever undefined GTM renders `{value: , currency: ''}`, which is
//    a SyntaxError that kills the whole tag - so a missing price would take the
//    entire InitiateCheckout event down rather than just its value. Quoting the
//    substitution and coercing makes it fail soft, and the defaults below mean
//    it has something to coerce.
//
// Run: node --env-file=.env.local scripts/gtm-checkout-value-fix.mjs [--apply]

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

// ─── 1. Defaults on the two variables ───────────────────────────────────────

for (const [name, def] of [["DLV - value", "0"], ["DLV - currency", "HUF"]]) {
  const v = byName(variables, name);
  if (!v) { console.log(`⚠ nincs meg: ${name}`); continue; }
  const hasDefault = (v.parameter ?? []).some(
    (p) => p.key === "setDefaultValue" && p.value === "true",
  );
  if (hasDefault) { done(`${name} már van alapértelmezése`); continue; }
  plan(`alapértelmezés: ${name} → "${def}"`);
  if (APPLY) {
    await api(`${WS}/variables/${v.variableId}`, "PUT", {
      ...v,
      parameter: [
        ...(v.parameter ?? []).filter((p) => p.key !== "setDefaultValue" && p.key !== "defaultValue"),
        { type: "boolean", key: "setDefaultValue", value: "true" },
        { type: "template", key: "defaultValue", value: def },
      ],
    });
    done("beállítva");
  }
}

// ─── 2. TikTok: the mode switch that unlocks value/currency ─────────────────

const tt = byName(tags, "TikTok — InitiateCheckout");
if (!tt) {
  console.log("⚠ nincs meg: TikTok — InitiateCheckout");
} else if ((tt.parameter ?? []).some((p) => p.key === "single_multi_product")) {
  done("a TikTok tagben már be van állítva a single_multi_product");
} else {
  plan('TikTok — InitiateCheckout: + single_multi_product = "empty"');
  if (APPLY) {
    await api(`${WS}/tags/${tt.tagId}`, "PUT", {
      ...tt,
      parameter: [
        ...(tt.parameter ?? []),
        { type: "template", key: "single_multi_product", value: "empty" },
      ],
    });
    done("frissítve");
  }
}

// ─── 3. Meta: make the substitution fail-soft ──────────────────────────────

const fb = byName(tags, "Meta Pixel — InitiateCheckout");
if (!fb) {
  console.log("⚠ nincs meg: Meta Pixel — InitiateCheckout");
} else {
  const current = (fb.parameter ?? []).find((p) => p.key === "html")?.value ?? "";
  const next =
    "<script>(function(){var v=Number('{{DLV - value}}')||0;" +
    "fbq('track','InitiateCheckout',v?{value:v,currency:'{{DLV - currency}}'}:{});})();</script>";
  if (current === next) {
    done("a Meta tag már a védett változatot használja");
  } else {
    plan("Meta Pixel — InitiateCheckout: idézőjelezett, hibatűrő behelyettesítés");
    plan(`    ${current.replace(/\s+/g, " ")}`);
    plan(`  → ${next}`);
    if (APPLY) {
      await api(`${WS}/tags/${fb.tagId}`, "PUT", {
        ...fb,
        parameter: (fb.parameter ?? []).map((p) =>
          p.key === "html" ? { ...p, value: next } : p,
        ),
      });
      done("frissítve");
    }
  }
}

console.log(APPLY ? "\n=== KÉSZ. GTM-ben Submit szükséges. ===\n" : "\n=== Terv. Végrehajtás: --apply ===\n");
process.exit(0);
