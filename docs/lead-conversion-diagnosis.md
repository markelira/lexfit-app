# Miért nem konvertál a lead magnet? — diagnózis és javítási terv

**Dátum:** 2026-09-13 · **Vizsgált időszak:** Sep 8–13 (a `SzeptUjrakezdes` Meta kampány élesítése óta)
**Adatforrások:** prod `quizLeads` / `users` / Auth / `subscriptions` / `events` export, Meta ads riport (Sep 1–13 xlsx),
teljes funnel-kód audit, külső benchmark-kutatás (Noom / MadMuscles / Reverse Health / BetterMe minták, forrásokkal).

---

## 0. Verdikt — egy mondatban

**A lead magnet nem „nem elég vonzó" — a tölcsér működik a leadgyűjtésig, utána viszont öt egymásra
rakódó szivárgás van, és a legvégén (a fizetésnél) egy valószínűleg technikai fal:** aki eljut a 490 Ft-os
checkoutig, az a Facebook Android webview-ban fut a beágyazott Stripe-ba, és ott 3-ból 3 elakadt.

## 1. A mért tölcsér (Sep 8–13)

| Lépcső | Szám | Konverzió | Értékelés |
|---|---|---|---|
| Meta link kattintás (Sep 10–13) | 310 | — | riport csak kattintást tartalmaz (spend/impression üres!) |
| Lead (`quizLeads`, lm_v2) | 109 | **~34%** klikk→lead | **jó** — a quiz vonz és lezár (iparági átlag ~40% quiz-start→lead) |
| … ebből marketing-hozzájárulás | 69 | 63% | 40 lead (37%) örökre elérhetetlen e-mailben |
| Regisztráció (lead-e-mail egyezés, valódi új) | ~4 | **~4%** | gyenge — benchmark: jó reveal/paywall ~10%+ |
| Checkout indítás (mind `week_intro`) | 3 | ~3% | a reveal CTA-ig kevesen jutnak, de aki igen, az fizetne |
| **Fizetés (`checkout_completed`)** | **0** | **0/3** | 🔴 mindhárom a fizetőfelületen halt el |

Kontextus a nullához: a legjobb quiz-funnelök a kitöltők 3–10%-át konvertálják fizetőssé; 109 leadből
tehát egy *jó* tölcsér is csak ~3–11 vásárlót adna. A 0 tehát részben kis minta — de a 3/3 checkout-elhagyás
kemény jel, nem zaj.

**Nyitott adat-kérdések:**
- A „220+ lead" nem egyezik a prod 109 dokumentumával. Valószínű ok: a Meta „Results" számláló
  (duplikált Lead esemény / retake), vagy más forrásból számolt lista. Tisztázandó, mit számolunk.
- A Meta xlsx-ben a spend/impression/CPL oszlopok üresek — új export kell Ads Managerből
  (Amount spent, Impressions, Results oszlopokkal), addig CPL/megtérülés nem számolható.

## 2. Az öt szivárgás (fontossági sorrendben)

### 🔴 L1 — A Facebook Android webview megöli a checkoutot (proximális ok)
A forgalom gyakorlatilag 100%-a `FB_IAB` Android user-agent (a leadek `consents.userAgent` mezője alapján).
A beágyazott (iframe-es) Stripe Checkout ebben a környezetben dokumentáltan hibára fut vagy extrém
súrlódású: nincs Google Pay, nincs autofill, third-party cookie korlátok, lassú betöltés. Publikált esetek:
webview konverzió 7,8%→0,86%; a social-kattintások ~40%-a el sem jut a konverzió esélyéig.
**Mindhárom checkout-indító itt akadt el.** Amíg ez áll, semmilyen szöveg/ajánlat-javítás nem tud látszani.

**Fix:** FB/IG webview detektálás (`FBAN|FBAV|Instagram` a UA-ban) → a fizetés előtt kiléptetés valódi
böngészőbe (Android: `intent://…#Intent;scheme=https;package=com.android.chrome;end`), vagy webview-forgalomnak
hosted Stripe Checkout teljes oldalas redirecttel; plusz percen belüli „fejezd be a fizetést" e-mail
magic-linkkel (az e-mail már megvan — a levél a valódi böngészőben nyílik, kikerülve a webview-t).

### 🔴 L2 — A legforróbb kohorszot kidobjuk a nurture-ből
`convertedAt` **regisztrációkor** íródik (`post-register`), nem fizetéskor — és nullázza a `nextEmail*` mezőket.
Aki regisztrált és a 490 Ft-os fizetésnél elakadt (pont az L1 áldozatai), az **soha többé nem kap levelet**.
Nincs checkout-abandonment e-mail. A kutatás szerint a 48 órán belül visszatérő elhagyók ~2×
konverzióval térnek vissza — ez a legolcsóbb megnyerhető szegmens, és ma szándékosan elengedjük.

