# GTM beállítás — a kvíz mérése és a TikTok Pixel

**Konténer:** `GTM-MPPRKGZ7` (a `NEXT_PUBLIC_GTM_ID` env értéke)
**Készült:** 2026-08-22

> ## ✅ A workspace beállítása 2026-08-22-én ELKÉSZÜLT
>
> A 1–4. lépést a `scripts/gtm-setup.mjs` script végezte el a Tag Manager API-n
> keresztül (a service account **Edit** joggal). **Semmi nem élesedett** — a
> konténer publikálása hátravan.
>
> **Ami még rád vár: az 5. lépés (Preview-ellenőrzés) és a 6. (Submit).**
>
> A script két olyan hibát is javított, ami eredetileg nem volt a tervben:
> a **duplikált Meta alappixelt** (minden oldalmegtekintés kétszer számított) és a
> TikTok varázslójának **catch-all event-tagjét** (minden custom eseményre tüzelt volna).
> Mindkettő **szüneteltetve**, nem törölve.

Ez egy **kattintásról kattintásra** követhető leírás. Két dolgot rendez el egyszerre:

1. **Meta — javítás.** A `Lead` esemény ma rossz helyre van kötve, és hiányzik a
   deduplikáció. Ez már a kvíz élesítése előtt is hátralévő tétel volt.
2. **TikTok — új.** A varázsló betette az alappixelt; az események bekötése kézi munka.

> ⚠️ **Semmi nem lesz élő, amíg a végén nem nyomsz Submit-et.** A workspace-ben végzett
> munka addig csak nálad látszik. Nyugodtan dolgozz végig mindent, és csak a 6. lépésben
> ellenőrzés után publikálj.

---

## 0. Mielőtt elkezded — mi van már a konténerben

| Elem | Honnan | Állapot |
|---|---|---|
| `Meta Pixel — Base (PageView)` | kézzel, Custom HTML | ✅ jó, nem nyúlunk hozzá |
| `Meta Pixel — Lead` | kézzel, Custom HTML | ⚠️ **rossz triggeren van** (1. és 3. lépés) |
| `Meta Pixel — CompleteRegistration` | kézzel, Custom HTML | ✅ jó |
| `Meta Pixel — InitiateCheckout` | kézzel, Custom HTML | ✅ jó |
| `TT-DA4PL4JC77U208UL7D60-Web-Tag-Pixel_Setup` | TikTok varázsló | ✅ alappixel, All Pages |
| `TT-DA4PL4JC77U208UL7D60-Web-Tag-Pixel_Event` | TikTok varázsló | ⚠️ **ebből kell 3 példány** (4. lépés) |

**Fontos háttér:** az app **vendor-semleges** `lx_*` eseményeket tol a `dataLayer`-be
(`src/lib/track.ts`). A GTM ezeket fordítja le Meta- és TikTok-eseményekre — ezért nem
kell deploy egy új hirdetési platformhoz.

A GTM-konténer maga **csak hozzájárulás után töltődik be**. Emiatt minden tag automatikusan
hozzájárulás-kötött, és emiatt a Preview módban is **el kell fogadnod a sütiket**, különben
jogosan nem tüzel semmi.

---

## 1. lépés — a `DLV - event_id` változó

Ezzel kell kezdeni, mert a 3. lépés hivatkozik rá.

1. Bal oldali menü → **Variables**
2. Görgess le a **User-Defined Variables** blokkhoz → **New**
3. Kattints a **Variable Configuration** dobozba → **Data Layer Variable**
4. **Data Layer Variable Name:** `event_id`
   *(pontosan így, kisbetűvel, alulvonással)*
5. **Data Layer Version:** maradjon `Version 2`
6. Fent a névmezőbe: `DLV - event_id`
7. **Save**

---

## 2. lépés — három Custom Event trigger

Mindháromnál ugyanaz a recept:

