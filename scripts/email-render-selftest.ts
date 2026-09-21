/**
 * Email render self-test.
 *
 * `deliver()` catches a template that throws and returns { sent: false }, so a
 * broken email does not crash anything - it silently reaches nobody while the
 * cron reports "failed". Typechecking will not catch it either, because the
 * failure happens at render time, inside React.
 *
 * So this renders every variant the Start campaign can produce and asserts two
 * things survived: the CTA, without which the mail has no job, and the
 * unsubscribe link, whose absence is a Grtv. §6 problem rather than a cosmetic
 * one. Run it before any send that has not been sent before.
 */
import { render } from "react-email";
import C1, { subject as s1 } from "../emails/start-c1";
import C2, { subject as s2 } from "../emails/start-c2";
import C3, { subjectFor } from "../emails/start-c3";
import C4, { subject as s4 } from "../emails/start-c4";

const U = "https://www.lexfit.hu/unsub/abc";
const H = "https://www.lexfit.hu/start?utm_source=email&utm_medium=owned&utm_campaign=start9990_szept&utm_content=c1";
const cases: [string, string, () => React.ReactElement][] = [
  ["C1", s1, () => C1({ unsubHref: U, ctaHref: H })],
  ["C2", s2, () => C2({ unsubHref: U, ctaHref: H })],
  ["C3 restart", subjectFor("restart"), () => C3({ unsubHref: U, ctaHref: H, segment: "restart" })],
  ["C3 no_energy", subjectFor("no_energy"), () => C3({ unsubHref: U, ctaHref: H, segment: "no_energy" })],
  ["C3 careful", subjectFor("careful"), () => C3({ unsubHref: U, ctaHref: H, segment: "careful" })],
  ["C3 stronger", subjectFor("stronger"), () => C3({ unsubHref: U, ctaHref: H, segment: "stronger" })],
  ["C4", s4, () => C4({ unsubHref: U, ctaHref: H })],
];

async function main() {
  let bad = 0;
  for (const [name, subj, make] of cases) {
    try {
      const html = await render(make());
      const text = await render(make(), { plainText: true });
      const cta = html.includes("utm_content=c1");
      const uns = html.includes(U);
      const ok = html.length > 800 && cta && uns && text.length > 200;
      if (!ok) bad++;
      console.log(`${ok ? "✓" : "✗"} ${name.padEnd(13)} html ${String(html.length).padStart(5)}  szöveg ${String(text.length).padStart(4)}  CTA ${cta ? "ok" : "HIÁNYZIK"}  leiratk. ${uns ? "ok" : "HIÁNYZIK"}`);
      console.log(`    tárgy: ${subj}`);
    } catch (e) {
      bad++;
      console.log(`✗ ${name} RENDER HIBA: ${(e as Error).message.slice(0, 160)}`);
    }
  }
  if (bad) {
    console.error(`\n${bad} sablon nem renderelhető.`);
    process.exit(1);
  }
  console.log("\nAll self-tests passed.");
}
void main();
