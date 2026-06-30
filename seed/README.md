# Seed data (Phase 1)

`source/` holds the prototype's real content datasets, copied verbatim from `LEXFIT-design`
(which is git-ignored). These are the single source of truth for the one-time Firestore seed.

## Files
- `prog-data.jsx` — `PROG_PHASES`, `PROG_SPLIT`, `PROG_META`, `PROG_WEEKS`, `PROG_BY_CODE`,
  `PROG_DONE_COUNT`, `PROG_CURRENT_INDEX`, `PROG_STREAK` → seeds **programs** + **workouts**
- `lexfit-data.jsx` — `LX_VIDEOS`, `LX_FILTERS`, `LX_TODAY_PLAN` → seeds **workouts/bonusContent** + **filters**
- `onb-data.jsx` — onboarding copy/options (`ONB_*`) → reference for the onboarding flow (Phase 2)

## ⚠️ Format note
These are **browser globals** — plain `const NAME = …` with **no `export`** (the prototype
loaded them as `<script>` globals). The Phase 1 seed script must either:
1. add `export` to each needed const (preferred — keeps them as ES modules), or
2. read the file text and `eval`/parse in a sandbox.

Values also contain presentation hints (e.g. `c: "var(--cat-mobility)"`) — decide per field
whether to store or drop when mapping to the Firestore schema (build-plan §03).

## Phase 1 plan
`scripts/seed.mjs` (`npm run seed`) imports these, maps them to the schema in build-plan §03,
and writes documents via the Admin SDK (Mux IDs left blank). Idempotent: re-running upserts.