### 🟠 L3 — Az e-mail gépezet a saját ígéretét töri meg, és nem adja el a horgot
- A D0/D3 „Megnyitom a tervem" CTA a **landing oldalra** mutat (`/ujrakezdes`) — a terv nincs elmentve
  visszanyitható URL-en, a lead újra kitöltheti a 7 kérdést. A gate közben azt ígéri: „a kész tervet
  e-mailben küldjük, hogy TV-n és laptopon is megnyisd."
- A D6/D9 (értékesítő levelek) a generikus `/arak`-ra mutatnak, **a 490 Ft-os intro hét egyszer sem
  hangzik el bennük**, és a quiz-személyre-szabás elveszik az útvonalon.
- D9 után a lead **soha többé** nem kap levelet (nincs win-back a v2 szekvenciában).
- A D0 küldés nincs naplózva a lead-dokumentumon (`lastEmailAt` nem íródik) — a „9/109 kapott levelet"
  látszat ebből fakad; valójában valószínűleg mind a 109 megkapta a D0-t, de ezt nem tudjuk bizonyítani.

### 🟠 L4 — Az ajánlat-oldal (reveal) jó szerkezetű, de a bizalmi/urgencia réteg hiányzik
A reveal igenis keményen pitchel (4 CTA → `/register?q=plan&plan=week_intro`, kézi átadással) — ez rendben van.
Ami hiányzik, pont a magyar 35–54-es célcsoport fő ellenvetésére (előre-fizetés kártyával ismeretlen márkának;
a magyar e-comban az utánvét máig domináns első vásárlásnál):
- **A pénzvisszafizetési garancia sötét** (`NEXT_PUBLIC_GUARANTEE_LIVE` off, ÁSZF-klauzulára vár) —
  a reveal elveszti a teljes kockázat-megfordító sávját, a D6 a gyengébb tárggyal megy ki.
- Nincs fizetési bizalmi mikroszöveg a gomb mellett (mikor, mennyit vonunk, hogyan mondható le, magyarul).
- Nincs napi ár-keretezés (~70 Ft/nap), nincs horgony-előválasztás, nincs (valódi) urgencia.
- Nincs „készítjük a terved…" feldolgozás-színház a quiz és a reveal között (mérhetően emeli az észlelt
  személyre-szabottságot és a paywall-konverziót).

### 🟠 L5 — A Meta kampány formafillereket vesz, nem vásárlókat
`OUTCOME_LEADS` optimalizálás = a Meta olyanoknak mutatja a hirdetést, akik űrlapot töltenek ki, nem akik
fizetnek. A web2app-konszenzus feliratkozás-alapú termékeknél: **Purchase-re (vagy InitiateCheckout-ra)
optimalizálni, sosem Leadre.** A 490 Ft-os intro külön előny: minden vásárlás valódi Purchase-jelet ad a
pixelnek. (A Conversion-Leads köztes út ~250 lead/hó alatt — ahol most vagyunk — nem működik.)

## 3. Mi NEM a baj

- **A lead magnet vonzereje.** 34% klikk→lead kiváló; a quiz UX (auto-advance, szekciók, tray) erős.
- **„Nincs eladás a reveal-en."** Van, és jól célzott (490 Ft intro, előválasztott plan, kérdés-skip).
- **A szekvencia hossza önmagában.** A 9 lead / e-mail szám főleg naplózási hiány + a kampány fiatal kora
  (D3 a `createdAt`+3 napnál esedékes; a leadek zöme Sep 11–13-as).

## 4. Prioritált javítási terv

> **STÁTUSZ (2026-09-13):** mind az öt P0 IMPLEMENTÁLVA (build + selftestek zöldek), deploy előtt áll.
> Deploy-sorrend: (1) commit+push → Vercel deploy, (2) `node --env-file=.env.local scripts/backfill-plan-tokens.mjs`
> (CSAK a deploy után — az új cron-szabály nélkül a régi kód újra nullázná a felélesztett leadeket),
> (3) `scripts/stripe-enable-expired-event.mjs` a LIVE Stripe kulccsal (a webhook csak így kapja meg
> a `checkout.session.expired` eseményt).