1. Bal oldali menü → **Triggers** → **New**
2. **Trigger Configuration** doboz → görgess az **Other** szakaszhoz → **Custom Event**
3. **Event name:** a lenti táblázat szerint — **pontosan így, a kis- és nagybetűk számítanak**
4. **This trigger fires on:** maradjon `All Custom Events`
5. Név → **Save**

| Trigger neve | Event name mezőbe |
|---|---|
| `CE - lx_quiz_lead` | `lx_quiz_lead` |
| `CE - lx_registration_complete` | `lx_registration_complete` |
| `CE - lx_checkout_start` | `lx_checkout_start` |

> Ha a `CE - lx_registration_complete` és a `CE - lx_checkout_start` már létezik (a Meta
> beállításakor készülhetett), **ne hozz létre másodikat** — használd a meglévőt.

---

## 3. lépés — Meta: a `Lead` átcímkézése és a deduplikáció

Ez a lépés két hibát javít egyszerre. Mindkettő valódi pénzben mérhető.

### 3.1 Nyisd meg a `Meta Pixel — Lead` taget

**Tags** → kattints a `Meta Pixel — Lead` sorra.

### 3.2 Cseréld a triggert

Alul a **Triggering** dobozban most `lx_onboarding_start`-ra hivatkozó trigger van.
Kattints rá, **vedd ki**, és tedd be helyette: **`CE - lx_quiz_lead`**.

**Miért:** ma minden látogató „Lead", aki csak elhagyta a welcome képernyőt. A kampány
viszont arra optimalizál, aki **megadta az e-mail-címét**. Amíg ez így marad, a Meta a
rossz emberekhez keres hasonló közönséget.

### 3.3 Tedd bele az `eventID`-t

Ez a tag **Custom HTML** típusú, tehát az azonosító nem egy mező, hanem **a kódba megy**.
A tag tartalma jelenleg valami ilyesmi:

```html
<script>
  fbq('track', 'Lead');
</script>
```

Írd át erre:

```html
<script>
  fbq('track', 'Lead', {}, {eventID: '{{DLV - event_id}}'});
</script>
```

Figyelj a részletekre: a `{{DLV - event_id}}` **aposztrófok között** van (a GTM csak a
szöveget helyettesíti be, az idézőjelet nem adja hozzá), és a harmadik argumentum egy
**üres objektum** — oda a Meta a custom paramétereket várná, nekünk nincs ilyen.

**Miért kell:** a szerverünk **ugyanezt a `Lead` eseményt is jelenti** a Conversions
API-n keresztül (`src/lib/meta-capi.ts`). A Meta csak akkor tudja, hogy a kettő ugyanaz,
ha azonos az `eventID`. Ha ez hiányzik, **minden kvíz-lead kétszer számít**, és a kampány
kétszeres konverziószámra optimalizál — vagyis rosszul osztja el a büdzsét.

*(A `Purchase`-nél ez nem probléma: az kizárólag szerveroldalról megy, nincs mivel ütköznie.)*

### 3.4 Mentés

**Save**.

### 3.5 Opcionális — mi legyen az `lx_onboarding_start`-tal

Most trigger nélkül maradt. Két lehetőség:

- **Hagyd mérés nélkül** — a tölcsér eleje amúgy is látszik a GA4-ben.
- **Csinálj neki `ViewContent` taget** — ha látni akarod, hányan indítják el az
  onboardingot. Recept: új Custom HTML tag `fbq('track', 'ViewContent');` tartalommal, a
  meglévő `lx_onboarding_start` triggerrel.

---

## 4. lépés — TikTok: három eseménytag

### 4.1 Nézd meg a varázsló által készített taget

**Tags** → `TT-DA4PL4JC77U208UL7D60-Web-Tag-Pixel_Event` → nyisd meg.

