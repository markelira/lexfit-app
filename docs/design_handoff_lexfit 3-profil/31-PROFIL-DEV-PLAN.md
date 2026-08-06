# 31 · Profil — build plan

**The order of work for `/app/profile`. Read `30-PROFIL.md` first.**

Nine phases. Each phase is a shippable state; each step names the files it touches, what to write, and how you know it is done. **Do not skip ahead** — the whole point of the order is that the UI is settled before any data flows through it, and that no phase ends with a hardcoded value pretending to be real.

**The end state:** every number, date, name, price, toggle and notification on this screen comes from Firestore, Firebase Auth, Stripe or the progress log. Zero mock data in the shipped bundle. Every feature the wireframe shows actually works.

| Phase | What ships | Data |
|---|---|---|
| **P0** | Decisions answered, nothing built | — |
| **P1** | The whole screen, pixel-correct, from one fixture file | mock |
| **P2** | Shell delta — avatar menu, six real items | live |
| **P3** | Data model, security rules, minutes ledger | live |
| **P4** | Read path — every displayed value is real | live |
| **P5** | Write path — every control persists | live |
| **P6** | Server features — export, deletion, reminders | live |
| **P7** | Privacy enforcement + subscription truth | live |
| **P8** | Mobile pass | live |
| **P9** | States, a11y, no-hardcoded-data audit, DoD | live |

---

## P0 · Decisions before code

Nothing here takes an hour, and each one changes the shape of later phases.

| # | Question | Blocks |
|---|---|---|
| **P0.1** | **The palette conflict — `00-FOUNDATIONS.md §0.1`.** Rose (repo tokens) or Eukaliptusz (wireframes, `/login`)? Still unanswered. | All CSS |
| **P0.2** | Settings route shape: `?section=` or `/[section]`. | P1.2 |
| **P0.3** | **Reminder channel: email only, or web push too?** The repo has `sendEmail` + a daily Vercel cron and **no push at all**. Email-only is ~1 step; push adds service worker, permission UX, token storage and a send path. | P6.3 |
| **P0.4** | Keep or drop `Alexa hangneme` (`30 §30.11 Q3`). | P5.6 |
| **P0.5** | Is `/app/profile` allowed to render for a user **without** an active subscription? (It should — identity is theirs regardless.) Confirm against `Protected`. | P1.1 |
| **P0.6** | Account deletion: soft-delete + 30-day purge (what the copy promises) — confirm that is the legal posture, and who can reverse it inside 30 days. | P6.2 |

**Ask all six in one message, then start.** P0.1 and P0.3 are the only true blockers.

---

## P1 · The wireframe, in dev, from a fixture

**Goal: the screen looks finished and navigates, with every value coming from one obvious mock file.** No Firestore in this phase. This is deliberate — it makes layout review fast and it makes Phase 4 a mechanical swap instead of a redesign.

### P1.0 — Tokens and icons first

- `src/app/lexfit-tokens.css` — confirm the `00` scales exist (`--sp-*`, `--r-sm|md|lg`, `--dur-*`, `--ease`). **Add `--danger` and `--danger-soft`** if absent; the profile is the first screen that needs a destructive colour.
- `src/lib/icons.ts` — add `bell`, `sliders`, `logOut`, `pencil`, `calendarCheck`, `trash`, `users`, `dumbbell`, `download`, `mail`, `shield` (`30 §30.9`), same 24×24 stroke style as the existing paths.
- **Done when:** nothing renders differently and no new literal px value entered the CSS.

### P1.1 — Route skeleton

```
src/app/app/profile/page.tsx            → Profil (new)
src/app/app/profile/settings/page.tsx   → Beállítások (new)
src/app/app/profile/profile.css         → rewritten to the token set
src/app/app/profile/_mock.ts            → THE fixture (deleted in P4)
```

- Keep the existing `page.tsx` as `page.legacy.tsx` **until P4 is done**, and gate with `NEXT_PUBLIC_PROFILE_V2` so the old screen is one env var away. Delete both the flag and the legacy file at the end of P4 — do not let it live past that.
- `_mock.ts` exports **one** object shaped exactly like the real read model (see P3.1). Every mock value is obviously fake: `name: "Réka"`, `doneCount: 21`, `minutes: 412`, `streak: 12`.
- **Done when:** both routes render inside the existing shell with the sidebar and tab bar intact.

### P1.2 — Primitives

