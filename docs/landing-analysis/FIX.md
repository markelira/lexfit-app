# Landing FIX tracker

Implementation log for the landing-analysis recommendations
(`00-recommendations.md`). Owner-approved sequence (2026-08-07):
**Stage 1** truth purge (six false claims) + CLAUDE.md refresh →
**Stage 2** market-gap fixes (02) → **Stage 3** UX/UI fixes (03).

Status legend: [x] done · [ ] open · [A] blocked on owner asset/decision.
All three stages implemented 2026-08-07 (typecheck clean, verified live on
localhost desktop; on-device mobile pass still pending — see 3.12).

## Stage 1 — false-claim purge (P0) — DONE

- [x] 1.1 Health/Naptár sync claim deleted; progress panel rewritten around
      honest Mux-verified completion ("a pipát nem lehet átpörgetéssel
      megszerezni")
- [x] 1.2 Badges section deleted (first replaced with a 4-card consistency-
      mechanics section; owner removed that too on 2026-08-07 — the false
      claim is gone and the page has no badge/mechanics band at all now)
- [x] 1.3 Recipes panel + 14-tile carousel + nav link + showcase slide
      deleted; showcase slide 4 now Kihívások
- [x] 1.4 Follow-along paragraph rewritten: Alexa singular, real themes,
      no weekly-drop claim, velem/lennének grammar fixed
- [x] 1.5 "Korlátlan lehetőség" replaced with Kihívások section
      (`#kihivasok`) using the 8 real seeded challenges (title · days · mins)
- [x] 1.6 Coverflow caption reworded ("Minden napra más edzés…", no
      "Naplózz", no "új listák hétről hétre")
- [x] 1.7 CLAUDE.md refreshed: women-first → women and men, don't gender copy
- [A] 1.8 Seed phase bug (`const phase = w` vs 2-phase intent in
      `prog-data.jsx` comments) — owner call: fix seed builder or landing
      copy; ALSO journey weekday strip still shows H-K-Sze-Cs-P vs real
      H-K-Cs-P-Szo split (`prog-data.jsx:21-29`)

## Stage 2 — market-gap fixes (02) — DONE (code side)

- [x] 2.1 Quiz CTA: `CTA_START = "/onboarding"`; hero CTA "Összeállítom a
      tervem"; "Belépés" added to hero nav; sticky + pricing-foot CTAs
      updated
- [x] 2.2 Founder intro moved after app intro (top third) + credential chips
      (10 év versenysport · 17 000+ közösség · minden edzést ő vezet);
      finale stays late; finale CTA → "Kezdjük együtt →" to /onboarding
- [x] 2.3 FAQ section `#gyik` (6 honest items incl. YouTube objection,
      férfiaknak is?, lemondás, TV/böngésző) with styled `<details>`
- [x] 2.4 Audience line in hero ("Nőknek és férfiaknak, minden szinten.")
- [x] 2.5 Guarantee wording → "14 napos elállási jog" (hero trust, price
      trust row, AuthScreen, OnboardingV2 paywall)
- [x] 2.6 Payment trust → "Biztonságos bankkártyás fizetés · Visa ·
      Mastercard" (Stripe demoted from trust word)
- [x] 2.7 OG/Twitter metadata + honest description in `src/app/page.tsx`
      (old description claimed "200+ edzés" — removed); share image still
      needed (see 2.13)
- [x] 2.8 "Válassz egy programot" → "Kezdd el a programot"; Foundation
      cap-body/facts now "heti 5 napra tervezve, de te választod" + "a te
      napjaidon" chip (5-nap-hét chip removed)
- [x] 2.9 Cast section leads with "A LEXFIT a böngészőben fut — nem kell
      letölteni semmit"
- [x] 2.10 Coverflow sample titles de-feminized ("Erős kar & váll")
- [A] 2.11 Legal footer: ÁSZF/Adatvédelem/impresszum — **needs real legal
      content + Kft. details from owner; links still `href="#"`. BLOCKER
      before paid traffic**
- [A] 2.12 Named member quotes with photos (collect from FB community)
- [A] 2.13 Real Alexa photography (hero, founder chapters, panels) + a
      1200×630 OG share image (TODO comment left in page.tsx)
- [ ] 2.14 Later (P3): comparison table, community section, activity
      counters, cohort dates, click-to-play video

## Stage 3 — UX/UI fixes (03) — DONE (desktop-verified)

- [x] 3.1 Smooth anchor scroll (`html:has(.lxl)`, PRM-guarded) +
      `scroll-margin-top: 92px` on anchored sections
- [x] 3.2 Sticky nav: benefit labels (Edzések · Program · Kihívások ·
      Bemutató · Árak), pill bg .6 → .74 for dark bands, mobile variant
      (links hidden ≤760px)
- [x] 3.3 Mobile sticky bottom CTA bar (`.mcta`: offer + CTA, ≤760px,
      appears with the sticky nav)
- [x] 3.4 Coverflow: 1:1 pointer drag with velocity projection
      (decel .998, ±3 card clamp), 6px hysteresis, drag-vs-tap guard,
      ArrowLeft/Right keyboard, focus ring, `user-select: none`,
      auto-advance pauses while dragging
- [x] 3.5 Journey day rows are real `<button>`s (click jumps the tour,
      aria-labels, focus ring)
- [x] 3.6 Price-anchor count-up (900ms ease-out cubic, fires once at 60%
      visibility, static under PRM); fixed `.pa-num span` selector leak
      onto the CountUp span (`> span`)
- [x] 3.7 Type floor: hero trust line 11px/.6 → 12.5px/.78
- [x] 3.8 Journey card expand: max-height loop → `grid-template-rows 0fr/1fr`
      + `.j-card-inner`
- [x] 3.9 Press states (`:active` 1px) on unlim/mech/trainer/price/cf cards
- [x] 3.10 CTA taxonomy reduced to two frames: start ("Összeállítom a
      tervem" / "Kezdjük együtt") vs choose-plan ("Válaszd ki a csomagod" /
      "Ezt választom")
- [x] 3.11 Focus pass on new interactive elements (coverflow group, journey
      rows, FAQ summaries)
- [ ] 3.12 Deferred: single auto-player arbiter, hero single-ambient-motion,
      panel sheen sweep, **on-device mobile verification** (mcta bar,
      sticky pill ≤560px, coverflow touch-drag, hero fold at 390×844 —
      couldn't be viewport-tested in this session)

## Stage 4 — golden-thread section order — DONE

Principle: every section answers the question the previous one raises.
Final order (2 moves from the stage-2 state: founder above app intro; cast
into the experience chapter):

1. Hero — the promise ("egy edző, aki végig veled marad") + quiz CTA
2. Founder `#alexa` — answers "ki ez az edző?"; `sec-first` entry padding
3. App intro `#funkciok` — the product in one sentence ("csak te, Alexa, és
   a következő edzésed" bridge)
4. Follow-along `#valos` — what a workout feels like
5. Cast (navy) — completes the living-room scene: browser → TV, no download
6. Coverflow — variety ("Minden napra más edzés")
7. Programs panel `#programok` — answers the overwhelm: "Nem kell kitalálnod"
8. Foundation journey — the concrete plan/spec
9. Kihívások `#kihivasok` — low-commitment on-ramps beside the big program
10. Showcase (navy) `#youtube` — one-minute recap of the whole app
11. Progress `#profil` — will I see results (honest tracking)
12. Price anchor (navy) — 767 Ft/hét reframe
13. Founder finale (navy) — emotional close, back to Alexa
14. FAQ `#gyik` — objections cleared immediately before the ask
15. Pricing `#elofizetes` + footer — the ask

(The consistency-mechanics section between Progress and Price anchor was
removed by owner decision 2026-08-07 — see 1.2. If the streak/Kiérdemelt Ár
story returns to the page, its slot is there.)

Chapters: person → experience (3–5) → content/guidance (6–9) → recap (10) →
outcomes (11) → decision (12–15). Navy bands at 5, 10, 12–13 keep the
visual rhythm. Hero nav reordered to document order (Alexa · Funkciók ·
Előfizetés · Belépés); sticky-nav scroll-spy order still matches the DOM.
