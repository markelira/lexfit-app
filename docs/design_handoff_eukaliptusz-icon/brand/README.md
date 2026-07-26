# LEXFIT — Logo & Icon Library · Eukaliptusz

Márkajel: **Az Ív**. A geometria változatlan — csak a színek frissültek Eukaliptuszra.

## Színek

| Szerep | Hex |
|---|---|
| Accent (Eukaliptusz) | `#7a9b8d` |
| Ink | `#18201d` |
| Krém (sötét alapon) | `#f0f4f3` |
| Fehér | `#ffffff` |

## Struktúra

```
brand/
├── svg/                14 vektor mesterfájl
└── png/
    ├── app-icon/       15 db · 29–1024 px + dark + mono
    ├── mark/           15 db · 64–1024 px · átlátszó
    ├── badge/           8 db · 128–1024 px
    ├── lockup/         18 db · vízszintes + függőleges
    └── favicon/         6 db · 16–512 px
```

## Melyiket mikor

| Helyzet | Fájl |
|---|---|
| App Store / app ikon | `svg/lexfit-appicon-accent.svg` · `png/app-icon/lexfit-appicon-1024.png` |
| iOS 26 Icon Composer — Default | `svg/lexfit-appicon-accent.svg` |
| iOS 26 Icon Composer — Dark | `svg/lexfit-appicon-dark.svg` |
| iOS 26 Icon Composer — Mono | `svg/lexfit-appicon-mono.svg` |
| Weboldal fejléc | `svg/lexfit-lockup-accent.svg` vagy `-ink` |
| Sötét háttér / fotó fölött | bármelyik `-white` változat |
| Közösségi profilkép | `png/badge/lexfit-badge-accent-512.png` |
| Favicon | `png/favicon/favicon-{32,192,512}.png` |
| Névjegy, számla | `svg/lexfit-mark-ink.svg` |
| Hímzés, szitanyomás | `svg/lexfit-appicon-mono.svg` |

## Szabályok

- **Védőzóna:** a pont átmérőjével egyenlő üres sáv a jel körül, minden oldalon.
- **Minimum méret:** 20 px képernyőn · 12 mm nyomtatásban · 20 mm hímezve.
- **Az app ikont ne kerekítsd le** — az iOS teszi rá a maszkot. Négyzetesen, átlátszóság nélkül add le.
- **Ne** torzítsd, ne vékonyítsd a vonalat, ne színezd át, ne forgasd.

## A jel fehér marad az app ikonon

Az Eukaliptusz világosabb, mint a régi rózsaszín, ezért a **szövegre** sötét inket írunk elő (fehér = 3,04:1, megbukik). **A márkajel viszont kivétel:** grafikai elem, nem szöveg, így nem vonatkozik rá a WCAG szövegkontraszt. Vastag vonalú jelként ikonméretben tisztán olvasható, és egy sötét jel elveszítené azt a sziluettet, ami a kezdőképernyőn felismerhetővé teszi.

## Figma

1. Húzd be az SVG-t — vektorként jön be.
2. **A lockup wordmarkja élő szöveg** (Poppins 800). Nyomda vagy hímző előtt: `Object → Outline Stroke`, majd `Flatten`. Ha nincs telepítve a Poppins, használd a PNG lockupot.
3. A jel maga (`mark`, `badge`, `appicon`) tiszta path — nincs fontfüggősége.

## Merch

A `#7a9b8d` gyakori hímzőcérna-szín, jól kivitelezhető. Egyszínű mono jel a merch munkalova. Nulla színátmenet, nincs 3 mm alatti elem.
