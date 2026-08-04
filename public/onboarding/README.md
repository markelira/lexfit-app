# Onboarding left-column images

The `/register` wizard's left column shows a **full-bleed photo per step** with a
dark bottom scrim and a short white caption (Apple-style). The files below are
**placeholders** — replace each with a real image, keeping the exact filename.

## Format
- **Filename:** `public/onboarding/{key}.jpg` (keep the name; `.jpg` preferred)
- **Size:** **1200 × 1600** (portrait, 3:4). 4:5 also fine — it's `object-fit: cover`.
- **Composition:** the important subject in the **upper two-thirds** — the bottom
  ~40% is darkened by a scrim and covered by the caption text, so keep faces/action
  above the lower third. Natural light, warm, women-first, home setting.
- The white caption + LEXFIT wordmark are drawn on top in code — **no text in the image.**

## The 11 slots (key → subject brief → the caption that overlays it)

| key | file | photo subject | caption (rendered in code) |
|---|---|---|---|
| welcome | `welcome.jpg` | A woman mid-movement at home, bright morning light, calm space | **A változás otthon kezdődik.** |
| community | `community.jpg` | Several women together / a warm group energy (community) | A közösség · "1 200+ csoporttag, akik már csinálják." |
| focus | `focus.jpg` | A woman in a targeted move (glutes/core/arms), strong & clean | Minden területre · "Van edzés arra, ahol erősödni akarsz." |
| level | `level.jpg` | A woman training confidently — strength & control | Minden szint · "A szint hozzád igazodik — kezdőtől haladóig." |
| days | `days.jpg` | Weekly-rhythm mood — mat, clean surface, a calm routine feel | A heted · "Heti 5 edzés, napi 30 perc." |
| player | `player.jpg` | A phone/tablet showing the workout video, woman following at home | A lejátszó · "Hang nélkül is végigvezet — TV-re is." |
| env | `env.jpg` | A small home corner with a mat — apartment-friendly | Minden helyzetre · "Bármi is az — van rá változat." |
| alone | `alone.jpg` | A woman resting/contemplative but not giving up (emotional) | Nem vagy egyedül · "Egyedül nehéz. Együtt muszáj." |
| story | `story.jpg` | **Alexa** portrait — natural, close, the founder | Az alapító · "„Egyedül nem megy.” — Alexa" |
| promise | `promise.jpg` | A woman after a workout — satisfied, confident (plan ready) | A terved kész · "Innentől együtt csináljuk." |
| reassure | `reassure.jpg` | A quiet, trusting home moment (calm before commitment) | Nyugodt szívvel · "A közösség ingyenes marad…" |

## Step → image mapping (which question shows which)
welcome→welcome · goal→community · focus→focus · level→level · days→days ·
time→player · env→env · obstacle→alone · why→story · reveal→promise ·
plan/account/pay→reassure.

To change a caption, edit `CAP` in `src/components/onboarding/BrandPanel.tsx`.
