import "server-only";
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { type LeadDoc } from "@/lib/quiz/lead";
import { loadQuizCatalog } from "@/lib/quiz/catalog.server";
import {
  HEALTH_FIELDS, scheduleAfter, stopReason, type SequenceStep,
} from "@/lib/quiz/sequence";
import {
  sendQuizHowItWorks, sendQuizLastCall, sendQuizObjections,
  sendQuizObstacle, sendQuizOffer, sendQuizWinback,
  sendUjrakezdesD3, sendUjrakezdesD6, sendUjrakezdesD9,
  type QuizObstacleKind,
} from "@/lib/mailer";
import { LM_HEALTH_FIELDS, LM_VARIANT, type LmLeadDoc } from "@/lib/ujrakezdes/lead";
import { isLmStep, lmScheduleAfter, lmStopReason } from "@/lib/ujrakezdes/sequence";
import { APP_URL } from "../../../../../emails/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily job for quiz leads: advances the nurture sequence and enforces the two
 * retention clocks.
 *
 * Kept separate from /api/cron/reminders on purpose. That job serves paying
 * users - renewals, dunning, habit mail - and a lead-side bug must not be able
 * to starve it. The sections here are isolated from each other for the same
 * reason (one SendGrid failure once killed a whole run, 2026-08-10).
 *
 * Idempotency comes from `nextEmailAt`: it is cleared or moved forward in the
 * same write that records the send, so a replay finds nothing due.
 */

const BATCH = 200;

/**
 * One step of the lead magnet v2 sequence (D3, D6). Returns true when a mail
 * actually went out.
 *
 * Mirrors the original path's idempotency contract exactly: the schedule is
 * advanced in the SAME write that records the send, and a transport rejection
 * leaves `nextEmailAt` untouched so tomorrow's run retries rather than
 * silently skipping somebody's mail.
 */
async function advanceLmLead(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  lead: LmLeadDoc,
  now: number,
): Promise<boolean> {
  const step = lead.nextEmailStep ?? 0;
  const stop = lmStopReason(lead, step);
  if (stop || !isLmStep(step)) {
    await doc.ref.set({ nextEmailAt: null, nextEmailStep: null }, { merge: true });
    return false;
  }

  const planHref = `${APP_URL}/ujrakezdes`;
  const sent = step === 3
    ? (await sendUjrakezdesD3(lead.email, doc.id, { planHref, segment: lead.computed.segment })).sent
    : step === 6
      ? (await sendUjrakezdesD6(lead.email, doc.id)).sent
      : (await sendUjrakezdesD9(lead.email, doc.id)).sent;

  if (!sent) return false;

  await doc.ref.set(
    { ...lmScheduleAfter(lead, step), lastEmailAt: now, lastEmailStep: step },
    { merge: true },
  );
  return true;
}


async function section(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    console.error(`[quiz-leads] section ${name} failed`, e);
    Sentry.captureException(e, { tags: { cron: "quiz-leads", cron_section: name } });
  }
}

/**
 * Leads whose next mail is due. The lower bound is not redundant: Firestore
 * orders null BEFORE numbers, so `<= now` alone would sweep in every finished
 * and unsubscribed lead on the list.
 */
function dueQuery(now: number) {
  return adminDb
    .collection("quizLeads")
    .where("nextEmailAt", ">", 0)
    .where("nextEmailAt", "<=", now)
    .orderBy("nextEmailAt")
    .limit(BATCH);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail CLOSED: without the secret this must not be a public endpoint.
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const stats = { due: 0, sent: 0, stopped: 0, healthPurged: 0, deleted: 0 };

  // ── Nurture sequence (E2-E6, W1) ──
  await section("sequence", async () => {
    const snap = await dueQuery(now).get();
    stats.due = snap.size;
    if (snap.empty) return;

    const catalog = await loadQuizCatalog();

    for (const doc of snap.docs) {
      const raw = doc.data() as LeadDoc | LmLeadDoc;

      // Two funnels share this collection (see src/lib/ujrakezdes/lead.ts).
      // The branch is additive: a document with no `variant` is an original
      // quiz lead and takes the path below completely unchanged.
      if ((raw as LmLeadDoc).variant === LM_VARIANT) {
        const handled = await advanceLmLead(doc, raw as LmLeadDoc, now);
        if (handled) stats.sent++; else stats.stopped++;
        continue;
      }

      const lead = raw as LeadDoc;
      const step = (lead.nextEmailStep ?? 0) as SequenceStep;

      // Withdrawn consent, an unsubscribe, or a conversion since scheduling.
      const stop = stopReason(lead, step);
      if (stop || step < 2) {
        await doc.ref.set({ nextEmailAt: null, nextEmailStep: null }, { merge: true });
        stats.stopped++;
        continue;
      }

      const program = catalog.bySlug[lead.computed?.program ?? ""]?.title ?? "Lexfit Start";
      const p = { firstName: lead.firstName, programTitle: program };
      const obstacle = lead.answers?.obstacle as QuizObstacleKind | undefined;
      const id = doc.id;

      let sent = false;
      switch (step) {
        case 2:
          // The obstacle answer may have been purged; skip rather than guess.
          if (obstacle) sent = (await sendQuizObstacle(lead.email, id, { firstName: p.firstName, obstacle })).sent;
          break;
        case 3: sent = (await sendQuizHowItWorks(lead.email, id, p)).sent; break;
        case 4: sent = (await sendQuizOffer(lead.email, id, { firstName: p.firstName })).sent; break;
        case 5:
          if (obstacle) sent = (await sendQuizObjections(lead.email, id, { firstName: p.firstName, obstacle })).sent;
          break;
        case 6: sent = (await sendQuizLastCall(lead.email, id, p)).sent; break;
        case 7: sent = (await sendQuizWinback(lead.email, id, { firstName: p.firstName })).sent; break;
      }

      // A definite rejection leaves `nextEmailAt` untouched, so tomorrow's run
      // retries this lead rather than silently skipping their mail.
      if (!sent && (step === 2 || step === 5) && !obstacle) {
        await doc.ref.set(scheduleAfter(lead, step), { merge: true });
        continue;
      }
      if (!sent) continue;

      await doc.ref.set(
        { ...scheduleAfter(lead, step), lastEmailAt: now, lastEmailStep: step },
        { merge: true },
      );
      stats.sent++;
    }
  });

  // ── Retention clock 1: strip the Art. 9 fields at 12 months ──
  await section("health-purge", async () => {
    const snap = await adminDb
      .collection("quizLeads")
      .where("healthPurgeAt", ">", 0)
      .where("healthPurgeAt", "<=", now)
      .limit(BATCH)
      .get();
    for (const doc of snap.docs) {
      const patch: Record<string, unknown> = { healthPurgeAt: null, healthPurgedAt: now };
      // Each variant has its own Art. 9 field list: the original quiz's body
      // metrics and calorie figures, or v2's single `care` answer.
      const fields = (doc.data() as LmLeadDoc).variant === LM_VARIANT
        ? LM_HEALTH_FIELDS
        : HEALTH_FIELDS;
      for (const f of fields) patch[f] = FieldValue.delete();
      await doc.ref.update(patch);
      stats.healthPurged++;
    }
  });

  // ── Retention clock 2: delete the lead at 24 months ──
  await section("lead-purge", async () => {
    const snap = await adminDb
      .collection("quizLeads")
      .where("purgeAt", ">", 0)
      .where("purgeAt", "<=", now)
      .limit(BATCH)
      .get();
    for (const doc of snap.docs) {
      await doc.ref.delete();
      stats.deleted++;
    }
  });

  return NextResponse.json({ ok: true, ...stats });
}
