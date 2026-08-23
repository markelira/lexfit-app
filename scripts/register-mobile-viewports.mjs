// Responsive matrix for /register on mobile.
// docs/register-mobile-redesign-plan.md §7e
//
//   npm run dev                                     # in another shell
//   node scripts/register-mobile-viewports.mjs [--shots DIR]
//
// Checks, at every viewport in the matrix, the things that actually broke on a
// real phone and were invisible in a single-size check:
//
//   • the question title is VISIBLE (not just present in the DOM)
//   • the caption fits its band instead of being sliced by the sheet
//   • the sheet, its action bar and the last option row do not overflow
//   • the photo still covers the viewport while the parallax is at full travel
//
// Heights here are CSS viewport heights WITH browser chrome, which is what a
// page actually gets — not the nominal device height. That gap (~230px on an
// iPhone) is what made the first version pass locally and fail on a phone.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import WebSocket from "ws";

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const SHOTS = arg("shots", null);
const ORIGIN = process.env.ORIGIN || "http://localhost:3000";
const PORT = 9370;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const MATRIX = [
  // label                              w    h   note
  ["iPhone SE · Safari",               375, 553],
  ["iPhone SE · chrome hidden",        375, 667],
  ["iPhone 13 mini · Safari",          375, 629],
  ["iPhone 15 Pro · Safari",           393, 622], // ← the reported bug
  ["iPhone 15 Pro · chrome hidden",    393, 852],
  ["iPhone 15 Plus · Safari",          428, 716],
  ["iPhone 16 Pro Max · Safari",       440, 794],
  ["Pixel 7 · Chrome",                 412, 730],
  ["Galaxy S8 (narrow)",               360, 616],
  ["very narrow",                      320, 568],
  ["landscape phone",                  740, 360],
];

const STEPS = [["goal", "?q=1"], ["days", "?q=4"], ["why", "?q=why"], ["plan", "?q=plan"]];

const proc = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu", "--hide-scrollbars",
  "--no-first-run", "--user-data-dir=/tmp/lx-viewports", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 60; i++) {
  try {
    const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const pg = l.find((t) => t.type === "page");
    if (pg) { wsUrl = pg.webSocketDebuggerUrl; break; }
  } catch { /* not up */ }
  await sleep(250);
}
const ws = new WebSocket(wsUrl, { maxPayload: 256 * 1024 * 1024 });
await new Promise((r) => ws.once("open", r));
let id = 0; const pend = new Map(); const evts = [];
ws.on("message", (m) => {
  const j = JSON.parse(m.toString());
  if (j.id && pend.has(j.id)) { const { res, rej } = pend.get(j.id); pend.delete(j.id); j.error ? rej(new Error(JSON.stringify(j.error))) : res(j.result); }
  else if (j.method) evts.push(j);
});
const send = (m, p = {}) => new Promise((res, rej) => { const n = ++id; pend.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method: m, params: p })); });
const ev = (e) => send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true }).then((r) => r.result?.value);
await send("Page.enable"); await send("Runtime.enable");

async function goto(u) {
  evts.length = 0;
  await send("Page.navigate", { url: u });
  for (let i = 0; i < 80; i++) { if (evts.some((e) => e.method === "Page.loadEventFired")) break; await sleep(100); }
  // Wait for the step to actually render rather than guessing a delay. Against a
  // remote origin a fixed 1000ms probed an empty document and reported every
  // measurement as null — a harness artifact that read exactly like a layout bug.
  for (let i = 0; i < 60; i++) {
    const ready = await ev(`!!document.querySelector('.fnl-sheet') && !!document.querySelector('.bp-stage')`);
    if (ready) break;
    await sleep(200);
  }
  await sleep(350);
}

