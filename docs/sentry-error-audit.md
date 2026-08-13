# Sentry error audit — LEXFIT production

**Collected:** 2026-08-13 · **Source:** Sentry org `am-studios-group-kft`, project
`javascript-nextjs` (id `4511876550230096`) · **Window:** last 14 days · **Scope:** every
issue in the project (19 total, all `unresolved`) · **Users affected: 0 on all
production issues** (Sentry has no identified-user context wired, so this number is not
a reach signal).

This file is a snapshot. It records what Sentry reported — title, culprit, mechanism,
stack frames, device/browser spread, breadcrumbs, release — plus a label and a read on
what it actually means for LEXFIT. Nothing here has been fixed, resolved, or filtered in
Sentry; this is the inventory step only.

---

## Label taxonomy

| Label | Meaning | Action shape |
| --- | --- | --- |
| **L1 — Real app bug** | Our code, our stack frames, reproducible in principle | Fix in code |
| **L2 — In-app browser noise** | Thrown by Meta's injected webview scripts (Instagram/Facebook), not by LEXFIT | Filter at the SDK, don't fix |
| **L3 — Browser extension noise** | Thrown by a visitor's extension (MetaMask) | Filter at the SDK |
| **L4 — Vendor / quota failure** | Third-party service refused us — plan or credit limit | Ops/billing, not code |
| **L5 — Client connectivity** | User's network dropped mid-request | Handle gracefully, don't report |
| **L6 — Setup artifact** | Test events from wiring Sentry up | Resolve/delete |
| **L7 — UX signal** | Replay-derived behavioural signal, not an exception | Investigate as product |

## Summary table

Sorted by event volume.

| # | Short ID | Title | Label | Events | Route | First → Last seen |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | JAVASCRIPT-NEXTJS-A | `i: Failed to connect to MetaMask` | **L3** | 106 | `/admin/members` | 08-11 07:56 → 08-12 14:31 |
| 2 | JAVASCRIPT-NEXTJS-D | `Error invoking postMessage: Java object is gone` | **L2** | 17 | `/` | 08-12 07:43 → 08-13 01:50 |
| 3 | JAVASCRIPT-NEXTJS-C | `undefined is not an object (evaluating 'window.webkit.messageHandlers')` | **L2** | 15 | `/register`, `/` | 08-12 01:12 → 08-12 20:44 |
| 4 | JAVASCRIPT-NEXTJS-B | `reCAPTCHA has already been rendered in this element` | **L1** | 6 | `/`, `/register` | 08-11 23:49 → 08-13 06:13 |
| 5 | JAVASCRIPT-NEXTJS-G | `Hydration failed — the server rendered HTML didn't match the client` | **L1** | 4 | `/` | 08-12 08:54 → 08-13 00:15 |
| 6 | JAVASCRIPT-NEXTJS-F | `reCAPTCHA placeholder element must be an element or id` | **L1** | 3 | `/` | 08-12 08:54 → 08-12 13:41 |
| 7 | JAVASCRIPT-NEXTJS-E | `Error invoking postMessage: Java exception was raised…` | **L2** | 3 | `/` | 08-12 07:50 → 08-13 03:46 |
| 8 | JAVASCRIPT-NEXTJS-9 | `AbortError: play() was interrupted by pause()` | **L1** | 2 | `/player/:code` | 08-10 21:10 → 08-10 21:13 |
| 9 | JAVASCRIPT-NEXTJS-6 | `SendGrid 401: Maximum credits exceeded` | **L4** | 2 | `GET /api/cron/workout-reminders` | 08-10 05:21 → 08-10 16:51 |
| 10 | JAVASCRIPT-NEXTJS-K | `IDBDatabase: The database connection is closing` | **L1** | 1 | `/register` | 08-12 21:54 |
| 11 | JAVASCRIPT-NEXTJS-J | `undefined is not an object ('window.webkit.messageHandlers')` (2nd group) | **L2** | 1 | `/` | 08-12 14:37 |
| 12 | JAVASCRIPT-NEXTJS-H | `Error invoking enableDidUserTypeOnKeyboardLogging: Java object is gone` | **L2** | 1 | `/` | 08-12 14:19 |
| 13 | JAVASCRIPT-NEXTJS-8 | `FirebaseError: Failed to get document because the client is offline` | **L5** | 1 | `/app/challenges` | 08-10 20:48 |
| 14 | JAVASCRIPT-NEXTJS-7 | `Rage Click` on `button.fc-cta` | **L7** | 1 | `/player/F001?autostart=1` | 08-10 18:47 |
| 15 | JAVASCRIPT-NEXTJS-5 | `Failed to set 'currentTime'… non-finite` | **L1** | 1 | `/player/:code` | 08-09 17:12 |
| 16 | JAVASCRIPT-NEXTJS-4 | `Mux 400: Free plan is limited to 10 assets` | **L4** | 1 | `POST /api/mux/upload` | 08-09 14:22 |
| 17 | JAVASCRIPT-NEXTJS-3 | `LEXFIT Sentry setup verification — safe to resolve` | **L6** | 1 | — | 08-08 18:18 |
| 18 | JAVASCRIPT-NEXTJS-2 | `Sentry.captureException is not a function` | **L6** | 1 | `.sentry-verify.mjs` | 08-08 18:18 |
| 19 | JAVASCRIPT-NEXTJS-1 | `Object [object Object] has no method 'updateFrom'` | **L6** | 1 | Sentry demo event | 08-08 18:09 |

