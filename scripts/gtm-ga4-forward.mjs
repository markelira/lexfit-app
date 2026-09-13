// Sprint P1-3: close the GA4 blind spot. The app's lx_* dataLayer events reach
// Meta/TikTok through the container, but NOTHING forwards them to GA4 - the
// property only holds auto-collected page_views, so the funnel (quiz_start,
// offer_view, offer_click...) is invisible in Analytics. One regex trigger +
// one GA4 event tag fixes the whole family at once, and every future lx_*
// event inherits the forwarding for free.
//
// The on-page Google tag (gtag.js, loaded consent-gated from Analytics.tsx)
// stays the config owner - this tag only SENDS events to the same measurement
// id, so page_views do not double-count.
//
// SCOPE: workspace edits only; publishing stays a human action in the GTM UI.
// Run: node --env-file=.env.local scripts/gtm-ga4-forward.mjs [--apply]

import { JWT } from "google-auth-library";

const CONTAINER_PATH = "accounts/6370552280/containers/260779505";
const GA4_ID = "G-C3DYY72PK6";
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

let WS;
{
  const list = await api(`${CONTAINER_PATH}/workspaces`);
  const w = (list.workspace ?? [])[0];
  if (!w) throw new Error("Nincs szerkeszthető workspace — hozz létre egyet a GTM-ben.");
  WS = `${CONTAINER_PATH}/workspaces/${w.workspaceId}`;
  console.log(`workspace: "${w.name}" (id=${w.workspaceId})`);
}

const tags = (await api(`${WS}/tags`)).tag ?? [];
const triggers = (await api(`${WS}/triggers`)).trigger ?? [];
const variables = (await api(`${WS}/variables`)).variable ?? [];
const byName = (list, name) => list.find((x) => x.name === name);
const log = (icon, msg) => console.log(`${icon} ${msg}`);
const plan = (msg) => log(APPLY ? "▸" : "·", msg);

console.log(`\n=== ${APPLY ? "VÉGREHAJTÁS" : "TERV (szárazon)"} ===\n`);

// ─── 1. DLV variables for the params worth having in GA4 ────────────────────
// A missing key resolves to undefined and the tag drops it, so one shared
// event tag can carry the union of every event's params.
const PARAMS = [
  "step_id", "q", "s", "position", "pick", "code",
  "plan", "value", "currency", "surface", "src", "variant",
];
const varFor = {};
for (const p of PARAMS) {
  const name = `DLV - ${p}`;
  let v = byName(variables, name);
  if (v) {
    log("✓", `változó már létezik: ${name}`);
  } else {
    plan(`létrehozás: ${name} (Data Layer Variable → ${p})`);
    if (APPLY) {
      v = await api(`${WS}/variables`, "POST", {
        name,
        type: "v",
        parameter: [
          { type: "integer", key: "dataLayerVersion", value: "2" },
          { type: "boolean", key: "setDefaultValue", value: "false" },
          { type: "template", key: "name", value: p },
        ],
      });
      log("✓", `létrehozva (id=${v.variableId})`);
    }
  }
  varFor[p] = name;
}

// ─── 2. Trigger: every lx_* custom event ────────────────────────────────────
let lxAll = byName(triggers, "lx — minden lx esemény");
if (lxAll) {
  log("✓", "trigger már létezik: lx — minden lx esemény");
} else {
  plan("létrehozás: trigger 'lx — minden lx esemény' (custom event regex: ^lx_.*)");
  if (APPLY) {
    lxAll = await api(`${WS}/triggers`, "POST", {
      name: "lx — minden lx esemény",
      type: "customEvent",
      customEventFilter: [
        {
          type: "matchRegex",
          parameter: [
            { type: "template", key: "arg0", value: "{{_event}}" },
            { type: "template", key: "arg1", value: "^lx_.*" },
          ],
        },
      ],
    });
    log("✓", `létrehozva (id=${lxAll.triggerId})`);
  }
}

// ─── 3. Tag: GA4 event, name passed through verbatim ────────────────────────
const TAG_NAME = "GA4 — lx események";
if (byName(tags, TAG_NAME)) {
  log("✓", `tag már létezik: ${TAG_NAME}`);
} else {
  plan(`létrehozás: ${TAG_NAME} (gaawe → ${GA4_ID}, eventName={{_event}}, ${PARAMS.length} param)`);
  if (APPLY) {
    const t = await api(`${WS}/tags`, "POST", {
      name: TAG_NAME,
      type: "gaawe",
      firingTriggerId: [lxAll.triggerId],
      parameter: [
        { type: "boolean", key: "sendEcommerceData", value: "false" },
        { type: "template", key: "measurementIdOverride", value: GA4_ID },
        { type: "template", key: "eventName", value: "{{_event}}" },
        {
          type: "list",
          key: "eventSettingsTable",
          list: PARAMS.map((p) => ({
            type: "map",
            map: [
              { type: "template", key: "parameter", value: p },
              { type: "template", key: "parameterValue", value: `{{${varFor[p]}}}` },
            ],
          })),
        },
      ],
    });
    log("✓", `létrehozva (id=${t.tagId})`);
  }
}

console.log(`\n${APPLY ? "Kész" : "Terv kiírva"} — élesítés: GTM UI → Submit/Publish (szándékosan kézi lépés).`);
