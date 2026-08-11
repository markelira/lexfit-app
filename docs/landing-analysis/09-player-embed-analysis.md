# Embedding the real player on `/` — feasibility & security analysis

> **STATUS: NOT BUILT (2026-08-11).** Superseded by a much cheaper answer — §3 now
> shows a silent, looping 22-second **screen recording** of the mobile player
> (`/player-demo.mp4`, 496KB). It carries the same evidence (countdown ticking,
> current exercise, Mai menü checking itself off) with **no** public playback ID, no
> anonymous token endpoint, no `X-Frame-Options` change and no demo branches inside
> the 972-line production player.
>
> This document is kept because the findings stay true if a live embed is ever
> revisited — in particular §3, the viewport-media-query constraint that makes an
> inline embed unable to show a real mobile layout.

Date: 2026-08-11. Question: can §3 *„edzés, ahogy neked jó"* show the **actual**
`/player/F007` experience — live, 1:1, with a desktop⇄mobile view toggle — instead of
a striped placeholder?

**Short answer: yes, and the honest way is cheaper than the duplicate.** But one
constraint decides the entire architecture, and it is not the one you would expect.

---

## 1 · What the player actually is

| | |
|---|---|
| Route | `src/app/player/[code]/page.tsx` — **972 lines, `"use client"`** |
| Guard | `<Protected requirePaid fallback={<PlayerSkeleton/>}>` |
| Styles | `src/app/player/[code]/player.css` — 399 lines |
| Video data | Client Firestore read: `getDoc(doc(db, "videos", code))` |
| Playback | `GET /api/mux/token?code=…` → signed Mux JWTs |
| Stages | `preview` → `playing` → `finished` |
| `?autostart=1` | Read at line 133; skips the preview screen and calls `start()` |

`F007` is fully authored and ready — I read the production doc:

```
title        Egyenes hát, nyitott mell        status     published
theme        Felsőtest · Klasszikus circuit   mins       20
muxPlaybackId  KRmrNi0045YIYahuEueK02qxmEXfs8fOft62xFfLPTl1M
muxAssetId     zUv9h00Gv8e5ySBClAZauxDHjqNTFMCngkaN1QHzjkfo
muxDuration    1185.46s (19m 45s)
blocks         8, every one with a `start` stamp, items timestamped
```

The 8 stamped blocks matter: they are what drives the countdown, the "Következik:"
pill and the *Mai menü* accordion in your screenshot. Nothing needs authoring.

**One piece of good news up front:** `@mux/mux-player-react` is *already* in the
landing bundle — `WorkoutDetail` imports it for the card-preview clip. Embedding the
player adds no new heavy dependency.

---

## 2 · The four walls between the player and a logged-out visitor

Each is deliberate. None can be removed globally.

**① The route guard.** `Protected requirePaid` → anonymous visitors are
`router.replace("/login")`. Not bypassable by query param.

**② Firestore rules.** `match /videos/{code} { allow read: if isSignedIn() }`. The
player's own `getDoc` fails for anonymous users. *Already solved on this page* — the
landing reads content server-side through the Admin SDK (`landing-catalog.server.ts`)
and hands it down as props. F007 joins that payload; no rule change.

**③ The token endpoint.** `/api/mux/token` runs `verifyRequest` → 401, then
`hasAccess(uid)` → 403 without an active subscription. Every Mux asset is created
`playback_policies: ["signed"]`, tokens expiring in 6h. **This is the real gate** —
and §5 of this analysis is entirely about how to open it for exactly one video.

**④ `X-Frame-Options: DENY`**, set globally in `next.config.ts` for `/:path*`. Blocks
framing by *anyone*, including ourselves.

---

## 3 · The constraint that decides the architecture

You asked for a **desktop⇄mobile toggle**. That single requirement rules out the
approach everyone reaches for first.

`player.css` does its responsive work with **viewport media queries**:

```
@media (max-height: 560px)   line 137
@media (max-width: 900px)    line 273   ← 100 lines: the entire mobile player
@media (max-width: 720px)    line 399
```