**Volume split:** 149 events total. 37 (25%) are Meta in-app browser noise (L2), 106
(71%) are one admin's MetaMask extension (L3). **Only 13 events out of 149 come from
LEXFIT's own code.**

## Release map

Sentry release SHAs seen in these events, resolved against git:

| Release | Commit |
| --- | --- |
| `2a8ffb4` | 2026-08-12 — Finish marquee: unblock the iOS repaint that froze the belt on phones **(current HEAD)** |
| `e74a4f8` | 2026-08-11 — Landing: reorder to a golden-thread spine, rebuild the hero |
| `e0624ac` | 2026-08-10 — Admin uploader: survive flaky networks better |
| `a104dd5` | 2026-08-10 — Fix finish-share surfaces hidden behind the fullscreen finish screen |
| `a36a580` | 2026-08-10 — TEMP diagnostics: `[finish-share]` logs |
| `dc4f6ae` | 2026-08-10 — Email imprint: real company data |
| `e874925` | 2026-08-10 — Enable Apple Pay / Google Pay in embedded Stripe Checkout |
| `4eaf2b7` | 2026-08-09 — Redeploy: activate GTM |
| `ae119ea` | 2026-08-09 — Remove one-off prod-wipe script |

---

# L1 — Real app bugs

## 4. `Error: reCAPTCHA has already been rendered in this element`

- **Short ID:** JAVASCRIPT-NEXTJS-B · **Issue:** `140167797` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140167797/)
- **Events:** 6 · **Status:** unresolved / new · **Level:** error · **Handled:** no (6/6)
- **First seen:** 2026-08-11 23:49 UTC · **Last seen:** 2026-08-13 06:13 UTC (most recent
  issue in the project)
- **Culprit:** `/` · **Mechanism:** `auto.browser.browserapierrors.setTimeout` (5),
  `auto.browser.global_handlers.onunhandledrejection` (1)
- **Routes:** `/register` (3), `/` (3) · **URLs:** `www.lexfit.hu/` (3),
  `www.lexfit.hu/register` (3)
- **Releases:** `2a8ffb4` (5), `e74a4f8` (1)

**Stack (latest event):**
```
node_modules/@sentry/browser/src/helpers.ts:116 in r
node_modules/@firebase/app-check/src/recaptcha.ts:96 in <anonymous>
app:///recaptcha/releases/XOqlk8PL_yVx6IdpLbpXdiLy/recaptcha__en.js:232 in ? [in-app]
```

**Device/browser spread (all 6 events):** Chrome Mobile 150 (2), Chrome 139 (2),
Chrome 151 (1), Facebook 573 (1) · Android 10 (2), Windows ≥10 (2), iOS 17.0.3 (1),
Linux (1) · devices: unnamed (3), `K` (2), `iPhone14,7` (1). Environment: production (6).

**Breadcrumbs (latest):** a run of RSC prefetches — `/onboarding?_rsc=…` ×2, three small
`GET`s, then `/login?_rsc=…`. So: the user is bouncing between `/`, `/onboarding`,
`/login`, `/register` while App Check tries to render reCAPTCHA.

**Read:** Firebase App Check (`ReCaptchaV3Provider`, `src/lib/firebase.ts:47`) is
initialising reCAPTCHA into a container that already holds a rendered widget. The
`globalThis.__LEXFIT_APPCHECK__` guard prevents a second `initializeAppCheck` call in one
page context, but it does not survive what these events show: fast client-side navigation
between auth-adjacent routes plus reCAPTCHA's own deferred `setTimeout` render. This is
ours, it is the only L1 still firing today, and it sits directly on the signup path.

## 6. `Error: reCAPTCHA placeholder element must be an element or id`