Build these as their own files, in this order, each with the geometry from `30 §30.3`–`§30.4`:

| File | Component |
|---|---|
| `src/components/profile/SetGroup.tsx` | group label + bordered container |
| `src/components/profile/SetRow.tsx` | icon · label · description · value · trailing (chevron / toggle / nothing / danger) |
| `src/components/profile/Toggle.tsx` | 44×26 `role="switch"`, controlled |
| `src/components/profile/DayPills.tsx` | weekday multi-select, `role="group"` |
| `src/components/profile/WeekStrip.tsx` | 7 cells, five states incl. `missed` |
| `src/components/profile/StatTrio.tsx` | three tabular numbers |
| `src/components/profile/IdentityCard.tsx` | avatar + name + meta + streak + button |
| `src/app/app/profile/profile.css` | all of the above, one stylesheet, tokens only |

Rules while building: flex/grid `gap` only, never per-element margins; `--r-sm|md|lg` only; `tabular-nums` on every changeable numeral; `.hit44` on the avatar-edit badge.

- **Done when:** every primitive renders every one of its states from a local prop, and `grep -nE "border-radius:\s*[0-9]+px" profile.css` returns nothing.

### P1.3 — Profil page composition

Identity card → stat trio → week card → the two side-by-side cards, `--sp-5` gaps, single column below `--bp-mobile`. All content from `_mock`.

### P1.4 — Beállítások composition

Frame from `30 §30.4.1`: back affordance, title, `196px 1fr` grid, six-item sub-nav wired to the section param, and all six sections' rows rendered from a **declarative section config**:

```ts
// src/app/app/profile/settings/sections.ts
export const SECTIONS = [
  { key: "account",  label: "Fiók",        icon: "user",
    groups: [{ label: "Személyes adatok", rows: [...] }, ...] },
  ...
]
```

Rows declare `label`, `desc`, `icon`, and a `control: "chevron" | "toggle" | "value"` plus a `read`/`write` key. The config is the single place a row's copy lives, which is what makes the P4/P5 wiring mechanical and the Hungarian copy auditable.

### P1.5 — Editor screens (still fixture-backed)

One reusable `EditorSheet` (mobile) / `EditorModal` (desktop) with: title, one control, `Mentés` (disabled until dirty), `Mégsem`. Instances: name, email, password, avatar, weekly days + weekday picker, session length, equipment, reminder time.

### P1.6 — Interaction pass

Hover/focus/active per `00 §0.7`, focus ring never removed, section change moves focus to the heading, Escape closes editors, `prefers-reduced-motion` honoured.

**P1 definition of done**
- Every element in `reference/LEXFIT Profil Wireframe.html` exists on screen, translated per `30 §30.6` (solid borders, token radii, `LxIcon`, no emoji).
- Clicking anything either navigates or opens the right editor. Nothing is inert.
- All copy verbatim from `30 §30.7`.
- `_mock.ts` is the **only** source of content; deleting it breaks the page loudly (typed, not optional).
- Clean build, no console errors, no layout shift between skeleton and content.

---

## P2 · Shell delta

Small, isolated, ships alone.

### P2.1 — Avatar menu, six items

`src/components/AppTopBar.tsx` — replace the three-item list (all pointing at `/app/profile`) with the six from `30 §30.2`, each with its icon and its real destination. **Do not touch** the existing open/close, outside-click, Escape or focus-return logic — it is already correct.

### P2.2 — Mobile sheet

Below `--bp-mobile` the same six items render in a bottom sheet (reuse `src/components/BottomSheet.tsx`) with the identity header and streak pill. Tab bar stays visible; scrim per `01-SHELL.md §1.5`.

### P2.3 — Remove the sidebar profile row

If `.lx-prof` still exists in `shell.css` / the sidebar, remove it (`01-SHELL.md §1.2`). `/app/profile` remains a route; it is simply not a nav destination.

- **Done when:** the avatar menu opens on both breakpoints, all six items land on the right screen, keyboard-only operation works, and the tab bar still has exactly four items.

---

## P3 · Data model and backend groundwork

No UI changes in this phase. **This is where "no hardcoded data" is actually won.**

### P3.1 — The read model

One typed shape, one loader, so both surfaces read the same thing:

