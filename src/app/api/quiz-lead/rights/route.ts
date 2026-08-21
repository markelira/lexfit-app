import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { leadId } from "@/lib/quiz/lead";
import { rightsUrl, type RightsAction } from "@/lib/quiz/lead-token";
import { validateEmail } from "@/lib/quiz/validate";
import { sendLeadRightsConfirm } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GDPR rights for a quiz lead - the request half ("please erase / send my data").
 *
 * The app's existing erasure and export machinery (/api/account/delete,
 * /api/account/export, the purge cron) is keyed on a Firebase uid, so none of
 * it can serve someone who only ever filled the quiz. This is that missing path,
 * and it exists from day one deliberately: a collection of Art. 9 data whose
 * subjects cannot exercise their rights should not be created in the first place.
 *
 * ALWAYS answers { ok: true } for a syntactically valid address, whether or not
 * a lead exists - otherwise this endpoint becomes an oracle for "is this person
 * in your database", which is exactly the sort of leak the flow is meant to
 * prevent. Nothing is destroyed here; the emailed link does the work.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; action?: string };
  const email = String(body.email ?? "");
  const action = (body.action === "export" ? "export" : "erase") as RightsAction;

  if (validateEmail(email) !== null) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const id = leadId(email);

  // Keyed on the address so this cannot be used to bomb someone's inbox.
  if (await allowRequest("leadRights", id, 3, HOUR_MS)) {
    try {
      const snap = await adminDb.doc(`quizLeads/${id}`).get();
      // Only mail an actual lead - but the caller cannot tell the difference.
      if (snap.exists) {
        await sendLeadRightsConfirm(email.trim(), { action, confirmUrl: rightsUrl(id, action) });
      }
    } catch (e) {
      console.error("[lead-rights]", e);
    }
  }

  return NextResponse.json({ ok: true });
}