Jegyezd meg, **hol állítja be az esemény nevét** (a TikTok sablonjában általában egy
„Event" legördülő vagy egy szövegmező), és mi a jelenlegi triggere.

### 4.2 Készíts három példányt

A tag jobb felső sarkában a **⋮ menü → Copy** (vagy Duplicate). Mindhárom példánynál:

| Tag neve | Trigger | TikTok esemény |
|---|---|---|
| `TikTok — SubmitForm` | `CE - lx_quiz_lead` | `SubmitForm` |
| `TikTok — CompleteRegistration` | `CE - lx_registration_complete` | `CompleteRegistration` |
| `TikTok — InitiateCheckout` | `CE - lx_checkout_start` | `InitiateCheckout` |

Az eredeti, varázsló által készített `…-Pixel_Event` taget utána **töröld vagy
szüneteltesd** (⋮ → Pause) — különben a saját triggerével párhuzamosan tüzelne.

### 4.3 Amit a TikTok tagekhez NE köss be

- **`event_id`** — a TikTok Pixel jelenleg az egyetlen forrás a lead-eseményre, nincs
  szerveroldali párja, amivel deduplikálni kellene. Ha később megépül a TikTok Events
  API, akkor lesz rá szükség.
- **Bármilyen kvíz-válasz** — a `lx_quiz_step` eseményt **ne** vedd fel tagként, és ne
  csinálj olyan változót, ami a válaszokra hivatkozik. A kvíz testadatot és
  élethelyzet-kérdést tartalmaz; ezek hirdetési rendszerbe küldése sértené a saját
  szabályunkat (`src/lib/track.ts`) és az adatkezelési tájékoztató 3.4. pontját.

---

## 5. lépés — ellenőrzés Preview módban

**Ezt hagyd ki, és élesben derül ki, ha valami rossz.**

1. Jobb felül **Preview** → írd be: `https://www.lexfit.hu/terv` → **Connect**
2. A megnyíló oldalon **fogadd el a sütiket**
   *(Ha elutasítod, a GTM be sem tölt, és a Tag Assistant üres marad. Ez nem hiba — ez a
   hozzájárulás-kapu, és épp ezt akartuk.)*
3. Töltsd ki a kvízt végig, adj meg egy teszt e-mail-címet, és küldd be
4. A Tag Assistant bal oldalán kattints a **`lx_quiz_lead`** eseményre, és ellenőrizd:

| Amit látnod kell | |
|---|---|
| `Meta Pixel — Lead` | **Fired** |
| `TikTok — SubmitForm` | **Fired** |
| A Meta tag → **Variables** fül → `DLV - event_id` | **nem üres**, valami UUID-szerű érték |

5. Ugyanez a `lx_registration_complete` és `lx_checkout_start` eseményekre, ha végigmész
   a regisztráción

### Kereszt-ellenőrzés a platformokon

- **Meta Events Manager → Test events:** ott valós időben látszik a `Lead`. Ha **kettő**
  jelenik meg egy beküldésre, a 3.3 lépés `eventID`-ja nem jó.
- **TikTok Events Manager → Test event:** a `SubmitForm` megjelenik.

---

## 6. lépés — publikálás

Csak akkor, ha az 5. lépés minden pontja rendben:

1. Jobb felül **Submit**
2. **Version Name:** pl. `Kvíz Lead átcímkézés + TikTok események`
3. **Version Description:** érdemes leírni, hogy a `Lead` átkerült az `lx_quiz_lead`-re,
   és bekerült az `eventID` a dedup miatt
4. **Publish**

---

## Ami ezután is hiányozni fog

**A TikTok nem fog vásárlást mérni.** A `CompletePayment` szándékosan nincs a listán: a
vásárlást a Stripe webhook igazolja **szerveroldalon**, böngésző-esemény nincs hozzá —
ezért épült a Meta oldalán a `meta-capi.ts`.

A TikTok-kampány így **leadre tud optimalizálni, vásárlásra nem**. Ha az utóbbi is kell,
egy `tiktok-capi.ts` kell a `meta-capi.ts` mintájára, ugyanabból a Stripe webhookból
hívva. Ez fejlesztői munka; a hozzá szükséges **Events API access tokent** a TikTok
Events Managerben lehet generálni a pixel beállításainál.

---

## Gyors ellenőrzőlista

- [ ] `DLV - event_id` változó létrehozva
- [ ] `CE - lx_quiz_lead` trigger létrehozva
- [ ] `CE - lx_registration_complete` trigger megvan (új vagy meglévő)
- [ ] `CE - lx_checkout_start` trigger megvan (új vagy meglévő)
- [ ] `Meta Pixel — Lead` triggere `CE - lx_quiz_lead`-re cserélve
- [ ] `Meta Pixel — Lead` kódjában benne az `{eventID: '{{DLV - event_id}}'}`
- [ ] `TikTok — SubmitForm` tag kész
- [ ] `TikTok — CompleteRegistration` tag kész
- [ ] `TikTok — InitiateCheckout` tag kész
- [ ] A varázsló `…-Pixel_Event` tagje törölve vagy szüneteltetve
- [ ] Preview: mindkét platform tüzel a `lx_quiz_lead`-re, az event_id nem üres
- [ ] Meta Test events: **egy** Lead jelenik meg, nem kettő
- [ ] Submit + Publish


---

## Napló — mérési eredmények (2026-08-22)

A GTM felülete ezen a munkán **háromszor** mutatott „beállítva" állapotot olyasmire,
ami nem működött. Az itt rögzített módszer az, ami eldöntötte a kérdéseket: **a tényleges
kimenő kérés elolvasása**, nem a felület.

### A TikTok payload önellenőrző jele

A sablon minden eseménybe beleteszi a saját konfigurációs kódját:

```js
gtm_version: version + ':' + getConfigHash(data)
```

A kód második fele elárulja, melyik ág fut:

| Hash vége | Mit jelent |
|---|---|
| `:00` | egyik ág sem illeszkedik — **a paraméterek figyelmen kívül maradnak** |
| `:01` | `enhance_ecomm=false` + `single_multi_product="empty"` → value/currency megy |
| `:02` | `enhance_ecomm=false` + `single_multi_product="single"` → **+ content_id, content_type** |

Ez a leggyorsabb módja annak, hogy megmondd, a böngésződ a friss konténert futtatja-e.
A `gtm.js` cache-e `max-age=900`, tehát **15 percig** régit szolgálhat ki.

### Három hiba, amit ez a módszer talált

1. **A `value` sosem ért célba**, pedig a paraméter be volt állítva. Ok: a sablon csak
   akkor olvassa, ha a `single_multi_product` is be van állítva — az pedig hiányzott,
   tehát egyetlen feltételes ág sem futott le. *(Jel: a hash `00` maradt.)*
2. **A Meta tag idézőjel nélküli behelyettesítést használt.** `{value: {{DLV - value}}}`
   üres változónál `{value: , …}`-t renderel, ami szintaktikai hiba — és nem csak az árat,
   hanem **az egész taget** megölte volna.
3. **A `content_id` elérhetetlen volt a `"empty"` módban.** A sablon
   `enablingConditions`-e a `"single"` módhoz köti.

### A content_id kísérlet

A live taghez hozzá sem nyúlva, közvetlenül a TikTok SDK-t hívtuk azokkal a mezőkkel,
amiket a `"single"` mód állítana elő — előbb ellenőrizve, hogy a böngésző teszt módban
van (`tt_test_id` jelen van, tehát nem szennyezi az éles adatot):

| Változat | Eredmény |
|---|---|
| jelenlegi (`currency` + `value`) | `content_id: null` |
| javasolt (`content_id`, `content_type`, `content_name`, `price`, `quantity`) | mind megérkezett, és a TikTok **szerveroldalon összeállította a teljes `contents` bejegyzést**, figyelmeztetés nélkül |

Ezért lett a `content_id` a `dataLayer`-ben már meglévő **`plan`** (pl. `week_intro`) —
katalógusadat, nem személyes adat, és ingyen ad csomag szerinti bontást a riportokban.
