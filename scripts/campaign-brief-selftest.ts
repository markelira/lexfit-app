/**
 * Campaign brief self-test.
 *
 * The evening mail runs once a day for ten days and nobody watches it being
 * built, so the renderer has to be exercised here or its first real run is
 * also its first test. These cases pin the things that would be embarrassing
 * to get wrong in front of the owner: doubled revenue, a decision gate that
 * quietly opens early, and an alert that fails to shout.
 */
import { renderBrief, buildBrief, BREAK_EVEN, CAMPAIGN, type Brief, type Alert, type CostSide, type EventDoc } from "../src/lib/campaign-brief";

let failures = 0;
function check(name: string, cond: boolean, detail?: string) {
  if (cond) return;
  failures++;
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}

function brief(over: Partial<Brief> = {}): Brief {
  const base: Brief = {
    nowMs: Date.parse("2026-09-23T20:00:00+02:00"),
    dayIndex: 3,
    totalDays: 11,
    live: true,
    days: [
      { day: "09-21", starts: 6, purchases: 2, revenueHuf: 19980, accounts: 2 },
      { day: "09-22", starts: 4, purchases: 1, revenueHuf: 9990, accounts: 1 },
    ],
    today: { day: "09-23", starts: 3, purchases: 1, revenueHuf: 9990, accounts: 0 },
    total: { day: "összesen", starts: 13, purchases: 4, revenueHuf: 39960, accounts: 3 },
    last12h: { starts: 3, purchases: 1 },
    breakEven: BREAK_EVEN,
    config: { pixel: true, capiToken: true, gtm: true, sendgrid: true },
    gate: { open: false, reason: "3. nap / 4 vásárlás - a kapu 5. napnál vagy 20 vásárlásnál nyílik." },
    cost: null,
    alerts: [],
  };
  return { ...base, ...over };
}

const CRITICAL: Alert = {
  severity: "critical",
  key: "capi_off",
  what: "A szerver-oldali Purchase-jelentés ki van kapcsolva.",
  why: "vakon licitál",
  do: "token felvétele",
};

console.log("campaign brief");

// 1. Break-even is derived from the real price, not typed.
// 100 000 / 9 990 = 10.01, so TEN sales bring 99 900 Ft and still leave the
// spend uncovered. Eleven is the first number that clears it - the off-by-one
// this assertion exists to keep honest.
check("break-even 11 vásárlás (100 000 / 9 990 = 10.01)", BREAK_EVEN === 11, `kapott: ${BREAK_EVEN}`);

// 2. The window matches what is actually set in Ads Manager.
check("indulás szept 21. 06:00 CEST", CAMPAIGN.startMs === Date.parse("2026-09-21T06:00:00+02:00"));
check("zárás okt 1. 19:00 CEST", CAMPAIGN.endMs === Date.parse("2026-10-01T19:00:00+02:00"));

// 3. A closed gate must actively forbid, not merely omit advice. This is the
//    whole point of the design: silence reads as permission.
{
  const { text } = renderBrief(brief());
  check("zárt kapunál tiltó mondat", /NE nyúlj/.test(text));
  check("zárt kapunál indokol is", /tanulási fázis/.test(text));
  check("nem ígér változtatást", !/módosítása védhető/.test(text));
}

// 4. An open gate permits exactly one change, then patience.
{
  const { text } = renderBrief(
    brief({ dayIndex: 6, gate: { open: true, reason: "6. nap / 7 vásárlás - a minta elbírja a döntést." } }),
  );
  check("nyitott kapunál engedélyez", /védhető/.test(text));
  check("egy változtatás egyszerre", /egyszerre/.test(text));
}

// 5. A critical alert has to be visible in the subject line - the body is
//    only read if the subject earns it.
{
  const { subject, text } = renderBrief(brief({ alerts: [CRITICAL] }));
  check("kritikus riasztás a tárgyban", subject.startsWith("[KRITIKUS]"), subject);
  check("riasztás teendővel", /Teendő:/.test(text));
  check("cselekvés-szekció elöl", text.indexOf("CSELEKVÉST") < text.indexOf("SZÁMOK"));
}

// 6. No alerts → the watchdog says so plainly rather than padding.
{
  const { subject, text } = renderBrief(brief());
  check("tiszta tárgy riasztás nélkül", !subject.includes("["), subject);
  check("nincs jelzés sor", /nincs jelzés/.test(text));
}

// 7. Revenue must read as the de-duplicated figure. Four purchases at 9 990
//    is 39 960 - if the twin rows ever leak back in this prints 79 920.
{
  const { text } = renderBrief(brief());
  check("bevétel nincs duplázva", /39\s?960/.test(text), "39 960 Ft nem szerepel");
  check("nullszaldó-számláló", /4 \/ 11 vásárlás/.test(text));
}

// 8. The brief states its own blind spot - a report that hides what it cannot
//    see invites decisions it cannot support.
{
  const { text } = renderBrief(brief());
  check("megnevezi a vakfoltját", /ads_read/.test(text) && /CPM/.test(text));
}

