# Finish Share — post-workout selfie + data overlay (Strava-style)

**Status:** P0 built + verified against the reference; P1–P6 pending.

**Build log:**
- **P3 ✓ (completion-step integration)** — Foundation player end screen (`src/app/player/[code]/page.tsx`) gains an "Oszd meg egy szelfivel" step + `buildFinishData(...)` from its finish scope (title/mins/theme/streak/exercises/workoutNo); `FinishShareEntry` routes mobile→`FinishShare` (inline camera), desktop→`DesktopHandoff`. `.pf-share` styled.
- **P4 ✓ (desktop→phone handoff)** — top-level `shareSessions/{token}` doc + rule (owner-read, server-write-only); `POST /api/finish-share/session` (authed, mints a 15-min token + sanitized data snapshot), `GET/POST /api/finish-share/[token]` (public, TTL-checked, no PII); `DesktopHandoff` (QR via `qrcode` dep + live status via `onSnapshot`) and the public `/finish/[token]` phone page (reuses `FinishShare`, reports status). Layout verified in headless (auth-gated QR shows the correct error unauthenticated). **Dev caveat:** cross-device handoff needs an HTTPS origin the phone can reach (deployed URL or a tunnel) — a `localhost` QR won't resolve from a phone and getUserMedia needs a secure context.
- **P1 ✓ (finish-data)** — `src/lib/finish-data.ts` `buildFinishData()` (pure, defensive; maps theme→Fókusz short word).
- **P2 ✓ (capture + overlay + share)** — `src/lib/finish-raster.ts` `renderFinishImage()` (canvas export mirroring `GEO`, Path2D LexMark + brackets, `document.fonts.load`; verified pixel-identical to the DOM in `/finish-preview`), and `src/components/finish/FinishShare.{tsx,css}` (getUserMedia front camera mirrored + shutter + retake + file-input fallback; the 5-overlay carousel; scrim toggle; Web Share `navigator.share({files})` + Download). Camera stage verified in headless (fake camera).
- **P2 polish ✓** — **drag-to-nudge** (an `offset` in reference-space px flows through `FinishOverlay`'s scaled transform AND `renderFinishImage`, so the export matches; clamped, resets on retake) and a **minimal data-swap** (a "Kiemelt:" pill row swaps the hero/lead metric among the workout's available options — reps/exercises/workoutNo — via `availableLeads`/`resultLead`'s `lead` override). Review stage verified in headless.
- **P0 ✓ (overlay renderer + preview)** — all 5 directions encoded at the reference's EXACT geometry (284×505 space, scaled to any width): `src/lib/finish-overlays.ts` (single geometry+data source of truth: `GEO`, `LOCKUP`, char limits, `FinishData`, `resultLead`/`defaultTrio`/`posterContent` — reps→exercise-count→workout-# fallback), `src/components/finish/FinishOverlay.{tsx,css}` (pure-white Poppins, inline `LexMark`, optional scrim), and `/finish-preview` (like `/cards-preview`). Rendered in headless Chrome and confirmed pixel-faithful to the 5 reference screenshots (A top-left · F Strava-center · B viewfinder brackets · C 78pt "340" · E vertical spine); the no-reps fallback shows "Gyakorlat 12" correctly. tsc + eslint clean.


**Reference:** `docs/LEXFIT Overlay Alternatives Adatok.html` (5 overlay directions A/F/B/C/E + slot/template system + data inventory).

## 0. What this is

When a user finishes a workout, the completion flow offers a **selfie**; the app stamps that selfie with a **data overlay** of the workout's numbers (Strava's post-activity share image), which the user then **shares** (Instagram Story/feed, …) or downloads. If the workout was finished on **desktop**, the selfie is **handed off to the phone** (QR → tokenized page), because you can't take a good selfie on a laptop.