- **Short ID:** JAVASCRIPT-NEXTJS-F · **Issue:** `140230694` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140230694/)
- **Events:** 3 · **Status:** unresolved / new · **Handled:** no (3/3)
- **First seen:** 2026-08-12 08:54 UTC · **Last seen:** 2026-08-12 13:41 UTC
- **Culprit:** `/` · **Mechanism:** `auto.browser.global_handlers.onunhandledrejection` (3)
- **Release:** `2a8ffb4` (3) · **URL:** `www.lexfit.hu/` (3)

**Stack (latest event):**
```
node_modules/@firebase/app-check/src/recaptcha.ts:96 in q/<
app:///recaptcha/releases/XOqlk8PL_yVx6IdpLbpXdiLy/recaptcha__hu.js:231 in D< [in-app]
```

**Device/browser spread:** Firefox 115 / Windows 8.1 (1), Facebook 495.1 / iOS 16.7.15
(1), Instagram 422.1 / iOS 16.7.16 (1) — all older clients. Devices: `iPhone10,4` (2).

**Breadcrumbs (latest):** `navigation / → /` then a filtered cookie/query entry. Nothing
else — this fires early, before the page does real work.

**Read:** Same root cause as #4, same `recaptcha.ts:96` frame — the App Check reCAPTCHA
container is missing or has been swapped out by the time the widget script runs. Note the
Hungarian bundle (`recaptcha__hu.js`) here vs the English one in #4; that is only locale.
**Fix #4 and #6 together — they are one defect with two failure modes.**

## 5. `Hydration Error — Hydration failed, the server rendered HTML didn't match the client`

- **Short ID:** JAVASCRIPT-NEXTJS-G · **Issue:** `140230708` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140230708/)
- **Events:** 4 · **Status:** unresolved / new · **Type:** `generic` (Sentry's own
  hydration detector, not an exception) · **Unhandled:** no
- **First seen:** 2026-08-12 08:54 UTC · **Last seen:** 2026-08-13 00:15 UTC
- **Culprit:** `https://www.lexfit.hu/` · **Release:** `2a8ffb4` (4)

**Evidence:** Sentry captured **no hydration diff** for this issue — `evidenceDisplay` and
`evidenceData` are both empty, and the event has no entries. The only payload is the
subtitle. There is nothing in Sentry that names the mismatched element.

**Device/browser spread (all 4):** Firefox 115 (1), Facebook 495.1 (1), Facebook 573 (1),
Instagram 422.1 (1) · iOS 16.7.15, iOS 17.0.3, iOS 16.7.16, Windows 8.1 · devices
`iPhone10,4` (2), `iPhone14,7` (1). URLs: `www.lexfit.hu/` (3), plus one with an
`fbclid=PAcGRvZgJmZGlk…` Facebook click ID.

**Read:** The client mix is the tell — **every event is either a Meta in-app browser or
Firefox 115 ESR on Windows 8.1**, and one carries an `fbclid`. Meta's webviews inject
their own DOM/scripts into the page, which routinely trips React hydration on the landing
page. This is likely environmental rather than a genuine server/client markup divergence,
but with no diff captured that is inference, not proof. To settle it: reproduce `/` inside
the Instagram in-app browser, or enable the Sentry hydration-diff capture.

## 8. `Error: AbortError: The play() request was interrupted by a call to pause()`

- **Short ID:** JAVASCRIPT-NEXTJS-9 · **Issue:** `139936985` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139936985/)
- **Events:** 2 · **Status:** unresolved / new · **Handled:** no · **DOMException.code:** 20
- **First seen:** 2026-08-10 21:10 UTC · **Last seen:** 2026-08-10 21:13 UTC (3 minutes
  apart — one session)
- **Culprit:** `/player/:code` · **Mechanism:**
  `auto.browser.global_handlers.onunhandledrejection`
- **Releases:** `a104dd5` (1), `a36a580` (1) — both the 2026-08-10 finish-share work
- **URLs:** `www.lexfit.hu/player/F003` (1), `/player/F004` (1)
- **Client:** Chrome 150 on macOS ≥10.15.7 (2/2) — a desktop session, almost certainly
  internal testing

**Stack:** no frames (rejection surfaced without a usable stack). Message:
`AbortError: The play() request was interrupted by a call to pause(). https://goo.gl/LdLk22`

**Breadcrumbs (latest):** Mux chunk XHRs (1.8 MB, 82 KB), a GA collect, then
`ui.click → div.pf-ctl > div.pf-chapwrap > div.pf-chaps > span.sg` (a **chapter/segment
click in the player controls**), then more chunk + manifest fetches.

**Read:** Classic `play()`/`pause()` race — clicking a chapter marker seeks and re-plays
while the previous `play()` promise is still pending. `togglePlay()` in
`src/app/player/[code]/page.tsx` calls `el.play()` without catching the returned promise,
so the rejection escapes to `onunhandledrejection`. Cosmetic for the user, trivially
silenced by awaiting/catching the `play()` promise. Not seen since 08-10.