// Everything is measured from real geometry, so "looks fine" is never assumed.
const PROBE = `(function(){
  var vw = innerWidth, vh = innerHeight;
  // The plan step titles through PaywallOffer's .pw-title, not .fnl-q.
  var q  = document.querySelector('.fnl-layer.top .fnl-q, .fnl-solo .fnl-q, .fnl-q')
        || document.querySelector('.pw-title');
  var sh = document.querySelector('.fnl-sheet');
  var cap= document.querySelector('.bp-cap');
  var line = cap && cap.querySelector('.bp-line, .bp-slogan');
  var foot = document.querySelector('.fnl-foot');
  var stage = document.querySelector('.bp-stage');
  function box(el){ if(!el) return null; var r = el.getBoundingClientRect();
    return {t:Math.round(r.top), b:Math.round(r.bottom), l:Math.round(r.left), r:Math.round(r.right), h:Math.round(r.height), w:Math.round(r.width)}; }
  var qb = box(q), sb = box(sh), cb = box(cap), lb = box(line), fb = box(foot), gb = box(stage);
  var qStyle = q ? getComputedStyle(q) : null;
  return {
    vw: vw, vh: vh,
    // The title must be inside the sheet's visible area AND actually painted.
    titleVisible: !!(qb && sb && qb.h > 0 && qb.t >= sb.t - 1 && qb.b <= vh + 1
                     && qStyle.visibility !== 'hidden' && qStyle.opacity !== '0'),
    titleBox: qb, sheetTop: sb && sb.t,
    // The caption must finish above the sheet, not disappear behind it.
    capClipped: !!(lb && sb && lb.b > sb.t + 1),
    capOverflow: !!(cb && lb && lb.b > cb.b + 1),
    capBox: lb, capBottom: lb && lb.b,
    // Nothing may run off the bottom.
    footBelow: !!(fb && fb.b > vh + 1),
    sheetBelow: !!(sb && sb.b > vh + 1),
    // The photo layer must still cover the viewport at full parallax travel.
    photoL: gb && gb.l, photoR: gb && gb.r,
    hOverflow: document.documentElement.scrollWidth > vw + 1
  };
})()`;

let fails = 0;
console.log("viewport                          step   title  caption  fits   photo@full");
console.log("─".repeat(80));

for (const [label, w, h] of MATRIX) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 2, mobile: false });
  for (const [stepName, q] of STEPS) {
    await ev(`localStorage.setItem('lx-consent','denied'); localStorage.removeItem('lexfit_onb_v1'); 1`).catch(() => {});
    await goto(`${ORIGIN}/register${q}`);
    await ev(`localStorage.setItem('lx-consent','denied');1`);
    // Park the photo layer at FULL parallax travel and confirm it still covers
    // the viewport there. Must match PHOTO_PARALLAX in StepStage.tsx.
    await ev(`(function(){var b=document.querySelector('.authx-brand'); if(b) b.style.setProperty('--fnl-px', (innerWidth*0.14)+'px'); return 1})()`);
    await sleep(220);
    const r = await ev(PROBE);
    if (!r) { console.log(`${label.padEnd(30)} ${stepName.padEnd(6)} probe failed`); fails++; continue; }

    const covers = r.photoL <= 0 && r.photoR >= r.vw;
    const fits = !r.footBelow && !r.sheetBelow && !r.hOverflow;
    const capOk = !r.capClipped && !r.capOverflow;
    const ok = r.titleVisible && capOk && fits && covers;
    if (!ok) fails++;
    console.log(
      `${label.padEnd(30)} ${stepName.padEnd(6)} ` +
      `${r.titleVisible ? " ok  " : " FAIL"}  ${capOk ? " ok   " : " FAIL "}  ` +
      `${fits ? " ok  " : " FAIL"}  ${covers ? " ok" : ` FAIL (${r.photoL}..${r.photoR} of ${r.vw})`}` +
      (ok ? "" : `   ${JSON.stringify({ title: r.titleBox, sheetTop: r.sheetTop, capB: r.capBottom })}`)
    );
    if (SHOTS && stepName === "goal") {
      const { data } = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(`${SHOTS}/${label.replace(/\W+/g, "-")}.png`, Buffer.from(data, "base64"));
    }
  }
}

ws.close(); proc.kill();
console.log("─".repeat(80));
console.log(fails ? `${fails} FAILURE(S)` : "every viewport passed");
process.exit(fails ? 1 : 0);
