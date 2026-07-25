# LEXFIT Admin Panel — dma Research & Migration Translation

> **Status:** Research + translation (Phase A/B of the admin work). This document
> describes the **dma** admin panel (front + back) in full, then translates every
> feature into the LEXFIT context with a MIGRATE / ADAPT / DROP verdict. The
> **migration plan** and **development** are separate, later steps — do not start
> coding from this doc alone.
>
> **Source app:** `/Users/mark/dma` (dma-platform / academion.hu) — a B2B2C
> e-learning marketplace. **Target app:** LEXFIT (`/Users/mark/lexfit_app`) — a
> single-tenant Hungarian women's-fitness web app.
>
> Research basis: full read of the dma admin routes, components, `functions/`,
> Firestore rules, and dma's own `CLAUDE.md`, cross-checked by five parallel
> code-reading passes (2026-07-01).

---

## 0. Executive summary

**The headline:** dma is a much bigger, heavier app than LEXFIT (multi-tenant,
multi-role, Cloud-Functions backend, per-course commerce). Its admin panel is a
rich reference, but **LEXFIT already owns the hard, risky parts** that dma's admin
depends on:

| Capability | dma | LEXFIT (already built) |
|---|---|---|
| Admin authorization | Inconsistent 3-way (Firestore `role` field vs custom claim vs client guard), casing bugs, **disabled** middleware | ✅ `isAdmin(token)` email allowlist + `verifyRequest` in `src/lib/auth-server.ts` |
| Content write path | Admin-SDK Cloud Functions | ✅ Admin-gated `/api/*` routes writing via Admin SDK (bypass read-only rules) |
| Signed video playback | ❌ **Never built** (all `public`; signing code is a dead stub) | ✅ Fully built — signed uploads + JWT tokens (`src/lib/mux.ts`, `/api/mux/token`) |
| Video ingest | `getMuxUploadUrl` → poll → write (scans all courses) | ✅ `/api/mux/{upload,finalize,webhook}` — admin-gated, targets `videos/{code}` via Mux `passthrough` |
| Subscription/commerce | Multi-plan (individual/team/company) | ✅ Single monthly Stripe sub (`/api/stripe/{checkout,webhook,portal}`) |
| Data model for content | Mid-migration modules→flat lessons; Mux fields embedded on lesson | ✅ Clean `videos/{code}` + `programs/{slug}/sessions/{id}` (sessions reference video codes) — **already the shape dma is migrating toward** |

**Consequence:** the LEXFIT admin panel is mostly a **guarded front-end CMS** over
the existing data model, plus a **small number of new admin write-routes** that
copy the already-proven `verifyRequest` + `isAdmin` + Admin-SDK pattern. The
"high-risk" concern is real but **the risky infrastructure already exists and is
in production shape** — the remaining work is well-bounded CRUD + a program builder.

**What we take from dma:** patterns, not code (dma is Tailwind+Radix+Cloud
Functions; LEXFIT is no-Tailwind hand-CSS + `/api` routes). Specifically: the
course-creation **wizard/flat-lesson builder** shape, the **taxonomy CRUD** shape,
the **users list + KPI** shape, the **loader-gated admin layout** pattern, and
`@dnd-kit` for drag-reordering.

**What we drop:** the entire **multi-tenant (universities) + B2B (companies/teams)**
layer, **RBAC/roles** (LEXFIT has one operator), **instructors**, **per-course
enrollments**, and every **mock/broken** dma admin page (see §A4).

---

# PART A — The dma admin panel (as-built)

## A1. Architecture & stack

- **Frontend:** Next.js 15 App Router, TypeScript, **Tailwind + shadcn/ui (Radix)**,
  Zustand (auth/global state), **TanStack Query** (server state), `sonner` toasts,
  `@dnd-kit` (curriculum reorder), `react-quill` (rich text), `recharts` (charts).
