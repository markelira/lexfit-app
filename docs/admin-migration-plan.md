# LEXFIT Admin Panel — Migration Plan (v1)

> **STATUS: COMPLETE (2026-07-02).** All phases A0–A5 built, browser-verified by the
> owner, and green (tsc + eslint + `npm run build`). Security invariants held (content
> stays client-read-only; admin writes via Admin SDK; every `/api/admin/*` route gates
> `isAdmin`). Independent code audit found no critical/high issues; medium hardening
> applied (Google-provider-pinned admin, block-delete-if-referenced, upload seeds a
> full draft, sessions 404 on missing program, NaN guards). Deferred (v1 scope): promo/
> comp codes, audit log, settings doc, notifications.

> Follows `docs/admin-migration-research.md`. Encodes the confirmed decisions and
> lays out a phased, test-verified build. **Each phase ends green** (tsc + eslint +
> `npm run build`) with a manual verification note, and we advance only at ~99%
> confidence it's correct and non-breaking. This is Phase 7 of `docs/build-plan.md`.

## Confirmed decisions (2026-07-01)

1. **UI:** rebuild in LEXFIT's `.lx` CSS — **no Tailwind/Radix**. `@dnd-kit` for
   drag-reorder (style-agnostic); `sonner` optional for toasts.
2. **v1 scope:** Tier 1 **content** (Videók + Mux upload, Programok builder, Szűrők)
   + Tier 2 **read-only** members list + small dashboard. **Deferred:** promo/comp
   codes, audit log, settings, notifications, analytics charts, support.
3. **Members:** **read-only** in v1 (no comp/cancel/GDPR actions yet).

## Non-negotiable invariants (every phase)

- **Auth:** every admin `/api/admin/*` route does `verifyRequest → isAdmin → Admin
  SDK`. Non-admin ⇒ 403. Client admin fetches send the Firebase ID token as
  `Authorization: Bearer` (reuse the `billing.ts` `postWithToken` shape → a shared
  `adminFetch` helper).
