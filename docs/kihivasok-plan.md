# Kihívások — dev plan (the Szavazz Magadra archive)

**Status:** Phases 1–3 built + verified (emulator). Phase 4 (admin CMS) is next.

**Build log:**
- **Phase 1 ✓** — `Challenge`/`ChallengeVideo`/`ChallengeDay`/`ChallengeProgress`/`ChallengeState` types in `src/lib/types.ts`; `firestore.rules` adds read-only `challenges/**`, `challengeVideos`, `challengeFilters`, global `settings/{doc}`, and owner-only `users/{uid}/challengeProgress`.
- **Phase 2 ✓** — `src/lib/challenges.ts` (loaders `loadChallenges`/`loadChallenge` + `filterChallenges`/`daysBucket`/`challengeState`); `scripts/seed-challenges.mjs` + `npm run seed:challenges[:local]`. Emulator seeded: 8 challenges, 61 portrait videos, filters `len[4]`/`theme[7]`, `settings/challenges`.
- **Phase 3 ✓** — `src/lib/challengeProgress.ts` (optimistic `markDayDone`/resume); `/api/progress/sync` extended so challenge-video completions route to the separate `challengeProgress` store AND their dates feed the shared flame streak, while Foundation `completed[]`/`doneCount`/`currentIndex` stay challenge-free (challenge codes live in neither `videos/` nor `sessions/`). Typecheck clean.
- **Phase 4 ✓ (admin CMS)** — full `next build` green (11 new routes). Mux: `mux.ts` gains a namespaced passthrough (`cv:` prefix) + `passthroughTarget()`; the shared webhook routes ready/errored events to `videos/` or `challengeVideos/` by passthrough; new `/api/mux/challenge/{upload,finalize}` write the challenge pool; `VideoUploader` gained `uploadPath`/`finalizePath` props. Challenge videos: `/api/admin/challenge-videos/[code]` (PUT/DELETE, DELETE guarded by `collectionGroup("days")`), `ChallengeVideoForm`, and `/admin/challenge-videos/{list,new,[code]}`. Challenges: `/api/admin/challenges/[slug]` (PUT/DELETE) + `/days` (flat full-replace, derives `durationDays`=`totalDays`=day count), `ChallengeForm`, `/admin/challenges/{list,new,[slug]}`. `SessionsBuilder` generalized (endpoint + copy props; defaults unchanged) and reused for the day list. Block sanitization extracted to `src/lib/admin-blocks.ts` (shared by both video routes). Admin NAV gains Kihívás-videók + Kihívások (trophy). **Deferred:** challengeFilters/settings admin UI (both seeded); end-to-end upload→author→publish needs `npm run dev:local` + Google sign-in (Admin SDK hits the emulator only when `FIRESTORE_EMULATOR_HOST` is set, as in dev:local).
- **Phase 5 ✓ (archive browse)** — `/app/challenges` stub replaced with the real archive (forks the Videótár two-mode engine: `resultsMode`, URL-synced `len`/`theme`/`state` chips + sort, restated removable chips, empty state, mobile filter sheet). Rows: Folytatod / A legutóbbi hetek (ÚJ ribbon) / Ha csak egy hetet vállalsz + the honest FB link-out. **Signature: the vertical 9:16 `ChallengeCard`** (stack mark, N NAP badge, series progress bar, ribbon, state line, save). Colour via new `challengeCatOf`/`challengeGrad` (bodyPart→`--cat-*`); `layers` icon added.
- **Phase 6 ✓ (playlist page)** — `/app/challenges/[slug]`: portrait cover + eyebrow + title + synopsis + meta chips + one loud CTA (Kihívás indítása / Folytatás — N. nap / Kezdd újra) + Listám + N/M nap kész, then the numbered day list (done ✓ / on "Itt tartasz" / open — never gated), then the participant-count FB row.
- **Phase 7 ✓ (vertical player)** — top-level `/challenge/[slug]/[code]` (fullscreen, outside the app shell): portrait MuxPlayer via a `?type=challenge` token (reads `challengeVideos`), resume save, `markDayDone` + pending-completion + forced Mux sync on end, and the trophy completion moment (per-day / whole-challenge) with next-day chaining. Gracefully shows a message when no video is attached (all seeded days) or entitlement is missing. Full `next build` green; whole browse→detail→play→complete flow navigable. **Playback + apple-design motion polish need a real 9:16 upload to verify** (dev:local + sign-in + admin upload).
- **Phase 8 ✓ (mobile)** — archive filter bar becomes a non-collapsing horizontal scroll strip on ≤640px (C-01); grid drops to 2-up; rows keep peek via `Rail`; playlist page stacks the cover; filter `BottomSheet` already wired. `ChallengeCard` styles extracted to `src/components/ChallengeCard.css` (self-contained, imported by the component) so the card renders on any page; added restrained hover-lift + active-press motion (reduced-motion respected).
- **Phase 9 ✓ (Kezdőlap)** — the old bonus-video placeholder row on `/app` is now a real `ChallengeCard` row: in-progress challenges first (C-RULE 06 — challenges live in the rows, never the hero), then newest for discovery; links to `/app/challenges`. Build green.
- **Code-review round 2 ✓** (Phase 4–9 diff) — (1) "started but 0 days done" now counts as in-progress: `challengeState` takes a `started` (has-resume) flag, so Folytatod/Kezdőlap catch a challenge you began but haven't finished a day of; (2) `loadChallenges`/`loadChallenge` filter to `status === "published"` (drafts/soon/archived stay admin-only — challenges have an explicit publish flow, unlike the library); (3) player resets per-video refs (`lastSave`, `didFinish`) + state in the load effect on code change (day-chaining doesn't remount), so day N+1's resume saves immediately; (4) completion uses `markDayDone`'s reconciled result, not a `doneCount+1` estimate; (5) dropped a dead `.chc-art` selector. Left as-is: Kezdőlap's `loadChallenges` runs for all users (the row needs the data; splitting the loader wasn't worth it). Build green.
- **Code-review round 1 fixes ✓** (Phase 1–3) — card no longer computes a wrong `nextDay` for out-of-order completion (detail page owns resume); `loadChallenge` fetches only the ≤14 day videos, not the whole `challengeVideos` collection; the sync's `collectionGroup("days")` scan is now lazy (only when a challenge day actually completes, detected by a videos/→challengeVideos/ probe); the sync writes `doneDays` via `arrayUnion` so a concurrent client completion isn't clobbered; seed authors distinct `order` for deterministic same-month sort. Left intentionally: global `settings/{doc}` is read-only and the reminders `collectionGroup("settings")` is doubly-guarded (`doc.id!=="prefs"` + where-clause), so the name overlap is safe.

