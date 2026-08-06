# 40 · Onboarding, Auth & Checkout

**Screen spec — the entire pre-app funnel: `/onboarding` → `/register` → `/subscribe` → `/app`.** Global values live in `00-FOUNDATIONS.md`, the shell in `01-SHELL.md`, controls in `02-BUTTONS.md`. This file describes only what is unique to the funnel.

The build order is in **`41-ONBOARDING-DEV-PLAN.md`**. Read this file first, build from that one.

Reference wireframe: `reference/LEXFIT Onboarding Wireframe.html`. It is greyscale on purpose — structure, hierarchy, sizing and copy, never colour.

---

## 40.0 What this is, and why it is not a re-skin

This is the highest-stakes surface in the product: **every user passes through it exactly once, and most of the ones who leave, leave here.** It is also the only place where design, legal consent and money meet on the same screen.

The wireframe makes one structural change and everything else follows from it:

| | Today, in the repo | This spec |
|---|---|---|
| Order | **auth → onboarding → app** | **onboarding → auth → checkout → app** |
| Question screens | 7 (+ reveal), several multi-part | **5, one question each**, + one optional free-text |
| Answers before account | impossible — `/onboarding` is `Protected` | held locally, attached on registration |
| Icons | emoji (`💪🔥🌱🧘📅`) | `LxIcon` + `lxPaths` |
| Reveal | a week grid | a week grid **that restates the user's own answers** |
| Checkout | reached separately | the step immediately after the account |

**Read that first row carefully.** `src/app/onboarding/page.tsx` is wrapped in `<Protected requireOnboarded={false}>` and `AuthScreen` routes to `/onboarding` *after* sign-in. This spec inverts that. It is the single largest piece of work in the plan and everything else in Phase 3 depends on it.

---

## 40.1 The current build — audit

Read before touching anything, so nothing is "fixed" twice.

| # | Finding | Where |
|---|---|---|
| **B1** | **Onboarding sits behind auth.** The user must create an account before answering anything — the most refusable request placed where they have invested nothing. | `onboarding/page.tsx`, `AuthScreen.tsx` redirect effect |
| **B2** | **Seven steps, several compound.** `about` alone asks age + height + weight + life stage; `motiv` asks free text + obstacle; `schedule` asks days + time. One screen, three decisions. | `FLOW` in `onboarding-data.ts` |
| **B3** | **Four answers feed nothing.** `focus`, `obstacle`, `lifestage`, `age` are collected and stored, and no screen in the bundle consumes them. | `OnboardingAnswers` |
| **B4** | **Height and weight are asked up front.** `30-PROFIL.md §30.10` explicitly rules weight out as a headline number; it belongs in Haladásom, if anywhere. | `about` step |
| **B5** | **Emoji are the icon system** — including `"🔥".repeat(o.flames)` with inline font-size arithmetic for the level control. | `OptionCards`, `STEP_OPTIONS` |
| **B6** | **The progress bar is a percentage of seven**, with no "n / 5" and no visible end on the reveal. | `onb-prog` |
| **B7** | **The auth brand panel is factually stale**: `4 hét`, `100+ edzés`, `a közösségben`. Foundation is **8 weeks**, the library is **200+**, and the community is the Facebook group. | `AuthScreen.tsx` `bstats` / `bsub` |
| **B8** | **No consequence preview.** Choosing 5 days shows nothing until the reveal, three screens later. | `schedule` step |
| **B9** | **No notification permission step at all**, and nothing consumes the `time` answer — the profile spec's reminder default (`07:15`) has no origin. | — |
| **B10** | `seed/source/onb-data.jsx` still hardcodes **19 990 Ft / hó**, which matches no price in `PRICES`. | seed source |
| **B11** | **Good, keep it:** answers already autosave to `localStorage` under `lexfit_onb_v2` with the step index, and restore on return. That mechanism is exactly what the new pre-auth flow needs — it only needs to move earlier. | `LS_KEY` |
| **B12** | **Good, keep it:** `saveOnboarding` already writes the `why` / `experience` aliases downstream screens read. | `lib/user.ts` |
| **B13** | **Good, keep it:** `/subscribe` derives **every** figure from `PRICES` via `formatHuf` / `perWeekHuf` / `annualSavingsPct`, and the dual-consent step is already J1/J2-compliant. **Do not rebuild it.** | `subscribe/page.tsx` |

