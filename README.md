# LEXFIT

Hungarian, women-first fitness web app — a guided 8-week program (not a generic workout
library). Production rebuild of a finished prototype. Full spec: [`docs/build-plan.md`](docs/build-plan.md).

## Stack
- **Next.js 16** (App Router, TypeScript) · **Firebase** (Auth, Firestore `europe-west3`, Storage)
- **Mux** (video, signed playback) · **Stripe** (subscriptions, Phase 6) · **Vercel** (hosting + auto-deploy)

## Local development (mock data in the emulator)
Mock/preview content (program, videos, filters) lives **only** in the Firebase
Local Emulator — production Firestore stays empty until real content is uploaded
via the admin. Auth stays on real Firebase (real Google sign-in).

Two terminals:
```bash
npm run emulators    # Firestore + Storage emulator, loads ./.emulator-data
npm run dev:local    # Next dev pointed at the emulator  → http://localhost:3000
```
Emulator UI: http://localhost:4000 · Re-seed mock data (with emulators running):
`npm run seed:local`.

⚠️ Plain `npm run dev` runs against **production** Firebase — never use it for
admin authoring or seeding. Seed scripts hard-exit unless pointed at the
emulator; production content is authored via `/admin` only.

Environment variables: copy `.env.example` → `.env.local` and fill in (see `CLAUDE.md`).
`.env.local` is git-ignored and mirrored into Vercel for every environment.

## Useful scripts
```bash
npm run healthcheck  # verify Firebase Admin SDK + Firestore connectivity
npm run build        # production build
npm run seed:local   # re-seed the EMULATOR from prototype data (never prod)
```

## Firebase
```bash
firebase deploy --only firestore:rules   # deploy Firestore security rules
firebase deploy --only storage           # deploy Storage rules (after bucket exists)
```
Rules live in `firestore.rules` / `storage.rules`; config in `firebase.json`.
Health endpoint: `GET /api/health` (proves Admin SDK + Firestore in any environment).

## Build roadmap
Eight phases — see `docs/build-plan.md` and `CLAUDE.md`. Build data-model first, then the
screens that read it.

## Deployment
Every push to `main` auto-deploys via Vercel. Secrets never go in git.