## 10. `InvalidStateError: Failed to execute 'transaction' on 'IDBDatabase': The database connection is closing`

- **Short ID:** JAVASCRIPT-NEXTJS-K · **Issue:** `140369214` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140369214/)
- **Events:** 1 · **Status:** unresolved / new · **Handled:** no · **DOMException.code:** 11
- **Seen:** 2026-08-12 21:54 UTC · **Culprit:** `/register` · **Release:** `2a8ffb4`
- **Mechanism:** `auto.browser.global_handlers.onunhandledrejection`
- **Client:** Instagram 442.0.0 in-app browser, `iPhone15,2`, iOS 26.6

**Stack:**
```
node_modules/@firebase/auth/src/platform_browser/persistence/indexed_db.ts:203 in tq._withRetries
node_modules/@firebase/auth/src/platform_browser/persistence/indexed_db.ts:362 in e
node_modules/@firebase/auth/src/platform_browser/persistence/indexed_db.ts:77  in tU
[native code] in transaction
```

**Breadcrumbs:** `navigation /register → /register`, then a reCAPTCHA `api2/clr` POST and
a 2.3 KB POST — i.e. App Check activity on the register screen, then teardown.

**Read:** Firebase Auth's IndexedDB persistence layer tried a transaction while the
in-app browser was tearing the page down (IG webviews aggressively suspend/kill pages).
Firebase already retries internally (`_withRetries`), so the user impact is probably
nil — but it lands on `/register`, on the same iOS-webview surface as the L2 noise, and
if it ever fires before sign-in completes it would drop auth persistence. Watch it; only
1 event so far.

## 15. `TypeError: Failed to set the 'currentTime' property on 'HTMLMediaElement': The provided double value is non-finite`

- **Short ID:** JAVASCRIPT-NEXTJS-5 · **Issue:** `139701519` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139701519/)
- **Events:** 1 · **Status:** unresolved / new · **Handled:** no
- **Seen:** 2026-08-09 17:12 UTC · **Culprit:** `/player/:code` · **Release:** `ae119ea`
- **Mechanism:** `auto.browser.global_handlers.onerror`
- **URL:** `www.lexfit.hu/player/F001` · **Client:** Chrome 150 on macOS (desktop)

**Stack — the only issue with a direct in-app frame in our own source:**
```
react-dom-client.production.js:1609  in batchedUpdates$1
react-dom-client.production.js:14152 in JSCompiler_inline_result
react-dom-client.production.js:13624 in processDispatchQueue
src/app/player/[code]/page.tsx:325   in tu   [in-app]      ← ours
@mux/mux-player/dist/base.mjs:2      in set Av.currentTime
castable-video/castable-mixin.js:347 in set r
custom-media-element/dist/custom-media-element.js:164 in i.set
```

**Breadcrumbs:** Mux chunk XHRs (~975 KB), a Firestore POST, more chunks, then
`ui.click → div.pf-ctl > div.pf-crow > div.pf-mid > button.pf-btn > svg` — a **click on
a centre transport button in the player controls**.

**Read:** A seek ran with a non-finite value — `NaN`/`Infinity` reached
`el.currentTime`, meaning `dur` (or a computed block/stamp offset) was not a real number
at click time. `seekTo` guards with `if (el && dur)`, so the bad path is a different
caller (a chapter/stamp jump computed from block starts). This is the same family as the
already-fixed player-stamps NaN bug. Single event on an 08-09 release; likely already
addressed, but the guard is worth confirming — clamp every seek through one
`Number.isFinite` check.

---

# L2 — Meta in-app browser noise (Instagram / Facebook webviews)

**These are not LEXFIT bugs.** Every frame belongs to scripts Meta injects into pages
opened inside the Instagram/Facebook app: `app://navigation_performance_logger_android`
and the iOS equivalent at `app:///`. Their functions (`sendDataToNative`,
`sendBeforeUnloadMessage`, `sendPageHideMessage`, `_handleBrowserPreparingToClose`) all
fail the same way — the webview tears down the native bridge while the logger is still
posting to it. Sentry's SDK catches them via global handlers because they are thrown in
our page's context, and marks them `in-app` because the `app://` scheme fools the
in-app-frame classifier.

**36 of 149 events (24%) are this.** They will keep growing as long as Instagram is a
traffic source — and given `/` and `/register` dominate the routes, IG/FB is clearly a
major acquisition channel.

**Recommended:** drop them at the SDK with a `beforeSend` / `ignoreErrors` /
`denyUrls` rule in `src/instrumentation-client.ts` rather than resolving them in the UI
(resolved issues will just reopen). Match on the `app://navigation_performance_logger_*`
and `app:///` filenames, or on the message strings below.

