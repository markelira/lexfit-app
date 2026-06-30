# LEXFIT — project context for Claude Code

LEXFIT is a Hungarian, women-first fitness web app — a guided 8-week program, not a
generic workout library. This repo is the production rebuild of a finished prototype.
Full spec: `docs/build-plan.md` (and the matching PDF). Read it before any phase.

## Stack
- **Next.js** (App Router, React + TypeScript), `src/` dir, import alias `@/*`. No Tailwind —
  brand comes from design tokens ported into global CSS.
- **Firebase** — Firestore (NoSQL), Auth (Google now; Apple/Facebook in Phase 2), Storage
  (progress photos). Project ID `lexfit-app`, region **`europe-west3` (Frankfurt, permanent)**.
- **Mux** — video upload, encoding, signed playback for paid gating.
- **Stripe** — subscriptions (Phase 6, not yet wired).
- **Vercel** — hosting + auto-deploy from GitHub `markelira/lexfit-app`.
- Language: **Hungarian only**; keep UI strings ready to centralize later.

## Accounts
- Firebase / Google Cloud: `gorgeimarko@gmail.com`
- GitHub: `markelira` · Vercel: `gorgeimarko` (scope `marks-projects-86c130e8`)

## Code layout
- `src/lib/firebase.ts` — client SDK (auth, db, storage). Browser-safe.
- `src/lib/firebase-admin.ts` — Admin SDK (server only). Never import client-side.
- `scripts/firebase-healthcheck.mjs` — Firestore connectivity check.
  Run: `node --env-file=.env.local scripts/firebase-healthcheck.mjs`

## Environment variables
See `.env.example`. `.env.local` is git-ignored and mirrored into Vercel for all
environments. Service-account private key is one line with literal `\n`; the admin init
restores real newlines.

## Local dev & mock data (IMPORTANT)
Content (program, videos, filters) is **mock/preview only** and lives **only in the
Firebase Local Emulator** — production Firestore is intentionally **empty** until real
content is uploaded via the Phase 7 admin. The seeded Foundation program is throwaway
preview filler, not real data.
- `npm run emulators` — Firestore+Storage emulator, imports/exports `./.emulator-data`.
- `npm run dev:local` — Next dev pointed at the emulator (`NEXT_PUBLIC_USE_EMULATORS=true`,
  `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`). Real Google auth still used.
- `npm run seed:local` — re-seed the emulator from `seed/source/` (+ `scripts/attach-emulator-video.mjs` for the F023 test video).
- Client emulator wiring: `src/lib/firebase.ts` (guarded by `NEXT_PUBLIC_USE_EMULATORS`).
- Do NOT seed production. Screens read Firestore at runtime — they are not hardcoded, so
  they render emulator data in dev and admin-uploaded data in prod with no code changes.

## Build roadmap (do in order — see docs/build-plan.md)
0. Foundations & design system  ← scaffold + services wired (current)
1. Database architecture & content seed
2. Auth & onboarding
3. Mux video pipeline & player
4. App shell + Foundation + Videótár
5. Haladásom (progress & photos)
6. Stripe subscriptions & sales pages
7. Admin dashboard
8. QA, polish & launch

## Conventions
- Build data model first, then screens that read it (back-to-front).
- Firestore security rules: content read-only to authed users; each user can only touch
  their own `users/{uid}/…` subtree; progress photos owner-private.
- Don't commit secrets. Service-account keys are git-ignored.

@AGENTS.md
