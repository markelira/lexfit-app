// LEXFIT pricing - `?plan=` preselect.
//
// The pricing cards on / and /arak link into the funnel as
// `/register?plan=<role>`, so the visitor arrives at the pay step already on
// the plan they chose. Without this the funnel always opened on its own default
// and a visitor who deliberately picked Éves was met by Heti.
//
// Pure so the validation is testable without a browser. It is also the only
// thing standing between a URL and a Stripe price id, which is why it is a
// strict allow-list rather than a cast: only the three roles that are actually
// purchasable from a pricing surface pass, and everything else - a one-off
// role, an internal/earned role, a typo, an injection attempt - returns null
// and the funnel keeps its own default.

import { isRecurringRole } from "./config";

export type PreselectRole = "week_intro" | "month_std" | "annual_std";

/** The `?plan=` value if it names a purchasable recurring plan, else null. */
export function planFromParam(raw: string | null | undefined): PreselectRole | null {
  if (!raw) return null;
  // isRecurringRole is RECURRING_CHECKOUT_ROLES - deliberately narrower than
  // isCheckoutRole, which would also admit the one-off roles. Those are not
  // offered on any pricing surface, so a URL must not be able to select one.
  return isRecurringRole(raw) ? (raw as PreselectRole) : null;
}

/** Read `?plan=` out of a query string (or a full URL's search part). */
export function planFromSearch(search: string): PreselectRole | null {
  try {
    return planFromParam(new URLSearchParams(search).get("plan"));
  } catch {
    return null;
  }
}