## 2. `Error: Error invoking postMessage: Java object is gone` — 17 events

- **Short ID:** JAVASCRIPT-NEXTJS-D · **Issue:** `140215325` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140215325/) ·
  **substatus: escalating** (the only escalating issue in the project)
- 2026-08-12 07:43 → 2026-08-13 01:50 UTC · release `2a8ffb4` (17) · handled: no (17)
- **Mechanism:** `auto.browser.global_handlers.onerror` (11),
  `auto.browser.browserapierrors.addEventListener` (6)
- **Routes:** `/` (15), `/register` (2)
- **Browsers:** Instagram 441 (9), Facebook 573 (4), Instagram 440.1 (1), Instagram 442 (1)
- **OS:** Android 16 (13), Android 15 (2), Android 13 (1), Android 12 (1)
- **Devices:** Samsung SM-A556B, SM-S928B, SM-S942B, Motorola edge 50 neo, Xiaomi
  2312DRAABG, 24069PC21G — a broad real-user Android spread
- **Stack:** `app://navigation_performance_logger_android:1` in `?` →
  `sendJsBlockingTimeMessage` → `sendDataToNative`
- **Breadcrumbs of note:** landing hits carrying `?fbclid=PAcGRvZgJle…`, a
  `console.info FBNavINP:296` (Meta's own INP logger), and —
  **worth flagging separately** — `@firebase/app-check: Requests throttled due to
  previous 403 error. Attempts allowed again after 01d:00m:00s`.

## 3. `TypeError: undefined is not an object (evaluating 'window.webkit.messageHandlers')` — 15 events

- **Short ID:** JAVASCRIPT-NEXTJS-C · **Issue:** `140172804` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140172804/)
- 2026-08-12 01:12 → 2026-08-12 20:44 UTC · release `2a8ffb4` (15) · handled: no (15)
- **Mechanism:** `auto.browser.global_handlers.onerror` (15)
- **Routes:** `/` (13), `/register` (2) · **Devices:** iPhone only (15) —
  `iPhone14,5`, `iPhone16,1`, `iPhone14,4`, `iPhone14,7`, `iPhone18,1`
- **Browsers:** Instagram 440 (5), 439 (3), 438 (2), 435.1 (1)… · **OS:** iOS 26.5.2 (7),
  iOS 26.6 (7), iOS 27.0 (1)
- **Stack:** `app:///:1` in `?` → `sendPageHideMessage` → `sendDataToNative`
- **Breadcrumbs (latest) — this one is useful product data:**
  `ui.click div.pgs-hero > div.pgs-content > h2.pgs-title` →
  `GET /register?_rsc=…` → `navigation /onboarding → /register` →
  `ui.click main.fnl-col > … > button.fnl-cta` →
  `navigation /register → /register?q=1`. A **real user walking the onboarding funnel
  into the register wizard from the Instagram app**, with Meta's logger throwing on every
  page-hide along the way.

## 11. `TypeError: undefined is not an object ('window.webkit.messageHandlers')` — 1 event (second grouping)

- **Short ID:** JAVASCRIPT-NEXTJS-J · **Issue:** `140311890` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140311890/)
- 2026-08-12 14:37 UTC · release `2a8ffb4` · Instagram 428.1.0, `iPhone18,1`, iOS 26.6
- **Stack:** `app:///:1` in `?` → `M` → `T` — same error as #3, different minified frame
  names, so Sentry fingerprinted it separately.
- **Breadcrumbs:** RSC prefetches for `/login`, a reCAPTCHA `api2/clr` POST, a 2.2 KB POST
  returning 200.
- **Note:** merge this into #3 when filtering; one rule kills both.

## 7. `Error: Error invoking postMessage: Java exception was raised during method invocation` — 3 events

- **Short ID:** JAVASCRIPT-NEXTJS-E · **Issue:** `140217042` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140217042/)
- 2026-08-12 07:50 → 2026-08-13 03:46 UTC · release `2a8ffb4` (3) · handled: no
- **Client:** Instagram 442.0.0 (3), Android 16 (3) · devices Samsung `SM-S931B`,
  `SM-A566B`, Xiaomi `23090RA98G` · route `/` (3)
- **Stack:** `<anonymous>` ×2 → `window._handleBrowserPreparingToClose` →
  `sendBeforeUnloadMessage` → `sendDataToNative`
- **Breadcrumbs — two things worth extracting:**
  1. `ui.click div.lx-consent-btns > button.lx-consent-yes` — the **cookie consent
     banner works and users accept it**.
  2. `@firebase/app-check: 403 error. Attempts allowed again after 01d:00m:00s`, then
     `Requests throttled due to previous 403 error` — see the cross-cutting note below.

