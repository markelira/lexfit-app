// One-off GTM configuration for the quiz measurement + the TikTok Pixel.
//
// Scripted rather than clicked, for three reasons: it is re-runnable, it is
// reviewable in the diff, and an event name cannot be mistyped in a way that
// silently stops firing.
//
// SCOPE: creates/updates objects in the workspace ONLY. It cannot create a
// container version and cannot publish - the service account holds `Edit`
// permission by deliberate choice, so going live stays a human action in the
// GTM UI.
//
// Run: node --env-file=.env.local scripts/gtm-setup.mjs [--apply]
//      Without --apply it prints the plan and changes nothing.

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

const log = (icon, msg) => console.log(`${icon} ${msg}`);
const plan = (msg) => log(APPLY ? "▸" : "·", msg);

// ─── Current state ───────────────────────────────────────────────────────────

const tags = (await api(`${WS}/tags`)).tag ?? [];
const triggers = (await api(`${WS}/triggers`)).trigger ?? [];
const variables = (await api(`${WS}/variables`)).variable ?? [];

const byName = (list, name) => list.find((x) => x.name === name);

console.log(`\n=== ${APPLY ? "VÉGREHAJTÁS" : "TERV (szárazon)"} ===\n`);

// ─── 1. Data Layer Variable: event_id ────────────────────────────────────────
//
// The Meta Lead event is reported twice - by the Pixel here and by the server's
// Conversions API - and Meta only collapses the pair when both carry the same
// id. Without this variable there is nothing to hand the Pixel.

let eventIdVar = byName(variables, "DLV - event_id");
if (eventIdVar) {
  log("✓", "változó már létezik: DLV - event_id");
} else {
  plan("létrehozás: DLV - event_id (Data Layer Variable → event_id)");
  if (APPLY) {
    eventIdVar = await api(`${WS}/variables`, "POST", {
      name: "DLV - event_id",
      type: "v",
      parameter: [
        { type: "integer", key: "dataLayerVersion", value: "2" },
        { type: "boolean", key: "setDefaultValue", value: "false" },
        { type: "template", key: "name", value: "event_id" },
      ],
    });
    log("✓", `létrehozva (id=${eventIdVar.variableId})`);
  }
}

// ─── 2. Trigger: lx_quiz_lead ───────────────────────────────────────────────

let quizLeadTrigger = byName(triggers, "lx — quiz lead");
if (quizLeadTrigger) {
  log("✓", "trigger már létezik: lx — quiz lead");
} else {
  plan("létrehozás: trigger 'lx — quiz lead' (custom event: lx_quiz_lead)");
  if (APPLY) {
    quizLeadTrigger = await api(`${WS}/triggers`, "POST", {
      name: "lx — quiz lead",
      type: "customEvent",
      customEventFilter: [
        {
          type: "equals",
          parameter: [
            { type: "template", key: "arg0", value: "{{_event}}" },
            { type: "template", key: "arg1", value: "lx_quiz_lead" },
          ],
        },
      ],
    });
    log("✓", `létrehozva (id=${quizLeadTrigger.triggerId})`);
  }
}

// ─── 3. Meta Pixel — Lead: retag + dedup id ─────────────────────────────────
//
// Two fixes in one tag. The trigger move matters because today every visitor
// who merely left the welcome screen counts as a Lead, so Meta builds lookalike
// audiences from the wrong people. The eventID matters because the server
// reports the same Lead, and without a shared id every lead counts twice.

const leadTag = byName(tags, "Meta Pixel — Lead");
if (!leadTag) {
  log("⚠", "NEM TALÁLHATÓ: 'Meta Pixel — Lead' — kihagyva");
} else {
  const newHtml = `<script>fbq('track', 'Lead', {}, {eventID: '{{DLV - event_id}}'});</script>`;
  const currentHtml = (leadTag.parameter ?? []).find((p) => p.key === "html")?.value ?? "";
  const triggerId = APPLY ? quizLeadTrigger?.triggerId : "(új)";

  plan(`módosítás: Meta Pixel — Lead`);
  plan(`    trigger: ${JSON.stringify(leadTag.firingTriggerId)} → [${triggerId}]  (lx_quiz_lead)`);
  plan(`    HTML:    ${currentHtml.replace(/\s+/g, " ")}`);
  plan(`          →  ${newHtml}`);

  if (APPLY) {
    await api(`${WS}/tags/${leadTag.tagId}`, "PUT", {
      ...leadTag,
      firingTriggerId: [quizLeadTrigger.triggerId],
      parameter: (leadTag.parameter ?? []).map((p) =>
        p.key === "html" ? { ...p, value: newHtml } : p,
      ),
    });
    log("✓", "frissítve");
  }
}