```ts
// src/lib/profile.ts
export interface ProfileData {
  identity: { name: string; photoURL: string | null; email: string | null;
              memberSince: number | null; provider: string | null };
  programme: { slug: string; label: string; week: number; nextRetestWeek: number | null;
               weeksToRetest: number | null };
  stats: { doneCount: number; minutes: number; streak: number };
  week: { weekday: number; state: "done"|"today"|"rest"|"todo"|"missed" }[];
  why: { text: string; at: number | null } | null;
  plan: PlanPrefs;
  prefs: Prefs;
  subscription: Subscription | null;
}
export async function loadProfile(uid: string): Promise<ProfileData>
```

`loadProfile` composes what already exists — `getOnboarding`, `loadFoundation`, `getProgress`, `getSubscription`, `users/{uid}`, and the new prefs doc — with `Promise.all`, one round of reads. **No new aggregation service, no duplicated Firestore queries in components.**

### P3.2 — The prefs document

`users/{uid}/settings/prefs` — one doc, merge-written, so a single `onSnapshot` covers every toggle:

```ts
interface Prefs {
  plan: {
    daysPerWeek: number;          // 3–6, seeded from onboarding.days
    weekdays: number[];           // 1=Mon … 7=Sun, seeded from WEEK in onboarding-data
    sessionLength: string;        // seeded from onboarding.time bucket
    equipment: string[];          // seeded from onboarding.env
    restDayKeepsStreak: boolean;  // default true
  };
  reminders: {
    workout: { enabled: boolean; time: string /* "HH:MM" */; weekdays: number[] };
    streakRisk: boolean;          // default true
    community: boolean;           // default false
    newContent: boolean;          // default false
  };
  privacy: { nameVisible: boolean; streakVisible: boolean };
  playback: { quietDefault: boolean; captions: boolean; autoNext: boolean };
  tone?: "meleg" | "oszinte" | "vegyes";
  updatedAt: number;
}
```

- `src/lib/prefs.ts`: `DEFAULT_PREFS`, `getPrefs(uid)`, `watchPrefs(uid, cb)`, `updatePrefs(uid, patch)` (deep-merge, `updatedAt: Date.now()`).
- **Seeding, once, idempotently:** on first read, if the doc is missing, derive it from `users/{uid}/onboarding/profile` (`days`, `time`, `env`) and write it. **Never** render defaults without persisting them — otherwise the reminder cron and the UI disagree about what the user chose.
- `weekdays` does not exist in onboarding today (only a `days` count). Seed from `WEEK` in `src/lib/onboarding-data.ts` — Mon/Tue/Thu/Fri/Sat work, Wed/Sun rest — trimmed to `daysPerWeek`.

### P3.3 — Security rules

`firestore.rules` — owner-only read/write on `users/{uid}/settings/{doc}`; validate `reminders.workout.time` against `^([01]\d|2[0-3]):[0-5]\d$` and `weekdays` as a 1–7 int array. `users/{uid}.deletionRequestedAt` is **admin-write only**. `subscriptions/{uid}` stays owner-read / server-write. Storage: `users/{uid}/avatar.*` owner-write, and confirm `users/{uid}/photos/**` is already owner-only.

*(If `firestore.rules` is not in the repo, stop and ask where rules are managed.)*

### P3.4 — The minutes ledger

`412 perc mozgás` cannot be faked and should not be recomputed from the whole video collection on every profile open.

- **Preferred:** in `markComplete()` (`src/lib/progress.ts`), append `minutes` to the completed entry and increment a `totalMinutes` counter on the progress doc. Cheap, correct going forward.
- **Backfill:** a one-off script/cron pass that sums durations for existing `completed[]` codes from `videos/{code}`. **First confirm the duration field name on `Video` in `src/lib/types.ts`** — if there is no minutes field, that is a schema gap: report it before writing the backfill.
- Until the backfill runs, the tile shows the counter, not an estimate. **A number that is wrong is worse than a number that is small.**

- **P3 done when:** prefs seed on first load, rules deny cross-user access (test with two emulator users), `loadProfile` returns a fully typed object, and `totalMinutes` increments on a completed workout.

---

## P4 · Read path — delete the fixture

Swap the fixture for `loadProfile`, one block at a time, verifying each against the emulator.

