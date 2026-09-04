/**
 * Content audit — do the CLAIMS on the marketing pages match the content that
 * actually exists in Firestore?
 *
 * This exists because they did not. Offer v3 promises "LEXFIT Start — 30
 * vezetett edzés" in the hero, the pricing band's included list and the FAQ,
 * while the `foundation` program in production held 20 sessions. The landing
 * page renders BOTH: the hero claim from copy, and `{entry.sessionCount} edzés`
 * from the catalog three bands lower — so the page contradicted itself in
 * public.
 *
 * Nothing static can catch that: the numbers live in Firestore and the claims
 * live in TSX, so the only place they can be compared is against a real
 * database. Run this before any launch that changes either.
 *
 * Run:  node --env-file=.env.local scripts/content-audit.mjs
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// The claims offer v3 makes, as (slug → promised session count). Keep in step
// with src/components/landing/offer-copy.ts PRICING_BAND.included.
const CLAIMS = {
  foundation: { label: "LEXFIT Start", promised: 30 },
  napindito: { label: "Reggeli rutinok", promised: 3 },
  elsolepes: { label: "7 napos kezdő", promised: 7 },
  "5naposhasmelytorzschallange": { label: "Has & Mély Törzs", promised: 5 },
  "5naposlabfenekchallange": { label: "Láb & Fenék", promised: 5 },
  napzaro: { label: "Esti rutinok", promised: 3 },
  tartasjavito: { label: "Tartásjavító", promised: 4 },
};

const pk = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: pk,
  })});
}
const db = getFirestore();

const snap = await db.collection("programs").get();
let bad = 0;

console.log(`Project: ${process.env.FIREBASE_ADMIN_PROJECT_ID}\n`);
console.log("slug                          claimed  actual  status");
console.log("─".repeat(62));

for (const [slug, { label, promised }] of Object.entries(CLAIMS)) {
  const doc = snap.docs.find((d) => d.id === slug);
  if (!doc) {
    console.log(`${slug.padEnd(30)}${String(promised).padStart(7)}       —  MISSING`);
    bad++;
    continue;
  }
  const sessions = (await db.collection("programs").doc(slug).collection("sessions").get()).size;
  const published = doc.data().status === "published";
  const ok = sessions === promised && published;
  if (!ok) bad++;
  const note = !published ? "NOT PUBLISHED" : sessions === promised ? "ok" : `MISMATCH (${label})`;
  console.log(`${slug.padEnd(30)}${String(promised).padStart(7)}${String(sessions).padStart(8)}  ${note}`);
}

const unclaimed = snap.docs.filter((d) => !CLAIMS[d.id] && d.data().status === "published");
if (unclaimed.length) {
  console.log(`\nPublished but not named in the included list: ${unclaimed.map((d) => d.id).join(", ")}`);
}

console.log();
if (bad) {
  console.error(`✗ ${bad} claim(s) the content does not back. The pages must not ship saying this.`);
  process.exit(1);
}
console.log("✓ every claim on the pricing band is backed by real content.");