---

**Wireframe:** `docs/LEXFIT Kihivasok Wireframe.html` (C1–C6).
**Supersedes:** the earlier "Közösség / live drop + voting feed" prototype at `src/app/app/szm/` + `src/lib/szm.ts`. That interaction model (weekly vote → daily locked drop → reactions/comments) is **dropped**; the community stays on Facebook. What we build is the **archive**.

---

## 0. What this is (and what it is not)

A **second content library**, parallel to Videótár, holding every past weekly "Szavazz Magadra" challenge. A challenge = a **5–14 day ordered series** (a playlist). Browsable, sortable, and completable **solo at any time**, running **alongside** Foundation — never replacing it, never touching the Kezdőlap hero.

It **inherits Videótár's grammar** (rows while browsing → grid on filter/sort intent, visible filter chips, count before grid) and **playlist grammar** for the unit (Spotify album / YT playlist page). No feed, no composer, no reactions, no leaderboards, no expiry, nothing gated.

### Locked decisions
| # | Decision | Choice |
|---|---|---|
| 1 | Storage vs `programs` | **Separate `challenges` collection** + `challenges/{slug}/days` subcollection |
| 2 | Day-video pool | **Separate `challengeVideos` pool** — never appears in Videótár |
| 3 | Progress/streak | **Shared flame streak** (a challenge day is a workout) + **separate completion store** (`users/{uid}/challengeProgress/{slug}`) |
| 4 | Video orientation | **9:16 vertical reels** → vertical card + vertical player |