---

## 40.2 The dependency map — what each question is for

**O-RULE 01: no question without a consumer.** A question that changes nothing the user will see is a drop-off point that buys nothing.

| Answer | Key | Consumed by | Verdict |
|---|---|---|---|
| Cél | `goal` | Kezdőlap row order · Videótár recommendations · Alexa's tone | **Keep** |
| Szint | `level` | Foundation entry point · default intensity filter | **Keep** |
| Napok / hét | `days` | Week strip · Haladásom ring · Profil plan · streak logic | **Keep** — the most reused answer in the product |
| Napszak | `time` | The default reminder time (`30 §30.4.3`) | **Keep** |
| Környezet | `env` | Card "eszköz nélkül" marking · variations · Profil | **Keep** — also the accessibility answer |
| **Miért kezdted** | `why` | Profil `Miért kezdted` card · Haladásom · Alexa | **Add** — quoted on two drawn screens, captured nowhere as a first-class question |
| Fókusz-területek | `focus` | — | **Defer** to after week 1 |
| Korábbi akadály | `obstacle` | — | **Defer** to the first missed week |
| Életszakasz | `lifestage` | — | **Defer** — but see the warning below |
| Életkor | `age` | — | **Defer** to profile level |
| Magasság / testsúly | `height`/`weight` | — | **Defer** to Haladásom |

**Deferred, not deleted.** `OnboardingAnswers` keeps every field; the deferred ones simply stop being asked in the funnel and are collected later, in context, where the answer can act.

> **Life stage needs a trainer's ruling, not a designer's.** Pregnancy, postpartum and menopause change what is *safe*, not just what is recommended. Deferring it is a judgement call. **If the programme adapts materially to it, it must be asked up front instead** — see §40.11 Q1. Do not build this either way until it is answered.

---

## 40.3 The sequence

Eleven steps. Account creation comes **after** the plan is revealed — at the moment the thing being signed up for is concrete.

| # | Screen | Route | Auth? |
|---|---|---|---|
| 01 | Üdvözlés | `/onboarding` | no |
| 02–06 | Öt kérdés — cél · szint · napok · napszak · környezet | `/onboarding?q=1…5` | no |
| 07 | Miért kezdted — free text, skippable | `/onboarding?q=why` | no |
| 08 | A heted — the reveal | `/onboarding?q=reveal` | no |
| 09 | **LEXFIT Auth, register pane** — the existing page | `/register` | — |
| 10 | Előfizetés | `/subscribe` | yes |
| 11 | Első belépés — first home screen + reminder prompt | `/app` | yes |

**Why this order.** Answering five taps costs nothing and builds investment; typing an email costs something and is easy to refuse. By step 9 the user has a plan with their name on it — the account is now the way to *keep* it, not a toll gate.

**The auth page already assumes this.** Its register lede reads „a csomagot a következő lépésben választod ki", and pricing was deliberately removed from it in that redesign. Checkout-after-auth is exactly this order; the page is currently just in the wrong position in the sequence.

**Answers survive the account.** They are held in `localStorage` through steps 1–8 and attached to Firestore on registration. **A user who bounces at auth and comes back must never be re-interrogated.**

---

## 40.4 The question screen — one pattern, five times

Nothing here is novel. This is the shape of every onboarding the audience has completed in the last five years.

