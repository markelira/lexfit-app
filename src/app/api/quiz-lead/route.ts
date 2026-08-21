import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { loadQuizCatalog } from "@/lib/quiz/catalog.server";
import { sendQuizResult } from "@/lib/mailer";
import {
  buildLead, leadId, parseAnswers, parseUtm, retakePatch, validateIdentity,
  type LeadDoc,
} from "@/lib/quiz/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lead magnet quiz - the only endpoint that writes a lead.
 *
 * PUBLIC and unauthenticated by design: the whole point is that filling the
 * quiz needs no account. That makes it the most exposed write in the app, so
 * every layer below is load-bearing.
 *
 * ⚠️ SHIPPED DISABLED. `QUIZ_ENABLED` must be set explicitly before this
 * accepts anything. The quiz collects GDPR Art. 9 health data, and the privacy
 * policy does not cover that yet (see
 * docs/legal/adatkezelesi-tajekoztato-kviz-modositas-TERVEZET.md). Turning the
 * flag on before that amendment is published and legally approved would make
 * the very first submission unlawful - so the switch is a deliberate,
 * one-line, auditable decision rather than a deploy side-effect.
 */
const enabled = () => process.env.QUIZ_ENABLED === "true";

function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0]!.trim() : req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
  if (!enabled()) {
    return NextResponse.json({ error: "not_enabled" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  // 1. Honeypot. A bot fills every field it finds; a human never sees this one.
  // Answer 200 so the bot cannot tell it was caught and retry differently.
  if (typeof body.hp_field === "string" && body.hp_field.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  // 2. Identity + consent.
  const firstName = String(body.first_name ?? "");
  const email = String(body.email ?? "");
  const consentHealth = body.consent_health === true;
  const consentMarketing = body.consent_marketing === true;

  const idErrs = validateIdentity(firstName, email, consentHealth);
  if (idErrs.length) {
    return NextResponse.json({ error: "invalid", fields: idErrs }, { status: 422 });
  }

  // 3. Answers - parsed and range-checked server-side; the client is only a
  // convenience layer and its numbers are never taken on faith.
  const answers = parseAnswers(body.answers);
  if (Array.isArray(answers)) {
    return NextResponse.json({ error: "invalid", fields: answers }, { status: 422 });
  }

  // 4. Rate limit. Two keys: the address (stops inbox-bombing one person) and
  // the IP (stops a scripted list-stuffing run). Fail-open by design.
  const ip = clientIp(req);
  const okEmail = await allowRequest("quizLead", leadId(email), 3, HOUR_MS);
  const okIp = ip ? await allowRequest("quizLeadIp", ip, 20, HOUR_MS) : true;
  if (!okEmail || !okIp) {
    // Same shape as success: a limited caller learns nothing.
    return NextResponse.json({ ok: true, limited: true });
  }

  const catalog = await loadQuizCatalog();
  const now = Date.now();

  const fresh = buildLead({
    firstName, email, consentHealth, consentMarketing,
    answers,
    utm: parseUtm(body.utm),
    ip,
    userAgent: req.headers.get("user-agent"),
    published: catalog.published,
    now,
  });

  // 5. Did the client's own arithmetic agree with ours? We always store OUR
  // numbers; the flag only tells us whether to go looking at the client build.
  const clientComputed = (body.computed ?? {}) as Record<string, unknown>;
  const mismatch =
    typeof clientComputed.goal_kcal === "number" &&
    Math.abs(clientComputed.goal_kcal - fresh.computed.goalKcal) > 50;

  // 6. Upsert on the email hash: a retake overwrites the answers but keeps the
  // original createdAt, so acquisition date stays honest.
  const ref = adminDb.doc(`quizLeads/${leadId(email)}`);
  let retake = false;
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const prev = snap.data() as LeadDoc | undefined;
      // Erasure is a hard delete (see the rights route), so an absent document
      // genuinely means "new lead" - a fresh submission after an erasure is a
      // fresh consent, and must be treated as one.
      if (prev) {
        retake = true;
        tx.set(ref, { ...retakePatch(prev, fresh), clientMismatch: mismatch }, { merge: true });
      } else {
        tx.set(ref, { ...fresh, clientMismatch: mismatch });
      }
    });
  } catch (e) {
    console.error("[quiz-lead] write failed", e);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  // 7. E1 is transactional (it is the result the lead asked for), so it goes
  // out regardless of the marketing checkbox. `deliver()` never throws, but the
  // await is still guarded: the lead is already saved, and a mail problem must
  // not turn a successful submission into an error for the person waiting.
  try {
    const prog = catalog.bySlug[fresh.computed.program];
    const bonus = fresh.computed.bonus ? catalog.bySlug[fresh.computed.bonus] : null;
    await sendQuizResult(fresh.email, {
      firstName: fresh.firstName,
      maintenanceKcal: fresh.computed.maintenanceKcal,
      goalKcal: fresh.computed.goalKcal,
      programTitle: prog?.title ?? "Lexfit Start",
      stepsTarget: fresh.computed.stepsTarget,
      bonusTitle: bonus?.title ?? null,
    });
  } catch (e) {
    console.error("[quiz-lead] E1 send failed", e);
  }

  return NextResponse.json({
    ok: true,
    retake,
    // Echoed so the result page renders from server-authoritative numbers.
    computed: fresh.computed,
    degradedCatalog: catalog.degraded,
  });
}
