# final-v3 — the shipping set

Twelve creatives: three copy variants × four Meta placements. Destination `/start`,
optimisation event **Purchase**. This folder supersedes `final/` and `final-v2/`, both of
which were deleted — see "What was wrong before".

## Files

| Placement | Ratio | Meta minimum | Delivered |
|---|---|---|---|
| Feed (FB/IG) vertical | 4:5 | 1080×1350 | `4x5-{a,b,c}.png` — **2160×2700** |
| Feed square | 1:1 | 1080×1080 | `1x1-{a,b,c}.png` — **2160×2160** |
| Stories / Reels | 9:16 | 1080×1920 | `9x16-{a,b,c}.png` — **2160×3840** |
| Right column / Marketplace / landscape feed | 16:9 | 1200×628 | `16x9-{a,b,c}.png` — **2400×1350** |

The landscape is delivered at 16:9, not at Meta's recommended 1.91:1, deliberately. The
generated ground is 1.792; stretching it to 1.911 distorts the lettering by 6.6%, and
cropping to it clips the bubbles. Meta accepts 16:9 on these placements and crops it
itself if it needs to.

## Copy variants

| | Headline | Line above the price |
|---|---|---|
| **a** | `8 HÉT,` / `VÉGIG TERVVEL` | `35 EDZÉS` |
| **b** | `8 HÉT.` / `35 EDZÉS.` | `ÖRÖKRE A TIÉD` |
| **c** | `EGYSZER FIZETSZ` / `ÖRÖKRE A TIÉD` | `8 HÉT · 35 EDZÉS` |

Shared across all twelve: badge `NINCS HAVIDÍJ`, starburst `14 NAP GARANCIA`, CTA pill
`MEGNÉZEM A PROGRAMOT`, price `9 990 Ft`, wordmark `LEXFIT`, and the six bubbles.

**Contrast note before you spend:** variant **b** has the darkest bubble text and reads
best at feed size. In **a** and especially **c** the model rendered the bubble text in
pale sage, which is legible on a desktop preview and marginal on a phone. If only one
variant gets budget, start with **b**.

## The six bubbles are from the lead database

Aggregated over the 456 quiz leads that answered (counts only — Q5 is health-adjacent and
never leaves the aggregate):

| what the leads said | bubble |
|---|---|
| 57% living room + 15% small space = 72% train in a room at home | `OTTHON` |
| product truth — the whole programme is bodyweight | `ESZKÖZ NÉLKÜL` |
| 31% rarely trained + 28% never = **59% are beginners** | `ALAPOKTÓL` |
| 50% chose whole-body over any single area | `TELJES TEST` |
| 40% evening + 35% varies | `ESTE IS` |
| 37% called themselves restarters — they lack a plan, not willingness | `NEM KELL TERVEZNED` |

The same query argued with the headline: **43% want three days a week and 32% want four**,
while eight weeks assumes four to five. So for most buyers this runs nine to twelve weeks.
The ad may lead with eight weeks — it is how Lexfit Start has always been positioned — but
`/start` states the cadence outright and says that training less often simply takes longer.
A selftest enforces both halves.

## How these are built

Not one generation each. The trainer is a **real photograph** (`IMG_9032`, supplied
2026-09-20), background-removed and composited onto a generated, person-free ground. An
AI-generated likeness was tried and rejected: Alexa is a person the audience recognises,
and a synthesised face on a paid ad is a claim we cannot make.

```
assets/alexa-cutout.png        the real trainer, transparent, reusable
assets/player-screen.png       the real player screenshot
assets/ground-<ratio>-<v>.png  the twelve generated grounds (4K, no person, no phone)
assets/compose.sh              the compositor, commented
```

`compose.sh <ground> <out> <W> <H> <figH> <figX> <figBot> <phoneH> <phoneX> <phoneBot>`
— heights and offsets are fractions of the canvas, and everything is positioned from the
**bottom** because the constraint that matters is clearance above the CTA pill. Passing
`phoneH` of `0` skips the mockup; the landscape uses that, because its headline leaves no
room and she is already holding a phone.

Re-cutting for a new size needs no regeneration: generate one ground, run the script.

## What was wrong before (so it is not repeated)

1. **Alexa's forearm was clipped** in `final/` and `final-v2/`. Her elbow reaches x≈4300 in
   the 4536-wide source; the crop fed to the matting model ended at 4120. Fixed by cropping
   to the frame edge, then **measuring all four borders of the matte** — all read alpha 0,
   so the silhouette cannot be touching the frame.
2. **Bubbles were cut off at the canvas edges.** That came from the generated ground, not
   from the export — the model hugged the bubbles to the edge. The prompts now carry a
   hard 6% safe-margin rule, and the export resizes to the exact delivery size instead of
   fill-cropping.
3. **Her feet were cut** at the bottom edge — she was anchored to it. She now ends above
   the CTA pill.
4. **The phone was an unrecognisable grey blur.** It is now a built iPhone mockup — dark
   titanium frame, Dynamic Island, rounded screen — carrying the real player screen, with
   the blur cut from 0x26 to 0x2.2.
5. **A corrupt PNG** sat in `final/`: a killed render left a partial file, and the runner
   skipped it because a file of that name existed. The runner no longer skips.
6. The first "leave the right third empty" prompt produced a poster split into two panels
   with a hard seam. "One single continuous background, the centre column simply has
   nothing placed on it" fixed it.
7. Cloning background over an already-generated figure is not viable — the patch clipped
   the headline. Generate the ground without the figure instead.

## Before any spend

- `/start` is **not deployed** — the commits are local and `www.lexfit.hu/start` returns 404.
- The Stripe price exists in **test mode only**; run `npm run seed:stripe` with the live key.
- Map `lx_program_purchase` to Purchase in GTM. An ad set optimising for a conversion that
  never arrives spends its whole learning budget on nothing — which is exactly what
  happened with Lead.
