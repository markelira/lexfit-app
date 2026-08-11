// LEXFIT pricing - display derivations. Pure; every number is computed from the
// config prices so on-screen figures can never drift from what Stripe charges.
//
// J4 note: the ONLY savings comparison allowed is monthly-annualized ↔ annual.
// The one-off ↔ continuous prices are two separate products - never framed as a
// discount, never struck through. There is deliberately no "one-off savings"
// helper here, so no UI can accidentally render one.

import { PRICES } from "./config";

const HU = new Intl.NumberFormat("hu-HU");

/** "39 900 Ft" - Hungarian grouping (space thousands). */
export function formatHuf(amount: number): string {
  return `${HU.format(amount)} Ft`;
}

/** Annual price expressed as Ft/week (the annual card's primary number). */
export function perWeekHuf(annualHuf: number = PRICES.annual_std.amountHuf): number {
  return Math.round(annualHuf / 52);
}

/**
 * Savings % of the annual plan vs paying the monthly plan for 12 months -
 * the one legitimate "Spórolj X%" comparison (monthly-annualized ↔ annual).
 */
export function annualSavingsPct(
  monthStd: number = PRICES.month_std.amountHuf,
  annualStd: number = PRICES.annual_std.amountHuf,
): number {
  const annualized = monthStd * 12;
  return Math.round(((annualized - annualStd) / annualized) * 100);
}

/** 12× monthly, for the "71 880 → 39 900" reference figure. */
export function monthlyAnnualized(monthStd: number = PRICES.month_std.amountHuf): number {
  return monthStd * 12;
}
