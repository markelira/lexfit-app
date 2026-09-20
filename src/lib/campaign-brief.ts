import { PRICES } from "@/lib/pricing/config";
import { formatHuf } from "@/lib/pricing/display";

/**
 * The September Meta campaign's watchdog and daily brief (P1).
 *
 * Why this is a WATCHDOG and not an optimiser. The campaign spends 100 000 Ft
 * over ten and a half days on a 9 990 Ft product: break-even is ten purchases,
 * so a realistic run produces roughly one conversion a day. Meta leaves the
 * learning phase at ~50 conversions a week, which this campaign will never
 * reach - and every edit to budget, audience or creative restarts that
 * learning. A brief that prescribed a change each evening would therefore be
 * acting on one-conversion samples AND resetting the algorithm nightly. It
 * would make results worse, not better, while looking diligent.
 *
 * This module is deliberately PURE - it takes rows and returns a report. The
 * Firestore read lives in the route, so the whole analysis (and every rule
 * below) can be exercised by scripts/campaign-brief-selftest.ts rather than
 * first running for real at 20:00 on launch day.
 *
 * So the two jobs are split by the sample size each one honestly needs:
 *
 *  · BREAKAGE is visible immediately and must be acted on immediately - the
 *    pixel not reporting, delivery at zero, a funnel that takes checkouts and
 *    completes none. These are decidable from a handful of events because they
 *    are binary: the thing either happens or it does not.
 *
 *  · PERFORMANCE - which creative wins, whether to scale, whether the audience
 *    is right - needs the whole run. `gate` below encodes that as a rule
 *    rather than a suggestion, so the evening mail cannot quietly drift into
 *    recommending edits before the data can carry them.
 */

export const CAMPAIGN = {
  name: "META_Sales_HU-25-49_Start9990_2026-09-21",
  /** Budapest local times, as set in Ads Manager. */
  startMs: Date.parse("2026-09-21T06:00:00+02:00"),
  endMs: Date.parse("2026-10-01T19:00:00+02:00"),
  budgetHuf: 100_000,
  role: "program_foundation" as const,
} as const;

/** Purchases needed for the ad spend to pay for itself. Derived, never typed. */
export const BREAK_EVEN = Math.ceil(CAMPAIGN.budgetHuf / PRICES[CAMPAIGN.role].amountHuf);

/** The decision gate. Before BOTH of these are false, no targeting/budget edit
 *  is defensible - the sample cannot distinguish a real effect from noise. */
const GATE_MIN_DAYS = 5;
const GATE_MIN_PURCHASES = 20;

/** Checkout starts in a 12h window that make "zero purchases" informative
 *  rather than unlucky. Measured on this funnel's own history (13 starts, 5
 *  purchases = 38.5% completion), eight starts finishing none has a ~0.8%
 *  chance of being variance - so it is a break, and worth waking someone for. */
const STALL_STARTS = 8;

const H = 3600_000;

export type Severity = "critical" | "high" | "medium";

export interface Alert {
  severity: Severity;
  key: string;
  what: string;
  why: string;
  /** The one action to take. Empty when the honest answer is "watch". */
  do: string;
}

export interface DayRow {
  /** "09-21", Budapest calendar day. */
  day: string;
  starts: number;
  purchases: number;
  revenueHuf: number;
  accounts: number;
}

export interface Brief {
  nowMs: number;
  /** 1-based day of the campaign; 0 before it starts, -1 once it has ended. */
  dayIndex: number;
  totalDays: number;
  live: boolean;
  days: DayRow[];
  today: DayRow;
  total: DayRow;
  last12h: { starts: number; purchases: number };
  breakEven: number;
  config: { pixel: boolean; capiToken: boolean; gtm: boolean; sendgrid: boolean };
  gate: { open: boolean; reason: string };
  alerts: Alert[];
}

/** "09-21" for an epoch ms, in Budapest. Grouping by the advertiser's own
 *  calendar day, not UTC, so the rows line up with what Ads Manager reports. */
function dayKey(ms: number): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Budapest",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
  return p; // en-CA gives "09-21"
}

export interface EventDoc {
  name: string;
  at: number;
  props?: Record<string, unknown>;
}

/** The env flags the report cares about. Passed in rather than read here, so
 *  the rules stay testable and the module stays free of `process.env`. */
export interface BriefConfig {
  pixel: boolean;
  capiToken: boolean;
  gtm: boolean;
  sendgrid: boolean;
}

