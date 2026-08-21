import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyRightsToken, type RightsAction } from "@/lib/quiz/lead-token";
import type { LeadDoc } from "@/lib/quiz/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GDPR rights for a quiz lead - the acting half. Reached only from the signed,
 * 24-hour link mailed by ../route.ts, which is what proves the requester
 * controls the mailbox.
 *
 * ERASURE IS A HARD DELETE. There is no 30-day grace period here, unlike the
 * account flow: that grace exists so a paying user can undo a rash cancellation
 * and keep their history, and a lead has neither. Keeping a "soft-deleted"
 * record of someone who asked to be forgotten would be the same processing they
 * objected to, just with a flag on it.
 */

function parse(req: Request): { id: string; action: RightsAction } | null {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const a = url.searchParams.get("a");
  const exp = Number(url.searchParams.get("e"));
  const t = url.searchParams.get("t") ?? "";
  if (a !== "erase" && a !== "export") return null;
  if (!verifyRightsToken(id, a, exp, t)) return null;
  return { id, action: a };
}

function page(title: string, body: string): Response {
  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} - LEXFIT</title></head>
<body style="margin:0;background:#f1f6f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#18201d">
<div style="max-width:440px;margin:80px auto;padding:38px 32px;background:#fff;border:1px solid #d8e0dd;border-radius:20px;text-align:center">
<p style="font-weight:900;letter-spacing:0.04em;margin:0 0 18px">LEX<span style="color:#496c5e">FIT</span></p>
<h1 style="font-weight:300;font-size:24px;margin:0 0 12px">${title}</h1>
<p style="color:#44544d;font-size:15px;line-height:1.6;margin:0">${body}</p>
</div></body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(req: Request) {
  const p = parse(req);
  if (!p) {
    return page(
      "Ez a link már nem érvényes.",
      "A megerősítő link 24 óráig él. Kérd újra, és küldünk egy frisset.",
    );
  }

  const ref = adminDb.doc(`quizLeads/${p.id}`);

  if (p.action === "erase") {
    try {
      await ref.delete();
    } catch (e) {
      console.error("[lead-rights/confirm] erase failed", e);
      return page("Most nem sikerült.", "Kérlek, próbáld újra, vagy írj az info@amstudios.hu címre.");
    }
    return page(
      "Töröltük az adataid.",
      "A kvíz kitöltésekor megadott adataid véglegesen törlődtek, és több levelet nem küldünk. Ha valaha visszatérnél, bármikor kitöltheted újra.",
    );
  }

  // Access / portability: hand back the stored record as JSON. The download is
  // the answer itself, so there is no page to render.
  try {
    const snap = await ref.get();
    if (!snap.exists) return page("Nincs mit elküldenünk.", "Ehhez a címhez nem tartozik tárolt adat.");
    const d = snap.data() as LeadDoc;
    return new NextResponse(JSON.stringify(d, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="lexfit-adataim.json"',
      },
    });
  } catch (e) {
    console.error("[lead-rights/confirm] export failed", e);
    return page("Most nem sikerült.", "Kérlek, próbáld újra, vagy írj az info@amstudios.hu címre.");
  }
}