| Step | UI | Source |
|---|---|---|
| **P4.1** | Name, avatar, member-since, e-mail | `users/{uid}` first, Auth as fallback; `displayName.split(" ")[0]`; date via `Intl.DateTimeFormat("hu-HU", {year,month})` |
| **P4.2** | `Foundation · {n}. hét` | `loadFoundation` → `currentIndex` → the session's `week`; label from `program.title`, **not the string "Foundation"** |
| **P4.3** | Three numbers | `progress.doneCount`, `progress.totalMinutes`, `progress.streak` |
| **P4.4** | Streak pill | `progress.streak`; hidden at 0 |
| **P4.5** | Week strip | `prefs.plan.weekdays` × `progress.completed[]` filtered to the current ISO week in **Europe/Budapest**, Monday-first. `today` from the same TZ. Past planned days with no completion → `missed` |
| **P4.6** | `Miért kezdted` | `onboarding.why ?? onboarding.motiv`; date from `completedAt`; **card omitted when empty** |
| **P4.7** | `Következő mérföldkő` | the next session with `retest !== null` → its `week`; `weeksToRetest = retestWeek - currentWeek`; omitted when past |
| **P4.8** | Settings row values | `prefs` + Auth (`Profilkép`: `Beállítva`/`Nincs`; `Jelszó`: months since `passwordUpdatedAt`, or the Google-provider line) |
| **P4.9** | Subscription panel | `getSubscription` + `PRICES` via `formatHuf()`; plan label from `sub.plan`; renewal `currentPeriodEnd`; `CANCELED` shows `accessUntil` |

Then: **delete `_mock.ts`, `page.legacy.tsx` and `NEXT_PUBLIC_PROFILE_V2`.** The build must fail if anything still imports the fixture.

- **P4 done when:** two different emulator users show two entirely different profiles; a user with no onboarding, no completions and no subscription renders the empty variants without a single `—` placeholder or crash; `grep -rn "Réka\|19 990\|412\|07:15" src/` returns only the spec files.

---

## P5 · Write path — every control persists

One rule: **optimistic for toggles, explicit for editors** (`30 §30.8`).

| Step | Control | Implementation |
|---|---|---|
| **P5.1** | All toggles | `updatePrefs` patch; flip local state first, revert + `Nem sikerült mentenünk. Próbáld újra.` on failure. Debounce 400ms per key |
| **P5.2** | `Név` | `updateProfile(auth.currentUser)` **and** `users/{uid}.displayName` in one action; the top-bar initial updates without reload (`auth-context` re-emit) |
| **P5.3** | `E-mail` | `verifyBeforeUpdateEmail` — **never** `updateEmail` directly; `reauthenticateWithCredential` on `auth/requires-recent-login`; show the pending-verification copy |
| **P5.4** | `Jelszó` | `updatePassword` + re-auth; row hidden for Google-provider users, replaced by the provider line |
| **P5.5** | `Profilkép` | client-side resize to 512px max (canvas), `uploadBytes` → `users/{uid}/avatar.jpg`, `getDownloadURL` → `updateProfile.photoURL` + `users/{uid}.photoURL`. Reuse the `photos.ts` pattern. Also a `Kép törlése` action |
| **P5.6** | Plan editor | `daysPerWeek` + `weekdays` together — changing the count must not leave an inconsistent weekday set. On save, invalidate the Kezdőlap query so today's workout reflects the new plan **immediately** (this is what the row's description promises) |
| **P5.7** | `Szokásos edzéshossz`, `Van otthon eszközöd?` | `prefs.plan`; mirror back onto `onboarding/profile` (`time`, `env`) so personalisation stays consistent — one write, both places, or neither |
| **P5.8** | Reminder time + weekdays | `prefs.reminders.workout`; presets `06:30 07:15 18:00 20:00` + `Egyéb időpont` → native `<input type="time">`. Editing reminder days does **not** change the plan — that is what the note says, so enforce it in code |
| **P5.9** | `A pihenőnap megtartja a sorozatot` | writes `prefs.plan.restDayKeepsStreak`; **and `markComplete`'s streak logic must read it** — a planned rest day between two workouts keeps the streak instead of resetting it. Without this the toggle is decoration |
| **P5.10** | `Kijelentkezés` | `signOutUser()` → `/login` (both menu and row) |

- **P5 done when:** every control survives a hard reload; two tabs stay in sync via `watchPrefs`; a forced write failure shows the error and reverts; and toggling `restDayKeepsStreak` demonstrably changes streak behaviour in the emulator.

---

## P6 · Server-side features

### P6.1 — `Adataim letöltése`

`src/app/api/account/export/route.ts`, `runtime: "nodejs"`, auth via `verifyRequest` (as `subscription/manage` does).