## 12. `Error: Error invoking enableDidUserTypeOnKeyboardLogging: Java object is gone` — 1 event

- **Short ID:** JAVASCRIPT-NEXTJS-H · **Issue:** `140308186` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140308186/)
- 2026-08-12 14:19 UTC · release `2a8ffb4` · Instagram 437.0.0, Huawei `Honor ABR-NX1`,
  Android 16 · route `/`
- **Stack:** `app://navigation_performance_logger_android:1` in `?` →
  `sendBeforeUnloadMessage`
- **Breadcrumbs:** nothing but Meta's own `FBNavLargestContentfulPaint` /
  `FBNavFirstContentfulPaint` console spam, repeated 7×.
- **Note:** the function name says it all — Meta's **keyboard-logging** hook. Nothing of
  ours is involved.

---

# L3 — Browser extension noise

## 1. `i: Failed to connect to MetaMask` — 106 events (71% of all volume)

- **Short ID:** JAVASCRIPT-NEXTJS-A · **Issue:** `140005668` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/140005668/)
- 2026-08-11 07:56 → 2026-08-12 14:31 UTC · **Events:** 106 · **Handled:** yes (106)
- **Mechanism:** `auto.core.linked_errors` (106) — chained from an
  `onunhandledrejection`
- **Client:** Chrome 151.0.0 (106/106), Windows ≥10 (106/106) — **one machine**
- **Releases:** `2a8ffb4` (102), `e0624ac` (4)
- **Routes:** `/admin/members` (66), `/admin/members/:uid` (16), `/admin` (10), `/` (10)
- **URLs:** `www.lexfit.hu/admin/members` (68), `/admin` (12), `/` (10),
  `/admin/members/HMAZxMRJE9WlwmX9WFwHdYynk2k1` (6)

**Two chained exceptions:**
```
Error: MetaMask extension not found
  app:///scripts/inpage.js:4 in ? [in-app]
i: Failed to connect to MetaMask
  app:///scripts/inpage.js:7 in Object.connect [in-app]
```

**Breadcrumbs:** `navigation /admin → /admin/members` → GA collect →
`GET /api/admin/users` 200 → `console.debug "Provider initialization - wallet not
connected"` → `console.warning "Error restoring session i: Failed to connect to
MetaMask"` ×2.

**Read:** A crypto-wallet browser extension (`inpage.js` is MetaMask's injected script)
on **the admin's own Windows/Chrome browser** retries a wallet connection on every admin
page view. LEXFIT has no wallet code whatsoever. This single extension produces **71% of
the project's entire error volume** and is drowning out real signal. Filter it (`denyUrls`
on `inpage.js`, or ignore `Failed to connect to MetaMask`) — this is the highest-value
noise cleanup available.

---

# L4 — Vendor / quota failures

## 9. `Error: SendGrid 401: {"errors":[{"message":"Maximum credits exceeded"}]}` — 2 events

- **Short ID:** JAVASCRIPT-NEXTJS-6 · **Issue:** `139759952` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139759952/)
- 2026-08-10 05:21 → 2026-08-10 16:51 UTC · **Handled:** no · **Platform:** node
- **Culprit / transaction:** `GET /api/cron/workout-reminders` · **Release:** `4eaf2b7`
- **Runtime:** node v20.20.2, Linux, `server_name 169.254.58.195` (Vercel lambda) ·
  caller UA `curl 8.5.0` (Vercel Cron)

**Stack:**
```
next-server/app-route-turbo.runtime.prod.js:1 in rJ.handleResponse
next/src/build/templates/app-route.ts:347   in responseGenerator
next-server/app-route-turbo.runtime.prod.js:5 in rJ.handle / rJ.do
src/app/api/cron/workout-reminders/route.ts:88 in GET        [in-app]   ← ours
node:internal/process/task_queues:95 in process.processTicksAndRejections
src/lib/email.ts:46 in sendEmail                             [in-app]   ← ours
```

**Read:** The **SendGrid free-tier credit limit was hit and the workout-reminder cron
died mid-loop.** `route.ts:88` is the `await sendWorkoutReminder(...)` / `sendStreakRisk`
call inside the per-user loop — an unhandled throw there aborts the whole run, so
**every user after the failing one got no reminder and no `mRef.set(...)` marker**. Two
distinct cron runs failed this way.

Business impact, not a crash: the email programme silently stops when credits run out.
Two things to do — (a) resolve the SendGrid plan/credits, (b) wrap the per-user send in
try/catch so one failure cannot abort the remaining recipients. Not seen since 08-10.

