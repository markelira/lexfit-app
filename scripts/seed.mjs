// LEXFIT one-time content seed (Phase 1).
// Maps the prototype datasets (seed/source/*) into the flexible Firestore model:
//   videos/{code}, programs/{slug}, programs/{slug}/sessions/{id}, filters/{key}
// Idempotent: re-running upserts content fields but PRESERVES Mux/published
// fields so attaching videos later is never clobbered.
//
// Run: npm run seed:local   (emulator only — guarded below)
import "./require-emulator.mjs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadPrototype } from "../seed/load-prototype.mjs";

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

// ── load prototype data ─────────────────────────────────────
const prog = loadPrototype("prog-data.jsx");
const lx = loadPrototype("lexfit-data.jsx");

const SERIES = { B: "has-kihivas", R: "reggeli-flow", T: "tartas", N: "nyujtas", M: "mobility" };
const seriesFromCode = (code) => SERIES[code[0]] ?? null;

// blocks only exist for the "today" sample so far
const blocksByCode = { [lx.LX_TODAY_PLAN.code]: lx.LX_TODAY_PLAN.blocks };

// ── helpers ─────────────────────────────────────────────────
/** Upsert a video, preserving Mux/publish state on re-run. */
async function upsertVideo(intrinsic) {
  const ref = db.collection("videos").doc(intrinsic.code);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.set({ ...intrinsic, updatedAt: TS }, { merge: true });
  } else {
    await ref.set({
      ...intrinsic,
      muxAssetId: null, muxPlaybackId: null, muxStatus: "none",
      muxDuration: null, thumb: null, published: false, status: "draft",
      createdAt: TS, updatedAt: TS,
    });
  }
}

/** Upsert any content doc, adding createdAt only when new. */
async function upsertDoc(ref, data) {
  const snap = await ref.get();
  await ref.set(
    { ...data, ...(snap.exists ? {} : { createdAt: TS }), updatedAt: TS },
    { merge: true },
  );
}

// ── build payloads ──────────────────────────────────────────
const programWorkouts = prog.PROG_WEEKS.flatMap((w) => w.workouts);

const workoutVideos = programWorkouts.map((wk) => ({
  code: wk.code,
  kind: "workout",
  series: null,
  title: wk.title,
  theme: wk.theme,
  mins: wk.mins,
  level: wk.level,
  format: wk.format,
  types: wk.types,
  blocks: blocksByCode[wk.code] ?? [],
}));

const bonusVideos = lx.LX_VIDEOS.filter((v) => v.phase === null).map((b) => ({
  code: b.code,
  kind: "bonus",
  series: seriesFromCode(b.code),
  title: b.title,
  theme: b.theme,
  mins: b.mins,
  level: b.level,
  format: b.format,
  types: b.types,
  blocks: [],
}));

const meta = prog.PROG_META;
const factOf = (label) => meta.facts.find((f) => f[0] === label)?.[1] ?? null;
const program = {
  slug: "foundation",
  title: meta.title,
  hu: meta.hu,
  category: "Program",
  eyebrow: meta.eyebrow,
  level: meta.level,
  goal: null,
  equipment: factOf("Eszköz"),
  synopsis: meta.synopsis,
  facts: meta.facts.map(([label, value]) => ({ label, value })),
  weeks: meta.weeks,
  perWeek: meta.perWeek,
  totalSessions: programWorkouts.length,
  defaultMins: meta.mins,
  phases: prog.PROG_PHASES.map((p) => ({
    idx: p.idx, icon: p.icon, name: p.name, weeks: p.weeks,
    short: p.short, desc: p.desc, colorVar: p.c,
  })),
  cover: null,
  trailerPlaybackId: null,
  access: "members",
  status: "published",
  order: 0,
};

const sessions = programWorkouts.map((wk) => ({
  id: String(wk.globalIndex).padStart(2, "0"),
  videoCode: wk.code,
  order: wk.globalIndex,
  week: wk.week,
  day: wk.day,
  dayName: wk.dayName,
  phaseIdx: wk.phase,
  retest: wk.retest,
}));

// Guarantee that value-based filter dimensions (theme/format/type) cover every
// value the seeded videos actually use — keeps the library filters consistent
// with the data where the prototype's taxonomy was incomplete (e.g. the
// "📊 Visszamérő" retest tag was missing from LX_FILTERS.type).
const allForTaxonomy = [...workoutVideos, ...bonusVideos];
const usedValues = {
  theme: new Set(allForTaxonomy.map((v) => v.theme)),
  format: new Set(allForTaxonomy.map((v) => v.format)),
  type: new Set(allForTaxonomy.flatMap((v) => v.types)),
};
const filters = Object.entries(lx.LX_FILTERS).map(([key, dim], i) => {
  let options = dim.options;
  if (usedValues[key]) {
    const missing = [...usedValues[key]].filter((x) => !options.includes(x));
    if (missing.length) {
      console.log(`  filters/${key}: +${missing.length} missing option(s): ${missing.join(", ")}`);
      options = [...options, ...missing];
    }
  }
  return { key, label: dim.label, options, order: i, editable: true };
});

// ── write ───────────────────────────────────────────────────
async function main() {
  const allVideos = [...workoutVideos, ...bonusVideos];
  console.log(`Seeding ${allVideos.length} videos (${workoutVideos.length} workouts + ${bonusVideos.length} bonus)…`);
  await Promise.all(allVideos.map(upsertVideo));

  console.log(`Seeding program "${program.slug}" + ${sessions.length} sessions…`);
  await upsertDoc(db.collection("programs").doc(program.slug), program);
  await Promise.all(
    sessions.map((s) =>
      upsertDoc(db.collection("programs").doc(program.slug).collection("sessions").doc(s.id), s),
    ),
  );

  console.log(`Seeding ${filters.length} filter dimensions…`);
  await Promise.all(
    filters.map((f) => upsertDoc(db.collection("filters").doc(f.key), f)),
  );

  console.log("✅ Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