export function buildBrief(rows: EventDoc[], nowMs: number, config: BriefConfig): Brief {
  const live = nowMs >= CAMPAIGN.startMs && nowMs <= CAMPAIGN.endMs;
  const totalDays = Math.ceil((CAMPAIGN.endMs - CAMPAIGN.startMs) / (24 * H));
  const dayIndex =
    nowMs < CAMPAIGN.startMs ? 0 : nowMs > CAMPAIGN.endMs ? -1 : Math.floor((nowMs - CAMPAIGN.startMs) / (24 * H)) + 1;

  const evs: EventDoc[] = rows
    .filter((e) => e && typeof e.at === "number" && e.at >= CAMPAIGN.startMs && e.at <= nowMs)
    // Chronological, so the row a de-duplicated purchase lands in is the
    // earliest of its twins rather than whichever Firestore returned first.
    .sort((a, b) => a.at - b.at);

  const byDay = new Map<string, DayRow>();
  const row = (k: string): DayRow => {
    let r = byDay.get(k);
    if (!r) { r = { day: k, starts: 0, purchases: 0, revenueHuf: 0, accounts: 0 }; byDay.set(k, r); }
    return r;
  };

  const since12h = nowMs - 12 * H;
  const last12h = { starts: 0, purchases: 0 };

  // `program_purchased` is logged TWICE for every sale: fulfilProgramSession
  // runs from the Stripe webhook and again from the thank-you page's confirm
  // call. The access write is idempotent; the event append is not, so the raw
  // count is exactly double and the revenue with it. Counting one row per
  // Stripe session is the only honest reading - a brief that doubles revenue
  // is worse than no brief, because it is confidently wrong.
  const seenSessions = new Set<string>();

  for (const e of evs) {
    const r = row(dayKey(e.at));
    if (e.name === "program_checkout_started") {
      r.starts++;
      if (e.at >= since12h) last12h.starts++;
    } else if (e.name === "program_purchased") {
      const sid = typeof e.props?.sessionId === "string" ? e.props.sessionId : null;
      // No session id (older rows) → count it; it cannot be matched to a twin.
      if (sid) {
        if (seenSessions.has(sid)) continue;
        seenSessions.add(sid);
      }
      r.purchases++;
      const amt = Number(e.props?.amountHuf);
      r.revenueHuf += Number.isFinite(amt) ? amt : PRICES[CAMPAIGN.role].amountHuf;
      if (e.at >= since12h) last12h.purchases++;
    } else if (e.name === "program_account_created") {
      r.accounts++;
    }
  }

  const days = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
  const todayKey = dayKey(nowMs);
  const today = byDay.get(todayKey) ?? { day: todayKey, starts: 0, purchases: 0, revenueHuf: 0, accounts: 0 };
  const total = days.reduce<DayRow>(
    (acc, d) => ({
      day: "összesen",
      starts: acc.starts + d.starts,
      purchases: acc.purchases + d.purchases,
      revenueHuf: acc.revenueHuf + d.revenueHuf,
      accounts: acc.accounts + d.accounts,
    }),
    { day: "összesen", starts: 0, purchases: 0, revenueHuf: 0, accounts: 0 },
  );

  const gateOpen = dayIndex >= GATE_MIN_DAYS || total.purchases >= GATE_MIN_PURCHASES;

  return {
    nowMs,
    dayIndex,
    totalDays,
    live,
    days,
    today,
    total,
    last12h,
    breakEven: BREAK_EVEN,
    config,
    gate: {
      open: gateOpen,
      reason: gateOpen
        ? `${dayIndex}. nap / ${total.purchases} vásárlás - a minta elbírja a döntést.`
        : `${dayIndex}. nap / ${total.purchases} vásárlás - a kapu ${GATE_MIN_DAYS}. napnál vagy ${GATE_MIN_PURCHASES} vásárlásnál nyílik.`,
    },
    alerts: findAlerts({ live, last12h, total, config }),
  };
}

function findAlerts(b: {
  live: boolean;
  last12h: { starts: number; purchases: number };
  total: DayRow;
  config: Brief["config"];
}): Alert[] {
  const out: Alert[] = [];

  // The one that silently wastes the whole budget. An empty env var is falsy,
  // so `meta-capi` skips every send and Meta optimises a Purchase goal it
  // never receives - it bids blind for ten days and nobody sees an error.
  if (!b.config.pixel || !b.config.capiToken) {
    out.push({
      severity: "critical",
      key: "capi_off",
      what: `A szerver-oldali Purchase-jelentés ki van kapcsolva (pixel: ${b.config.pixel ? "ok" : "HIÁNYZIK"}, token: ${b.config.capiToken ? "ok" : "HIÁNYZIK"}).`,
      why: "A kampány Purchase-re optimalizál. Jelentés nélkül a Meta nem tudja, ki vásárolt, tehát nem tud vásárlókat keresni - a teljes keret vakon megy el.",
      do: "Events Manager → adathalmaz → Beállítások → Conversions API hozzáférési token; utána Vercel env + deploy.",
    });
  }

  if (!b.live) return out;

  // Takes checkouts, completes none. Binary enough to act on at this size.
  if (b.last12h.starts >= STALL_STARTS && b.last12h.purchases === 0) {
    out.push({
      severity: "high",
      key: "funnel_stall",
      what: `${b.last12h.starts} fizetés-indítás az elmúlt 12 órában, 0 befejezés.`,
      why: "Ez már nem szórás. A Stripe checkout vagy a visszatérés akad - a lead-kampányoknál a Facebook in-app böngészője ölte meg pontosan ezt.",
      do: "Nyisd meg a /start/fizetes oldalt FB in-app böngészőből iOS-en és Androidon, és nézd meg a Sentryt ugyanerre az ablakra.",
    });
  }

  // Money is going out and nobody reaches the checkout.
  if (b.last12h.starts === 0) {
    out.push({
      severity: "medium",
      key: "no_traffic",
      what: "0 fizetés-indítás az elmúlt 12 órában, miközben a kampány fut.",
      why: "Vagy nem szállít a hirdetés (elutasítás, korlátozás, kimerült keret), vagy eljutnak a landingre és senki nem kattint tovább.",
      do: "Ads Manager: szállítási státusz és a mai költés. Ha költ, a landing a gyanús.",
    });
  }

  // A purchase that produced no account is a delivery failure the buyer feels.
  if (b.total.purchases > 0 && b.total.accounts === 0) {
    out.push({
      severity: "high",
      key: "fulfilment_gap",
      what: `${b.total.purchases} vásárlás, de 0 létrehozott fiók.`,
      why: "Fizettek és nem kaptak hozzáférést. Ez a legdrágább hibafajta: visszatérítés és bizalomvesztés egyszerre.",
      do: "Vercel logok: [program-fulfil] sorok, és a Stripe webhook kézbesítési státusza.",
    });
  }

  return out;
}

