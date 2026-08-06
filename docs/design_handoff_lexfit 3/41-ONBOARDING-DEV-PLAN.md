# 41 · Onboarding — build plan

**The order of work for the pre-app funnel. Read `40-ONBOARDING.md` first.**

Nine phases. Each is a shippable state; each step names the files it touches and how you know it is done.

**Read this before anything else:** this is not a re-skin. The repo runs **auth → onboarding → app**; this plan inverts it to **onboarding → auth → checkout → app**. That inversion (Phase 3) is the riskiest change in the whole bundle, because getting it wrong means either a user with an account and no answers, or a user asked the same five questions twice. Phases 1–2 exist so that when you make the switch, the UI is already settled and the state machine is already tested.

**The end state:** every price, plan, week and date comes from `PRICES`, Firestore and `loadFoundation`. Zero mock data. The whole funnel works end to end from a cold browser to a paid first workout.

| Phase | What ships | Data |
|---|---|---|
| **P0** | Decisions answered, nothing built | — |
| **P1** | All 11 screens, pixel-correct, from one fixture | mock |
| **P2** | The draft store + routing state machine, tested | local |
| **P3** | **The inversion** — onboarding before auth, answers attached | live |
| **P4** | Real content in the funnel — options, week, first workout | live |
| **P5** | Auth delta — brand figures, destination, attachment | live |
| **P6** | Subscribe — new selection layer over the existing engine | live |
| **P7** | First entry + the reminder ask | live |
| **P8** | Deferred questions get their homes | live |
| **P9** | States, a11y, audit, DoD | live |

---

## P0 · Decisions before code

| # | Question | Blocks |
|---|---|---|
| **P0.1** | **Is `életszakasz` safety-critical enough to stay in the funnel?** (`40 §40.14 Q1`) A trainer's ruling. Changes the step count and the progress bar. | P1.3 |
| **P0.2** | **Palette** — rose or Eukaliptusz (`00 §0.1`). Still open. | All CSS |
| **P0.3** | Does step 3 collect **weekdays** or only a count? (`40 §40.14 Q4`) | P1.3, P3.4 |
| **P0.4** | Keep the **one-off products** on the new subscribe layout? | P6.2 |
| **P0.5** | **Free first workout** between the reveal and registration? | P1.5 |
| **P0.6** | Reminder channel — email or push (same question as `31 §P0.3`; answer once for both). | P7.2 |
| **P0.7** | Who owns building the **four deferred prompts** (focus, obstacle, life stage, age)? If nobody, they are dropped, not deferred — say so honestly. | P8 |

**Ask all seven in one message.** P0.1 and P0.3 are true blockers; the rest can be answered while P1 is in progress.

---

## P1 · The funnel, in dev, from a fixture

**Goal: all 11 screens look finished and navigate, with content from one obvious mock file.** No Firestore, no Stripe, no auth changes. This makes layout review fast and makes P4 a swap rather than a redesign.

### P1.0 — Tokens and icons

- `src/lib/icons.ts` — add what the funnel needs and the profile plan did not already add: `flame`, `chartColumn`, `moon`, `userRound`, `calendarCheck`, `dumbbell`, `eye`, `shield`, `chevronLeft`. (Several overlap with `31 §P1.0` — add each once.)
- **The level control's flames become `LxIcon` repeats**, not `"🔥".repeat(n)` with inline font sizes. One `<FlameRating n={1|2|3} />`.
- Confirm `--r-sm|md|lg`, `--sp-*`, `--dur-*` exist. No new literals.

### P1.1 — Route skeleton

```
src/app/onboarding/page.tsx        → rewritten: 8 pre-auth steps
src/app/onboarding/onb.css         → rewritten to the token set
src/app/onboarding/_mock.ts        → THE fixture (deleted in P4)
src/components/onboarding/…        → primitives (below)
```

Keep the existing page as `page.legacy.tsx` behind `NEXT_PUBLIC_ONB_V2` until P3 lands. **Delete flag and legacy file at the end of P3** — a funnel with two live implementations is how users get asked twice.

### P1.2 — Primitives

| File | Component |
|---|---|
| `components/onboarding/StepFrame.tsx` | back · progress · counter · scroll body · bottom-anchored CTA |
| `components/onboarding/StepProgress.tsx` | 5 segments, `role="progressbar"` |
| `components/onboarding/OptionRow.tsx` | icon tile · bold · sub · mark; radio **or** checkbox semantics |
| `components/onboarding/OptionList.tsx` | `role="radiogroup"` / checkbox group, arrow-key nav, exclusive-option handling |
| `components/onboarding/Segmented.tsx` | the 3/4/5/6 control |
| `components/onboarding/Whisper.tsx` | Alexa line — one component, used on 4 screens |
| `components/onboarding/PlanCard.tsx` | subscribe plan selector (used in P6) |