Assembles: `users/{uid}`, `onboarding/profile`, `progress/state` (including the full completed log), `settings/prefs`, photo **metadata** (paths and dates, not bytes), and a subscription summary (plan, status, dates — **no Stripe internals**). Returns `application/json` with `Content-Disposition: attachment; filename="lexfit-adataim-{YYYY-MM-DD}.json"`. Rate-limit to a few per day per uid.

### P6.2 — `Fiók törlése`

Two-stage, matching the copy `Végleges. Az adataid 30 napon belül törlődnek.`

1. `POST /api/account/delete` — requires a **fresh** ID token and the typed word `TÖRLÉS`. Writes `deletionRequestedAt` (server-side), cancels any Stripe subscription at period end via the existing `cancelAtPeriodEnd`, disables the Auth user, signs the client out, sends a confirmation e-mail stating the 30-day window and how to reverse it.
2. `GET /api/cron/purge-accounts` (daily, `CRON_SECRET`-guarded, same pattern as `api/cron/reminders`) — for every request older than 30 days: recursively delete the `users/{uid}` subtree, delete `users/{uid}/**` in Storage, delete the Auth user, and **retain only what law requires** (invoices).

Confirm the retention posture in P0.6 before writing the purge.

### P6.3 — Reminders that actually fire

The existing `api/cron/reminders` is **billing-only** (day-5, dunning, pause, offers). Do not extend it — workout reminders are a separate job with a different cadence.

`src/app/api/cron/workout-reminders/route.ts`, hourly:

1. Query users with `settings/prefs.reminders.workout.enabled == true` *(needs a collection-group index on the settings docs — add it)*.
2. Compute the user's local time in **Europe/Budapest**; fire only when the current hour matches `time` and today's weekday is in `weekdays`.
3. Skip if `progress.lastCompletedDate == today` — never remind someone who already trained.
4. Idempotency via a milestone doc `{uid}_workout_reminder_{YYYY-MM-DD}`, exactly like `milestoneDocId` usage in the billing cron.
5. `Sorozat veszélyben`: a second pass at 20:00 local for users with `streakRisk: true`, a live streak, a workout planned today, and nothing completed. **One message maximum, per user, per day, across both passes.**

Channel per P0.3. Email → `sendEmail` with new templates in `src/lib/pricing/templates.ts` style (or a new `src/lib/notify-templates.ts` — reminders are not billing). Push → service worker + token collection on the toggle, `prefs.pushTokens[]`, and a permission-denied fallback that turns the toggle back off with an explanation.

- Both cron entries go in `vercel.json`. Every send is logged with uid + kind + timestamp.
- **Done when:** an emulator user with `07:15` + Monday gets exactly one message on Monday morning, none if they trained first, and none twice if the cron is invoked repeatedly.

---

## P7 · Make the privacy and money settings real

A privacy toggle that nothing reads is a lie in the UI. This phase is short and non-negotiable.

| Step | Work |
|---|---|
| **P7.1** | `privacy.nameVisible === false` → **every** surface that renders another user's name shows `{FirstInitial}.` (`Réka` → `R.`). Audit `/app/szm`, check-ins, any community list. One helper, `displayNameFor(user, prefs)`, used everywhere — no per-component logic |
| **P7.2** | `privacy.streakVisible === false` → the streak is omitted from any shared/community view. The user's **own** header pill always shows |
| **P7.3** | `Haladásfotók · Privát` — verify with rules tests that another authenticated uid cannot read `users/{uid}/photos/**` or its Storage path. This row makes a promise; prove it |
| **P7.4** | `Fizetési előzmények` → the real invoice list (`src/lib/pricing/invoice.ts`) or the Stripe hosted invoice URLs. If neither is available, the row does not ship — **an inert row is worse than no row** |
| **P7.5** | `Előfizetés lemondása` / `Csomag váltása` → `/app/membership` (already J3-compliant: pause / downgrade / cancel + skippable reason). Do **not** reimplement it |
| **P7.6** | `Számlázás` → the Stripe billing portal or the invoice route, whichever P7.4 settles |

---

## P8 · Mobile pass

Per `30 §30.5` and `11-MOBILE.md`.

