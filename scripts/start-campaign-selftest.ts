/**
 * Start campaign self-test.
 *
 * This campaign mails a real list of real people under Hungarian marketing law,
 * so the consent gate is not a preference - it is the thing that must not have
 * a bug. These cases pin it, along with the idempotency that stops a re-run
 * mailing somebody twice and the schedule that decides who gets what when.
 */
import {
  CAMPAIGN_START_MS,
  ctaHref,
  dueAt,
  dueStep,
  segmentOf,
  stopFor,
  STEPS,
  type CampaignLead,
} from "../src/lib/start-campaign/sequence";

let failures = 0;
const check = (name: string, cond: boolean, detail?: string) => {
  if (cond) return;
  failures++;
  console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
};

const T = CAMPAIGN_START_MS;
const DAY = 86_400_000;
const ok = (o: Partial<CampaignLead> = {}): CampaignLead => ({
  email: "a@b.hu",
  consents: { marketing: true },
  ...o,
});

console.log("start campaign");

// 1. The schedule is the one the owner chose, in Budapest time.
check("indulás 2026-09-21 17:30 CEST", T === Date.parse("2026-09-21T17:30:00+02:00"));
check("4 lépés", STEPS.length === 4);
check("2. levél +1 nap", dueAt(2) === T + DAY);
check("4. levél +4 nap (nem +3)", dueAt(4) === T + 4 * DAY, String((dueAt(4) - T) / DAY));

// 2. Before the first send, nothing is due - the cron must be able to run
//    harmlessly ahead of time.
check("indulás előtt nincs esedékes", dueStep(T - 1) === null);
check("indulás pillanatában az 1.", dueStep(T) === 1);
check("másnap a 2.", dueStep(T + DAY + 60_000) === 2);
check("3 nap múlva még a 3.", dueStep(T + 3 * DAY) === 3);
check("5 nap múlva a 4. (nincs 5.)", dueStep(T + 5 * DAY) === 4);

// 3. THE GATE. 221 of 456 leads set marketing to false; they must never be
//    reachable, and an absent or truthy-but-not-true value is not permission.
check("marketing=false → tilos", stopFor(ok({ consents: { marketing: false } }), 1, T) === "no_consent");
check("consents hiányzik → tilos", stopFor({ email: "a@b.hu" }, 1, T) === "no_consent");
check("consents üres objektum → tilos", stopFor(ok({ consents: {} }), 1, T) === "no_consent");
check("marketing=true → mehet", stopFor(ok(), 1, T) === null);
check("email nélkül → tilos", stopFor(ok({ email: undefined }), 1, T) === "no_email");
check("leiratkozott → tilos", stopFor(ok({ unsubscribedAt: 1 }), 1, T) === "unsubscribed");
check("már fizetett → tilos", stopFor(ok({ paidAt: 1 }), 1, T) === "converted");
check("convertedAt → tilos", stopFor(ok({ convertedAt: 1 }), 1, T) === "converted");

// 4. Idempotency: the cron may run twice in a day, and must not mail twice.
check("már megkapta → nem megy újra", stopFor(ok({ startCampaignStep: 1 }), 1, T) === "already_sent");
check("1-et megkapta, 2-t még nem", stopFor(ok({ startCampaignStep: 1 }), 2, T) === null);
check("előrébb jár, mint a lépés", stopFor(ok({ startCampaignStep: 3 }), 2, T) === "already_sent");

// 5. The mid-sequence switch is OFF by the owner's decision. This asserts the
//    shipped default, so flipping it is a deliberate act and not a drift.
check(
  "futó sorozat mellett is megy (a tulaj döntése)",
  stopFor(ok({ nextEmailAt: T + DAY }), 1, T) === null,
);

// 6. Segments come from the lead's own quiz answer; anything unknown lands on
//    the restart door rather than on nothing.
check("restart", segmentOf("restart") === "restart");
check("no_energy", segmentOf("no_energy") === "no_energy");
check("careful", segmentOf("careful") === "careful");
check("stronger", segmentOf("stronger") === "stronger");
check("browsing → restart", segmentOf("browsing") === "restart");
check("ismeretlen → restart", segmentOf(undefined) === "restart" && segmentOf("xyz") === "restart");

// 7. Links carry the UTMs the brief and GA4 read, and point at /start.
{
  const h = ctaHref("https://www.lexfit.hu", 3);
  check("a /start oldalra visz", h.startsWith("https://www.lexfit.hu/start?"));
  check("kampány-UTM", h.includes("utm_campaign=start9990_szept"));
  check("levelenkénti content", h.includes("utm_content=c3"));
}

if (failures) {
  console.error(`\n${failures} hiba.`);
  process.exit(1);
}
console.log("  ✓ start campaign (28 eset)\n\nAll self-tests passed.");
