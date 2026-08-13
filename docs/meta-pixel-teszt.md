# Meta mérés — részletes teszt-útmutató

**Dataset / Pixel:** `938411635181898` (Lexfit-web-page) · hirdetési fiók: ALEXA
**Kapcsolódó:** `docs/meta-pixel-setup.md` · `src/lib/track.ts` · `src/lib/meta-capi.ts`

---

# ELŐKÉSZÜLET

## E1. Melyik böngészőben tesztelj?

A tulajdonos Chromeja **blokkolja a Facebookot**. A mérés alapján ez **bővítmény**,
nem DNS-szűrés (az `fbevents.js` kérése lefutott, csak üresen tért vissza; DNS-blokknál
el sem indult volna). Ezért **nem kell telefon** — elég egy tiszta böngésző.

**Gyorsteszt, hogy melyik böngésződ tiszta.** Nyisd meg bármelyikben ezt a címet:

```
https://connect.facebook.net/en_US/fbevents.js
```

| Amit látsz | Jelentés |
|---|---|
| Hosszú JavaScript-kód | ✅ **tiszta böngésző** — ebben tesztelj |
| Üres oldal / hibaüzenet / „blokkolva" | 🔴 ez is blokkol — próbálj másikat |

Sorrendben érdemes próbálni: **Safari** → **Chrome inkognitó bővítmények nélkül**
(`chrome://extensions` → kapcsold ki mind) → **új Chrome-profil** → telefon mobilneten.

> Chrome inkognitóban a bővítmények alapból ki vannak kapcsolva, **de** sok
> ad-blockert a felhasználó engedélyez inkognitóra is. Ezért a fenti gyorsteszt
> fontosabb, mint a feltételezés.

## E2. A Meta Test Events fül megnyitása

1. `business.facebook.com/events_manager`
2. Bal oldalsávban: **Datasets**
3. Válaszd: **Lexfit-web-page** (`938411635181898`)
4. Felül a fülek közt: **Test events**

Ezt a fület **hagyd nyitva** a tesztek alatt — valós időben frissül.

Itt látsz egy **teszt-kódot** (`TEST` + számok). Ez kell a szerveroldali teszthez;
ha még nem tetted be a Vercelbe `META_CAPI_TEST_CODE` néven, most tedd meg + Redeploy.

## E3. Friss e-mail-cím

**Kötelező**, két okból:
- A saját fiókodon a `weekIntroUsed` be van állítva → **1990 Ft**-ot fizetnél 490 helyett
- A `CompleteRegistration` esemény **csak új fióknál** tüzel (szándékosan)

Bármilyen cím jó, amihez hozzáférsz. Gmail-trükk: `sajatcimed+teszt1@gmail.com` —
ugyanoda érkezik, de a rendszer új felhasználónak látja.

---

# 1. TESZT — a hozzájárulás elutasítása

**Ez a legfontosabb teszt.** Ezt igazolja vissza a publikált adatvédelmi
tájékoztatónk 7.1 pontja: *„elutasítás esetén semmilyen analitikai mérőkód nem
töltődik be"*.

> **Állapot: 2026-08-13-án lefuttatva, ÁTMENT.** Az alábbi lépések a megismétléshez
> vannak — érdemes minden Pixel-változtatás után újra elvégezni.

### Lépések

1. Nyiss **inkognitó ablakot** (Chrome: `Cmd + Shift + N`)
2. Menj a `https://www.lexfit.hu` címre
3. A süti-sávon kattints: **„Elutasítom"**
4. Nyisd meg a konzolt: **`Cmd + Option + J`**
   *(vagy: jobb klikk bárhol → „Vizsgálat" → felül a „Console" fül)*
5. Másold be és nyomj Entert:

```js
typeof fbq
```

### Elvárt eredmény

| Kimenet | Jelentés |
|---|---|
| `"undefined"` | ✅ **helyes** — a Pixel el sem indult |
| `"function"` | 🔴 **HIBA** — kilyukadt a gating, azonnal szólj |

### Kiegészítő ellenőrzés (ugyanabban a konzolban)

```js
({
  gtm: !!window.google_tag_manager,
  fbSutik: document.cookie.split('; ').filter(c => c.startsWith('_fb')).length
})
```