```
┌──────────────────────────────────────┐
│ ‹  ▬▬ ▬▬ ▬▬ ▭▭ ▭▭            3 / 5   │  top bar, 28px back circle
├──────────────────────────────────────┤
│ Hány nap fér bele?                   │  qhd — 19px/800/-.03em
│ Ebből épül a heted. Bármikor         │  qsub — 11.5px --ink-2
│ változtathatod.                      │
│                                      │
│ [ opció ]                            │  56px rows, --sp-2 gap
│ [ opció ]                            │
│                                      │
│                        [ Tovább ]    │  46px primary, bottom-anchored
└──────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Back | 28px circle, `chevronLeft`, `.hit44`. **Always available, never destructive** (answers persist) |
| Progress | 5 segments, 4px tall, radius `999px`, `flex:1`, gap `--sp-1`; filled = `--accent`; unfilled = `--surface-2` + 1px `--line`. `role="progressbar"`, `aria-valuenow` |
| Counter | mono 10px, `{n} / 5` — on step 07 it reads `Kész` |
| Heading | 19px / 800 / `-.03em` / line-height 1.15 |
| Sub | 11.5px `--ink-2`, `--sp-1` below |
| Primary | 46px, full width, bottom-anchored (`margin-top:auto`), disabled until valid |

### Option row

| Slot | Spec |
|---|---|
| Box | 1.5px `--line`, radius `var(--r-sm)`, `--surface`, padding `9px 12px`, gap 11px, **min-height 52px** (single line) / ~68px (with a sub) |
| Icon tile | 34px square, radius `var(--r-sm)`, `--surface-2` fill, 1px `--line`, icon 17px `--ink-2` |
| Bold label | 12.5px / 700 / `-.01em` |
| Sub label | 10.5px `--ink-3`, 2px below |
| Mark | 22px, right; `50%` for single-choice, `var(--r-sm)` for multi. **The tick shape says which it is** |
| Selected | border `--accent`, background `--accent-soft`, tile filled `--accent-2`, glyph white, label `--accent-ink` |

Single-choice rows are radios (`role="radiogroup"` + `role="radio"`), multi are checkboxes (`aria-checked`). **Do not use `aria-pressed` buttons for both**, as the current build does — the semantics are the affordance.

### The five questions

| # | Question | Sub | Control |
|---|---|---|---|
| 1 | `Mi hozott ide?` | `Egyet válassz — ez adja az edzéseid fókuszát. Később módosítható.` | 5 single-choice rows (`goal`) |
| 2 | `Hol tartasz most?` | `Ne becsüld túl és ne is alá — ehhez igazítjuk a tempót.` | 3 single-choice rows (`level`) — **flame count becomes an icon repeat, not an emoji string** |
| 3 | `Hány nap fér bele?` | `Ebből épül a heted. Bármikor változtathatod.` | 4-up segmented `3 4 5 6` + live week preview |
| 4 | `Mikor a legjobb?` | `Ide teszem majd az emlékeztetőt.` | 3 single-choice rows (`time`) |
| 5 | `Van bármi, amire figyeljek?` | `Többet is választhatsz. Ehhez igazítom a variációkat.` | 5 multi-choice rows (`env`), `Nincs külön kérésem` exclusive |

**Segmented control (step 3):** grid of 4, gap 5px, `--surface-2` track, 1px `--line`, radius `999px`, padding 4px; each cell 9px vertical, radius `999px`, 12px/600; selected = `--surface` fill, `--ink` text, `0 1px 3px rgba(24,32,29,.12)`. Under it, centred 11.5px `--accent-ink`: `ajánlott · heti {n} edzés`.

**O-RULE 04 — show the consequence on the same screen.** Step 3 draws the resulting week strip immediately below, inside a card, with the note `A pihenőnap is a terv része — nem töri meg a sorozatot.` The user watches the product being built instead of filling in a form. Week strip geometry and cell states come from `30 §30.3.3` — do not invent a second week component.

### Step 07 — Miért kezdted

Heading `És miért most?`, sub `Egy mondat elég. Ezt később visszahozom neked — akkor, amikor nehéz lesz.`

- Textarea: min-height 82px, 1.5px `--line`, radius `var(--r-sm)`, padding `12px 13px`, 12px text, `maxLength 160` with a live counter. Placeholder: `Pl. „Hogy a lépcsőn ne fulladjak ki, és bírjam a gyerekekkel."`
- Alexa whisper below: `„Ezt csak te fogod látni. Nem kell szépnek lennie — elég, ha igaz."`
- Primary `Mehet`; under it, centred 11px `--ink-3` text button `Most kihagyom`.

**Skippable, and asked while motivation is highest.** It is the most human thing in the product and the one place the funnel is allowed to be itself. If skipped, the Profil card is omitted entirely (`30 §30.3.4`) — never a placeholder.

