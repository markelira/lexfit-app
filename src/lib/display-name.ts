import type { Prefs } from "@/lib/profile";

// THE single enforcement point for privacy.nameVisible / streakVisible (30 §P7.1-2).
// Any surface that renders ANOTHER member's name or streak MUST go through these —
// never per-component logic — so a privacy toggle can never be a lie.
//
// NB: LEXFIT has no in-app member list today (community lives in the Facebook group;
// in-app "co-presence" shows aggregate facts only — "312-en csinálták végig ezt a
// hetet" — never individual names/streaks). These helpers exist so that when a
// co-presence surface DOES render a name or streak, it is already gated.

type PrivacyPrefs = Pick<Prefs, "privacy">;

/** The name to show OTHER users. nameVisible=false → "{FirstInitial}." (Réka → R.). */
export function displayNameFor(fullName: string | null | undefined, prefs: PrivacyPrefs): string {
  const first = (fullName ?? "").trim().split(/\s+/)[0] ?? "";
  if (!first) return "";
  return prefs.privacy.nameVisible ? first : `${first[0].toUpperCase()}.`;
}

/** Whether this user's streak may be shown to OTHERS. (Their own header pill,
 *  which is not "shown to others", always shows regardless.) */
export function streakVisibleToOthers(prefs: PrivacyPrefs): boolean {
  return prefs.privacy.streakVisible;
}