Reuse `WeekStrip` from `31 §P1.2` — **do not build a second week component.** If the profile work has not landed yet, build `WeekStrip` here to the `30 §30.3.3` spec and let the profile import it.

Rules: flex/grid `gap` only; token radii only; `tabular-nums` on prices and counts; 44px floor.

### P1.3 — The eight pre-auth screens

Welcome, five questions, why, reveal — per `40 §40.4`–`§40.5`, all content from `_mock`. Step 3 renders the live week preview from the selected count. Step index in the URL (`?q=`) so back/forward and refresh work from the very first commit.

### P1.4 — Auth, visually in the funnel (desktop)

Do not touch `AuthScreen.tsx` yet. Confirm the split-screen shell can host the funnel's right column — the brand panel is identical, so this is a CSS check, not a rebuild. If it needs a shared wrapper, extract one now and have both use it.

### P1.5 — Subscribe and first-entry, fixture-backed

Plan selector + fixed CTA + feature list, prices from `_mock` (real config comes in P6). First-entry hero and the reminder card as static markup.

### P1.6 — Interaction pass

Hover/focus/active (`00 §0.7`); step transitions ≤ `--dur-base`, opacity/transform only; `prefers-reduced-motion`; focus moves to the heading on step change.

**P1 definition of done**
- All 11 screens exist, translated per `40 §40.10` (solid borders, token radii, `LxIcon`, no emoji, no 8.5px labels).
- Forward and back work across all eight pre-auth steps, including browser back.
- All copy verbatim from `40 §40.11`.
- `_mock.ts` is the only content source; deleting it breaks the build.
- No console errors, no layout shift between steps.

---

## P2 · The draft store and the routing machine

**No visual change. Build and test this before the inversion, not during it.**

### P2.1 — The store

```ts
// src/lib/onboarding-draft.ts
const KEY = "lexfit_onb_v1";
interface Draft { v: 1; idx: number; answers: Partial<OnboardingAnswers>; startedAt: number }
export function readDraft(): Draft | null
export function writeDraft(d: Draft): void      // called on every answer change
export function clearDraft(): void
export function hasDraft(): boolean
```

- Guard every access in `try/catch` — Safari private mode throws on `localStorage`.
- Version field present from day one so a future shape change is a migration, not a corruption.
- **Do not migrate `lexfit_onb_v2` drafts** (`40 §40.8`): anyone holding one already has an account.

### P2.2 — The routing machine

One function, one place, used by every route guard:

```ts
// src/lib/funnel.ts
export type FunnelState = "anon" | "anon_draft" | "auth_new" | "auth_unpaid" | "auth_ready";
export function funnelDestination(state: FunnelState, requested: string): string | null
```

Implement the truth table in `40 §40.8` **exactly**, including the diagonal cases. Then unit-test it — all five states × four routes, twenty assertions. It is twenty lines of test that prevent the two worst bugs in this plan (a loop between `/onboarding` and `/subscribe`, and a paying user sent back through the questions).

### P2.3 — Wire the guards

`Protected` gains the funnel check; `/onboarding` becomes **public**. Leave the redirect destinations pointing at the current behaviour for now — P3 flips them in one commit.

- **P2 done when:** the tests pass, and a manual walk of all five user states lands where the table says, with the old flow still running.

---

## P3 · The inversion

**The riskiest phase. One commit, behind the flag, with a rollback path.**

| Step | Work |
|---|---|
| **P3.1** | `/onboarding` loses `<Protected>`. It renders for anonymous users, resuming from the draft |
| **P3.2** | The reveal CTA `Mentsük el a tervedet` → `/register` (no write yet — nothing to write to) |
| **P3.3** | `AuthScreen`'s redirect effect: after `ensureUserDoc`, if a draft exists → `saveOnboarding(uid, draft.answers)` → `clearDraft()` → `/subscribe`. If no draft and not onboarded → `/onboarding`. If onboarded → `funnelDestination` decides |
| **P3.4** | `saveOnboarding` writes the five collected answers plus the deferred fields as their blanks — **keep `OnboardingAnswers` intact** so nothing downstream breaks (`lib/user.ts` already writes the `why` / `experience` aliases; keep them). Add `weekdays` only if P0.3 says so |
| **P3.5** | Attachment failure handling: the draft is **not** cleared until the write resolves. On failure show the retry copy and retry in place — **never** send the user back through the questions |
| **P3.6** | Delete `page.legacy.tsx` and `NEXT_PUBLIC_ONB_V2` |