Elvárt: `{ gtm: false, fbSutik: 0 }` — a konténer sem indul el, Facebook-süti nincs.

### Ismert hiányosság (2026-08-13)

Ha korábban **elfogadtad** ugyanabban a böngészőben, a régi `_ga` sütik **ott
maradnak** elutasítás után is. Új süti nem kerül elhelyezésre (a tájékoztató ezt
állítja, és ez igaz), de a meglévők törlése még nincs megoldva. → Külön javítás,
lásd a záró szakaszt.

---

# 2. TESZT — böngésző-oldali események

**Tiszta böngészőben** (lásd E1), **friss e-mail-lel** (lásd E3).
A Meta **Test events** fület tartsd nyitva egy másik ablakban.

### 2/a — PageView

1. Nyiss **inkognitó ablakot a tiszta böngészőben**
2. `https://www.lexfit.hu`
3. Süti-sáv: **„Elfogadom"**

**Test events fülön:** megjelenik egy **`PageView`** esemény pár másodpercen belül.

**Konzolban ellenőrizhető:**
```js
typeof fbq          // "function"
```

Ha `undefined` marad: a böngésző is blokkol (vissza az E1-hez), **vagy** a GTM
konténer 15 perces cache-e miatt régi verziót töltött → `Cmd + Shift + R` (hard reload).

### 2/b — Lead (a kérdőív indítása)

4. Menj a `/register` oldalra
5. Kattints: **„Kezdjük"**

**Test events:** **`Lead`** esemény.

**Konzolban:**
```js
window.dataLayer.map(e => e.event).filter(Boolean)
```
Elvárt: tartalmazza az `lx_onboarding_start`-ot.

> ⚠️ Ez az esemény **csak új futásnál** tüzel, resume-nál nem. Ha újratöltesz és
> folytatod, szándékosan nem jön újra. Új teszthez: friss inkognitó ablak, vagy
> a konzolban `localStorage.removeItem('lexfit_onb_v1')` és újratöltés.

### 2/c — CompleteRegistration (fiók létrehozása)

6. Válaszold végig a kérdéseket (7 kérdés + reveal + plan)
7. A **fiók lépésnél** regisztrálj a **friss e-mail-címmel**

**Test events:** **`CompleteRegistration`** esemény.

**Konzolban:** a `dataLayer`-ben megjelenik az `lx_registration_complete`.

> Ha nem tüzel: meglévő fiókkal léptél be. A kód szándékosan csak akkor számolja
> regisztrációnak, ha tényleg új felhasználói dokumentum jött létre.

### 2/d — InitiateCheckout (fizetési lépés)

8. Lépj tovább a fizetési lépésre (`?q=pay`)

**Test events:** **`InitiateCheckout`** esemény.

**Konzolban:** `lx_checkout_start` — és ha megnézed a teljes bejegyzést,
tartalmazza a választott csomagot is:
```js
window.dataLayer.find(e => e.event === 'lx_checkout_start')
// { event: 'lx_checkout_start', plan: 'week_intro' }
```

### 2. teszt összefoglaló

| Meta esemény | dataLayer esemény | Mikor |
|---|---|---|
| `PageView` | — (a Pixel maga küldi) | minden oldalbetöltés |
| `Lead` | `lx_onboarding_start` | „Kezdjük" gomb |
| `CompleteRegistration` | `lx_registration_complete` | új fiók létrejött |
| `InitiateCheckout` | `lx_checkout_start` | paywall lépés elérve |

---

# 3. TESZT — a vásárlás (szerveroldal)

**Ez a te gépeden is működik**, mert nem a böngészőből megy. Ez a Conversions API
egész lényege.

### Lépések

1. Folytasd ott, ahol a 2. teszt véget ért (fizetési lépés, friss fiók)
2. Fizess végig — **490 Ft** (intro ár, mert friss a fiók)
3. Várj **10–30 másodpercet** (Stripe → webhook → Meta)

### Hol nézd

**Test events** fül → megjelenik:

| Mező | Elvárt érték |
|---|---|
| Esemény | **`Purchase`** |
| **Forrás** | **`Server`** ← ez a bizonyíték |
| Érték | `490 HUF` |

A **`Server`** jelölés az, ami igazolja, hogy a Stripe webhookból ment, nem a
böngészőből — tehát ad-blockertől függetlenül működik.

### Amit NEM szabad látnod

**Böngésző-oldali `Purchase` eseményt.** Ilyet szándékosan nem küldünk. Ha mégis
látsz, valaki felvett egy Purchase taget a GTM-be — azt törölni kell, mert duplán
számolna, és a Meta költségadatai elcsúsznának.

### Mellékhatás, ami jó jel

*Settings → Conversions API* alatt a **„Connection pending"** státusz **aktívra vált**.
Az első szerveroldali esemény kapcsolja be.

---

# 4. TESZT (opcionális) — vásárlás elutasított sütikkel

Ez igazolja, hogy a hozzájárulás a **szerveroldalon is** érvényesül. Egy extra
fizetésbe kerül, de ez a legerősebb megfelelőségi bizonyíték.

1. Új inkognitó ablak → **„Elutasítom"**
2. Új friss e-mail-cím → végig a tölcséren → fizess (490 Ft)
3. **Test events:** **NEM szabad `Purchase`-nek megjelennie**

**Miért működik:** a böngésző a checkout-session létrehozásakor ráírja a döntést a
Stripe metadatájára (`adConsent: "denied"`), és a webhook csak explicit `"granted"`
esetén hívja a Metát. Egységtesztben öt esetre ellenőrizve (elfogadta / elutasította /
nincs döntés / hamisított érték / üres metadata) — ez az élő megerősítés.

---

# HA VALAMI NEM JÖN MEG

| Tünet | Hol keresd |
|---|---|
| `Purchase` nem érkezik | **Sentry** → keresés `integration:meta-capi` címkére. Ott a Meta pontos hibaüzenete: rossz/lejárt token, hiányzó azonosító, hibás Pixel ID |
| Semmilyen böngésző-esemény, `fbq` undefined elfogadás után | Ad-blocker az adott böngészőben (E1), vagy a GTM 15 perces cache → hard reload |
| `lx_*` esemény sincs a `dataLayer`-ben | Az app oldalán van baj — ez kódhiba, szólj |
| `lx_*` megvan, de Meta-esemény nincs | A GTM trigger neve nem betűre egyezik. Kis-nagybetű számít: `lx_onboarding_start` |
| `Purchase` jön, de rossz összeggel | A `valueHuf` a Stripe `amount_paid`-ből jön, 100-zal osztva. Ha eltér, a Stripe-oldali összeg más |

**Fontos:** a CAPI **sosem dob kivételt** — egy Meta-hiba nem bukhatja meg a Stripe
webhookot. A fizetés akkor is rendben lefut, ha a jelentés elakad. Ezért kell a
Sentryben nézni, nem a fizetési folyamatban.

---

# A TESZT UTÁN — kötelező záró lépések

### 1. Töröld a teszt-kódot ⚠️

*Vercel → Settings → Environment Variables* → **`META_CAPI_TEST_CODE`** → **törlés**
→ **Redeploy**

**Ha bennmarad, minden valódi vásárlás teszt-forgalomnak számít, és nem számít bele
a hirdetés-optimalizálásba** — a kampányod vakon futna a konverziókra.

### 2. Teszt-fizetések visszatérítése

Stripe dashboard → Payments → a teszt-tranzakciók → Refund.
(Vagy hagyd bent, ha az összeg elhanyagolható.)

### 3. Teszt-fiókok

`/admin → Tagok` alatt látod őket. Törölni nem kötelező, de a KPI-kat torzítják.

---

# NYITOTT JAVÍTÁS

**A `_ga` sütik nem törlődnek a hozzájárulás visszavonásakor** (lásd 1. teszt).
Az „Elutasítom" megállítja az új betöltést, de a korábban elhelyezett sütiket
bennhagyja. Javítás: a `decide()` függvény (`src/components/Analytics.tsx`) törölje
a `_ga*` és `_fb*` sütiket, mielőtt újratölt. Néhány sor — még nincs megcsinálva.
