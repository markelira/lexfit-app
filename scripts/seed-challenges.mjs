// LEXFIT — Kihívások (Szavazz Magadra archive) PREVIEW seed.
// Writes the parallel challenge library into Firestore:
//   challengeVideos/{code}, challenges/{slug}, challenges/{slug}/days/{id},
//   challengeFilters/{key}, settings/challenges
// Idempotent: upserts content fields but PRESERVES Mux/published fields on
// challengeVideos so attaching real videos later is never clobbered.
//
// This is throwaway EMULATOR preview filler (like the Foundation seed) — the
// real archive (weekly challenges since April) gets authored via the Phase 4
// admin. Do NOT seed production.
//
// Run: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node --env-file=.env.local scripts/seed-challenges.mjs
import "./require-emulator.mjs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ── init admin ──────────────────────────────────────────────
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}
const db = getFirestore();
const TS = FieldValue.serverTimestamp();

const BODY_PARTS = ["Has & core", "Fenék & comb", "Karok & váll", "Tánc-cardio", "Mobilitás", "Felsőtest", "Tartás"];

// Day-title pool (from the wireframe) — sliced to each challenge's length.
const DAY_TITLES = [
  "Alapozás", "Alsó has", "Oldalsó has", "Plank-nap", "Kombináció",
  "Kitartás", "Záró kör", "Tempó-nap", "Erő-nap", "Aktív pihenő",
  "Mély munka", "Pulzus", "Finisher", "Ünneplő kör",
];

const CH = [
  { slug: "7-napos-has-kihivas", title: "7 napos has-kihívás", month: "2024. november", sort: "2024-11", body: "Has & core", days: 7, mins: "napi 10–14 perc", participants: 312,
    synopsis: "Hét nap, napi 10–14 perc. A csoport ezt szavazta meg novemberben — most bármikor végigcsinálhatod a saját tempódban." },
  { slug: "5-napos-reggeli-ebreszto", title: "5 napos reggeli ébresztő", month: "2024. szeptember", sort: "2024-09", body: "Mobilitás", days: 5, mins: "napi 8–12 perc", participants: 143,
    synopsis: "Öt reggel, öt rövid felébresztő mozgás. A szeptemberi hét, bármikor újrajátszva." },
  { slug: "6-napos-mobilitas", title: "6 napos mobilitás", month: "2024. október", sort: "2024-10", body: "Mobilitás", days: 6, mins: "napi 10–15 perc", participants: 121,
    synopsis: "Hat nap ízület-nyitás és nyújtás — a leglágyabb hét a csoportból." },
  { slug: "14-napos-reggeli-flow", title: "14 napos reggeli flow", month: "2025. január", sort: "2025-01", body: "Mobilitás", days: 14, mins: "napi 12–18 perc", participants: 204,
    synopsis: "Két hét reggeli flow — a leghosszabb kihívás, napi 12–18 perc, a saját tempódban." },
  { slug: "5-napos-tartas-kihivas", title: "5 napos tartás-kihívás", month: "2025. január", sort: "2025-01", body: "Tartás", days: 5, mins: "napi 8–12 perc", participants: 266,
    synopsis: "Öt nap egyenes hát és nyitott mell. Rövid, de mindennap érzed." },
  { slug: "7-napos-hat-tartas", title: "7 napos hát & tartás", month: "2025. február", sort: "2025-02", body: "Tartás", days: 7, mins: "napi 10–14 perc", participants: 180,
    synopsis: "Hét nap a hátért és a tartásért — a februári csoport-választás." },
  { slug: "7-napos-core", title: "7 napos core", month: "2025. február", sort: "2025-02", body: "Has & core", days: 7, mins: "napi 10–14 perc", participants: 167,
    synopsis: "Hét nap fókuszált core-munka, eszköz nélkül." },
  { slug: "10-napos-alsotest", title: "10 napos alsótest", month: "2025. március", sort: "2025-03", body: "Fenék & comb", days: 10, mins: "napi 15–20 perc", participants: 158, featured: true, featuredLabel: "A CSOPORT VÁLASZTÁSA",
    synopsis: "Tíz nap, napi 15–20 perc. A csoport márciusi választása — most bármikor végigcsinálhatod." },
];