### Locked decisions
| # | Decision | Choice |
|---|---|---|
| 1 | Reps source (the hero "340 ismétlés") | **Not available as data** — lead with what we have (Time, Streak, exercise count, workout #, week, body part); add an **optional authored `reps` field later** so Ismétlés lights up then. |
| 2 | Desktop→phone handoff | **QR → phone does everything on-device**; desktop shows a live "kész ✓" via `onSnapshot`. Image never sent back. |
| 3 | Phone auth | **One-time server-minted token, no phone login** (KYC-style). |
| 4 | Selfie storage | **Ephemeral — never uploaded.** No save-to-app at all. Face images never touch the server. |
| 5 | Camera | **Live in-browser front camera** (`getUserMedia`) with a 9:16 preview + in-page shutter + retake. |
| 6 | Bright-photo guardrail | **Fixed template positions + drag-to-nudge** + an optional scrim toggle (off by default). No auto-luminance in v1. |
| 7 | Slot data | **Smart per-workout defaults + a minimal swap** control. |
| 8 | Export | **Web Share** (`navigator.share` files) + **Download** fallback. |
| 9 | v1 finishes | **Foundation workouts first**; Kihívás player is a fast-follow. |
| 10 | Trigger | **A step everyone sees** on the completion screen (skippable). |
| 11 | Save-to-app | **None** — share/download only. |

### Decided-by-default
- Build **all 5** overlays (A/F/B/C/E) exactly per the reference, enforcing its per-template character limits.
- **Poppins** (already the app font) + the existing **`LexMark`** SVG (from `paywall.tsx`); overlay text is pure white.
- Copy in **Hungarian**.

---

## The data (personalized per workout)

Inventory the overlay slots can hold, with the real source (from the surface map):

| Datum | Source | v1? |
|---|---|---|
| **Idő** — `NN perc` | `video.mins` | ✅ |
| **Sorozat** — `NN. nap` | Foundation: `result.streak` (fresh `computeStreak`); Kihívás: fetch `getProgress` (fast-follow) | ✅ |
| **Gyakorlat** — exercise count | `blocks.reduce((n,b)=>n+b.items.length,0)` (player `totalEx`); degrades to 3 for un-authored videos | ✅ |
| **Edzésem** — workout # | `progress.doneCount` (+1 optimistic) | ✅ |
| **Fókusz / Testrész** | `video.theme` → short word via the player's `CAT` map | ✅ |
| **Edzés neve** (A/E headline only) | `video.title` | ✅ |
| **Program-hét** | derive from `currentIndex`/`perWeek` (or pass session `week`) | ✅ (derive) |
| **Összesen** — total minutes ever | sum `progress.watchByDay` (server) or `completed.length × mins` (approx) | ⚠️ approx |
| **Ismétlés** — total reps | none — needs a new authored `reps` field (Phase 5) | ❌ later |
| **Körök** — rounds | none — needs authoring | ❌ later |
| **Mérföldkő** — milestone | streak milestones (7/30/…) or program Hét 1/5/8 | ✅ (line) |

**Smart defaults:** the "result-lead" number = reps if authored, else Gyakorlat (exercise count), else Edzésem (#). Trio overlays (A/F/B/E) default to **[result-lead · Idő · Sorozat]**; C (one number) highlights the result-lead with **Idő · Sorozat** as the footnote; A/C/E may carry an optional headline (Edzés neve / Program-hét). A small "Adat cseréje" control swaps a slot to any inventory item that fits that template's char limit. Milestone weeks add a milestone line.

---

## The 5 overlays (exact per reference)

| Dir | Structure | Char limits |
|---|---|---|
| **A · Bal felső** | top-left: lockup, then 3 stacked label/value groups | label ≤12, value ≤11 |
| **F · Középre** (Strava) | vertically-centered: 3 groups, lockup at the bottom | value ≤9 |
| **B · Vágójelek** | two diagonal corner brackets (viewfinder) framing a 3-group block | value ≤8 |
| **C · Egy szám** | one 78pt number + unit + 2-line footnote + lockup | highlight ≤4 |
| **E · Gerinc** | vertical LEXFIT wordmark down the left edge + 3 groups | label ≤12, value ≤11 |

All render pure white, no shadow. If a datum exceeds a template's limit it's routed to a slot/template that fits (never shrunk). Max 3 slots + the fixed lockup.

---

## The flow

**Finish → completion step (everyone sees, skippable):**
- **On a phone:** inline → front camera live 9:16 preview → shutter (retake allowed) → the 5 overlays as a swipeable carousel over the photo, auto-filled → pick one → optional swap-data / drag-nudge / scrim → **Share** (Web Share) or **Download**. Nothing uploaded.
- **On desktop:** the step shows a **QR + short link** ("Fejezd be a telefonodon egy szelfivel") and a live status; the phone runs the exact same flow on the tokenized page. Desktop flips to **"kész ✓"** when the phone reports done (or the user dismisses).

---

## Handoff architecture (ephemeral · token · no phone login)

```
Desktop (authed)
  └─ POST /api/finish-share/session  { data: {title,mins,streak,exCount,doneCount,theme,week,milestone?} }
        → Admin SDK creates users/{uid}/shareSessions/{id}
             = { token(random,high-entropy), data, status:"pending", createdAt, expiresAt(+15m) }
        → returns { id, token, url:"/finish/<token>" }
  └─ renders QR(url) + onSnapshot(users/{uid}/shareSessions/{id})  → status → "kész ✓"

Phone (no auth) opens /finish/<token>  (public route)
  └─ GET  /api/finish-share/<token>   → server verifies token+TTL → returns data snapshot
  └─ runs the camera+overlay+share UI purely on-device (selfie never leaves the phone)
  └─ POST /api/finish-share/<token>   { status:"opened" | "shared" }  → server updates the session doc
```

- **Firestore rule:** `match /users/{uid}/shareSessions/{id} { allow read: if isOwner(uid); allow write: if false; }` (server-only writes via Admin SDK; desktop reads for the listener).
- **Security:** token is high-entropy + 15-min TTL + single session. If leaked, exposure = read non-PII workout stats + set a status flag; the **selfie is never uploaded**. Rate-limit the token endpoints.
- **Reuse:** the `onSnapshot` single-doc pattern from `prefs.ts`; the `canvas→toBlob` pattern from `account.ts`.

---

## Phases

**P0 · Overlay renderer + preview.** The 5 templates as a shared, presentational `<FinishOverlay dir data/>` (DOM for preview, and a canvas rasterizer for export), the data model + char-limit routing, Poppins/LexMark/white. A `/finish-preview` route (like `/cards-preview`) to iterate all 5 against sample photos + data. **Verifiable without camera/finish.**

**P1 · Finish data assembly.** `buildFinishData()` from the Foundation player's finish scope (video, `result.streak`, `totalEx`, `doneCount`, theme, derived week, milestone). Pure function, unit-testable.

**P2 · Capture + overlay + share UI (mobile-native).** `getUserMedia` front camera, shutter→frozen frame, the 5-overlay carousel with swap/nudge/scrim, canvas composite (draw photo + draw overlay), `navigator.share({files})` + download fallback. Works when you finish on a phone.

**P3 · Completion-step integration (Foundation player).** The always-shown, skippable step; device-aware (`useIsMobile`): mobile → P2 inline; desktop → P4 handoff.

**P4 · Desktop→phone handoff.** `shareSessions` doc + rule; `POST /api/finish-share/session`, `GET/POST /api/finish-share/[token]` (Admin SDK, token mint/verify/TTL); QR on desktop (add a small `qrcode` dep or inline SVG generator); `onSnapshot` status; the public `/finish/[token]` phone route reusing the P2 UI seeded from the token's data.

**P5 · (Optional/later) reps & rounds authoring.** Add optional `reps`/`rounds` fields to the video schema + admin form + block model so "Ismétlés"/"Körök" become real data and the C "one big number" overlay gets its intended hero. Not blocking.

**P6 · QA.** Bright-photo nudge/scrim, camera-permission-denied state, TTL expiry + reused/exhausted token, Web Share unsupported (download path), reduced-motion, exact Hungarian copy, image quality/size.

**Fast-follow:** mount the module on the Kihívás player (add a streak fetch there).

---

## Code-review fixes (xhigh pass)
Applied all 9 findings: DesktopHandoff subscribes once with an active-guard (was torn down every parent re-render → status never updated); player memoizes `buildFinishData` (stable `data`); camera effect stops a stream that resolves after teardown (no orphaned camera); `shareSessions` bounded by delete-on-read-expired + an authed `DELETE` the desktop fires on close (+ **ops TODO: add a Firestore TTL policy on `expiresAt`** as the durable backstop); `FinishShareEntry` waits for a resolved `isMobile` so mobile never flashes DesktopHandoff / POSTs a wasted session; share()'s Web-Share-unavailable fallback now reports `onShared`; C raster block-height uses `max(icon,word)`; `/finish-preview` `?share` benches gated to non-production; **CHAR_LIMITS marked not-yet-enforced** (no overflow with today's short values — wire enforcement into the data-swap + template routing in P5 when longer data types land).

## Explicitly NOT doing
Calories / body-weight / cm / intensity / rank (the reference bars them). No desktop webcam capture (always hand off to phone). No auto-luminance placement in v1. No server-side storage of selfies. No leaderboard.

## Open/for-build details (not blocking)
- QR: add `qrcode` (small) vs. inline SVG generator — decide at P4.
- Total-minutes-ever precision (watchByDay sum vs approx) — pick at P1.
- Exact default trio when `totalEx` degrades to 3 (un-authored) — prefer Idő·Sorozat·Fókusz there.