- **No Firestore rule changes.** Content stays `read: <authed>`, client `write:
  false`. All admin **writes go through Admin-SDK `/api` routes** (rule-exempt).
  Content **reads** in the admin use the client SDK (already allowed); **members**
  read goes through an admin GET route (clients can't read other users).
- **Dev = emulator, prod = prod.** The admin uses the same Firebase wiring as the
  app (`NEXT_PUBLIC_USE_EMULATORS`), so all content authoring happens against the
  emulator in `dev:local` and against prod when deployed. **Never seed prod by hand.**
- **No Tailwind, no secrets committed, Hungarian UI strings.**
- Reuse existing infra: `src/lib/auth-server.ts` (`verifyRequest`,`isAdmin`),
  `src/lib/mux.ts` + `/api/mux/{upload,finalize,webhook,token}`, `src/lib/types.ts`,
  `src/lib/firebase-admin.ts` (`adminDb`).

---

## Phase A0 — Admin shell & auth gate (foundation)

**Goal:** a guarded `/admin` area that only the owner can enter, with the nav and the
handful of shared `.lx` primitives the CRUD screens need.

- `GET /api/admin/me` — `verifyRequest → isAdmin` → `{ admin: boolean }` (server
  truth; avoids duplicating the allowlist client-side).
- `src/app/admin/layout.tsx` — client layout: wait for `authReady`, call
  `/api/admin/me`, show a loader until resolved, **redirect non-admins** to `/app`
  (race-safe pattern from dma). `.lx`-styled admin sidebar nav: Vezérlőpult · Videók ·
  Programok · Szűrők · Tagok, + "vissza az appba".
- `src/lib/admin-fetch.ts` — `adminFetch(path, init)` attaching the ID token.
- Shared primitives in `src/components/admin/` (`.lx` CSS): `AdminTable`
  (sort/filter/paginate via `useState`), `Modal`, `Confirm`, `Field` (labeled
  input/select/textarea), and a toast (adopt `sonner` or a tiny hand-rolled one).
- `src/app/admin/admin.css` — admin design tokens layered on `.lx`.

**DoD:** non-admin hitting `/admin` is redirected; owner sees the shell; `/api/admin/me`
returns 403 without a valid admin token; tsc+eslint+build green.

## Phase A1 — Szűrők (filters/taxonomy) editor

*Smallest surface — validates the whole write-path end-to-end first.*

- `GET/PUT /api/admin/filters/[key]` (PUT = replace `options`/`order`/`label`).
- `src/app/admin/filters/page.tsx` — list `filters/{key}` (client SDK read); per
  dimension, edit `options` (add/rename/remove/reorder, honoring `editable`); save via
  `adminFetch`.

**DoD:** edit a filter option in the emulator; the app's Videótár filters reflect it;
rules unchanged; verified manually; green.

## Phase A2 — Videók (library) + Mux upload  ⭐ core

*Reuses the existing signed Mux pipeline — no new video infra.*

- `GET (list) / POST / PUT / DELETE /api/admin/videos/[code]` — metadata CRUD
  (Admin SDK). Metadata: `code, kind, series, title, theme, level, format, types,
  mins, blocks, status`. (Mux fields are written by the existing upload/finalize/
  webhook — the admin does not set them by hand.)
- `src/app/admin/videos/page.tsx` — library list (client SDK read) with mux-status
  badge (`none/uploading/processing/ready/error`), search, publish toggle, delete.
- `src/app/admin/videos/[code]/page.tsx` — create/edit form; `theme/format/types`
  selects sourced from `filters/*`; `blocks` editor (name/mins/items).
- **Upload flow (existing routes):** form → `POST /api/mux/upload {code}` → returns
  `{url, uploadId}` → browser uploads the file directly to Mux (`@mux/mux-uploader`
  or a plain `PUT` with progress) → `POST /api/mux/finalize {code, uploadId}` polls to
  `ready` (the webhook also writes on `video.asset.ready` via `passthrough`) → show
  status. Signed playback + entitlement already handled by `/api/mux/token`.

**DoD:** create a video doc, upload a real file in dev, watch `uploading→ready`, and
play it in the app player (signed) — end-to-end verified; green.

## Phase A3 — Programok (playlist) builder  ⭐ biggest

*The dma course-wizard analog, reshaped to reference `videos/{code}`.*

- `GET (list) / POST / PUT / DELETE /api/admin/programs/[slug]` — program metadata
  CRUD (Admin SDK), slug = doc id.
- `PUT /api/admin/programs/[slug]/sessions` — replace the ordered sessions list
  (also recomputes `totalSessions`).
- `src/app/admin/programs/page.tsx` — programs list.
- `src/app/admin/programs/[slug]/page.tsx` — metadata form (title, hu, eyebrow,
  category, level, goal, equipment, synopsis, facts[], weeks/perWeek/defaultMins,
  **phases editor**, cover, access `members|free`, order, status) **+ sessions
  builder**: add a session that picks a `videos/{code}` (library picker), set
  `week/day/dayName/phaseIdx/retest`, **drag-reorder with `@dnd-kit`** (maintains
  `order`).

**DoD:** build/edit the Foundation program from scratch in the emulator; the app's
Foundation screen + player render it correctly (weeks, days, sessions, retests);
verified; green.

## Phase A4 — Tagok (members, read-only) + Dashboard

- `GET /api/admin/users` — Admin SDK: list users + `subscription` status; count
  aggregations for KPIs.
- `GET /api/admin/users/[uid]` — one member's profile + onboarding + progress (read).
- `src/app/admin/members/page.tsx` — list (name, email, joined, subscription status,
  streak/doneCount) with search/filter.
- `src/app/admin/members/[uid]/page.tsx` — detail (onboarding answers, progress,
  link to the Stripe customer). **Read-only.**
- `src/app/admin/page.tsx` (Vezérlőpult) — KPIs (total members, active subs, active
  this week, new this month) + recent signups. On-demand Firestore reads (fine at
  LEXFIT scale).

**DoD:** KPI numbers match Firestore; member detail shows real onboarding/progress;
nothing writable; verified; green.

## Phase A5 — QA, polish & prod dry-run

- End-to-end pass: auth gate (admin vs non-admin vs signed-out), every CRUD path,
  empty/error states, mux upload happy-path + error, `@dnd-kit` reorder persistence.
- Confirm **zero Firestore rule changes** and that content is still client-read-only.
- Update `CLAUDE.md`/docs: how to author content via the admin (dev + prod), and the
  fact that prod content now comes from the admin (retire the throwaway seed note when
  real content lands).
- Optional: a Playwright smoke test for the admin gate + one CRUD path.

**DoD:** full green build; a written verification checklist; ready for the owner to
author real content into production.

---

## Deferred to a later pass (explicitly out of v1)

Promo/comp-access codes (§B7 of research — gifted-months vs Stripe discounts, TBD),
minimal audit trail on destructive actions, a `config/app` settings doc, broadcast
notifications, analytics charts, in-app support. Multi-tenancy/RBAC/instructors/
enrollments are **permanently dropped**, not deferred.

## Build order rationale

Write-path + auth first (A0), then smallest CRUD to prove it (A1 filters), then the
two content cores (A2 videos, A3 programs) that unblock real content, then read-only
insight (A4), then hardening (A5). Back-to-front per LEXFIT convention — but the data
model already exists, so "back" = the admin write-routes, "front" = the screens.
