// Screenshot + contrast harness for the /register mobile redesign.
// docs/register-mobile-redesign-plan.md §7b
// Drives a headless Chrome over CDP at a real iPhone viewport, because the
// claude-in-chrome extension could not resize this window below ~728px.
//
//   npm run dev            # in another shell
//   node scripts/register-mobile-shots.mjs [--w 402] [--h 874] [--out DIR]
//
// Seeds a realistic onboarding draft so `reveal` and `plan` render composed
// content rather than empty defaults, and sets the cookie consent to "denied"
// (the privacy-preserving choice) so the banner does not cover the CTA.

import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import WebSocket from "ws";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const W = Number(arg("w", 402));
const H = Number(arg("h", 874));
const OUT = arg("out", "./.register-shots");
const ORIGIN = arg("origin", "http://localhost:3000");
const PORT = 9333;

mkdirSync(OUT, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const proc = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=/tmp/lx-shots-profile",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function targetWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint never came up");
}

const wsUrl = await targetWs();
const ws = new WebSocket(wsUrl, { maxPayload: 256 * 1024 * 1024 });
await new Promise((res, rej) => { ws.once("open", res); ws.once("error", rej); });

let id = 0;
const pending = new Map();
const events = [];
ws.on("message", (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
  } else if (msg.method) events.push(msg);
});
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const n = ++id;
    pending.set(n, { res, rej });
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: W, height: H, deviceScaleFactor: 2, mobile: true,
});
// Force light/dark-agnostic rendering to whatever the page declares.
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

const evaluate = (expr) => send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });

async function goto(url) {
  await send("Page.navigate", { url });
  // Wait for the load event, then a beat for images/fonts to settle.
  for (let i = 0; i < 80; i++) {
    if (events.some((e) => e.method === "Page.loadEventFired")) break;
    await sleep(100);
  }
  events.length = 0;
  await sleep(900);
}

// ── Seed state ────────────────────────────────────────────────────────────
const DRAFT = {
  v: 1,
  idx: 9,
  startedAt: 1755900000000,
  answers: {
    goal: "forma",
    focus: ["fenek"], // OnboardingAnswers.focus is an ARRAY (funnelFromDraft reads focus[0])
    level: 2,
    days: 5,
    weekdays: [1, 2, 4, 5, 6],
    time: "reggel",
    env: ["csendes", "terd"],
    obstacle: "motiv",
    motiv: "Szeretnék végre bírni egy egész napot fáradtság nélkül, és jól érezni magam a bőrömben.",
  },
};

await goto(`${ORIGIN}/register`);
await evaluate(`
  localStorage.setItem('lx-consent','denied');
  localStorage.setItem('lexfit_onb_v1', ${JSON.stringify(JSON.stringify(DRAFT))});
  sessionStorage.setItem('lx_reveal_built','1');
  'ok'
`);

// ── Shots ─────────────────────────────────────────────────────────────────
const SHOTS = [
  ["01-welcome", "/register"],
  ["02-goal", "/register?q=1"],
  ["03-focus", "/register?q=2"],
  ["04-level", "/register?q=3"],
  ["05-days", "/register?q=4"],
  ["06-time", "/register?q=5"],
  ["07-env", "/register?q=6"],
  ["08-obstacle", "/register?q=7"],
  ["09-why", "/register?q=why"],
  ["10-reveal", "/register?q=reveal"],
  ["11-plan", "/register?q=plan"],
  ["12-account", "/register?q=account"],
];

// Warm the dev image optimizer: the first request for each photo is compiled on
// demand and can take seconds, which is why early runs captured blur placeholders
// instead of photos. Visit every step once, discarding the result.
console.log("warming images…");
for (const [, path] of SHOTS) { await goto(ORIGIN + path); }

// Wait until every <img> in the tree has actually decoded, rather than guessing.
// Never await forever: an <img> that is queued but never decodes would hang the
// CDP call (awaitPromise), which is exactly what stalled the first attempt.
const settle = () => evaluate(`
  (async function(){
    var imgs = Array.from(document.images);
    var cap = new Promise(r => setTimeout(r, 6000));
    await Promise.race([
      Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; }))),
      cap,
    ]);
    await Promise.race([document.fonts.ready, cap]);
    return imgs.filter(i => i.naturalWidth > 0).length + '/' + imgs.length;
  })()
`);