/** Upsert a challenge video, preserving Mux/publish state on re-run. */
async function upsertVideo(v) {
  const ref = db.collection("challengeVideos").doc(v.code);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.set({ ...v, updatedAt: TS }, { merge: true });
  } else {
    await ref.set({
      ...v,
      orientation: "portrait",
      muxAssetId: null, muxPlaybackId: null, muxUploadId: null, muxStatus: "none",
      muxDuration: null, thumb: null, published: false, status: "draft",
      createdAt: TS, updatedAt: TS,
    });
  }
}

/** Upsert any content doc, adding createdAt only when new. */
async function upsertDoc(ref, data) {
  const snap = await ref.get();
  await ref.set({ ...data, ...(snap.exists ? {} : { createdAt: TS }), updatedAt: TS }, { merge: true });
}

function buildFor(c) {
  const videos = [];
  const days = [];
  for (let i = 0; i < c.days; i++) {
    const code = `${c.slug}-d${String(i + 1).padStart(2, "0")}`;
    const seed = c.slug.charCodeAt(0) + i;
    const dayTitle = DAY_TITLES[i] ?? `${i + 1}. nap`;
    videos.push({
      code,
      title: `${i + 1}. nap · ${dayTitle}`,
      bodyPart: c.body,
      mins: 10 + (seed % 9),
      level: 1 + (seed % 3),
      blocks: [],
    });
    days.push({ id: String(i).padStart(2, "0"), videoCode: code, order: i, dayTitle });
  }
  const challenge = {
    slug: c.slug,
    title: c.title,
    series: "Szavazz Magadra",
    monthLabel: c.month,
    sortDate: c.sort,
    synopsis: c.synopsis,
    bodyPart: c.body,
    equipment: "eszköz nélkül",
    durationDays: c.days,
    perDayMinsLabel: c.mins ?? null,
    participantCount: c.participants ?? null,
    fbPostUrl: null,
    featured: c.featured ?? false,
    featuredLabel: c.featuredLabel ?? null,
    cover: null,
    totalDays: c.days,
    access: "members",
    status: "published",
    order: 0,
  };
  return { challenge, videos, days };
}

const filters = [
  { key: "len", label: "Hossz", options: ["≤5 nap", "6–7 nap", "8–10 nap", "11–14 nap"], order: 0, editable: true },
  { key: "theme", label: "Testrész", options: BODY_PARTS, order: 1, editable: true },
];

async function main() {
  let vCount = 0;
  for (const [idx, c] of CH.entries()) {
    const { challenge, videos, days } = buildFor(c);
    // Distinct order breaks same-month sort ties deterministically (the loader
    // sorts by sortDate desc, then order asc). CH is already authored newest-ish.
    challenge.order = idx;
    await Promise.all(videos.map(upsertVideo));
    vCount += videos.length;
    await upsertDoc(db.collection("challenges").doc(challenge.slug), challenge);
    await Promise.all(
      days.map((d) => upsertDoc(db.collection("challenges").doc(challenge.slug).collection("days").doc(d.id), d)),
    );
    console.log(`  challenge ${challenge.slug}: ${days.length} days`);
  }
  console.log(`Seeded ${CH.length} challenges + ${vCount} challenge videos.`);

  await Promise.all(filters.map((f) => upsertDoc(db.collection("challengeFilters").doc(f.key), f)));
  console.log(`Seeded ${filters.length} challenge filter dimensions.`);

  await upsertDoc(db.collection("settings").doc("challenges"), {
    fbGroupUrl: "https://www.facebook.com/groups/lexfit",
  });
  console.log("Seeded settings/challenges.");

  console.log("✅ Kihívások seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Kihívások seed failed:", e);
  process.exit(1);
});
