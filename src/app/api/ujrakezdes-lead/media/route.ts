import "server-only";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { allowRequest, HOUR_MS } from "@/lib/rate-limit";
import { signPreviewTokens, signThumbToken } from "@/lib/mux";
import { loadLandingCatalog } from "@/lib/landing-catalog.server";
import { LM_VARIANT, type LmLeadDoc } from "@/lib/ujrakezdes/lead";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The reveal's media, by plan token (reveal redesign v2, owner decision
// 2026-09-13: the FIRST workout is fully watchable on the reveal - the
// strongest possible proof for a "will I stick with it" audience is the
// actual product, and the reveal is the moment of peak investment).
//
// THIS response is IMAGE-ONLY (posters + animated previews) for the first
// few entry sessions - the cards must show the real product, but a card
// leaking a video token would open the library to anyone with a lead token.
// Full playback for the first workout is the /watch endpoint's job (the real
// player's guest mode); no video token ever travels through here.
//
// The gate is the lead's unguessable planToken + an IP rate limit, same
// posture as the handoff endpoint.

const TOKEN_RE = /^[0-9a-f]{32}$/;
const CARD_COUNT = 6;

export async function GET(req: Request) {
  const lt = new URL(req.url).searchParams.get("lt") ?? "";
  if (!TOKEN_RE.test(lt)) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip");
  if (ip && !(await allowRequest("ujraMedia", ip, 60, HOUR_MS))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const leadSnap = await adminDb
    .collection("quizLeads")
    .where("planToken", "==", lt)
    .limit(1)
    .get();
  const lead = leadSnap.docs[0]?.data() as LmLeadDoc | undefined;
  if (!lead || lead.variant !== LM_VARIANT) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // The entry programme's session order is the allowlist.
  const catalog = await loadLandingCatalog();
  const sessions = catalog.entry?.sessions ?? [];
  const byCode = new Map(catalog.workouts.map((w) => [w.code, w]));
  const codes = sessions
    .map((s) => s.code)
    .filter((c) => byCode.has(c))
    .slice(0, CARD_COUNT);
  if (!codes.length) return NextResponse.json({ first: null, cards: [] });

  // Published videos only - same rule as the entitled token route.
  const docs = await Promise.all(
    codes.map((c) => adminDb.collection("videos").doc(c).get()),
  );
  const playable = new Map<string, string>();
  for (const d of docs) {
    const v = d.data();
    if (!v?.muxPlaybackId) continue;
    if (v.status !== undefined && v.status !== "published") continue;
    playable.set(d.id, v.muxPlaybackId as string);
  }

  let first: unknown = null;
  const cards: unknown[] = [];
  for (const code of codes) {
    const playbackId = playable.get(code);
    const w = byCode.get(code)!;
    if (!playbackId) continue;
    if (!first) {
      // The hero card only needs a poster - full playback is served by the
      // /watch endpoint to the real player's guest mode, so no video token
      // travels through this response. Frame selection (60s in, past the
      // dark intro) lives in the token claims (see mux.ts).
      const t = await signPreviewTokens(playbackId);
      first = {
        code, title: w.title, theme: w.theme, mins: w.mins,
        poster: `https://image.mux.com/${playbackId}/thumbnail.webp?token=${t.thumbnail}`,
      };
      continue;
    }
    const t = await signPreviewTokens(playbackId);
    cards.push({
      code,
      title: w.title,
      theme: w.theme,
      mins: w.mins,
      poster: `https://image.mux.com/${playbackId}/thumbnail.webp?token=${t.thumbnail}`,
      anim: `https://image.mux.com/${playbackId}/animated.webp?token=${t.gif}`,
    });
  }

  // The programme strip (graphics audit 2026-09-14). The entry block lists
  // seven programmes as numbers and prose across 1 215px with no image at
  // all - the page's most wordless stretch, and the one that has to carry
  // "this is what you get". One real poster per programme, taken from its
  // first session, at 192px: the programmes have no cover field of their own,
  // but every video has a Mux playback id, so the library can show itself.
  // NOT via catalog.workouts: that array is `entryVideos.map(toWorkout)`, i.e.
  // the entry programme ONLY, so matching against it returned one poster and
  // silently dropped the other six. Each programme's own `sessions`
  // subcollection is the honest source.
  const progPosters = (
    await Promise.all(
      catalog.programs.map(async (p) => {
        const sess = await adminDb
          .collection("programs").doc(p.slug).collection("sessions")
          .orderBy("order").limit(1).get();
        const code = sess.docs[0]?.data()?.videoCode as string | undefined;
        if (!code) return null;
        const v = (await adminDb.collection("videos").doc(code).get()).data();
        if (!v?.muxPlaybackId) return null;
        if (v.status !== undefined && v.status !== "published") return null;
        const t = await signThumbToken(v.muxPlaybackId as string, 192);
        return {
          slug: p.slug,
          poster: `https://image.mux.com/${v.muxPlaybackId}/thumbnail.webp?token=${t}`,
        };
      }),
    )
  ).filter(Boolean);

  // Tokens live 6h; let the CDN hold the response briefly so a reveal that
  // re-fetches (refresh, back-forward) doesn't re-sign every time.
  return NextResponse.json(
    { first, cards, programs: progPosters },
    { headers: { "Cache-Control": "private, max-age=600" } },
  );
}