and `page.tsx:713` branches on `window.innerWidth <= 900` for the mobile
tap-to-reveal overlay.

> A media query asks **how wide is the browser window**, never **how wide is this
> box**. Rendering the player into a 390px-wide `<div>` on a 1440px desktop produces
> the **desktop** layout squeezed into 390px — not the mobile player. The toggle
> would be a lie.

There are exactly two ways out:

- **Rewrite `player.css` to container queries.** ~100 lines of the *shipped* mobile
  player, plus the `innerWidth` branch — in a file that just went through the
  fullscreen rebuild (`e035478`, `86cc223`, `630b2ce`, `1eb91e0`). High regression
  risk on the real product, to serve a marketing page.
- **Give the embed a real viewport — a same-origin iframe.** Media queries then work
  because they are true. The toggle becomes "resize the iframe". `player.css`
  is not touched at all.

**The iframe wins on both fidelity and risk.** It is also the only option where "1:1"
is guaranteed rather than asserted.

---

## 4 · Three architectures

| | A · iframe `/player/F007` | B · inline React embed | C · **iframe → `/embed/player`** |
|---|---|---|---|
| True mobile layout | ✅ | ❌ *(§3)* | ✅ |
| Touches `player.css` | no | **yes, ~100 lines** | no |
| Touches the guarded route | no | no | **`PlayerScreen` gains a `demo` prop** |
| Auth | ❌ redirects to `/login` | n/a | ✅ public route, no auth |
| `X-Frame-Options` | must relax | n/a | must relax **for one path** |
| Stays 1:1 over time | ✅ | ⚠️ diverges | ✅ same component |

**A is dead** — the guard redirects and the page would try to write progress for a
`null` user.

**C is the recommendation.** A new public route `/embed/player` renders the *same*
`PlayerScreen` component in demo mode. Because it is the same component, it cannot
drift; because it is a real page in a real iframe, the device toggle is honest.

### What "demo mode" has to neutralise

`PlayerScreen` touches the signed-in user at **14 call sites**. Each becomes a guard
that leaves current behaviour untouched:

| Line | Call | In demo |
|---|---|---|
| 117 | `getProgress(user.uid)` | skip — no resume |
| 263 | `ensureProgress(user.uid)` | skip |
| 283–293 | `notePendingCompletion` · `clearResume` · `computeStreak` · `syncMuxProgress` | skip — **must not pollute progress data** |
| 306 | `saveResume(user.uid, …)` | skip |
| 599/623 | `getMyList` · `setSavedRemote` | hide the save control |
| 723 | `viewer_user_id: user?.uid` | **omit** — anonymous views must not be attributed |
| 228 | `buildFinishData` → finish screen | end on a *„Ez a te edzésed lenne"* CTA to `/onboarding` |
| exit / tab bar | `router.push("/app")` | no `/app` links on a public page |

Line 723 is the one with teeth: `/api/progress/sync` reads Mux Data **by
`viewer_id`**. Tagging anonymous marketing views with a uid — or reusing one — would
inject fake watch time into a real member's streak.

---

## 5 · Playback security — the actual decision

To stream F007 to a stranger, something has to give. Three ways, and they are not
equally safe.

### T1 · Public token endpoint
`/api/mux/demo-token` signs tokens for one **hardcoded** code (never a `?code=`
param). Short expiry (~2h, not 6h). Rate-limited; App Check in front.
- ➕ You keep the signing policy, can throttle, and can see the traffic.
- ➖ **Creates an unauthenticated path to the signing key.** Anyone can mint a fresh
  token on demand, so the video is effectively public anyway — with more code, more
  surface, and a new endpoint to get wrong.

### T2 · A second, public playback ID on the same asset ← **recommended**
Mux assets can carry multiple playback IDs with different policies. Add one with
`policy: "public"` to `zUv9h00Gv8e5ySBClAZauxDHjqNTFMCngkaN1QHzjkfo`. The landing
uses the public ID; **the app keeps using the signed one, unchanged.**
- ➕ Same asset — no re-encode, no extra storage, no second upload.
- ➕ **No anonymous code path near the signing key.** No endpoint, no JWTs, no rate
  limiting to design.
