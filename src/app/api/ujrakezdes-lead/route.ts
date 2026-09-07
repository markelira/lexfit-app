import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { sendUjrakezdesD0 } from "@/lib/mailer";
import { sendLead } from "@/lib/meta-capi";
import { parseUtm } from "@/lib/quiz/lead";
import {
  buildLead, leadId, LM_VARIANT, parseAnswers, retakePatch, validateIdentity,
  type LmLeadDoc,
} from "@/lib/ujrakezdes/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lead magnet v2 gate - the only endpoint that writes an `lm_v2` lead.
 *
 * PUBLIC and unauthenticated by design: the whole point is that getting a plan
 * needs no account. That makes it one of the most exposed writes in the app, so
 * every layer below is load-bearing and none of them is decorative.
 *
 * ⚠️ FLAGGED OFF BY DEFAULT. `UJRAKEZDES_ENABLED` must be set explicitly.
 * Unlike /api/quiz-lead the blocker here is not Art. 9 - this funnel collects
 * no body metrics and no calorie figures - but the flag is kept for the same
 * reason: a paid campaign pointing at a lead form should be switched on by a
 * deliberate, auditable decision rather than as a deploy side-effect. It must
 * be set in Vercel BEFORE the ads go live (docs/lead-magnet-v2-plan.md §7.1).
 */
const enabled = () => process.env.UJRAKEZDES_ENABLED === "true";

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

  // 2. Identity. One field and one optional box - spec §3 asks for nothing
  // else, and every extra field costs conversion on a cold-traffic gate.
  const email = String(body.email ?? "");
  const consentMarketing = body.consent_marketing === true;

  const idErrs = validateIdentity(email);
  if (idErrs.length) {
    return NextResponse.json({ error: "invalid", fields: idErrs }, { status: 422 });
  }

  // 3. Answers - re-parsed server-side; the client is only a convenience layer.
  const answers = parseAnswers(body.answers);
  if (Array.isArray(answers)) {
    return NextResponse.json({ error: "invalid", fields: answers }, { status: 422 });
  }

  // 4. Rate limit. Two keys: the address (stops inbox-bombing one person) and
  // the IP (stops a scripted list-stuffing run). Fail-open by design.
  const ip = clientIp(req);
  const id = leadId(email);
  const okEmail = await allowRequest("ujraLead", id, 3, HOUR_MS);
  const okIp = ip ? await allowRequest("ujraLeadIp", ip, 20, HOUR_MS) : true;
  if (!okEmail || !okIp) {
    // Same shape as success: a limited caller learns nothing.
    return NextResponse.json({ ok: true, limited: true });
  }

  const now = Date.now();
  const fresh = buildLead({
    email,
    consentMarketing,
    answers,
    utm: parseUtm(body.utm),
    ip,
    userAgent: req.headers.get("user-agent"),
    now,
  });

  // 5. Upsert on the email hash: a retake overwrites the answers but keeps the
  // original createdAt, so acquisition date and the D3/D6 clock stay honest.
  //
  // A document that already exists as an ORIGINAL quiz lead is upgraded to this
  // variant rather than rejected - it is the same person and the same mailbox,
  // and splitting them would give them two unsubscribe links for one consent.
  const ref = adminDb.doc(`quizLeads/${id}`);
  let retake = false;
  try {
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const prev = snap.data() as LmLeadDoc | undefined;
      // Erasure is a hard delete, so an absent document genuinely means "new
      // lead" - a fresh submission after an erasure is a fresh consent.
      if (prev && prev.variant === LM_VARIANT) {
        retake = true;
        tx.set(ref, retakePatch(prev, fresh), { merge: true });
      } else {
        tx.set(ref, fresh, { merge: true });
      }
    });
  } catch (e) {
    console.error("[ujrakezdes-lead] write failed", e);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  // 6. D0 is transactional - it is the plan they just asked for - so it goes
  // out regardless of the marketing checkbox. `deliver()` never throws, but the
  // await is still guarded: the lead is already saved, and a mail problem must
  // not turn a successful submission into an error for the person waiting.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
  try {
    await sendUjrakezdesD0(fresh.email, {
      planHref: `${appUrl}/ujrakezdes`,
      consented: consentMarketing,
    });
  } catch (e) {
    console.error("[ujrakezdes-lead] D0 send failed", e);
  }

  // 7. Report the lead to Meta, server-side. This is the campaign's
  // optimisation signal, and the server is the only place that knows the lead
  // was actually stored - an ad blocker can stop the Pixel, but not this.
  //
  // Two guards that are not optional:
  //  - CONSENT. Reporting a lead is advertising measurement, not something the
  //    person asked for, so a visitor who declined cookies is never reported.
  //  - THE SHARED event_id. The Pixel fires `Lead` too; Meta only collapses the
  //    pair on a matching id, so a missing one double-counts every lead.
  const mkt = (body.marketing_context ?? {}) as { consent?: string; fbp?: string; fbc?: string };
  const eventId = typeof body.event_id === "string" ? body.event_id : "";
  if (mkt.consent === "granted" && eventId) {
    try {
      await sendLead({
        eventId,
        eventTime: Math.floor(now / 1000),
        email: fresh.email,
        fbp: mkt.fbp ?? null,
        fbc: mkt.fbc ?? null,
        programCode: "lexfit-start",
      });
    } catch (e) {
      console.error("[ujrakezdes-lead] CAPI report failed", e);
    }
  }

  return NextResponse.json({ ok: true, retake });
}