### Decided by default (correct unless flagged)
- Destination named **Kihívások** (nav); **"Szavazz Magadra"** is the series eyebrow.
- **Participant count** ("312-en csinálták") = admin-entered static number per challenge (a past fact, not live, not a leaderboard).
- **FB links** = one global group URL (setting) + optional per-challenge post URL.
- **Ordered, never gated**; completed days stay playable; sort defaults to **newest**; challenges never reschedule Foundation.
- Authored/tested against the **emulator** with a seed; prod Firestore stays empty until real upload.

### The one open design decision (lock at the top of Phase 5)
The wireframe draws **16:9** thumbs, but the real content is **9:16 vertical reels**. Recommendation: **vertical (9:16) poster cards + a vertical player**, adapting the wireframe's series-card overlays (stack mark, days badge, progress bar, ribbon, state line) onto a portrait frame — the old `szm-vc` card is a ready starting point. Confirm before building the card.

---

## Reuse map (what already exists)

| Need | Reuse |
|---|---|
| Playlist builder (drag-order videos) | `src/components/admin/SessionsBuilder.tsx` — generic over `slug` + `videos`; only its POST path + video source are program-specific |
| Video upload | Mux pipeline: `src/lib/mux.ts`, `/api/mux/{upload,finalize,webhook,token}`, `src/components/admin/VideoUploader.tsx` |
| Admin write pattern | `verifyRequest → isAdmin → adminDb` (`src/lib/auth-server.ts`, `src/lib/admin-fetch.ts`, `src/lib/firebase-admin.ts`) |
| Admin metadata form | `src/components/admin/ProgramForm.tsx` (mirror for `ChallengeForm`) |
| Browse two-mode engine | `src/app/app/library/page.tsx` — `resultsMode = searching \|\| activeCount>0`, URL-sync effects, chips, category tiles, empty-state |
| Filter helpers | `src/lib/library.ts` — `filterVideos`/`emptyFilters`/`durBucket`/`ActiveFilters` (fork for challenge dims) |
| Rows | `src/components/Rail.tsx` |
| Cards | `src/components/{Cover,CourseCardShelf,WorkoutCard}.tsx`; **vertical**: `src/app/app/szm/szm.css` `.szm-vc` |
| Playlist detail model | `src/app/app/program/foundation/page.tsx` + `src/lib/program.ts` (numbered day list, `.pg-facts` chips) |
| Progress / streak | `src/lib/progress.ts`, `src/lib/streak.ts` (`computeStreak`), `/api/progress/sync` |
| Mobile | `src/components/BottomSheet.tsx`, `src/lib/useIsMobile.ts`, `src/components/MobileWorkoutSheet.tsx` |
| Nav (already wired!) | `src/app/app/layout.tsx` `NAV` has `["/app/challenges","trophy","Kihívások"]`; `/app/challenges/page.tsx` is a `Stub` to replace |

---

## Phase 1 — Data model & types

**Goal:** the Firestore topology and TypeScript types. No UI.

### Firestore topology
```
challenges/{slug}                     — challenge metadata (see fields below)
challenges/{slug}/days/{NN}           — ordered day → { videoCode, order, dayTitle, dayName? }
challengeVideos/{code}                — separate 9:16 video pool (Mux signed); mirrors Video minus Videótár taxonomy
challengeFilters/{key}                — editable taxonomy: HOSSZ buckets, TESTRÉSZ options (ÁLLAPOT is computed, not stored)
settings/challenges                   — { fbGroupUrl }
users/{uid}/challengeProgress/{slug}  — { doneDays: code[], resume: {code:sec}, completedAt } (completion store)
```