const SEV_LABEL: Record<Severity, string> = {
  critical: "KRITIKUS",
  high: "SÚLYOS",
  medium: "FIGYELENDŐ",
};

/** The evening report. Plain text on purpose: this is an ops mail to one
 *  person, and a branded template would add ceremony without adding meaning. */
export function renderBrief(b: Brief): { subject: string; text: string } {
  const L: string[] = [];
  const pct = (n: number, d: number) => (d > 0 ? `${((100 * n) / d).toFixed(1)}%` : "-");

  const head = b.dayIndex === 0
    ? "A kampány még nem indult el."
    : b.dayIndex === -1
      ? "A kampány lezárult."
      : `${b.dayIndex}. nap a ${b.totalDays}-ből.`;

  L.push(`${CAMPAIGN.name}`, head, "");

  if (b.alerts.length) {
    L.push("── AMI MOST CSELEKVÉST KÍVÁN ──", "");
    for (const a of b.alerts) {
      L.push(`[${SEV_LABEL[a.severity]}] ${a.what}`, `   Miért számít: ${a.why}`, `   Teendő: ${a.do}`, "");
    }
  } else {
    L.push("── Hibafigyelő: nincs jelzés. ──", "");
  }

  L.push("── SZÁMOK ──", "");
  L.push("nap      indítás  vásárlás  bevétel");
  for (const d of b.days) {
    L.push(`${d.day}    ${String(d.starts).padStart(5)}  ${String(d.purchases).padStart(7)}  ${formatHuf(d.revenueHuf).padStart(10)}`);
  }
  L.push(
    "",
    `Összesen: ${b.total.starts} indítás → ${b.total.purchases} vásárlás (${pct(b.total.purchases, b.total.starts)}), ${formatHuf(b.total.revenueHuf)}`,
    `Ma: ${b.today.starts} indítás → ${b.today.purchases} vásárlás`,
    `Nullszaldó: ${b.total.purchases} / ${b.breakEven} vásárlás a ${formatHuf(CAMPAIGN.budgetHuf)} keretre`,
    "",
  );

  L.push("── DÖNTÉSI KAPU ──", "");
  L.push(b.gate.reason);
  L.push(
    b.gate.open
      ? "Mostantól védhető a célzás vagy a keret módosítása. Egy változtatás egyszerre, és utána 48 óra türelem."
      : "Célzáshoz, kerethez és kreatívhoz NE nyúlj. Ekkora mintán a különbség zaj, a szerkesztés viszont újraindítja a Meta tanulási fázisát - a beavatkozás mérhetően többet ront, mint amennyit a döntés javíthat.",
    "",
  );

  L.push("── AMIT EZ A BRIEF NEM LÁT ──", "");
  L.push(
    "Költés, CPM, CTR, frekvencia, kreatívonkénti bontás: ezek a Meta oldalán vannak,",
    "és csak egy ads_read jogú System User tokennel lennének olvashatók. E nélkül a brief",
    "az eredményoldalt méri (vásárlás, checkout, fiók), a költségoldalt nem.",
  );

  const alarm = b.alerts.some((a) => a.severity === "critical")
    ? "[KRITIKUS] "
    : b.alerts.length
      ? "[jelzés] "
      : "";
  return {
    subject: `${alarm}LEXFIT kampány - ${b.dayIndex > 0 ? `${b.dayIndex}. nap` : head} - ${b.total.purchases}/${b.breakEven} vásárlás`,
    text: L.join("\n"),
  };
}