---

## 40.5 Step 08 — the reveal

The emotional peak, and the justification for every question before it.

| Block | Content |
|---|---|
| Eyebrow | mono `Kész is` |
| Heading | `Ez lesz az első heted.` (21px/800) |
| Week card | 7-cell strip + summary line `Heti {n} edzés · {napszak} · {env-derived}` |
| First workout | 16:9 thumb, `1. NAP` flag top-left, duration chip bottom-right, title `Foundation · alapozás` |
| Whisper | `„Ezt a hetet a válaszaidból raktam össze. Ha nem passzol, együtt átírjuk."` |
| Primary | **`Mentsük el a tervedet`** |

**O-RULE 05 — the reveal restates the answers.** `Heti 5 edzés · reggelente · csendes variációkkal` is assembled from `days`, `time` and `env`. The user must recognise their own inputs, or the questions felt pointless.

**The button names what registering protects.** Not „Regisztráció" — the account is a means, the plan is the thing.

---

## 40.6 Step 09 — Auth, used as built

**`src/app/login/AuthScreen.tsx` is not redesigned.** It is already high-fidelity, validated, GDPR-correct (marketing opt-in defaults to unchecked), and its error map is complete. Three changes only:

1. **Correct the brand panel figures (B7).** `4 hét` → `8 hét`, `100+` → `200+`, `a közösségben` → `a csoportban`, and the sub line to match. The same edit is owed to `docs/design_handoff_auth/LEXFIT Auth.html`.
2. **Attach the pending answers on registration** (§40.8).
3. **Change the post-auth destination** — `/subscribe` instead of `/onboarding`, since onboarding now happens before.

**Desktop reuses the auth page's split-screen for the entire funnel.** Brand panel left, the changing content right; the brand panel never moves between step 1 and step 9. The auth page stops being a separate destination and becomes the last card in a sequence the user is already inside — no visual transition at all.

Mobile shows no brand panel, only the mark. That also resolves the below-940px stacking problem the auth handoff flagged: the form is never pushed below the fold because the panel is never there.

> **The wireframe's mobile auth card omits the password field.** The real form requires one (8 chars, one digit) and the wireframe is simply abbreviated. **Keep the password field.** Do not treat its absence as a spec.

---

## 40.7 Step 10 — Előfizetés

`/subscribe` already exists and is correct where it counts. **Do not rebuild it; restyle the selection layer and keep everything below it.**

| Keep, untouched | Change |
|---|---|
| Every figure derived from `PRICES` via `formatHuf` / `perWeekHuf` / `annualSavingsPct` | Mobile layout: **radio-style selection + one fixed CTA** instead of a per-card button |
| The dual-consent step (J1 auto-renew + J2 immediate-start), disabled CTA until ticked | The CTA repeats the exact amount: `Előfizetek — {formatHuf(ANNUAL)} / év` |
| Server-side consent persistence before any Stripe session | Annual pre-selected, `LEGNÉPSZERŰBB` badge, `SPÓROLJ {annualSavingsPct()}%` |
| The `week_intro` once-per-user server guard | Every plan also shown **per week**, so the comparison is like-for-like |
| The one-off products as separate, non-discounted purchases | A scrolled `Mi van benne` feature list + the community whisper |

Plan card: 1.5px `--line`, radius `var(--r-sm)`, padding `13px 15px`, min-height 74px; mono 9px plan label; price 22px/800/`-.035em` with an 11px/600 `--ink-3` unit; 10.5px `--ink-3` terms line; 22px tick top-right. Selected = `--accent` border + `--accent-soft` fill + filled tick.

**Three prices, three truths, all from config:**

| Card | Primary | Terms line |
|---|---|---|
| Éves | `{perWeekHuf()} Ft / hét` | `{ANNUAL} / év · évente számlázva` + `SPÓROLJ {pct}%` |
| Havi | `{MONTH_STD} / hó` | `Havonta automatikusan megújul` |
| Heti | `{WEEK_INTRO} / első 7 nap` | `Utána {WEEK_STD} / hét` |