- **Backend:** **Firebase Cloud Functions v2** (`functions/src`, region
  `europe-west1`), invoked from the browser as `httpsCallable`. **No `/api/*`
  routes** (exactly one server action exists). A legacy Express+Prisma `server/` is
  dead. `src/middleware.ts` exists but is **hard-disabled**.
- **Data:** Firestore (~40 top-level collections). **Auth:** Firebase Auth
  (custom claims + Firestore `users/{uid}.role`). **Storage:** Firebase Storage.
  **Video:** Mux (public policy only). **Payments:** Stripe (multi-plan).
  **Email:** SendGrid. **Hosting:** Vercel (frontend) + Firebase (backend).

**Two admin panels exist:**
1. **Super-admin** — `src/app/(admin)/admin/**` (platform operator).
2. **University-admin** — `src/app/(university-admin)/university-admin/**` (a
   tenant-scoped, restricted role).

## A2. Admin surface map

**Super-admin routes** (`(admin)/admin`):

| Route | Purpose | Backend | Real or mock? |
|---|---|---|---|
| `/dashboard` (+ `/` redirect) | KPI cards, live activity feed, 30-day chart | `getAdminAnalytics` fn + 3 `onSnapshot` | Real |
| `/courses` | Course list, search, publish, soft-delete | `getCoursesCallable`, `publishCourse`, `useDeleteCourse` | Real |
| `/courses/new/edit` | **Course-creation wizard** (4 steps) | `createCourse`/`updateCourse`/`publishCourse` | Real |
| `/courses/[courseId]/edit` | Legacy tab editor (second builder) | direct client Firestore | Real (redundant) |
| `/categories` | Category CRUD | `get/create/update/deleteCategory` | Real |
| `/target-audiences` | Audience CRUD | `…TargetAudience` fns | Real |
| `/instructors` | Instructor CRUD + photo | `…Instructor` fns | Real |
| `/users` | User list, role change, pre-registration invite | `getUsers`,`getStats`,`updateUserRole`,`createPreRegistration` | Real |
| `/roles` | Same list, promote role | `getUsers`,`updateUserRole` | Real (thin) |
| `/promo-codes` | Comp-access code CRUD | `createPromoCode`,`getPromoCodes`,`deletePromoCode` | Real |
| `/enrollments` | Student→course table | — | **Mock** |
| `/notifications` | Broadcast composer | — | **Mock** |
| `/analytics` | recharts tabs (overview/video/users) | `getAdminCharts` (**missing fn**) + mock | **Broken/mock** |
| `/reports` | **Support tickets** (misnamed) | `supportTickets` `onSnapshot` | Real |
| `/audit-log` | Terminal-style audit console | `auditLogs` `onSnapshot` | Real |
| `/system-status` | Uptime/CPU/services | — | **Mock** |
| `/settings` | Platform/email/payment/security tabs | — (all TODO) | **Mock (no persistence)** |
| `/universities` (+ `[id]`, `[id]/dashboard`) | Tenant CRUD & dashboards | `useUniversityQueries` | Real (mock in dev) |
| `/tools/file-upload` | Signed-upload dev harness | `getSignedUploadUrl` | Dev tool |
| `/preview/course-player`, `/preview/heroes` | Design/preview harnesses (mock data) | — | Dev tool |

**University-admin routes** (`university-admin/`): dashboard, courses (+create),
students, instructors, enrollments, finance, reports, schedule, settings — all
**scoped by `where('universityId','==',user.universityId)`**.

## A3. Feature catalog (front + back)

### A3.1 Content management — courses & the builder ⭐

- **Courses list** (`courses/page.tsx`): grid of cards, search
  (title/desc/instructor), status badge (`DRAFT|PUBLISHED|PENDING_REVIEW|ARCHIVED`),
  inline approve/publish, edit, preview, soft-delete (`deletedAt`). Reads via
  `getCoursesCallable` (denormalizes instructor+category).
