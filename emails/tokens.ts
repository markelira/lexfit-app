// Email-safe brand tokens - hex mirror of src/app/lexfit-tokens.css (OKLCH is not
// safe in mail clients; authoritative hex mapping: docs/design_handoff_eukaliptusz).
// Rule carried over from the design handoff: NEVER put non-ink text on the accent
// green (white on #7a9b8d fails contrast) - CTAs are ink-filled, like the app.

export const color = {
  accent: "#7a9b8d", // Eukaliptusz - decorative accents only
  accent2: "#496c5e", // deep accent - the FIT half of the wordmark
  accentSoft: "#e1f1ea", // tinted panels
  accentInk: "#355c4d", // accent-colored TEXT on white/soft (passes contrast)
  ink: "#18201d",
  ink2: "#44544d",
  ink3: "#5c6e66",
  bg: "#f1f6f4", // page - never white
  surface: "#ffffff",
  surface2: "#e8efec",
  line: "#d8e0dd",
  ok: "#007f37",
  warn: "#925b00",
  danger: "#b13a38",
  onInk: "#f0f4f3", // light text on ink fills
};

// Poppins loads in Apple Mail & friends via the <link> in EmailLayout; the
// Helvetica fallback IS the baseline (Gmail/Outlook never load web fonts).
//
// DELIBERATE SECOND SOURCE OF TRUTH. Every other font-family in the codebase
// resolves through `--font` / `--mono` (declared once on :root in
// src/app/lexfit-tokens.css). Email cannot: clients strip custom properties and
// next/font's self-hosted faces aren't reachable from a mail client, so the stack
// has to be spelled out literally here.
// → If the app typeface ever changes, THIS FILE MUST BE UPDATED BY HAND.
export const font = {
  sans: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'IBM Plex Mono', 'SFMono-Regular', Menlo, Consolas, monospace",
};

export const radius = { sm: 8, md: 14, lg: 20 };

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://www.lexfit.hu";

// Ektv. §4 imprint - source of truth: docs/legal/aszf.md §1 (keep in sync).
export const IMPRINT = {
  company: "AM Studios Group Kft.",
  seat: "3532 Miskolc, Miklós utca 17. 2. em. 26. ajtó",
  regNo: "Cégjegyzékszám: 05 09 039717",
  taxNo: "Adószám: 33004312-1-05",
  email: "hi@lexfit.hu",
};

// ---- shared text styles (inline - Gmail strips <style> in places) ----
import type { CSSProperties } from "react";

export const styles = {
  eyebrow: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: color.ink3,
    margin: "0 0 14px",
  } as CSSProperties,
  h1: {
    fontFamily: font.sans,
    fontWeight: 300, // the app's thin display style
    fontSize: 28,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
    color: color.ink,
    margin: "0 0 18px",
  } as CSSProperties,
  body: {
    fontFamily: font.sans,
    fontSize: 16,
    lineHeight: 1.6,
    color: color.ink2,
    margin: "0 0 16px",
  } as CSSProperties,
  note: {
    fontFamily: font.sans,
    fontSize: 13,
    lineHeight: 1.55,
    color: color.ink3,
    margin: "18px 0 0",
  } as CSSProperties,
  sign: {
    fontFamily: font.sans,
    fontSize: 16,
    lineHeight: 1.6,
    color: color.ink,
    fontWeight: 600,
    margin: "22px 0 0",
  } as CSSProperties,
  small: {
    fontFamily: font.sans,
    fontSize: 12,
    lineHeight: 1.6,
    color: color.ink3,
    margin: "0 0 6px",
  } as CSSProperties,
};