- **P8.1** P-01 avatar sheet (from P2.2) — grab handle, header, six rows at 48px.
- **P8.2** P-02 Profil — centre-stacked identity, 3-up compact stats, week card, `Miért kezdted`; top bar back chevron + `sliders` icon-button.
- **P8.3** P-03 Beállítások — **no sub-nav**; the six sections become grouped rows, each a chevron into its own screen. Back chevron on every level, tab bar always visible.
- **P8.4** P-04 Emlékeztető — big `tabular-nums` time, four preset pills, weekday pills, bottom-anchored full-width 44px `Mentés`.
- **P8.5** Sweep: every row ≥48px, every glyph target ≥44px, destructive rows out of the thumb zone, no horizontal overflow at 320px, safe-area insets respected.

---

## P9 · States, accessibility, and the hardcoded-data audit

### P9.1 — Four states, both surfaces
Skeletons in the real shapes (no spinners, no shift), the empty new-user variant with its way out, an error state with `Újra`, and the no-subscription variant. `00 §0.9`, `30 §30.8`.

### P9.2 — Accessibility
Menu semantics and focus trap, `role="switch"` + `aria-checked` on every toggle, `aria-pressed` pills inside a labelled group, focus rings never clipped, section change moves focus and updates the URL, keyboard-completable deletion and cancellation, `prefers-reduced-motion`.

### P9.3 — The no-hardcoded-data audit

Run it, paste the output, fix everything it finds:

```bash
grep -rnE "Réka|reka@|19 990|24 900|412|21 |12 NAP|07:15|2025\. március" src/app/app/profile src/components/profile
grep -rn "Foundation tagság\|Foundation ·" src/            # plan and programme labels must come from data
grep -rnE "border-radius:\s*(5|6|7|10|16|24)px" src/app/app/profile
grep -rn "useState(true)\|useState(false)" src/app/app/profile   # every one must be UI-only, not a setting
grep -rn "_mock\|page.legacy\|PROFILE_V2" src/                    # must be empty
```

Then, by hand: open the screen as a **brand-new user with nothing** — no onboarding, no completions, no subscription, no photo. Every block must either show a real zero state or be absent. Nothing invented, nothing borrowed from another user, nothing left over from the fixture.

### P9.4 — Definition of done

**Structure**
- Profil shows; Beállítások edits; they are separate routes and never mixed.
- Avatar top-right on both breakpoints opens the six-item menu / sheet. Four tabs, still four.
- Six settings sections, grouped rows, label left / value-or-toggle right, chevron only when the row opens something.

**Data — the hard requirement**
- Every displayed value traces to Firestore, Auth, Stripe or the progress log. `_mock.ts` deleted, legacy page deleted, flag removed.
- Prefs seed from onboarding on first load and persist on every change.
- `totalMinutes` is a real ledger, backfilled.
- No price, plan name, date or count is a literal anywhere in `src/app/app/profile` or `src/components/profile`.

**Features that work end to end**
- All 14 settings rows persist and survive reload.
- Name, e-mail (verify-first), password (re-auth), avatar upload + delete.
- Plan edit changes what the Kezdőlap offers today.
- `restDayKeepsStreak` changes actual streak arithmetic.
- Reminder fires once, at the chosen local time, only on chosen days, never after training.
- `Sorozat veszélyben` fires at most once a day, and never alongside the daily reminder.
- Data export downloads a complete JSON.
- Deletion: typed confirm → soft delete → Stripe cancelled → 30-day purge job proven in the emulator.
- Privacy toggles change what other users actually see.
- Subscription panel matches Stripe exactly; cancel routes to `/app/membership`.

**Craft**
- Token radii only, `--danger` for destructive, no emoji, `LxIcon` throughout.
- 44px floor on touch, 48px settings rows, `.hit44` on the small glyphs.
- Four screen states everywhere; focus rings everywhere; reduced motion honoured.
- Hungarian copy verbatim; new strings from `30 §30.7` reviewed before ship.
- Clean build, no console errors, no layout shift.

---

## P10 · What not to do while building this

- **Do not extend `api/cron/reminders`** with workout logic. Billing and habit reminders have different cadences, different idempotency keys and different failure consequences.
- **Do not reimplement cancellation.** `/app/membership` is already J3-compliant.
- **Do not render a default without persisting it.** The UI and the cron must never disagree about what the user chose.
- **Do not ship an inert row.** If the feature behind a row is not built, the row does not exist yet.
- **Do not put weight, calories, badges or a leaderboard on this page** (`30 §30.10`).
- **Do not translate or reword the Hungarian.**
- **Do not fix the palette conflict by choosing.** Ask (P0.1).

Anything the two specs do not cover: ask before deciding.