for (const [name, path] of SHOTS) {
  await goto(ORIGIN + path);
  // The wizard resumes from the draft on cold open; force the step we asked for.
  await evaluate(`
    (function(){
      var want = ${JSON.stringify(path)};
      if (location.pathname + location.search !== want) {
        history.replaceState({}, '', want);
        window.dispatchEvent(new Event('fnl:nav'));
      }
      return location.href;
    })()
  `);
  await sleep(600);
  const r = await settle();
  await sleep(400);
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, "base64"));
  console.log("✓", name, "images:", r.result?.value ?? "?");
}

// ── Contrast audit (plan §3.1) ────────────────────────────────────────────
// Measure the REAL composited pixels behind the caption on each step, then
// compute the WCAG contrast ratio for the white caption text sitting on them.
// Done in-page by drawing the caption's backdrop region to a canvas: this reads
// photo + scrim exactly as the eye sees them, not as the CSS claims.
console.log("\ncontrast audit — white caption text over photo+scrim");
console.log("step        panel        min    p05    mean   verdict");

const AUDIT = [];
for (const [name, path] of SHOTS.slice(1, 9)) {
  await goto(ORIGIN + path);
  await evaluate(`
    (function(){
      var want = ${JSON.stringify(path)};
      if (location.pathname + location.search !== want) {
        history.replaceState({}, '', want);
        window.dispatchEvent(new Event('fnl:nav'));
      }
    })()
  `);
  await sleep(600);
  await settle();
  await sleep(400);

  // Grab the caption's bounding box, screenshot that clip, and sample it.
  const box = await evaluate(`
    (function(){
      var c = document.querySelector('.bp-cap');
      if (!c) return null;
      var r = c.getBoundingClientRect();
      var p = document.querySelector('.authx-brand');
      return {x:r.x, y:r.y, w:r.width, h:r.height, panel: p ? p.dataset.panel : '?'};
    })()
  `);
  const b = box.result?.value;
  if (!b || b.w < 4) { console.log(`${name.padEnd(12)}(no caption on this step)`); continue; }

  // Hide the caption GLYPHS before sampling. Screenshotting the caption box
  // with its white text still in it measures the text against itself (every
  // step came back at ratio 1.00), not the backdrop the text has to survive.
  // Hide only the CHILD spans, not .bp-cap itself — visibility inherits, and
  // hiding the whole element would also hide its ::before contrast plate, i.e.
  // measure the backdrop the design does not actually ship.
  await evaluate(`document.querySelectorAll('.bp-cap > *').forEach(function(e){e.style.visibility='hidden'}); 1`);
  await sleep(120);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 },
  });
  await evaluate(`document.querySelectorAll('.bp-cap > *').forEach(function(e){e.style.visibility=''}); 1`);
  writeFileSync(`${OUT}/cap-${name}.png`, Buffer.from(shot.data, "base64"));

  // Decode + sample in-page (canvas), which avoids adding an image library.
  const stats = await evaluate(`
    (async function(){
      var img = new Image();
      img.src = 'data:image/png;base64,${shot.data}';
      await img.decode();
      var cv = document.createElement('canvas');
      cv.width = img.width; cv.height = img.height;
      var cx = cv.getContext('2d');
      cx.drawImage(img, 0, 0);
      var d = cx.getImageData(0, 0, cv.width, cv.height).data;
      function lin(v){ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }
      var Ls = [];
      for (var i=0;i<d.length;i+=4){
        Ls.push(0.2126*lin(d[i]) + 0.7152*lin(d[i+1]) + 0.0722*lin(d[i+2]));
      }
      Ls.sort(function(a,b){return b-a;});                 // brightest first = worst for white text
      var ratio = function(L){ return (1.05)/(L+0.05); };  // white (L=1.0) vs backdrop
      var p05 = Ls[Math.floor(Ls.length*0.05)];
      var mean = Ls.reduce(function(a,b){return a+b;},0)/Ls.length;
      return { min: ratio(Ls[0]), p05: ratio(p05), mean: ratio(mean) };
    })()
  `);
  const s = stats.result?.value;
  const verdict = s.p05 >= 4.5 ? "PASS" : s.p05 >= 3.0 ? "LARGE-TEXT ONLY" : "FAIL";
  AUDIT.push({ step: name, panel: b.panel, ...s, verdict });
  console.log(
    `${name.padEnd(12)}${String(b.panel).padEnd(13)}` +
    `${s.min.toFixed(2).padStart(5)}  ${s.p05.toFixed(2).padStart(5)}  ${s.mean.toFixed(2).padStart(5)}   ${verdict}`
  );
}
writeFileSync(`${OUT}/contrast-audit.json`, JSON.stringify(AUDIT, null, 2));

ws.close();
proc.kill();
console.log("\nDone →", OUT);
process.exit(0);
