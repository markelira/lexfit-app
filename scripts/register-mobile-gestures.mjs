// Gesture tests for the /register mobile swipe-back.
// docs/register-mobile-redesign-plan.md §4
//
//   npm run dev                                   # in another shell
//   node scripts/register-mobile-gestures.mjs
//
// Drives a headless Chrome over CDP at a phone viewport and asserts the four
// decision cases plus interruptibility.
//
// WHY MOUSE AND NOT TOUCH: headless Chrome's touch emulation
// (Input.dispatchTouchEvent) fires `pointercancel` immediately after the first
// pointermove, so a touch-driven drag can never be completed here. That was
// verified to be an emulation artifact, not our code — it reproduces with
// touch-action `none`, `manipulation` and `pan-y` alike. Mouse pointer events
// exercise exactly the same handler with an uncancelled stream. Real-finger
// behaviour on iOS therefore remains UNVERIFIED by this script.

import { spawn } from "node:child_process";
import WebSocket from "ws";

const PORT = 9338;
const ORIGIN = process.env.ORIGIN || "http://localhost:3000";
const W = 402, H = 874;

const proc = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${PORT}`, "--disable-gpu", "--hide-scrollbars",
  "--no-first-run", "--user-data-dir=/tmp/lx-gestures", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 60; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const page = list.find((t) => t.type === "page");
    if (page) { wsUrl = page.webSocketDebuggerUrl; break; }
  } catch { /* not up yet */ }
  await sleep(250);
}
const ws = new WebSocket(wsUrl, { maxPayload: 256 * 1024 * 1024 });
await new Promise((r) => ws.once("open", r));

let id = 0; const pend = new Map(); const evts = [];
ws.on("message", (m) => {
  const j = JSON.parse(m.toString());
  if (j.id && pend.has(j.id)) {
    const { res, rej } = pend.get(j.id); pend.delete(j.id);
    j.error ? rej(new Error(JSON.stringify(j.error))) : res(j.result);
  } else if (j.method) evts.push(j);
});
const send = (m, p = {}) => new Promise((res, rej) => { const n = ++id; pend.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method: m, params: p })); });
const ev = (e) => send("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true }).then((r) => r.result?.value);

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 2, mobile: false });

async function goto(u) {
  evts.length = 0;
  await send("Page.navigate", { url: u });
  for (let i = 0; i < 80; i++) { if (evts.some((e) => e.method === "Page.loadEventFired")) break; await sleep(100); }
  await sleep(1300);
}
const mouse = (type, x, y) =>
  send("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1, pointerType: "mouse" });

await goto(`${ORIGIN}/register`);
await ev(`localStorage.setItem('lx-consent','denied'); localStorage.removeItem('lexfit_onb_v1'); 1`);

let failures = 0;
const Y = 620; // inside the sheet, over the option rows

async function drag(label, xs, pause, expect) {
  await ev(`localStorage.removeItem('lexfit_onb_v1'); 1`);
  await goto(`${ORIGIN}/register?q=3`); // "level"
  await mouse("mousePressed", 40, Y);
  let mid = null;
  for (const x of xs) {
    await mouse("mouseMoved", x, Y);
    await sleep(pause);
    if (x === xs[Math.floor(xs.length / 2)]) {
      mid = await ev(`(function(){
        var t=document.querySelector('.fnl-layer.top'), u=document.querySelector('.fnl-layer.under'),
            b=document.querySelector('.authx-brand'), s=document.querySelector('.fnl-nav');
        // NB: match inside translate3d(...) - a bare /-?[\\d.]+/ picks up the
        // "3" in "translate3d" and silently reports every offset as 3px.
        var num=function(el){ if(!el) return null; var m=el.style.transform.match(/translate3d\\(\\s*(-?[\\d.]+)px/); return m?Number(m[1]):0; };
        // The photo plane is driven through a custom property, not a transform
        // on the panel — reading .style.transform here silently returned 0.
        var px=function(el){ return el ? (parseFloat(el.style.getPropertyValue('--fnl-px')) || 0) : null; };
        return { topX:num(t), underX:num(u), photoX:px(b),
                 dragging: s && s.classList.contains('is-dragging'),
                 blurDropped: getComputedStyle(document.querySelector('.fnl-sheet')).backdropFilter === 'none' };
      })()`);
    }
  }
  await mouse("mouseReleased", xs[xs.length - 1], Y);
  await sleep(900);
  const step = await ev(`document.querySelector('.fnl-wiz').dataset.step`);
  const ok = step === expect;
  if (!ok) failures++;
  console.log(`${ok ? "✅" : "❌"} ${label.padEnd(26)} → ${String(step).padEnd(7)}${ok ? "" : ` (expected ${expect})`}`);
  if (mid) {
    // The photo plane must trail the sheet at exactly PHOTO_PARALLAX, and must
    // be slower than the under layer's 28% or it is not parallax at all.
    const ratio = mid.topX ? mid.photoX / mid.topX : 0;
    const parallaxOk = Math.abs(ratio - 0.14) < 0.01;
    if (!parallaxOk) failures++;
    console.log(`   ${parallaxOk ? "✅" : "❌"} parallax ${(ratio * 100).toFixed(1)}% of travel (expect 14%)` +
      ` · dragging=${mid.dragging} · blur dropped mid-drag=${mid.blurDropped}`);
    if (!mid.dragging || !mid.blurDropped) failures++;
  }
}

console.log("swipe-back decisions\n");
await drag("far drag → commit", [80, 140, 200, 260, 320], 55, "focus");
await drag("slow short → snap back", [55, 70, 85, 100], 170, "level");
await drag("fast short flick → commit", [60, 95, 130], 22, "focus");
await drag("leftward drag → rubber-band", [20, -10, -40], 60, "level");

console.log("\ninterruptibility — grab a settling screen (skill §3)\n");
await goto(`${ORIGIN}/register?q=3`);
await mouse("mousePressed", 40, Y);
for (const x of [90, 150, 210]) { await mouse("mouseMoved", x, Y); await sleep(50); }
await mouse("mouseReleased", 210, Y);
await sleep(70); // the commit spring is mid-flight
const topX = async () => {
  const t = (await ev(`(document.querySelector('.fnl-layer.top')||{style:{}}).style.transform`)) || "";
  return Number(t.match(/translate3d\(\s*(-?[\d.]+)px/)?.[1] ?? 0);
};
const before = await topX();
await mouse("mousePressed", 210, Y);   // grab it again
await mouse("mouseMoved", 120, Y);      // and pull it 90px back
await sleep(60);
const during = await topX();
await mouse("mouseReleased", 120, Y);
await sleep(900);
const finalStep = await ev(`document.querySelector('.fnl-wiz').dataset.step`);

// The regrab must continue from the PRESENTATION value: 90px of pull from
// `before` should land within a frame's worth of `before - 90`, not snap to 0.
const continuous = Math.abs((before - 90) - during) < 12;
if (!continuous) failures++;
if (finalStep !== "level") failures++;
console.log(`${continuous ? "✅" : "❌"} continues from on-screen value: ${before.toFixed(0)}px −90px → ${during.toFixed(0)}px (expect ~${(before - 90).toFixed(0)}, NOT 0)`);
console.log(`${finalStep === "level" ? "✅" : "❌"} reversal did not navigate → ${finalStep}`);

console.log("\ndesktop must not mount the stage\n");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await goto(`${ORIGIN}/register?q=3`);
const layers = await ev(`document.querySelectorAll('.fnl-layer').length`);
if (layers !== 0) failures++;
console.log(`${layers === 0 ? "✅" : "❌"} .fnl-layer count at 1440px: ${layers} (expect 0)`);

ws.close(); proc.kill();
console.log(failures ? `\n${failures} FAILURE(S)` : "\nall gesture checks passed");
process.exit(failures ? 1 : 0);