// ─── 4. Pause the duplicate Meta base tag ───────────────────────────────────
//
// Both base tags init the same pixel id on All Pages and both call
// track('PageView'), so every page view is counted twice today. Paused rather
// than deleted so it can be restored from the UI in one click.

const dupBase = byName(tags, "Meta Pixel ID 938411635181898");
if (!dupBase) {
  log("✓", "nincs duplikált Meta alappixel");
} else if (dupBase.paused) {
  log("✓", "a duplikált Meta alappixel már szüneteltetve van");
} else {
  plan("szüneteltetés: 'Meta Pixel ID 938411635181898' (duplikált PageView)");
  if (APPLY) {
    await api(`${WS}/tags/${dupBase.tagId}`, "PUT", { ...dupBase, paused: true });
    log("✓", "szüneteltetve");
  }
}

// ─── 5. TikTok event tags ───────────────────────────────────────────────────
//
// The wizard left one tag on a catch-all trigger (`event` matches ".+") that
// forwards the raw dataLayer event name. That would ship `lx_quiz_step` to
// TikTok dozens of times a session under a non-standard name. Three explicit
// tags replace it.
//
// `enhance_ecomm` is off: these are not commerce events, and the setting invites
// the pixel to scrape page data we have no reason to send.

const TIKTOK_TAG_TYPE = "cvt_MRQN8"; // a varázsló által telepített TikTok sablon
const PIXEL_CODE = "DA4PL4JC77U208UL7D60";

const TIKTOK_EVENTS = [
  { tag: "TikTok — SubmitForm", trigger: "lx — quiz lead", event: "SubmitForm" },
  { tag: "TikTok — CompleteRegistration", trigger: "lx — registration", event: "CompleteRegistration" },
  { tag: "TikTok — InitiateCheckout", trigger: "lx — checkout start", event: "InitiateCheckout" },
];

for (const spec of TIKTOK_EVENTS) {
  if (byName(tags, spec.tag)) {
    log("✓", `tag már létezik: ${spec.tag}`);
    continue;
  }
  // The quiz-lead trigger may have been created moments ago in this same run.
  const trg =
    spec.trigger === "lx — quiz lead"
      ? quizLeadTrigger
      : byName(triggers, spec.trigger);
  if (!trg) {
    log("⚠", `KIHAGYVA ${spec.tag} — nincs meg a trigger: ${spec.trigger}`);
    continue;
  }
  plan(`létrehozás: ${spec.tag} → ${spec.event}  (trigger: ${spec.trigger})`);
  if (APPLY) {
    const t = await api(`${WS}/tags`, "POST", {
      name: spec.tag,
      type: TIKTOK_TAG_TYPE,
      firingTriggerId: [trg.triggerId],
      parameter: [
        { type: "template", key: "pixel_code", value: PIXEL_CODE },
        { type: "template", key: "event", value: spec.event },
        { type: "boolean", key: "enhance_ecomm", value: "false" },
      ],
    });
    log("✓", `létrehozva (id=${t.tagId})`);
  }
}

// ─── 6. Pause the wizard's catch-all TikTok tag ─────────────────────────────

const ttCatchAll = byName(tags, `TT-${PIXEL_CODE}-Web-Tag-Pixel_Event`);
if (!ttCatchAll) {
  log("✓", "nincs catch-all TikTok event-tag");
} else if (ttCatchAll.paused) {
  log("✓", "a catch-all TikTok event-tag már szüneteltetve van");
} else {
  plan(`szüneteltetés: ${ttCatchAll.name} (minden custom eseményre tüzelne)`);
  if (APPLY) {
    await api(`${WS}/tags/${ttCatchAll.tagId}`, "PUT", { ...ttCatchAll, paused: true });
    log("✓", "szüneteltetve");
  }
}

console.log(
  APPLY
    ? "\n=== KÉSZ. Semmi nem élesedett — a GTM-ben Preview, majd Submit szükséges. ===\n"
    : "\n=== Ez csak terv volt. Végrehajtás: --apply ===\n",
);
process.exit(0);
