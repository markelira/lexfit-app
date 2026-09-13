// Sprint P0-2: the orphan-rescue send. One-time fulfilment mail to Meta
// instant-form leads who never reached the site (deduped against quizLeads).
// Idempotent: each send is markered in `formRecovery/{sha256(email)}`, and a
// `form_recovery_sent` event is appended per delivery.
//
// Run:      node --env-file=.env.local --import tsx scripts/send-form-recovery.ts <orphans.json>
// Dry run:  … scripts/send-form-recovery.ts <orphans.json> --dry
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { sendFormRecovery } from "../src/lib/mailer";

if (process.env.FIRESTORE_EMULATOR_HOST) { console.error("emulator set — abort"); process.exit(1); }
const file = process.argv[2];
const DRY = process.argv.includes("--dry");
if (!file) { console.error("usage: send-form-recovery.ts <orphans.json> [--dry]"); process.exit(1); }

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
if (!getApps().length) {
  initializeApp({ credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  })});
}
const db = getFirestore();
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";

const orphans = JSON.parse(readFileSync(file, "utf8")) as { email: string }[];
const stats = { total: orphans.length, sent: 0, already: 0, failed: 0 };

async function main() {
  for (const o of orphans) {
    const email = o.email.trim().toLowerCase();
    const id = createHash("sha256").update(email).digest("hex");
    const marker = db.doc(`formRecovery/${id}`);
    if ((await marker.get()).exists) { stats.already++; continue; }

    const e64 = Buffer.from(email).toString("base64url");
    const ctaHref = `${appUrl}/ujrakezdes/terv?src=form_recovery&utm_source=email&utm_medium=recovery&utm_content=orphan_rescue&e=${e64}`;

    if (DRY) { console.log("[dry]", email.replace(/(.{2}).+(@.+)/, "$1…$2")); stats.sent++; continue; }

    const res = await sendFormRecovery(email, { ctaHref });
    if (!res.sent) { stats.failed++; console.log("FAILED", id.slice(0, 8)); continue; }
    await marker.set({ sentAt: Date.now() });
    await db.collection("events").add({
      name: "form_recovery_sent", uid: null, props: { leadHash: id.slice(0, 16) }, at: Date.now(),
    });
    stats.sent++;
    // SendGrid free-tier friendly pacing.
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log(DRY ? "DRY RUN." : "Done.", stats);
  process.exit(stats.failed ? 1 : 0);
}
void main();