> **The wireframe drops the one-off products.** `Csak egy hetet szeretnék` / `Csak egy hónapot szeretnék` exist in the live page as deliberately separate, never-discounted products. **Do not delete them** — carry them into the new layout as the secondary text link they already are. Removing a purchase option is a business decision, not a layout one (§40.11 Q3).

Footer under the CTA, 10.5px `--ink-3`: `Bármikor lemondható · 14 napos pénzvisszafizetési garancia`.

---

## 40.8 The state machine — where answers live

This is the part that is easy to get wrong and expensive to fix.

```
step 01–08   →  localStorage "lexfit_onb_v1"  { v, idx, answers, startedAt }
step 09      →  register → ensureUserDoc(user, {firstName, marketing})
                        → saveOnboarding(uid, answers)   ← attach here
                        → localStorage cleared
step 10      →  /subscribe (Protected, requireOnboarded false)
step 11      →  /app
```

Rules, all non-negotiable:

- **`localStorage` is written on every answer change**, exactly as the current build does. Reload mid-funnel resumes on the same step with the same answers.
- **Attachment is idempotent and happens once**, immediately after `ensureUserDoc`, before any redirect.
- **A returning user who already onboarded never re-enters the funnel.** `hasOnboarded(uid)` → `/app` (or `/subscribe` if unpaid).
- **A user who signs in mid-funnel with an existing onboarded account** keeps the server answers; the local draft is discarded, not merged. Ask nothing.
- **Local answers are never trusted for entitlement**, only for content. Access is decided solely by `hasAccessFromData` (`lib/pricing/types.ts`).
- **Bump the storage key to `lexfit_onb_v1`** for the new shape. Do not attempt to migrate `lexfit_onb_v2` drafts — they belong to a flow that required auth, so any holder of one already has an account.

### Routing truth table

| User state | `/onboarding` | `/register` | `/subscribe` | `/app` |
|---|---|---|---|---|
| Anonymous, no draft | step 01 | allowed | → `/register` | → `/onboarding` |
| Anonymous, draft | resume | allowed | → `/register` | → `/onboarding` |
| Signed in, not onboarded | resume, attach on finish | → next | allowed | → `/onboarding` |
| Signed in, onboarded, unpaid | → `/subscribe` | → `/subscribe` | allowed | → `/subscribe` |
| Signed in, onboarded, paid | → `/app` | → `/app` | „aktív" panel | allowed |

---

## 40.9 Step 11 — first entry, and the permission ask

The first home screen renders normally (`10-KEZDOLAP.md`), with two additions that appear **once**:

1. **The first-workout hero** — `Kezdjük az elsőt`, the day-1 Foundation session, with Alexa's whisper `„Itt vagyok. Az első nap a legnehezebb — utána már csak csináljuk."`
2. **The reminder card** — mono label `Beállítanál egy emlékeztetőt?`, body `Reggel {time}-kor szólok az edzésnapjaidon.`, and two 38px buttons: secondary `Most nem`, primary `Beállítom`.

**O-RULE 06 — permissions in context, later, pre-filled, refusable.**

- Asked **after** the first home screen, not during the funnel.
- The time is derived from the `time` answer (reggel → `07:15`, napközben → `12:30`, este → `19:30`) — the user is confirming, not configuring.
- `Most nem` is a real option, given equal visual weight.
- `Beállítom` writes `prefs.reminders.workout` per `30 §30.4.3` and only then requests the OS permission (if push is the channel — `31 §P0.3`).
- **Dismissed once, never re-shown.** The setting stays reachable in Beállítások. Refused OS permissions are effectively permanent; asking again buys nothing and costs trust.

---

## 40.10 Geometry the wireframe gets wrong

Translate, do not copy. Same drift as the profile wireframe.