## 16. `Error: 400 {"error":{"type":"invalid_parameters","messages":["Free plan is limited to 10 assets, you cannot create direct uploads while exceeding this limit"]}}` — 1 event

- **Short ID:** JAVASCRIPT-NEXTJS-4 · **Issue:** `139686141` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139686141/)
- 2026-08-09 14:22 UTC · **Handled:** no · **Platform:** node · **Release:** `ae119ea`
- **Culprit / transaction:** `POST /api/mux/upload` · URL
  `www.lexfit.hu/api/mux/upload` · client Chrome 150 on macOS (the admin)

**Stack:**
```
next-server/app-route-turbo.runtime.prod.js:5 in rJ.handle / rJ.do
src/app/api/mux/upload/route.ts:22 in POST            [in-app]   ← ours
node:internal/process/task_queues:95
@mux/mux-node/src/client.ts:565 in tp.makeRequest
@mux/mux-node/src/client.ts:345 in tp.makeStatusError
@mux/mux-node/src/core/error.ts:51 in _.generate
```

**Read:** **The Mux account is on the free plan and is at its 10-asset ceiling — no
further video uploads can be created.** This is a hard launch blocker for content
authoring through the Phase 7 admin, and it is an account/billing action, not a code
change. The route surfaced it correctly.

---

# L5 — Client connectivity

## 13. `FirebaseError: Failed to get document because the client is offline` — 1 event

- **Short ID:** JAVASCRIPT-NEXTJS-8 · **Issue:** `139934657` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139934657/)
- 2026-08-10 20:48 UTC · **Handled:** no · **Release:** `e874925`
- **Route:** `/app/challenges` · **Client:** Mobile Safari 26.2, iPhone, iOS 18.7
- **Mechanism:** `auto.browser.global_handlers.onunhandledrejection`

**Stack:**
```
node_modules/@sentry/browser/src/helpers.ts:116 in r
node_modules/@firebase/firestore/src/util/async_observer.ts:65 in event
node_modules/@firebase/firestore/src/core/firestore_client.ts:706 in eventManager.next
```

**Breadcrumbs:** `navigation /app/challenges → /app/challenges`, a GA collect, then
**three `fetch|error` POSTs to a `[Filtered]` URL** (Firestore, scrubbed by Sentry's data
scrubber) and a `console.error [Filtered]`.

**Read:** The user's network dropped while `/app/challenges` was reading Firestore.
Not a code defect. If it recurs at volume it is worth catching the offline case and
showing a Hungarian "nincs kapcsolat" state rather than letting it reach Sentry.

---

# L6 — Setup artifacts (safe to resolve/delete)

## 17. `Error: LEXFIT Sentry setup verification — safe to resolve`

- **Short ID:** JAVASCRIPT-NEXTJS-3 · **Issue:** `139599068` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139599068/)
- 2026-08-08 18:18 UTC · environment **`setup-verification`** · 1 user (by IP)
- The title says it: a deliberate test event from wiring Sentry up. **Resolve.**

## 18. `TypeError: Sentry.captureException is not a function`

- **Short ID:** JAVASCRIPT-NEXTJS-2 · **Issue:** `139599051` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139599051/)
- 2026-08-08 18:18 UTC · **Level: fatal** · environment `setup-verification`
- Culprit `?(.sentry-verify)`; stack ends at
  **`/Users/mark/lexfit_app/.sentry-verify.mjs:3`** on `Gorgei-MacBook-Air.local`,
  node v20.19.5, macOS 26.5.2. Mechanism `auto.node.onuncaughtexception`.
- A local throwaway verification script that called the API wrong. Nothing to do with
  production. **Resolve.** (Its `fatal` level makes the project look worse than it is.)

## 19. `TypeError: Object [object Object] has no method 'updateFrom'`

- **Short ID:** JAVASCRIPT-NEXTJS-1 · **Issue:** `139598319` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139598319/)
- 2026-08-08 18:09 UTC · tag **`sample_event: yes`**, URL `http://example.com/foo`,
  Chrome 65 / macOS 10.13.4, message *"This is an example Next.js exception"*
- **Sentry's own onboarding demo event.** Not real. **Resolve.**

---

# L7 — UX signal

## 14. `Rage Click` on `button.fc-cta`

