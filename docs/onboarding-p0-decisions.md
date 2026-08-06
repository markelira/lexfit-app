# Onboarding funnel — P0 decisions (LOCKED)

Answers to the seven P0 blockers from `docs/design_handoff_lexfit 3/41-ONBOARDING-DEV-PLAN.md` §P0
and the open questions in `40-ONBOARDING.md` §40.14. Decided 2026-08-01. These govern P1–P9.

| # | Question | Decision |
|---|---|---|
| **P0.1** | Is `életszakasz` safety-critical enough to ask in the funnel? | **Defer** — keep it OUT of the funnel. Program does not branch on life stage for safety yet. |
| **P0.2** | Palette — rose or Eukaliptusz? | **Green / Eukaliptusz** — match the shipped app (Kezdőlap, player, Videótár). No rose. |
| **P0.3** | Does step 3 collect specific weekdays or only a count? | **Count + weekdays** — user picks 3/4/5/6 AND which days. Feeds `prefs.plan.weekdays` and the reminder time. |
| **P0.4** | Keep the one-off products on the subscribe layout? | **Keep** — as secondary text links, no strikethrough, no „kedvezmény" (J4-compliant). |
| **P0.5** | Free first workout between reveal and registration? | **No** — reveal CTA (`Mentsük el a tervedet`) → `/register` directly. |
| **P0.6** | Reminder channel — email or push? | **Email** — `Beállítom` writes an email reminder pref; no OS push permission prompt. |
| **P0.7** | Who owns the four deferred prompts (focus, obstacle, lifestage, age)? | **Defer all four — build in P8.** Real in-app homes: focus after week 1, obstacle after first missed week, lifestage at variations, age at profile. Fields stay in `OnboardingAnswers` regardless. |

## Consequences for the build

- **Step count = 5 questions**, one per screen (goal, level, schedule, time, environment). Progress bar
  has 5 segments (`StepProgress`). No life-stage step in the funnel.
- **Step 3 (schedule)** renders both a count control (`Segmented` 3/4/5/6) AND a weekday picker.
  `saveOnboarding` must write `weekdays` in addition to the existing `OnboardingAnswers` fields (P3.4).
- **CSS uses the green/Eukaliptusz token set**, same as the rest of the app. No new palette.
- **Subscribe (P6):** radio `PlanCard`s + one fixed CTA, annual pre-selected, one-off products carried
  through as secondary links.
- **Reveal → `/register`**, no free-workout interstitial (P3.2).
- **First-entry reminder (P7.2):** email channel — time derived from the `time` answer
  (reggel 07:15 · napközben 12:30 · este 19:30); `Beállítom` writes `prefs.reminders.workout`, no OS prompt.
- **P8:** build four prompt cards (focus / obstacle / lifestage / age), each writing to the
  `onboarding/profile` doc. Keep the four fields in `OnboardingAnswers` — do not remove.