| In the wireframe | In production |
|---|---|
| `border-radius: 6px / 10px / 11px` | `--r-sm` 8 · `--r-md` 14 · `--r-lg` 20 · `999px` · `50%` (`00 §0.5`) |
| `1px dashed var(--line)` | 1px **solid** `--line` — dashed is wireframe notation |
| `#fff`, `#ececec`, `#f5f5f5` literals | `--surface`, `--surface-2`, `--bg` |
| Mono labels at 8.5px / 9px | **10px minimum** (`00 §0.4`) — 8.5px is below the legibility floor for a 35+ audience |
| `linear-gradient(160deg, …)` brand panel | Whatever `auth.css` already does. Do not introduce a new gradient |
| Lucide icons | `LxIcon` + `lxPaths` (`00 §0.11`) |
| Phone frame 320×610 | Presentation device only — mobile is the real viewport |
| Prices as literals (`767`, `39 900`, `5990`, `490`, `1990`) | `PRICES` + `formatHuf` / `perWeekHuf` / `annualSavingsPct`, always |

**Contrast trap, again:** selected states in the wireframe put white on `--accent`. On Eukaliptusz that fails. Filled selected states use **`--accent-2` with white**, or `--accent-soft` with `--accent-ink` (`00 §0.2`).

---

## 40.11 Copy — verbatim, Hungarian

**Welcome:** `LEXFIT · OTTHONI EDZÉS` · `Egyedül nehéz.` / `Együtt muszáj.` · `Alexa vagyok. 30 perc, csak egy matrac, és egy közösség mögötted. Pár kérdés, és kész a heted.` · `Kezdjük` · `Van már fiókod? Lépj be` · stats `8 hét / Foundation` · `200+ / edzés` · `17 000+ / a csoportban`

**Questions:** `Mi hozott ide?` · `Egyet válassz — ez adja az edzéseid fókuszát. Később módosítható.` · `Hol tartasz most?` · `Hány nap fér bele?` · `Ebből épül a heted. Bármikor változtathatod.` · `ajánlott · heti 5 edzés` · `Így néz majd ki a heted` · `A pihenőnap is a terv része — nem töri meg a sorozatot.` · `Mikor a legjobb?` · `Van bármi, amire figyeljek?` · `Többet is választhatsz. Ehhez igazítom a variációkat.` · `Tovább`

**Options** — reuse the existing labels and sub-labels in `STEP_OPTIONS` verbatim (`goal`, `level`, `env`, `time`). They are written, reviewed and in production. Only the icons change.

**Why:** `És miért most?` · `Egy mondat elég. Ezt később visszahozom neked — akkor, amikor nehéz lesz.` · `„Ezt csak te fogod látni. Nem kell szépnek lennie — elég, ha igaz."` · `Mehet` · `Most kihagyom`

**Reveal:** `Kész is` · `Ez lesz az első heted.` · `Heti {n} edzés · {napszak} · {env}` · `Az első edzésed` · `Foundation · alapozás` · `„Ezt a hetet a válaszaidból raktam össze. Ha nem passzol, együtt átírjuk."` · `Mentsük el a tervedet`

**Auth** — every string already in `AuthScreen.tsx`, unchanged, except the corrected brand stats.

**Subscribe:** `Egy előfizetés. Minden funkció.` · `Bármikor lemondhatod.` · `LEGNÉPSZERŰBB` · `SPÓROLJ {n}%` · `ÉVES` `HAVI` `HETI` · `évente számlázva` · `Havonta automatikusan megújul` · `Utána {price} / hét` · `Előfizetek — {price} / év` · `Bármikor lemondható · 14 napos pénzvisszafizetési garancia` · `Mind a három csomagban` · `„A Facebook-közösség ingyenes marad — ez az előfizetés a programot nyitja meg."`

**First entry:** `Kezdjük az elsőt` · `„Itt vagyok. Az első nap a legnehezebb — utána már csak csináljuk."` · `Beállítanál egy emlékeztetőt?` · `Reggel {time}-kor szólok az edzésnapjaidon.` · `Most nem` · `Beállítom`

**Strings to write for production** (not in the wireframe — draft, then review):

| Situation | Copy |
|---|---|
| Resuming a draft | `Ott folytatjuk, ahol abbahagytad.` |
| Attach failed after registration | `A fiókod elkészült, de a válaszaidat nem tudtuk elmenteni. Újrapróbáljuk?` + `Újra` |
| Offline during the funnel | `Most nincs internet — a válaszaid itt maradnak, amíg visszajössz.` |
| Checkout cancelled | `Nem történt fizetés. A terved megvan — bármikor folytathatod.` |
| Reveal error | `Nem tudtuk összerakni a hetedet. Próbáld újra.` |