// 9. Pre-launch and post-campaign render without pretending to have data.
{
  const pre = renderBrief(brief({ dayIndex: 0, live: false, days: [], alerts: [CRITICAL] }));
  check("indulás előtt is olvasható", /még nem indult/.test(pre.text));
  const post = renderBrief(brief({ dayIndex: -1, live: false }));
  check("lezárás után is olvasható", /lezárult/.test(post.text));
}

// 10. Cost side present → the blind-spot section must shrink, and the two
//     independent purchase counts must both be printed rather than reconciled.
{
  const cost: CostSide = {
    ok: true,
    totalSpendHuf: 28_400,
    totalPurchases: 3,
    days: [
      { date: "2026-09-21", spendHuf: 9800, impressions: 7100, clicks: 121, ctr: 1.7, cpmHuf: 1380, frequency: 1.12, purchases: 2 },
      { date: "2026-09-22", spendHuf: 9600, impressions: 6900, clicks: 104, ctr: 1.51, cpmHuf: 1391, frequency: 1.28, purchases: 1 },
      { date: "2026-09-23", spendHuf: 9000, impressions: 6400, clicks: 98, ctr: 1.53, cpmHuf: 1406, frequency: 1.4, purchases: 0 },
    ],
  };
  const { text } = renderBrief(brief({ cost }));
  check("költségoldal megjelenik", /KÖLTSÉGOLDAL/.test(text));
  check("mindkét mérés kiírva", /4 \(a mi mérésünk\) vs 3 \(a Meta/.test(text));
  // formatHuf separates groups with a non-breaking space, so match on \s.
  check("keret-százalék", /28\s400\sFt\s\/\s100\s000\sFt\s\(28%\)/.test(text), text.split("Összes költés")[1]?.slice(0, 60));
  check("vakfolt zsugorodott", !/META_ADS_TOKEN/.test(text) && /kreatívonkénti/.test(text));
}

// 11. Token missing → the brief names WHY the cost side is absent, so nobody
//     reads its silence as "there was no spend".
{
  const { text } = renderBrief(brief({ cost: { ok: false, reason: "token_lacks_ads_read", totalSpendHuf: 0, totalPurchases: 0, days: [] } }));
  check("hiányzó jog megnevezve", /nincs ads_read joga/.test(text));
  check("nem tesz úgy, mintha nulla lenne", !/KÖLTSÉGOLDAL/.test(text));
}

// 12. Scheduled but not spending. On launch day this is the likeliest fault of
//     all - a draft that was never published - so it must be an alert, not a
//     row the reader is expected to notice in a table.
{
  const now = Date.parse("2026-09-21T20:00:00+02:00");
  const cost: CostSide = { ok: true, totalSpendHuf: 0, totalPurchases: 0, days: [{ date: "2026-09-21", spendHuf: 0, impressions: 0, clicks: 0, ctr: 0, cpmHuf: 0, frequency: 0, purchases: 0 }] };
  const b = buildBrief([], now, { pixel: true, capiToken: true, gtm: true, sendgrid: true }, cost);
  check("no_spend riasztás", b.alerts.some((a) => a.key === "no_spend"), b.alerts.map((a) => a.key).join(","));
  check("a publikálást említi", /publikálva/.test(b.alerts.find((a) => a.key === "no_spend")?.why ?? ""));
}

// 13. Attribution drift only fires once our own count can carry the ratio.
{
  const now = Date.parse("2026-09-25T20:00:00+02:00");
  const rows: EventDoc[] = [];
  for (let i = 0; i < 6; i++) {
    rows.push({ name: "program_purchased", at: Date.parse("2026-09-23T12:00:00+02:00") + i * 1000, props: { sessionId: `cs_${i}`, amountHuf: 9990 } });
    // The twin the webhook/confirm pair produces - must not inflate the count.
    rows.push({ name: "program_purchased", at: Date.parse("2026-09-23T12:00:00+02:00") + i * 1000, props: { sessionId: `cs_${i}`, amountHuf: 9990 } });
  }
  const cfg = { pixel: true, capiToken: true, gtm: true, sendgrid: true };
  const spend = (p: number): CostSide => ({ ok: true, totalSpendHuf: 40_000, totalPurchases: p, days: [{ date: "2026-09-25", spendHuf: 40_000, impressions: 1, clicks: 1, ctr: 1, cpmHuf: 1, frequency: 1, purchases: p }] });

  const dedup = buildBrief(rows, now, cfg, spend(6));
  check("12 sorból 6 vásárlás", dedup.total.purchases === 6, `kapott: ${dedup.total.purchases}`);
  check("egyezésnél nincs drift", !dedup.alerts.some((a) => a.key === "attribution_drift"));

  const drifted = buildBrief(rows, now, cfg, spend(2));
  check("nagy eltérésnél van drift", drifted.alerts.some((a) => a.key === "attribution_drift"));
}

if (failures) {
  console.error(`\n${failures} hiba.`);
  process.exit(1);
}
console.log("  ✓ campaign brief (13 eset)\n\nAll self-tests passed.");