- **Course-creation wizard** (`courses/new/edit` → `CourseCreationWizard.tsx`) —
  **the primary builder and the best template for LEXFIT's program builder:**
  - Step 0 **Típus**: `courseType` (ACADEMIA/WEBINAR/MASTERCLASS/PODCAST) — only
    changes terminology labels.
  - Step 1 **Alapadatok**: react-hook-form + zod → `createCourse` callable → stores
    returned `courseId` in a **Zustand `persist` store** (`courseWizardStore.ts`),
    writes an `auditLogs` entry.
  - Step 2 **Leckék**: add/edit/delete/**reorder a flat lesson list** (drag = native
    HTML5 events, *not* dnd-kit here). Videos are **selected but not uploaded yet** —
    held as pending `File`s in a module-level `Map` (can't serialize into the store).
  - Step 3 **Publikálás**: uploads pending videos to Mux, writes lessons to Firestore,
    calls `publishCourse` (sets `published/status/visibility/slug/publishedAt` **and
    emails every user**).
  - Resumable from localStorage; `beforeunload` guard; integer `order` maintained.
- **Legacy editor** (`courses/[courseId]/edit`): a *second*, older editor writing
  directly to Firestore with tabs. **Redundant — do not carry two builders over.**
- **Data written:** `courses/{autoId}` (slug is a *field*, uniqueness by query) and a
  **flat** `courses/{id}/lessons/{lessonId}` subcollection with integer `order`.
  Lesson carries its own Mux ids (`muxAssetId/muxPlaybackId/videoUrl/duration/thumb`).
  *(An older `modules[]/…/lessons` layout coexists — dma is mid-migration to flat.)*

### A3.2 Taxonomy — categories, target-audiences, instructors

- **Categories** (`categories/{id} = {name, description}`): table + dialog CRUD via
  callables. Auto-seeds 12 defaults if empty.
- **Target-audiences** (`targetAudiences/{id}`): identical CRUD; courses reference
  `targetAudienceIds[]`; delete guarded against references.
- **Instructors** (`instructors/{id} = {name,title,bio,profilePictureUrl,role}`):
  table CRUD + Storage photo upload; courses reference `instructorIds[]`.

### A3.3 Video pipeline (the crux) — **dma is weaker than LEXFIT here**

- **A. Mux direct upload** (wizard): client calls `getMuxUploadUrl` (INSTRUCTOR/ADMIN)
  → `uploads.create({ new_asset_settings: { playback_policy: ['public'] }, encoding_tier:'baseline' })`
  → client `PUT`s the file to Mux (plain `XHR`, no chunking) → polls `getMuxAssetStatus`
  every 10s until `ready` → stores `muxPlaybackId`.
- **B. Firebase Storage upload** (legacy editor): video straight to Storage as
  `videoUrl` (no Mux). `migrateVideoToMux` bridges old Storage videos into Mux.
- **Webhook** (`muxWebhook`, HMAC-verified): on `video.asset.ready`, **scans all
  courses + both lesson layouts** to find the lesson by `muxAssetId`, writes playback
  data.
- **⚠️ Signed playback is NOT implemented** — every policy is `['public']`; the
  signing helper is a dead stub returning an unsigned URL; `playerData` returns
  `signedPlaybackUrl: null`. **dma offers no reusable signed-playback reference.**

### A3.4 Users, roles, enrollments

- **Users** (`users/page.tsx`): list + search + role/status filters, stat cards
  (via Firestore `count()` aggregation), change-role, pre-registration invite
  (tokenized SendGrid email). `deleteUser`/`toggleStatus` are **client stubs (TODO)**.
- **Roles** (`roles/page.tsx`): same list; promotes STUDENT/INSTRUCTOR/ADMIN. **No
  real RBAC** — just a `role` string enum on `users/{uid}` + custom claims;
  permission checks are literal `role === 'ADMIN'` scattered across functions.
- **Enrollments** (`enrollments/page.tsx`): **100% mock.** The *real* `enrollments`
  collection (`{uid}_{courseId}`) is a **progress/last-accessed record**, not the
  paywall — access is decided by **subscription status**, not per-course enrollment.

### A3.5 Promo codes ⭐ (the most reusable commerce feature)

- **Admin** (`promo-codes/page.tsx`): create named codes granting **N months** of
  access, optional max-uses + expiry; list with usage stats; delete.
- **Data:** `promoCodes/{id} = {code,durationMonths,maxUses,usedCount,active,expiresAt,…}`
  + `promoCodeUsages/{id}` (one redemption per user).
- **Redemption** (`applyPromoCode` fn): **fabricates a `subscriptions/{id}` doc**
  (status `active`, `currentPeriodEnd = now + N months`) — **bypasses Stripe entirely**.
  These are **not** Stripe coupons; it's a custom comp-access system.

### A3.6 Ops & insight (mostly thin/mock)

- **Dashboard** (`AnalyticsDashboard.tsx`): 4 KPI cards + live activity feed (3
  `onSnapshot` on users/enrollments/payments) + 30-day chart, all from the heavy
  on-demand `getAdminAnalytics` fn (full-collection scans + **live Stripe API**).
- **Analytics** (`analytics/page.tsx`): **broken** — calls a non-existent
  `getAdminCharts`; video/user tabs are hardcoded mock.
- **Reports** (`reports/page.tsx`): actually a **support-ticket console**
  (`supportTickets` + threaded replies + status); writes `auditLogs` on each action.
- **Audit log** (`audit-log/page.tsx`): terminal-styled `auditLogs` viewer. Writes
  are **opportunistic/manual** (client `addDoc` in some places, a server helper in
  others) — **no trigger**, inconsistent coverage, `createdAt` is client `new Date()`.
- **System status**: 100% fake numbers (Nginx/Cloudflare/Redis it doesn't run).
- **Settings**: 4 tabs (platform/email/payment/security) — **persists nothing**
  (all `// TODO`, inputs not even bound).

### A3.7 Multi-tenancy (universities) & B2B (companies/teams)

- **Universities** = tenants with own admin, instructors, students, courses,
  finance, `revenueSharePct`. Scoping = a `universityId` field on the user + every
  scoped doc; university-admin queries are always `where('universityId','==',…)`.
- **Companies/teams** = a second B2B axis (`companyId`, `companyRole`, `teamId`,
  seats, masterclasses, invites) — ~30 Cloud Functions.
- Role hierarchy: `STUDENT | INSTRUCTOR | ADMIN | COMPANY_ADMIN | COMPANY_EMPLOYEE |
  UNIVERSITY_ADMIN`. `ADMIN` global; `UNIVERSITY_ADMIN` tenant-scoped.

### A3.8 Admin shell, route protection, reusable UI

- **Shell:** client `(admin)/layout.tsx` (`force-dynamic`) → fixed `AdminDashboardSidebar`
  (hardcoded grouped nav, `lucide-react` icons, `motion` animations) + mobile drawer +
  `ErrorBoundary`. University-admin uses a role-fanned `UnifiedSidebar`.
- **Route protection:** **client-side only.** `middleware.ts` is disabled. Each layout
  waits for `authReady`, shows a full-screen loader, and `router.replace()`s
  non-admins. Auth state from Firebase `onAuthStateChanged` → reconciles custom claims
  + Firestore `users/{uid}` → Zustand `authStore`. Real security lives in Firestore
  Rules, not the shell.
- **Reusable UI:** a full shadcn/ui `src/components/ui/**` library (Radix + Tailwind +
  CVA): `DataTable` (`@tanstack/react-table`), dialogs/sheets/dropdowns, `sonner`
  toasts, `@dnd-kit` reorder (course-creation only), forms (react-hook-form used in
  only ~2 places — most pages use plain `useState`). **All Tailwind-coupled.**

### A3.9 Backend summary

- **~130 Cloud Functions** (region `europe-west1`), grouped: auth/password/email,
  users/admin, content read, **content write** (`createCourse`/`updateCourse`/
  `publishCourse`/`deleteCourse`, category/instructor/audience CRUD), enrollment/
  progress/gamification, Mux (`getMuxUploadUrl`/`getMuxAssetStatus`/`migrateVideoToMux`),
  payments/Stripe/subs (+ promo), company/team B2B (~60), GDPR/support/audit.
- **Non-callable:** `healthCheck`, `muxWebhook` (HMAC), `stripeWebhook`
  (`constructEvent`), and scheduled jobs (daily analytics/recs/sub-reconciliation/
  reminders). **No Firestore or Auth triggers.**
- **Firestore rules:** content (`courses`+nested, `instructors`, `categories`,
  `targetAudiences`) `read: if true`, `write: if isAdmin()` (=`users/{uid}.role=='ADMIN'`);
  `users` self-write but **locked fields** (`role`, Stripe fields, `subscriptionStatus`);
  `subscriptions/invoices/promoCodeUsages` `write: if false` (Admin-SDK only);
  deny-by-default fallback. Admin content writes go through **Admin SDK (rule-exempt)**.
- **Admin auth:** three coexisting, drifting mechanisms (Firestore `role` field +
  custom claim + client guard), with `'admin'`/`'ADMIN'` casing bugs. **Anti-pattern.**
- **Stripe:** get-or-create customer (`users/{uid}.stripeCustomerId`), checkout with
  metadata → webhook maps `customer.subscription.*`/`invoice.*` to status, idempotent
  by `stripeSubscriptionId`. **On cancel it deletes user progress** (questionable).

## A4. Anti-patterns — **do NOT copy these into LEXFIT**

1. **No signed playback** — everything is `public`. LEXFIT already does this right.
2. **Three-way admin auth + casing bugs** (`role` field vs claim vs client guard;
   `'admin'` vs `'ADMIN'`). LEXFIT's single allowlist is cleaner — keep it simple.
3. **Disabled `middleware.ts`** shipped as dead code — do not inherit.
4. **Mock/broken admin pages** shipped as if real: `enrollments`, `notifications`,
   `system-status`, `settings` (no persistence), `analytics` (missing `getAdminCharts`).
5. **Two coexisting course builders** and two lesson layouts (modules vs flat) — carry
   over exactly **one** (the flat one).
6. **Client-side `deleteUser`/`toggleStatus` stubs** returning `{success:true}`.
7. **Opportunistic audit logging** with client `new Date()` and inconsistent coverage.
8. **"Compute everything live on every request" analytics** (full scans + live Stripe)
   — fine at LEXFIT's tiny scale, but don't over-build it.

---

# PART B — Translation to LEXFIT

## B1. What LEXFIT already has (the head start)

- **Admin auth:** `src/lib/auth-server.ts` — `verifyRequest(req)` (verifies the
  Firebase ID token) + `isAdmin(token)` (email allowlist:
  `gorgeimarko@gmail.com`). Already used to gate `/api/mux/upload` & `/finalize`.
- **Admin write-path (proven):** `/api/mux/upload` and `/api/mux/finalize` verify
  `isAdmin`, then write `videos/{code}` via the **Admin SDK** — which bypasses the
  read-only client rules. **This is exactly the pattern all new admin writes will use.**
- **Signed Mux pipeline (done):** `src/lib/mux.ts` — `createDirectUpload` (signed,
  `passthrough=code`), `getUploadAsset` (poll), `signPlaybackTokens` (video/thumbnail/
  storyboard JWTs); `/api/mux/webhook` writes `videos/{code}` on `video.asset.ready`
  keyed by `passthrough`; `/api/mux/token` issues signed tokens gated by `hasAccess`.
- **Data model (designed for the admin):** `src/lib/types.ts` already defines
  `Video` (with `muxAssetId/muxPlaybackId/muxStatus/muxDuration/thumb/published/status`),
  `Program`, `ProgramSession` (`videoCode` reference + `order/week/day/phaseIdx/retest`),
  `FilterDimension` (`key/label/options/order/editable`), and the user subtree.
- **Commerce:** `/api/stripe/{checkout,webhook,portal}`, `getSubscription`,
  `hasAccess(uid)` entitlement — single monthly sub.
- **No-Tailwind design system:** brand tokens in global CSS scoped under `.lx`.

**Implication:** the LEXFIT admin is ~80% front-end (a guarded CMS UI) + a handful of
new **admin write-routes** copying the existing `verifyRequest`+`isAdmin`+Admin-SDK
pattern. The genuinely hard/risky pieces (signed video, admin auth, content write
path, payments) are already in production shape.

## B2. Master verdict table (dma → LEXFIT)

| dma feature | Verdict | LEXFIT translation |
|---|---|---|
| Courses list | **ADAPT** | Split into **Videók** (library) list + **Programok** list; drop instructor/category joins |
| Course-creation wizard | **ADAPT** ⭐ | Template for the **Program builder** — flat ordered `sessions` that **reference `videos/{code}`** instead of inline upload; drop courseType/price/certificate |
| Legacy `[courseId]/edit` | **DROP** | Build one builder only |
| Mux direct-upload → poll → playbackId | **REUSE** | Already built (`/api/mux/upload`+`/finalize`); admin UI just calls them |
| Public playback policy | **N/A** | LEXFIT already uses **signed** — no change |
| Storage video path + `migrateVideoToMux` | **DROP** | LEXFIT is Mux-only |
| Categories CRUD | **ADAPT** ⭐ | Maps to **`filters/{key}`** options editor (theme/format/type/level/dur/phase) |
| Target-audiences | **DROP** | Single audience (women); fold into a filter if ever needed |
| Instructors | **DROP** | Single brand/coach; a static value, not a collection |
| Users list + `getStats` | **ADAPT** | **Members** view: list + subscription status + engagement; aggregation-count pattern is good |
| Roles / RBAC | **DROP** (screen) | Collapse to the existing `isAdmin` allowlist (or a claim); no roles page |
| Enrollments | **DROP** | No per-course enrollment; a member's progress lives under `users/{uid}/progress` (show in member detail) |
| Promo codes | **ADAPT** ⭐ | Comp-access codes granting N months → write `users/{uid}/subscription` (see §B7). Optional; Phase 2 of admin |
| Notifications | **DROP** (mock) | Build fresh later if wanted (SendGrid/FCM) |
| Dashboard KPIs + activity feed | **ADAPT** | ~4 KPIs (members, active subs, active this week, new this month) + optional MRR from one Stripe price; 1–2 `onSnapshot` |
| Analytics charts | **DROP** | dma's is broken/mock; add one small growth chart later if wanted |
| Reports (support tickets) | **DEFER** | Only if in-app support is desired; else email |
| Audit log | **DEFER / minimal** | At most a tiny append on destructive actions; no console |
| System status | **DROP** | Vercel/Firebase have status pages |
| Settings | **DROP** as-is | If needed: one `config/app` doc (e.g. `maintenanceMode`); keys stay in env |
| Universities / multi-tenant | **DROP (all)** | LEXFIT is single-tenant |
| Companies / teams B2B | **DROP (all)** | Not applicable |
| Admin shell + loader-gated layout | **ADAPT** ⭐ | Reuse the *pattern* (authReady → loader → redirect non-admin); rebuild markup in `.lx` |
| shadcn/ui + Radix + `DataTable` | **ADAPT (rebuild)** | Hand-build ~5 primitives in `.lx` CSS (table, modal, confirm, menu, toast); **do not adopt Tailwind** |
| `@dnd-kit` reorder | **MIGRATE** | Style-agnostic; use for session/video ordering in the program builder |
| Cloud Functions | **ADAPT** | Reshape needed logic into **`/api/admin/*` routes** (LEXFIT has no Cloud Functions) |
| SendGrid email service | **DEFER** | Optional later (transactional email) |

## B3. Target LEXFIT admin — proposed scope

A **single-operator CMS** under a guarded `/admin` area, in three tiers:

**Tier 1 — content (the reason the admin exists; prod Firestore is empty until this
ships):**
1. **Videók (library):** list `videos/{code}`; create/edit a video's metadata
   (code, kind, title, theme, level, format, types, mins, blocks); **upload the
   video file** via the existing Mux flow (upload → poll/finalize → status);
   publish/unpublish; delete.
2. **Programok (playlists):** list `programs/{slug}`; edit program metadata
   (title, eyebrow, synopsis, level, phases, facts, weeks/perWeek/totalSessions,
   access, order, cover, status); **build the sessions playlist** — add sessions
   that reference a `videos/{code}`, set week/day/dayName/phaseIdx/retest/order,
   **drag-reorder** (`@dnd-kit`).
3. **Szűrők (taxonomy):** edit `filters/{key}` options (theme, format, type, level,
   dur, phase) — add/rename/reorder options, respecting `editable`.

**Tier 2 — members & commerce (read-first):**
4. **Tagok (members):** list `users/{uid}` with subscription status + basic
   engagement (streak/doneCount); member detail shows onboarding + progress; open
   the Stripe customer. (Read-only first; comp access later.)
5. **Dashboard:** a few KPIs + recent signups.

**Tier 3 — optional / later:** promo (comp-access) codes; a minimal audit trail on
destructive actions; a single `config/app` settings doc.

## B4. Data model — reuse existing collections (no new top-level collections needed)

- **`videos/{code}`** — already fully specced in `types.ts`. Admin creates the doc
  (metadata) then attaches Mux via the existing upload/finalize/webhook (which set
  `muxAssetId/muxPlaybackId/muxStatus/muxDuration/published`).
- **`programs/{slug}` + `programs/{slug}/sessions/{id}`** — already specced. Admin
  writes program metadata and session entries (`videoCode` + `order/week/day/…`).
  **Keep slug as the doc id** (LEXFIT's deliberate divergence from dma's autoId).
- **`filters/{key}`** — already specced (`FilterDimension`). Admin edits `options`.
- **`users/{uid}` + `subscription`** — read for the members view; comp access (if
  built) writes `users/{uid}/subscription`.
- **Optional new:** `promoCodes/{id}` + `promoCodeUsages/{id}` (only if Tier 3 built);
  `config/app` (only if settings needed).

**Borrow from dma:** the `Video`/lesson **Mux field set** is already mirrored. Note
dma enters `duration` manually; LEXFIT already **auto-fills `muxDuration`** from the
webhook — keep that (better).

## B5. Admin authorization

- **Keep the existing model:** `isAdmin(token)` email allowlist in
  `src/lib/auth-server.ts`, verified server-side in every admin `/api` route. It is
  already used by `/api/mux/upload` & `/finalize`. For a single operator this is
  simpler and safer than dma's three-way scheme.
- **Client gate:** a `/admin` layout that checks the signed-in user's email against
  the same allowlist (or a lightweight `/api/admin/me` check), shows a loader until
  `authReady`, and redirects non-admins — copying dma's **race-safe loader-gate
  pattern** (wait for `onAuthStateChanged`, don't trust cached state).
- **If multiple admins are ever needed:** upgrade the allowlist to a Firebase
  **custom claim** `admin:true` (set once via a secured server script) and check
  `token.admin` — *one* source of truth, avoiding dma's drift. Not needed now.
- **Firestore rules stay untouched:** content remains `read: <authed>`, client
  `write: false`; **all admin writes go through Admin-SDK `/api` routes** (rule-exempt).
  No rule loosening — this is the key safety property.

## B6. Write-path architecture (new admin routes, proven pattern)

New routes, each = `verifyRequest` → `isAdmin` → Admin-SDK write (mirrors the
existing Mux routes):

- `POST/PUT/DELETE /api/admin/videos/[code]` — video metadata CRUD.
- `POST/PUT/DELETE /api/admin/programs/[slug]` — program metadata CRUD.
- `PUT /api/admin/programs/[slug]/sessions` — replace/reorder the sessions list.
- `PUT /api/admin/filters/[key]` — edit filter options.
- `GET /api/admin/users` — list members + subscription (Admin SDK read).
- Video upload/finalize: **already exist** (`/api/mux/upload`, `/api/mux/finalize`).
- (Optional) `POST /api/admin/promo`, `POST /api/admin/comp-access`.

## B7. Comp-access (promo) — if/when Tier 3

Two options (decision for the user):
- **(a) Free/gifted months (dma-style):** admin route writes `users/{uid}/subscription`
  with `status:'active'`, `currentPeriodEnd = now + N months`, a `comp:true`/`promoCode`
  marker. No Stripe. Matches dma's `applyPromoCode` — **but write to
  `users/{uid}/subscription`, not a top-level `subscriptions` collection**, and make
  sure `hasAccess()` honors it (it already checks status).
- **(b) Real Stripe discounts:** create Stripe coupons + promotion codes and let the
  existing webhook write status. Cleaner if codes are for *discounting the paid sub*.
  dma does **not** do this — it's net-new.

## B8. UI approach (pivotal decision) — **rebuild in `.lx`, don't adopt Tailwind**

- LEXFIT's identity (per `CLAUDE.md`/`AGENTS.md`) is **no Tailwind**; the app hand-
  builds components under `.lx` tokens. Bolting Tailwind+Radix on just for the admin
  means **two styling systems**, Tailwind's global reset fighting the existing CSS, and
  ~30 new deps — for a small, internal, single-operator surface.
- **Recommendation:** reuse dma at the **pattern layer** (guarded layout, data hooks,
  table interaction model, per-entity page structure) and **hand-build ~5 primitives**
  in `.lx`: a sortable/filterable table, a modal, a confirm dialog, a dropdown/menu, a
  toast. Adopt **`@dnd-kit`** (style-agnostic) for drag-reorder; optionally `sonner`
  for toasts (also style-agnostic) if a quick win is wanted. Skip `@tanstack/react-table`
  — plain `useState` sort/filter over a Firestore array is what most dma admin pages
  actually do.

## B9. Open decisions for the user (confirm before the migration plan is finalized)

1. **Admin UI styling:** confirm **rebuild in `.lx` (no Tailwind)** — recommended — vs.
   adopting Tailwind+Radix for the admin only.
2. **Admin scope for v1:** confirm **Tier 1 (content) + Tier 2 read-only members/
   dashboard** first; defer promo codes / audit / settings to a later pass. (Content is
   the blocker — prod Firestore is empty until it ships.)
3. **Comp access:** if/when built, **(a) gifted free months** (no Stripe) or **(b) real
   Stripe discount codes**?
4. **Admin auth:** keep the **email allowlist** now (recommended), upgrade to a custom
   claim only if multiple admins are needed?
5. **Members actions:** read-only first, or also allow admin actions (grant comp,
   cancel sub, delete account/GDPR export) in v1?

---

## Next steps (sequenced, per the user's directive)

1. **This doc** = deep research + LEXFIT translation. ← done.
2. **Migration plan** — a phased, test-verified build plan for the LEXFIT admin
   (scaffolding + auth gate → filters editor → video library + upload → program
   builder → members/dashboard), with per-phase "definition of done", only after the
   §B9 decisions are confirmed.
3. **Development** — implement phase by phase, proceeding only at ~99% confidence that
   each phase is correct and non-breaking in LEXFIT's context.