**Test these six paths by hand before merging:**
1. Cold browser → full funnel → register → answers in Firestore → `/subscribe`.
2. Cold browser → 3 questions → close tab → reopen → resumes on question 3.
3. Cold browser → funnel → at auth, **sign in to an existing onboarded account** → local draft discarded, straight to `/app` or `/subscribe`, **no re-asking**.
4. Register with the network cut at the attach step → error, retry, succeeds, draft cleared exactly once.
5. Already-paid user opens `/onboarding` → `/app`.
6. Registers, abandons before paying, returns days later → `/subscribe`, answers intact.

- **P3 done when:** all six pass, and `grep -rn "requireOnboarded" src/` shows the guards agree with the truth table.

---

## P4 · Real content in the funnel

Delete the fixture, one block at a time.

| Step | UI | Source |
|---|---|---|
| **P4.1** | The five questions' options | `STEP_OPTIONS` in `onboarding-data.ts` — **labels unchanged**, `ic` emoji replaced by `lxPaths` keys. Add an `icon` field; **remove `ic`** so no surface can fall back to emoji |
| **P4.2** | Per-step headings and subs | `STEP_COPY`, trimmed to the five kept steps + the new `why` copy |
| **P4.3** | The day counts | `DAYS` (3/4/5/6 with their labels) |
| **P4.4** | Step-3 week preview | `WEEK` (the canonical Foundation split), trimmed to the chosen count |
| **P4.5** | Reveal week + summary line | `WEEK` + the user's own `days`/`time`/`env`, composed — **not a static string** |
| **P4.6** | Reveal first workout | `loadFoundation()` → session 1: title, duration, `thumb`. **No hardcoded „22 PERC"** |
| **P4.7** | Welcome stats | `8 hét` / `200+` / `17 000+` — from config or constants, and **identical to the auth panel's** (single source, so they can never drift again) |

Then **delete `_mock.ts`.** The build must fail if anything imports it.

- **P4 done when:** `grep -rn "🔥\|💪\|🌱\|🧘\|📅" src/` returns nothing, and the reveal shows the real day-1 workout from the emulator.

---

## P5 · Auth delta

Three changes only. `AuthScreen.tsx` is otherwise correct — validation, the Hungarian error map, GDPR-unchecked marketing opt-in, persistence handling, forgot-password non-disclosure. **Do not refactor it.**

| Step | Work |
|---|---|
| **P5.1** | Brand panel figures (B7): `4 hét` → `8 hét`, `100+` → `200+`, `a közösségben` → `a csoportban`, and the `bsub` sentence to match. Same edit to `docs/design_handoff_auth/LEXFIT Auth.html` so the reference stops teaching the wrong numbers |
| **P5.2** | Destination change (done in P3.3) — verify `/register` and `/login` both route through `funnelDestination` |
| **P5.3** | Mobile: no brand panel, mark only. Confirms the below-940px stacking issue the auth handoff flagged is resolved by the funnel rather than by a media query hack |

Keep the password field. The wireframe's mobile auth card omits it; that is abbreviation, not spec (`40 §40.6`).

---

## P6 · Subscribe — new selection layer, same engine

**Do not rebuild `/subscribe`.** Its pricing derivation, consent step and server guard are correct and legally load-bearing. Restyle the selection layer above them.

| Step | Work |
|---|---|
| **P6.1** | Replace the three-card grid + per-card buttons with **radio-style `PlanCard`s + one fixed CTA** (`40 §40.7`). Annual pre-selected. `LEGNÉPSZERŰBB` badge, `SPÓROLJ {annualSavingsPct()}%` |
| **P6.2** | Carry the one-off products through as secondary text links, unchanged wording, **no strikethrough, no „kedvezmény"** (J4). Unless P0.4 says otherwise |
| **P6.3** | CTA label repeats the exact amount: `Előfizetek — {formatHuf(price)} / {period}`, recomputed on selection |
| **P6.4** | Every plan also shown per week, so `SPÓROLJ` is verifiable rather than a claim |
| **P6.5** | `Mi van benne` feature list + the community whisper below the fold |
| **P6.6** | The consent step is reached from the single CTA and is **otherwise untouched** |
| **P6.7** | Fix `seed/source/onb-data.jsx` (B10) — the stale `19 990 Ft / hó` matches no price in `PRICES`. Delete the figure or derive it |

- **P6 done when:** changing a price in `PRICES` changes every figure on the screen with no other edit; the consent checkboxes still gate the CTA; a real emulator checkout completes and `/app?sub=success` grants access via the existing confirm route.

---

## P7 · First entry and the reminder ask

| Step | Work |
|---|---|
| **P7.1** | First-workout hero on the first `/app` visit, with the whisper. Shown while `progress.doneCount === 0`, not via a separate flag |
| **P7.2** | The reminder card: time derived from the `time` answer (reggel `07:15` · napközben `12:30` · este `19:30`). `Beállítom` writes `prefs.reminders.workout` per `30 §30.4.3`, then requests OS permission if push is the channel (P0.6). `Most nem` dismisses |
| **P7.3** | **Dismissed once, never re-shown** — persist the dismissal in `prefs`, not `localStorage`, so it survives a device change. The setting stays reachable in Beállítások |
| **P7.4** | This closes the `31 §P3.2` seeding loop: the funnel now supplies `plan.weekdays`, `sessionLength`, `equipment` and the reminder time, instead of the prefs doc inventing them |