- ➕ Revoked instantly by deleting that one playback ID. Nothing else is affected.
- ➖ While it exists, F007 is genuinely public and hotlinkable.

### T3 · A separate short marketing asset
Upload a 2–3 minute excerpt as its own public asset.
- ➕ Strongest: you give away a sample, not a 20-minute paid workout.
- ➖ A second asset to encode, store and keep in sync; not literally "F007".

**T2 over T1** because T1's extra machinery buys no real protection — both make F007
streamable by anyone — while T1 adds an anonymous route to the signing key.

> ⚠️ **The business question underneath this is yours, not mine.** All three options
> make a full 20-minute paid workout free to anyone who views the homepage source.
> T3 exists precisely so you don't have to. Worth knowing: the demo's persuasive
> payload is the **player chrome** — the countdown, "Következik:", the 8-block *Mai
> menü* — not the video's length. A 3-minute excerpt demonstrates all of it.
>
> I could not verify Mux's referrer/domain-restriction options for public playback
> from here; if hotlinking is the deciding factor, that should be checked against
> current Mux docs before committing to T2.

### The framing header

`X-Frame-Options: DENY` must become `SAMEORIGIN` **for `/embed/*` only**, paired with
CSP `frame-ancestors 'self'` (which modern browsers honour over XFO). Every other
route keeps `DENY`.

Residual clickjacking risk on that path: **negligible.** `/embed/player` is
unauthenticated, renders one video, has no forms, no state and no destructive
actions — there is nothing for a clickjacker to harvest.

---

## 6 · Recommendation

```
C + T2 + scoped frame-ancestors
```

1. Add a public playback ID to the existing F007 asset (one Mux API call).
2. `PlayerScreen` gains a `demo` prop — 14 guards, every one defaulting to today's
   behaviour.
3. New public route `/embed/player`, server-rendered, video doc via Admin SDK.
4. Scope `X-Frame-Options`/`frame-ancestors` to `/embed/*`.
5. §3's placeholder becomes a device-framed iframe with a **Desktop / Mobil** toggle
   (desktop only) — real viewport widths, real media queries, real player.
6. **No autoplay.** A poster + a play affordance; the visitor starts it.

### On "basically duplication"

I'd push back on one word. A landing-only copy of the player is the same bet this
page already lost twice: §5 had a landing lookalike of the workout card and §11 had
one of the challenge card. Both drifted, both got deleted this week in favour of the
real components. A duplicated 972-line player would drift within one sprint, and the
marketing page would quietly start advertising a product that no longer exists.

Rendering the *same component* is what makes it 1:1 — permanently, without anyone
having to remember.

---

## 7 · Cost & risk

**Roughly 400–600 lines** across: the demo guards, the embed route, the landing-side
device frame + toggle, the catalog addition, and the header scoping. Half a day-ish.

The one real risk is that `PlayerScreen` becomes shared between the product and a
marketing page — a demo-mode bug could reach the real player. Mitigated by making
every branch an `if (demo)` guard whose else-path is the current code, unchanged.

**Bandwidth:** a homepage-embedded 20-minute video is a real Mux delivery cost once
traffic arrives. Worth a spend check before launch. No-autoplay keeps this
proportional to actual interest, which is the right shape.

---

## 8 · What I need from you

1. **T2 or T3** — public playback ID on the real F007 (full 20 min goes free), or a
   short excerpt as its own asset?
2. **Confirm the header change** — `frame-ancestors 'self'` on `/embed/*` only.
3. **Toggle default** — open on Desktop or on Mobil? (Mobil shows off the fullscreen
   ladder and tap controls; Desktop shows the *Mai menü* rail from your screenshot.)
4. **End of video** — the real player shows the finish/share flow. In demo I'd end on
   *„Ez a te edzésed lenne"* → `/onboarding`. Agreed?