---

## 40.12 States and accessibility

**Loading** — the funnel is local until step 09, so steps 1–8 have no loading state at all. The reveal may need one if the first workout is fetched: skeleton the thumb and title, never a spinner.

**Error** — attachment failure after registration is the only dangerous one: the account exists but the answers do not. Retry in place, and **never send the user back through the questions**; the draft is still in `localStorage` until the write confirms.

**Empty** — not applicable; every step has content by construction.

**Accessibility additions** to the `00 §0.14` floor:

- Each step is a `<fieldset>` with a `<legend>` carrying the question; the visible heading is the legend.
- Single-choice = `role="radiogroup"` + `role="radio"`; multi = checkboxes. Arrow keys move within a radiogroup.
- Progress: `role="progressbar"`, `aria-valuenow`, `aria-valuemin=1`, `aria-valuemax=5`, `aria-label="Onboarding"`.
- Step change moves focus to the heading and announces via `aria-live="polite"`; the URL updates so back/forward work natively.
- The back button is never disabled mid-funnel; on step 01 it is absent, not greyed.
- 44px floor throughout; option rows are 52px+ already.
- The consent checkboxes on `/subscribe` have visible, associated labels — never placeholder text, never pre-ticked.

---

## 40.13 Funnel rules

| # | Rule | Why |
|---|---|---|
| **O-RULE 01** | **No question without a consumer.** Every question maps to a screen that displays or uses its answer. If it maps to nothing, it waits. | The map in §40.2 — seven asked, five used. |
| **O-RULE 02** | **Value before account, account before payment.** Five questions → the plan → registration → checkout. | Deferred sign-up; the auth page's own copy already assumes checkout comes after it. |
| **O-RULE 03** | **One question per screen, with a visible end.** Segmented bar plus `3 / 5`. Back always available, never destructive. | An unbounded flow is the strongest abandonment predictor in a question sequence. |
| **O-RULE 04** | **Show the consequence on the same screen.** Choosing 5 days draws the week; choosing „csendben" says what changes. | Makes it feel like building, not filling in. |
| **O-RULE 05** | **The reveal restates the answers.** | Peak–end: the reveal is the emotional peak and the justification for the questions. |
| **O-RULE 06** | **Permissions in context, later, pre-filled, refusable.** | Up-front prompts are refused, and refusals are permanent. |
| **O-RULE 07** | **No price is ever a literal.** Every figure from `PRICES`; every renewal term stated at equal weight to the headline price. | J1; the standing P1 on price clarity; `seed/source/onb-data.jsx` is currently wrong (B10). |

### Deliberately not doing

- **Asking for an email first.** The most refusable request where the user has invested nothing.
- **Seven question screens.** Four feed nothing today. Defer, don't delete.
- **An unbounded flow.** No progress bar means no idea when it ends.
- **A notification prompt before the first workout.**
- **Pricing on the auth page.** Removed deliberately in that redesign; do not reintroduce it.
- **Re-asking the questions after a bounce at auth.**
- **Height and weight in the funnel.**
- **Emoji as the icon system.**

---

## 40.14 Open questions — ask before building

1. **Is `életszakasz` safety-critical?** Pregnancy / postpartum / menopause change what is safe. If the programme adapts materially, it must be asked **in** the funnel, not deferred. **A trainer's ruling, not a design one — and it changes the step count.**
2. **Free first workout between the reveal and registration?** The natural place for one, if the business wants it. Not drawn; depends on a commercial decision.
3. **Keep the one-off products on the new subscribe layout?** They exist and are J4-compliant today. This spec keeps them as secondary links; confirm.
4. **Does step 3 also collect specific weekdays,** or only a count? `30 §30.4.2` needs `prefs.plan.weekdays`, currently seeded from the canonical `WEEK`. Asking here is more honest but adds a control.
5. **What happens to the four deferred questions?** Each needs a home before it can be called deferred rather than dropped: focus after week 1, obstacle after the first missed week, life stage where variations are offered, age at profile level. Who owns building those prompts?
6. **Palette** — still the standing blocker (`00 §0.1`).