---

## P8 · The deferred questions get homes

**Only what P0.7 assigns an owner.** A "deferred" question with no home is a dropped question — say so rather than pretending.

| Question | Home |
|---|---|
| `focus` | An in-app prompt after week 1, when the user has context to answer well |
| `obstacle` | A check-in after the first missed week — where the answer can act |
| `lifestage` | At the point variations are offered (unless P0.1 moves it into the funnel) |
| `age` | Profile level, if analytics need it |

Each is one card in an existing screen, writing to the same `onboarding/profile` doc. Keep the fields in `OnboardingAnswers` regardless — removing them breaks `getOnboarding` consumers for no gain.

---

## P9 · States, accessibility, and the audit

### P9.1 — States
Steps 1–8 are local, so no loading state. The reveal skeletons the workout thumb and title. Attachment failure retries in place. Checkout cancellation returns with the plan intact and the copy from `40 §40.11`.

### P9.2 — Accessibility
`<fieldset>`/`<legend>` per step; radiogroup vs checkbox semantics matching single vs multi; arrow-key nav within a radiogroup; `role="progressbar"` with real values; focus to the heading on step change with `aria-live="polite"`; URL updates so back/forward work; back never disabled mid-funnel; 44px floor; consent checkboxes with visible associated labels, never pre-ticked.

### P9.3 — Audit

```bash
grep -rnE "19 990|39 900|5990|1990|490 Ft|767" src/ seed/    # prices must come from PRICES
grep -rnE "🔥|💪|🌱|🧘|📅|🎯|🍑|🦵|🔙|🧣|✨|🤰|🍼|🧷|🌿|🙂|👍|🌅|☀️|🌙|⏳|🌧️|❓|🤍|🔋" src/
grep -rn "4 hét\|100+ edzés\|a közösségben" src/ docs/       # stale auth figures
grep -rnE "border-radius:\s*(5|6|7|10|11|16|24)px" src/app/onboarding src/app/subscribe
grep -rn "_mock\|page.legacy\|ONB_V2" src/                    # must be empty
grep -rn "lexfit_onb_v2" src/                                 # must be empty
```

Then by hand, **from a genuinely cold browser** (new profile, no storage): complete the funnel end to end, pay in Stripe test mode, land on the first workout. Then do it again and abandon at each of the eight steps, returning each time. Nothing invented, nothing re-asked, nothing lost.

### P9.4 — Definition of done

**Structure**
- Order is onboarding → auth → checkout → app, on both breakpoints.
- Five questions, one per screen, with a visible end and a working back button.
- The reveal restates the user's own answers; the CTA names what registering protects.
- The auth page is used as built, with corrected figures.

**Data**
- Every price from `PRICES`; every renewal term at equal weight to the headline.
- Options, copy, week split and the first workout from `onboarding-data.ts` / `loadFoundation`. `_mock.ts` gone.
- Answers persist locally through the funnel and attach exactly once, idempotently.
- Welcome and auth-panel stats come from one shared source.

**Features that work end to end**
- Cold browser → paid first workout, with no dead ends.
- Resume after a close at any step.
- Existing-account sign-in mid-funnel never re-asks.
- Attachment failure is recoverable without losing answers.
- Checkout cancellation returns cleanly.
- The reminder ask pre-fills from `time`, writes real prefs, and never appears twice.
- Every route obeys the truth table for all five user states.

**Craft**
- No emoji anywhere in the funnel. Token radii only. No mono label below 10px.
- 44px floor; 52px+ option rows.
- Hungarian copy verbatim; new strings reviewed.
- Clean build, no console errors, no layout shift.

---

## P10 · What not to do while building this

- **Do not rebuild `/subscribe`'s pricing or consent logic.** It is J1/J2/J4-compliant and legally load-bearing. Restyle above it.
- **Do not redesign `AuthScreen.tsx`.** Three edits, listed in P5.
- **Do not write a second week-strip component.** One lives in `30 §30.3.3`.
- **Do not run two onboarding implementations past P3.** Users get asked twice.
- **Do not trust local answers for entitlement.** Access comes only from `hasAccessFromData`.
- **Do not delete deferred fields from `OnboardingAnswers`.**
- **Do not re-ask a refused permission.**
- **Do not invent prices, week counts, or library sizes.** If a number is not in config, it is a question, not a decision.

Anything the two specs do not cover: ask before deciding.