### `Challenge` (challenges/{slug})
Challenge-specific attributes (the "different informations" the user asked for):
- `slug`, `title` (e.g. "7 napos has-kihívás"), `series` ("Szavazz Magadra")
- `monthLabel` ("2024. november") + `sortDate` (sortable ISO/epoch, since "newest first" is the default sort)
- `synopsis`, `bodyPart` (→ TESTRÉSZ filter), `equipment` ("eszköz nélkül")
- `durationDays` (5–14; the card's "N NAP" badge; also DERIVED-checkable from day count), `perDayMinsLabel` ("napi 10–14 perc")
- `participantCount` (static, admin-entered; "312-en csinálták")
- `fbPostUrl` (optional per-challenge)
- `featured` / `featuredLabel` ("A CSOPORT VÁLASZTÁSA", "ÚJ")
- `cover`, `access` ("members" | "free"), `status`, `order`
- `totalDays` (maintained by the days route, like `totalSessions`)

### `ChallengeDay` (challenges/{slug}/days/{NN})
`{ id, videoCode, order, dayTitle ("Alapozás"), dayName? }` — **no `week`/`phase`** (challenges are flat day-lists); order = array position, id = zero-padded.

### `ChallengeVideo` (challengeVideos/{code})
Mirror of `Video` but 9:16 and challenge-scoped: `code`, `title`, `bodyPart`, `mins`, `level`, `blocks[]`, Mux fields (`muxAssetId/muxPlaybackId/muxStatus/muxDuration`, `orientation:"portrait"`), `thumb`, `published`, `status`. **Not** in the `videos` collection → never in Videótár.

### Filters
- **HOSSZ** — day buckets (e.g. `≤5`, `6–7`, `8–10`, `11–14`). Computed bucket like `durBucket`.
- **TESTRÉSZ** — options from `challengeFilters/theme` (seed from SZM themes: Fenék & comb, Has, Karok & váll, Tánc-cardio, Mobility-reset, Felsőtest, Tartás).
- **ÁLLAPOT** — `elkezdetlen | folyamatban | kész`, **computed per-user** from `challengeProgress`, not stored.

### Security rules
`challenges/**` and `challengeVideos/**` read-only to authed users; `challengeFilters/**` read-only; `users/{uid}/challengeProgress/**` owner-only read+write. Playback still gated by signed Mux URLs.

**Deliverables:** types in `src/lib/types.ts`; `firestore.rules` additions.

---

## Phase 2 — Read layer & seed

**Goal:** client loaders + emulator seed so screens have data.

- `src/lib/challenges.ts`:
  - `loadChallenges(uid): { challenges: ChallengeCardData[], filters }` — reads `challenges`, `challengeFilters`, and the user's `challengeProgress`; joins per-challenge state (elkezdetlen/folyamatban/kész + doneDays count + resume).
  - `loadChallenge(slug, uid): { challenge, days: ChallengeDayItem[], progress }` — reads doc + `days` (ordered) + `challengeVideos` for each + progress.
  - `filterChallenges(list, active, filters)`, `emptyChallengeFilters()`, `daysBucket(n)`, `challengeState(progress, totalDays)`.
- **Seed:** `seed/source/challenges.*` (real archive since April; adapt structure from `SZM_ARCHIVE`) + a seeding path in the emulator seed script; attach one 9:16 test video (mirror `scripts/attach-emulator-video.mjs`).

**Deliverables:** `src/lib/challenges.ts`; seed source + script; emulator populated.

---

## Phase 3 — Progress integration (shared streak, separate store)

**Goal:** completing a challenge day feeds the global flame but stays out of Foundation's state.

- `src/lib/challengeProgress.ts` — `getChallengeProgress(uid, slug)`, `markDayDone(uid, slug, code)`, `saveChallengeResume(...)`, `challengeCompletion(slug)`.
- **Shared streak:** a completed challenge day writes into the same daily signal the flame reads (`progress.workoutDays` / `computeStreak`), so the top-bar streak counts challenge days too — without touching `currentIndex`/`doneCount`/Foundation `completed[]`.
- **Mux completion:** route challengeVideos through the Mux progress sync (`viewer_id`) the same way workouts finalize (90% = done). Decide the passthrough namespace so the shared webhook routes challengeVideos vs videos correctly (**recommended: code prefix `SZM…`/`K…` or passthrough `challenge:CODE`** — see Phase 4 webhook note).

**Deliverables:** `src/lib/challengeProgress.ts`; streak wiring; sync route (parallel or extended).

---

## Phase 4 — Admin: Kihívások CMS

**Goal:** author challenges + upload their videos, dev→emulator / prod→prod, reusing the existing pipeline.

1. **Nav:** add `/admin/challenges` (+ `/admin/challenge-videos`) to admin `NAV` (`src/app/admin/layout.tsx`), trophy icon.
2. **Challenge videos (do first — days reference them):**
   - `src/app/admin/challenge-videos/{page,new,[code]}` — list/create/edit (mirror Videók).
   - `ChallengeVideoForm` (mirror `VideoForm`, 9:16, challenge taxonomy) + reuse `VideoUploader`.
   - API: `/api/admin/challenge-videos/[code]/route.ts` (PUT create/update, DELETE guarded against day references).
   - **Mux reuse:** `/api/mux/upload` seeds into `challengeVideos` when the code is challenge-scoped; webhook/finalize write back by passthrough. Namespace passthrough so `webhook` picks the right collection.
3. **Challenges:**
   - `src/app/admin/challenges/{page,new,[slug]}` — list / create (`ChallengeForm` only) / edit (`ChallengeForm` + day-list builder).
   - `ChallengeForm` (mirror `ProgramForm`) — all challenge fields incl. `monthLabel`/`sortDate`, `participantCount`, `fbPostUrl`, `featured`.
   - **Day-list builder:** reuse `SessionsBuilder` with (a) a `videos` source of `challengeVideos` and (b) a configurable POST endpoint prop. Small refactor to parametrize the path (currently hardcodes `/api/admin/programs/{slug}/sessions`).
   - API: `/api/admin/challenges/[slug]/route.ts` (PUT/DELETE, DELETE batch-removes days) + `/api/admin/challenges/[slug]/days/route.ts` (PUT full-replace, id = zero-padded order, maintain `totalDays`; **no week/phase derivation** — flat list).
4. **Challenge filters admin:** `/admin/challenge-filters` (or extend Szűrők) for HOSSZ/TESTRÉSZ; global FB group URL setting.

**Deliverables:** admin routes + `ChallengeForm`/`ChallengeVideoForm`; API routes; `SessionsBuilder` endpoint prop; Mux namespacing.

---

## Phase 5 — User: the archive browse page (C1–C3)

**Goal:** replace the `/app/challenges` stub with the archive, reusing the Videótár engine.

- **Lock card orientation first** (see §0 open decision) — recommended vertical poster.
- Fork the Videótár two-mode engine: `resultsMode = searching || activeCount>0`, URL filter state, `Törlés mind`, count-before-grid, restated removable chips.
- **Filter bar:** chips HOSSZ · TESTRÉSZ · ÁLLAPOT + `Szűrők` overflow + sort (`Legújabb elől` default, `Legrövidebb elől`).
- **Browse rows (budget = 3 + link-out):** `Folytatod` (in-progress), `A legutóbbi hetek` (newest, with ÚJ/featured ribbon), `Ha csak egy hetet vállalsz` (short challenges). Hide empty rows.
- **Grid mode:** count + uniform grid of challenge cards.
- **FB link-out row** at the foot (honest, last — not a banner/modal): "A szavazás a Facebook-csoportban zajlik… Ugrás a csoportba" → `settings.challenges.fbGroupUrl`.
- **`ChallengeCard`** (the series card): vertical poster + **stack mark** ("7 RÉSZ" layers, top-left) + **days badge** ("7 NAP", bottom-right) + **series progress bar** + **ribbon** (featured/ÚJ) + **state line** (month / "5 / 7 nap kész" / "Megcsináltad · januárban") + **save "+"**. Base: `szm-vc` + wireframe overlays.

**Deliverables:** `src/app/app/challenges/page.tsx` (+ css); `ChallengeCard`; Videótár-forked engine.

---

## Phase 6 — User: the challenge playlist page (C4)

**Goal:** the Spotify-album / YT-playlist detail page.

- Route `src/app/app/challenges/[slug]/page.tsx`.
- **Header:** cover (left) + eyebrow ("Szavazz Magadra · 2024. november") + `h1` title + synopsis + **meta chips** (`N RÉSZ`, `NAPI X PERC`, body part, `ESZKÖZ NÉLKÜL`) + **one loud button** — `Kihívás indítása` (unstarted) / `Folytatás — N. nap` (in progress) — + `Listám` + `N / M nap kész`.
- **Numbered day list:** done (✓ + "Megcsináltad · dátum", greyed but **still playable**), `on` ("Itt tartasz", highlighted), open (never locked). Each row: index/check, thumb, title ("6. nap · Kitartás"), mins, play.
- **Participant-count FB row:** "Ezt … 312-en csinálták végig … A csoport posztja" → `fbPostUrl`.

**Deliverables:** `[slug]/page.tsx` (+ css); day-row component.

---

## Phase 7 — Vertical player + completion moment

**Goal:** play a 9:16 day and celebrate finishing the series.

- **Vertical player:** portrait (9:16) player for challenge days keyed to `challengeVideos`. Either a portrait mode of `/player/[code]` (object-fit + controls overlay) or a dedicated reels-style route. On finish: `markDayDone`, feed shared streak, up-next = next day (order+1), completed stays replayable.
- **Completion (C5 C-03):** trophy + "Végigcsináltad." + "N napos … · M / M nap" + one Alexa line + `Következő kihívás` / `Vissza a Kihívásokhoz`. Same shape as the workout completion screen.

**Deliverables:** vertical player (route/mode); completion screen; day-done wiring.

---

## Phase 8 — Mobile (C5)

**Goal:** the three mobile screens.

- **C-01 Kihívások:** horizontally-scrolling filter strip (does not collapse) + browse rows with peek (72% card width) + bottom tab bar (trophy active). Reuse `BottomSheet` for the filter sheet with live count.
- **C-02 playlist:** one column — cover, eyebrow, title, chips, full-width play button, `N / M nap kész`, day list.
- **C-03 completion:** full-screen trophy moment.
- Use `useIsMobile`; card→sheet on tap where Videótár does.

**Deliverables:** mobile styles/behaviour across Phases 5–7.

---

## Phase 9 — Kezdőlap integration

**Goal:** a challenge in progress appears on the home screen — as a `Folytatod` card only, **never the hero** (C-RULE 06).

- Home reads `challengeProgress` for in-progress challenges and renders a Folytatod entry alongside Foundation. Foundation keeps the hero.

**Deliverables:** home `Folytatod` row addition.

---

## Runtime test (emulator) — how to exercise the whole flow

1. `npm run emulators` (Firestore+Storage+Auth).
2. `npm run seed:challenges:local` — seed the archive.
3. `npm run attach:challenge:local` — points the day videos of `5-napos-tartas-kihivas` + `7-napos-has-kihivas` at the real Mux test asset (24s, landscape; the vertical player crops it). Override targets with `CH_SLUGS="a,b"`.
4. `npm run dev:local`, sign in with Google, go to **/app/challenges** → open one of those two challenges → play a day → finish → watch the completion + next-day chaining. The flame/streak + `challengeProgress` update via `markDayDone` + the Mux sync.

Note: playback needs entitlement (`hasAccess`) — the same gate as the workout player; use a dev user with a subscription in the emulator.

## Phase 10 — QA, seed polish, launch

- Emulator authoring walkthrough (upload 9:16 video → build day-list → publish → browse → play → complete).
- Deploy `firestore.rules`; verify prod Firestore still empty; verify Videótár does **not** show challenge videos.
- Accessibility, `prefers-reduced-motion`, Hungarian copy verbatim from the wireframe.
- **Definition of done** (from C6): archive behaves like Videótár (rows→grid, chips, count); challenge = playlist (stack mark + part count on card; cover + one play + numbered list on page); ordered never gated; days on card / minutes on page; FB linked not imitated; runs alongside Foundation.

---

## Explicitly NOT doing (from the wireframe)
In-product feed / composer / reactions · locking later days · leaderboards · expiring challenges · challenge hijacking the Kezdőlap hero · importing FB comments.

## Open items to settle during build
1. Card orientation reconciliation (§0) — vertical vs the wireframe's 16:9. **Recommend vertical.**
2. Mux passthrough namespacing for the shared webhook (videos vs challengeVideos).
3. Whether `challengeFilters` is its own collection or a namespaced set inside `filters`.