- **Short ID:** JAVASCRIPT-NEXTJS-7 · **Issue:** `139919853` ·
  [permalink](https://am-studios-group-kft.sentry.io/issues/139919853/)
- 2026-08-10 18:47 UTC · **Type:** `generic` (Session Replay detector, not an exception)
- **URL:** `www.lexfit.hu/player/F001?autostart=1` · Chrome 151, Windows ≥10 ·
  release `dc4f6ae`

**Evidence captured by Sentry:**
```
Clicked Element: button#.fc-cta  (no aria-label, no role, no title, no text content)
Selector Path:   div.pf-main > div.pf-stage > div.fc > div.fc-inner > button.fc-cta
```
`evidenceData` confirms `tagname: button`, `class: fc-cta`, **`textcontent: ""`** and every
accessibility attribute empty.

**Read:** Someone clicked the **finish-screen CTA (`fc-cta`) repeatedly and nothing
happened.** This is the exact symptom behind the 08-10 finish-share work (`a104dd5`
"Fix finish-share surfaces hidden behind the fullscreen finish screen", `a36a580` TEMP
diagnostics) and the later `1eb91e0` "Finish in fullscreen: auto-exit so the completion
screen actually shows". The rage click is on release `dc4f6ae`, before that final fix —
**so this is most likely already resolved.** Verify once on the current build, then
resolve.

Two things this also exposes, independent of the bug: the button has **empty text content
and no `aria-label`**, so it is unlabelled for screen readers.

---

# Cross-cutting observations

These are not issues in their own right — they surfaced inside other issues' breadcrumbs
and are worth acting on.

### Firebase App Check is returning 403 in production and getting throttled for 24h

Seen in the breadcrumbs of **#2** and **#7**, on real Android in-app-browser sessions:

```
[2026-08-13T03:45:46.783Z] @firebase/app-check: AppCheck: 403 error.
                            Attempts allowed again after 01d:00m:00s
[2026-08-13T01:50:17.666Z] @firebase/app-check: AppCheck: Requests throttled due to
                            previous 403 error. Attempts allowed again after ...
```

App Check is currently **live but unenforced**, so this is not breaking users today. Once
enforcement is switched on, a 403 + 24-hour client-side throttle would lock those sessions
out of Firestore/Auth entirely. The reCAPTCHA render failures in **#4** and **#6** are
plausibly the same story from the other end: if the widget never renders, no valid App
Check token is ever minted. **Resolve the reCAPTCHA render bug before enforcing App
Check.**

### The error profile is dominated by traffic from Instagram

`/` and `/register` inside Instagram/Facebook webviews account for essentially all L2
volume, across a wide spread of real Android and iPhone devices and IG app versions
428–442. That is a real acquisition channel, and it is also the harshest runtime LEXFIT
has to survive (aggressive page suspension, injected DOM, teardown mid-request). Both #10
(IndexedDB closing) and #5 (hydration) are in-app-browser-only symptoms.

### Sentry has no user identity attached

Every production issue reports **0 users**. `Sentry.setUser()` is never called, so there is
no way to tell whether 17 events are 17 people or one person 17 times. Wiring the Firebase
uid into Sentry after sign-in would make every future triage far cheaper.

### Source maps are not uploaded

Frames like `app:///:1 in T` and `page.tsx:325 in tu` show minified function names.
`next.config.ts` already wraps with `withSentryConfig`, but `SENTRY_AUTH_TOKEN` /
`SENTRY_ORG` / `SENTRY_PROJECT` are not set locally — so releases upload no source maps.
Setting them in Vercel would make the L1 stacks directly readable.

---

# Suggested triage order

Nothing below has been done — this is the recommendation, not a changelog.

1. **Filter the noise first (L3 + L2).** One `beforeSend`/`ignoreErrors`/`denyUrls` block
   in `src/instrumentation-client.ts` removes 142 of 149 events (95%) and makes the
   project readable. Target `inpage.js` / "Failed to connect to MetaMask",
   `app://navigation_performance_logger_*`, and the `webkit.messageHandlers` /
   `postMessage: Java object is gone` families.
2. **Fix the reCAPTCHA / App Check render bug (#4 + #6).** Only L1 still firing today,
   sits on `/` and `/register`, and blocks safe App Check enforcement.
3. **Clear the vendor blockers (#9 SendGrid credits, #16 Mux free-plan asset cap).** Both
   are launch blockers and neither is a code change; also wrap the cron's per-user send in
   try/catch so one failure cannot abort the rest of the run.
4. **Resolve the three setup artifacts (#17, #18, #19).**
5. **Verify #14 rage click is dead on the current build**, then resolve; add an
   `aria-label` to `button.fc-cta` regardless.
6. **Harden the player (#8, #15):** catch the `play()` promise; clamp every seek through
   `Number.isFinite`.
7. **Watch (#5 hydration, #10 IndexedDB, #13 offline)** — all in-app-browser or network
   symptoms, low volume, no action until they recur.
8. **Improve the instrumentation:** `Sentry.setUser()` after sign-in; set
   `SENTRY_AUTH_TOKEN`/`ORG`/`PROJECT` in Vercel for source maps.
