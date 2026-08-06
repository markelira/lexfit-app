// The funnel routing machine (40 §40.8). One pure function, used by every route
// guard, so the onboarding → auth → checkout → app order can never loop or
// re-interrogate a paying user. The truth table below IS §40.8 — change it here
// and nowhere else. Unit-tested in scripts/funnel-selftest.ts (5 states × 4
// routes = 20 assertions).

export type FunnelState =
  | "anon" // anonymous, no local draft
  | "anon_draft" // anonymous, a saved draft exists
  | "auth_new" // signed in, onboarding not yet saved
  | "auth_unpaid" // signed in, onboarded, no active entitlement
  | "auth_ready"; // signed in, onboarded, paid

export type FunnelRoute = "/onboarding" | "/register" | "/subscribe" | "/app";

// null → the requested route is allowed (stay). A string → redirect there.
const TABLE: Record<FunnelState, Record<FunnelRoute, string | null>> = {
  // anon / anon_draft differ only in whether /onboarding resumes — both render it.
  anon: {
    "/onboarding": null,
    "/register": null,
    "/subscribe": "/register",
    "/app": "/onboarding",
  },
  anon_draft: {
    "/onboarding": null,
    "/register": null,
    "/subscribe": "/register",
    "/app": "/onboarding",
  },
  // Authed but not onboarded (attach failed, or an old account that never
  // onboarded): finish onboarding first. /register makes no sense for an authed
  // user, so send them to the thing they still need.
  auth_new: {
    "/onboarding": null,
    "/register": "/onboarding",
    "/subscribe": null,
    "/app": "/onboarding",
  },
  // Onboarded, unpaid: the only thing left is checkout — every route funnels there.
  auth_unpaid: {
    "/onboarding": "/subscribe",
    "/register": "/subscribe",
    "/subscribe": null,
    "/app": "/subscribe",
  },
  // Onboarded, paid: never re-ask; /subscribe renders its "aktív" panel (allowed).
  auth_ready: {
    "/onboarding": "/app",
    "/register": "/app",
    "/subscribe": null,
    "/app": null,
  },
};

export function funnelDestination(state: FunnelState, requested: FunnelRoute): string | null {
  return TABLE[state][requested];
}