### P0 — most (ezek nélkül a többi nem látszik)
| # | Teendő | Hol | Hatás |
|---|---|---|---|
| P0-1 | FB/IG webview detektálás + kiléptetés valódi böngészőbe a fizetés előtt (Android `intent://` Chrome-ra; fallback: hosted Checkout redirect webview UA-nak) | `/register` pay lépés / `EmbeddedPay` | a 3/3 elhagyás fő gyanúsítottja |
| P0-2 | Checkout-abandonment visszahozó: regisztrált-de-nem-fizetett trigger (percek–órák), magic-link egyenesen a pay lépésre; `convertedAt` ne állítsa le a szekvenciát fizetés nélkül (vagy: `paidAt` külön mező, és a stop arra figyeljen) | `post-register`, cron, új e-mail | a legforróbb szegmens visszanyerése |
| P0-3 | A terv perzisztálása tokenes URL-en (`/ujrakezdes/terv/[token]` a lead-dokumentumból) + D0/D3 CTA erre mutasson | lead API + új route + e-mailek | az e-mail út megjavítása, ígéret betartása |
| P0-4 | D6/D9: CTA → `/register?q=plan&plan=week_intro`, a 490 Ft nevesítve a szövegben | `emails/ujrakezdes-d6/9.tsx` | a horog végre megjelenik a sales-levelekben |
| P0-5 | D0 küldés naplózása (`lastEmailAt/Step`) + cron telemetria javítás | lead API, cron | mérhetőség |

### P1 — napokon belül
- **Garancia élesítése**: ÁSZF-klauzula publikálása (tulajdonosi döntés) → `NEXT_PUBLIC_GUARANTEE_LIVE=1`;
  a reveal B7 sáv + D6 erős tárgy visszakapcsol.
- **Fizetési bizalmi réteg** a pay lépésen: pontos levonási összeg/dátum, „bármikor lemondható" magyarul,
  kártyalogók, garancia a gomb mellett.
- **Reveal finomítás**: napi ár (~70 Ft/nap), feldolgozás-színház a gate előtt/után, horgony-előválasztás.
- **Meta kampány**: optimalizálás átállítása Purchase-re (kevés event esetén InitiateCheckout-ra);
  a Pixel/CAPI `InitiateCheckout` + `Purchase` események ellenőrzése a checkout-útvonalon.
- **Konszent-arány javítása**: a checkbox-copy adja el a 6 napos sorozatot (mit kap, miért éri meg),
  ne az „enélkül is elküldjük" legyen az utolsó szó. (Előre bepipálni Mo.-n nem lehet.)

### P2 — következő hét
- Win-back lépés D9 után (pl. D21) a nem-konvertált, konszentes leadeknek.
- `trackUjrakezdesQuizStart` bekötése (landing→quiz bounce ma mérhetetlen).
- Retargeting réteg: a nem-konvertált leadeknek másik ajánlat/objection-handling kreatív (nem ugyanaz újra).
- Meta riport újra-export spend oszlopokkal → CPL/megtérülés számítás; „220 vs 109" egyeztetés.

### Hirdetés: futtassuk tovább?
**Feltételesen igen.** A kampány leadet olcsón hoz (a kattintás→lead 34%), de amíg az L1 (webview-fal) él,
a büdzsé fizetésképtelen leadeket vesz. Javaslat: **a P0-1 + P0-2 shipeléséig (1–2 nap) érdemes a napi
büdzsét minimálisra venni vagy szüneteltetni**, utána visszakapcsolni és 3–4 nap múlva az
InitiateCheckout/Purchase számokon értékelni — nem a lead-számon. (Spend-adat híján kill/scale döntés
most nem hozható; új export kell.)

## 5. Elvárás-kalibráció

Jó tölcsérrel is: 109 lead → ~3–11 fizető (3–10% quiz-kitöltő→fizető a legjobb funneleknél; a medián ~2,7%).
A siker mérőszáma a következő két hétben: **checkout-indítás / lead** és **checkout-befejezés / indítás**
(cél: >60% a webview-fix után), ne önmagában a fizetők száma.

## 6. Források (külső kutatás)

Interact quiz-benchmark riport; RevenueCat State of Subscription Apps (trial→paid 37,7% H&F);
Adapty H&F paywall benchmarkok (~11% paywall→trial); FunnelFox web2app pattern-elemzés (250+ funnel);
Web2App World teardownok (Noom, MadMuscles); Reverse Health (Fortune); Stripe/webview hibariportok
(Ionic fórum, react-native-webview #3835); InApp Redirect / Shopify webview-konverzió esetek;
Balkan eCommerce Summit + Unicorn Group magyar fizetési szokások. Részletes linkek: a kutatási
jelentésben (session-artifact).
