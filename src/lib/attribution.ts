"use client";

// Campaign attribution for the /register funnel.
//
// THE PROBLEM THIS SOLVES. An ad lands the visitor on
// /register?utm_source=tiktok&…&ttclid=… and the funnel's first navigation
// rebuilds the URL as /register?q=1 — so the very first tap every visitor makes
// destroyed every tracking parameter, and nothing had stored them. Verified
// against production: after one tap, utm_source, utm_campaign and ttclid were
// all null. The quiz at /terv captured UTMs; this funnel never did. The result
// was that "which campaign produced a paying subscriber" — the exact question
// ad spend is meant to answer — was unanswerable from our own data.
//
// Capture happens once, on mount, before anything can navigate.
//
// CONSENT. Deliberately split, mirroring src/lib/track.ts:
//
//   • UTM values are first-party campaign LABELS ("tiktok", "paid",
//     "spring_launch"). They are not device identifiers and they describe how
//     someone reached our own service, so they are captured and stored with the
//     account regardless of the cookie choice.
//
//   • ttclid / fbclid are advertising CLICK IDENTIFIERS that exist to match a
//     person back to an ad platform. Those are advertising measurement, so they
//     are only persisted once consent is granted — the same rule the purchase
//     reporting already follows.
//
// In-memory always, localStorage only where allowed: the funnel is a single
// page (pushState, no reload), so the in-memory copy survives the whole run
// including registration. Persistence only exists so a hard reload mid-funnel
// does not lose the campaign.

const KEY = "lx_attr_v1";
const UTM_KEYS = ["source", "medium", "campaign", "content", "term", "id"] as const;
type UtmKey = (typeof UTM_KEYS)[number];

export interface Attribution extends Partial<Record<UtmKey, string>> {
  /** Where the click came from, when the browser tells us. */
  referrer?: string;
  /** ms epoch of the landing this attribution came from. */
  landedAt: number;
}

/** Survives navigation within the funnel; the only copy that is always present. */
let memo: Attribution | null = null;
/** Advertising click id — held separately because it obeys the consent rule. */
let memoClickId: { ttclid?: string; fbclid?: string } = {};

const clean = (v: string | null) => (v && v.trim() ? v.trim().slice(0, 160) : undefined);

function consentGranted(): boolean {
  try {
    return localStorage.getItem("lx-consent") === "granted";
  } catch {
    return false; // storage blocked → treat as refusal, same as track.ts
  }
}

function readStored(): Attribution | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p: unknown = JSON.parse(raw);
    if (!p || typeof p !== "object") return null;
    const o = p as Attribution;
    return typeof o.landedAt === "number" ? o : null;
  } catch {
    return null;
  }
}

/**
 * Read the landing URL and remember it. Safe to call more than once; only a
 * landing that actually carries a campaign replaces what is already held.
 *
 * LAST PAID TOUCH, not first: if someone clicks a TikTok ad today and a
 * different ad next week, the click that actually led to the signup is the one
 * that should get the credit. A landing with no campaign (a direct return, an
 * internal navigation) never overwrites — which is the case that was silently
 * wiping everything before.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  let p: URLSearchParams;
  try {
    p = new URLSearchParams(window.location.search);
  } catch {
    return;
  }

  const next: Attribution = { landedAt: Date.now() };
  for (const k of UTM_KEYS) {
    const v = clean(p.get(`utm_${k}`));
    if (v) next[k] = v;
  }
  const ttclid = clean(p.get("ttclid"));
  const fbclid = clean(p.get("fbclid"));

  const isCampaignLanding = Object.keys(next).length > 1 || !!ttclid || !!fbclid;

  if (isCampaignLanding) {
    const ref = clean(document.referrer);
    if (ref && !ref.startsWith(window.location.origin)) next.referrer = ref;
    memo = next;
    if (ttclid) memoClickId.ttclid = ttclid;
    if (fbclid) memoClickId.fbclid = fbclid;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* private mode — the in-memory copy still carries the whole funnel */
    }
  } else if (!memo) {
    // No campaign on this URL: fall back to whatever an earlier landing stored,
    // so a mid-funnel reload keeps its attribution.
    memo = readStored();
  }

  // Click ids are advertising identifiers, so they are only written to the
  // device once the visitor has accepted. In memory they are fine either way -
  // that copy dies with the tab and is never sent unless consent is granted.
  if (consentGranted() && (memoClickId.ttclid || memoClickId.fbclid)) {
    try {
      localStorage.setItem(`${KEY}_cid`, JSON.stringify(memoClickId));
    } catch {
      /* ignore */
    }
  }
}

/** The campaign that brought this visitor, or null if they arrived directly. */
export function readAttribution(): Attribution | null {
  if (memo) return memo;
  memo = readStored();
  return memo;
}

/**
 * The advertising click id, for server-side event matching. Returns nothing
 * without consent - the caller (marketingContext) is already inside a consent
 * check, but this must not depend on that to stay safe.
 */
export function readClickIds(): { ttclid?: string; fbclid?: string } {
  if (!consentGranted()) return {};
  if (memoClickId.ttclid || memoClickId.fbclid) return memoClickId;
  try {
    const raw = localStorage.getItem(`${KEY}_cid`);
    if (raw) memoClickId = JSON.parse(raw) as typeof memoClickId;
  } catch {
    /* ignore */
  }
  return memoClickId;
}

export function clearAttribution(): void {
  memo = null;
  memoClickId = {};
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(`${KEY}_cid`);
  } catch {
    /* ignore */
  }
}
