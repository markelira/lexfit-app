import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { UNSUB_KINDS, verifyUnsubToken, type UnsubKind } from "@/lib/email-unsub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// One-click unsubscribe (RFC 8058). GET = a human clicked the footer link
// (apply + tiny HU confirmation page); POST = a mail client's headless
// one-click (apply + 200). HMAC-verified - fails closed without CRON_SECRET.

function parse(req: Request): { uid: string; kind: UnsubKind } | null {
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid") ?? "";
  const kind = url.searchParams.get("kind") as UnsubKind;
  const t = url.searchParams.get("t") ?? "";
  if (!uid || !UNSUB_KINDS.includes(kind)) return null;
  if (!process.env.CRON_SECRET) return null; // fail closed
  if (!verifyUnsubToken(uid, kind, t)) return null;
  return { uid, kind };
}

async function apply(uid: string, kind: UnsubKind): Promise<void> {
  // A quiz lead has no account, so the opt-out lives on the lead document.
  // Clearing nextEmailAt is what actually stops the sequence - the cron picks
  // leads by that field, so a flag alone would not be enough.
  if (kind === "leadMarketing") {
    await adminDb.doc(`quizLeads/${uid}`).set(
      { unsubscribedAt: Date.now(), nextEmailAt: null, nextEmailStep: null, "consents.marketing": false },
      { merge: true },
    );
    return;
  }
  if (kind === "marketing") {
    await adminDb.doc(`users/${uid}`).set({ marketingOptIn: false }, { merge: true });
    return;
  }
  const patch =
    kind === "workout"
      ? { reminders: { workout: { enabled: false } } }
      : { reminders: { [kind]: false } };
  await adminDb
    .doc(`users/${uid}/settings/prefs`)
    .set({ ...patch, updatedAt: Date.now() }, { merge: true });
}

const KIND_LABEL: Record<UnsubKind, string> = {
  workout: "az edzés-emlékeztetőket",
  streakRisk: "a sorozat-figyelmeztetéseket",
  weeklyRecap: "a heti összefoglalót",
  marketing: "az újdonságokat és ajánlatokat",
  leadMarketing: "a tippeket és ajánlatokat",
};

export async function POST(req: Request) {
  const p = parse(req);
  if (!p) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await apply(p.uid, p.kind);
  return new Response("ok", { status: 200 });
}

export async function GET(req: Request) {
  const p = parse(req);
  if (!p) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await apply(p.uid, p.kind);
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";
  // A lead has no account, so pointing them at in-app settings would be a dead
  // end. They get the erasure route instead - the only self-service they have.
  const isLead = p.kind === "leadMarketing";
  const tail = isLead
    ? `<p style="color:#44544d;font-size:15px;line-height:1.6;margin:0 0 20px">Ha azt is szeretnéd, hogy a kvíznél megadott adataidat töröljük, szólj az alábbi címen - egy megerősítő levelet küldünk.</p>
<a href="mailto:info@amstudios.hu?subject=Adattörlési%20kérelem" style="color:#355c4d">Adataim törlését kérem</a>`
    : `<p style="color:#44544d;font-size:15px;line-height:1.6;margin:0 0 20px">Ha meggondolnád magad, a beállításokban bármikor visszakapcsolhatod.</p>
<a href="${base}/app/profile/settings" style="color:#355c4d">Beállítások megnyitása</a>`;
  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Leiratkozva - LEXFIT</title></head>
<body style="margin:0;background:#f1f6f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#18201d">
<div style="max-width:440px;margin:80px auto;padding:38px 32px;background:#fff;border:1px solid #d8e0dd;border-radius:20px;text-align:center">
<p style="font-weight:900;letter-spacing:0.04em;margin:0 0 18px">LEX<span style="color:#496c5e">FIT</span></p>
<h1 style="font-weight:300;font-size:24px;margin:0 0 12px">Rendben, kikapcsoltuk.</h1>
<p style="color:#44544d;font-size:15px;line-height:1.6;margin:0 0 12px">Többé nem küldjük neked ${KIND_LABEL[p.kind]}.</p>
${tail}
</div></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
