"use client";

// Rasterize a finish-share overlay onto a photo, at export resolution, mirroring
// FinishOverlay's DOM geometry via the SAME GEO constants — so the shared image
// is pixel-identical to the on-screen preview. Pure white, no shadow.
import {
  GEO, LOCKUP, REF_W, REF_H,
  defaultTrio, posterContent,
  type FinishData, type OverlayDir, type Slot,
} from "@/lib/finish-overlays";

const K_SIZE = 13;
const K_TRACK = -0.004; // em
const V_TRACK = -0.028; // em
const WD_TRACK = 0.055; // em

type Align = "left" | "center";

async function ensureFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load("600 13px Poppins"),
      document.fonts.load("700 78px Poppins"),
      document.fonts.load("800 18px Poppins"),
    ]);
  } catch { /* fall back to whatever's available */ }
}

export interface RenderOpts {
  photo: CanvasImageSource | null; // captured selfie (null → dark fill, for previews)
  dir: OverlayDir;
  data: FinishData;
  scrim?: boolean;
  offset?: { x: number; y: number }; // drag-nudge, in reference-space px
  width?: number; // export width (default 1080 → 1080×1920)
}

export async function renderFinishImage(opts: RenderOpts): Promise<Blob> {
  const W = opts.width ?? 1080;
  const H = Math.round((W * 16) / 9);
  const S = W / REF_W; // reference-space → export-space scale
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  await ensureFonts();

  // 1 · background: cover-fit the photo, or a dark fill.
  if (opts.photo) drawCover(ctx, opts.photo, W, H);
  else { ctx.fillStyle = "#221f1c"; ctx.fillRect(0, 0, W, H); }

  // 2 · optional scrim (mirrors FinishOverlay.css .fs-scrim.*).
  if (opts.scrim) drawScrim(ctx, opts.dir, W, H);

  // 3 · overlay, at exact geometry (offset applied for drag-nudge).
  ctx.save();
  ctx.translate((opts.offset?.x ?? 0) * S, (opts.offset?.y ?? 0) * S);
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  drawDir(ctx, opts.dir, opts.data, S);
  ctx.restore();

  return await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/jpeg", 0.92),
  );
}

// ── drawing helpers (all coordinates in reference px, multiplied by S) ──

function setFont(ctx: CanvasRenderingContext2D, weight: number, sizeRef: number, trackEm: number, S: number) {
  const px = sizeRef * S;
  ctx.font = `${weight} ${px}px Poppins, sans-serif`;
  ctx.letterSpacing = `${trackEm * px}px`;
}
function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, align: Align) {
  if (align === "center") { const w = ctx.measureText(s).width; ctx.fillText(s, x - w / 2, y); }
  else ctx.fillText(s, x, y);
}
const labelH = (S: number) => K_SIZE * S * 1.1;
const valueH = (sizeRef: number, S: number) => sizeRef * S * 1.04;

/** Draw a label/value group at (x,y); returns the y after it. */
function group(ctx: CanvasRenderingContext2D, x: number, y: number, s: Slot, valueSize: number, S: number, align: Align) {
  setFont(ctx, 600, K_SIZE, K_TRACK, S);
  ctx.globalAlpha = 0.92;
  text(ctx, s.k, x, y, align);
  ctx.globalAlpha = 1;
  y += labelH(S) + 2 * S;
  setFont(ctx, 700, valueSize, V_TRACK, S);
  text(ctx, s.v, x, y, align);
  return y + valueH(valueSize, S);
}

/** Draw the LEXFIT mark (arc + dot) with its top-left at (x,y), sized w×h (ref px→S applied by caller). */
function mark(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / 680, h / 616);
  ctx.translate(-192, -152);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 112;
  ctx.lineCap = "round";
  ctx.stroke(new Path2D("M248 712A400 400 0 0 1 648 312"));
  ctx.fillStyle = "#fff";
  const dot = new Path2D();
  dot.arc(800, 224, 72, 0, Math.PI * 2);
  ctx.fill(dot);
  ctx.fillStyle = "#fff";
  ctx.restore();
}

/** Horizontal or column lockup at (x,y); returns height consumed (ref-space *S). */
function lockup(ctx: CanvasRenderingContext2D, x: number, y: number, variant: keyof typeof LOCKUP, S: number, column: boolean, centerX?: number) {
  const l = LOCKUP[variant];
  const iw = l.icon * S, ih = l.iconH * S, gap = l.gap * S;
  setFont(ctx, 800, l.word, WD_TRACK, S);
  const wordH = l.word * S; // approx cap+line

  if (column) {
    // stacked, centered on centerX
    const cx = centerX ?? x;
    mark(ctx, cx - iw / 2, y, iw, ih);
    const wy = y + ih + gap;
    ctx.textBaseline = "top";
    text(ctx, "LEXFIT", cx, wy, "center");
    return ih + gap + wordH;
  }
  // horizontal: mark then word, vertically centered on the mark height
  mark(ctx, x, y, iw, ih);
  ctx.textBaseline = "middle";
  ctx.fillText("LEXFIT", x + iw + gap, y + ih / 2);
  ctx.textBaseline = "top";
  return Math.max(ih, wordH);
}

function drawDir(ctx: CanvasRenderingContext2D, dir: OverlayDir, data: FinishData, S: number) {
  switch (dir) {
    case "A": {
      const g = GEO.A;
      let y = g.block.top * S;
      const x = g.block.left * S;
      y += lockup(ctx, x, y, "sm", S, false) + g.lockupGap * S;
      defaultTrio(data).forEach((s, i) => {
        if (i) y += g.groupGap * S;
        y = group(ctx, x, y, s, g.valueSize, S, "left");
      });
      break;
    }
    case "E": {
      const g = GEO.E;
      const x = g.block.left * S;
      // bottom-anchor (bottom: 34): total height = spine + gap + trio
      const trio = defaultTrio(data);
      let h = 0;
      // approximate spine height: 6 chars * spineSize * ~0.62 tracking expansion
      const spineTextH = spineApproxHeight(g.spineSize, g.spineTrack, S);
      h += spineTextH + g.spineGap * S;
      trio.forEach((s, i) => { if (i) h += g.groupGap * S; h += labelH(S) + 2 * S + valueH(g.valueSize, S); });
      let y = REF_H * S - g.block.bottom * S - h;
      drawSpine(ctx, x, y, g.spineSize, g.spineTrack, S);
      y += spineTextH + g.spineGap * S;
      trio.forEach((s, i) => { if (i) y += g.groupGap * S; y = group(ctx, x, y, s, g.valueSize, S, "left"); });
      break;
    }
    case "B": {
      const g = GEO.B;
      // brackets
      ctx.save();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2 * S;
      ctx.lineCap = "butt";
      for (const d of g.brackets) ctx.stroke(new Path2D(scalePath(d, S)));
      ctx.restore();
      const x = g.block.left * S;
      let y = g.block.top * S;
      defaultTrio(data).forEach((s, i) => { if (i) y += g.groupGap * S; y = group(ctx, x, y, s, g.valueSize, S, "left"); });
      y += g.lockupGap * S;
      lockup(ctx, x, y, "sm", S, false);
      break;
    }
    case "C": {
      const g = GEO.C;
      const c = posterContent(data);
      const x = g.block.left * S;
      // bottom-anchored: measure total height
      const h = lockHeights(g, c, S);
      let y = REF_H * S - g.block.bottom * S - h;
      y += lockup(ctx, x, y, "sm", S, false) + g.lockupGap * S;
      setFont(ctx, 600, g.headSize, K_TRACK, S); ctx.globalAlpha = 0.92; text(ctx, c.headline, x, y, "left"); ctx.globalAlpha = 1;
      y += labelH(S) + 2 * S;
      setFont(ctx, 700, g.bigSize, g.bigTrack, S); text(ctx, c.big, x, y, "left");
      y += g.bigSize * S * g.bigLine;
      setFont(ctx, 700, g.unitSize, V_TRACK, S); text(ctx, c.unit, x, y, "left");
      y += valueH(g.unitSize, S) + g.footGap * S;
      setFont(ctx, 600, g.headSize, K_TRACK, S); ctx.globalAlpha = 0.92;
      c.footnote.split("\n").forEach((line, i) => { text(ctx, line, x, y + i * g.headSize * S * g.footLine, "left"); });
      ctx.globalAlpha = 1;
      break;
    }
    case "F": {
      const g = GEO.F;
      const cx = (REF_W / 2) * S;
      const trio = defaultTrio(data);
      // total height to vertically center
      const groupH = labelH(S) + 2 * S + valueH(g.valueSize, S);
      const lockTotal = LOCKUP.col.iconH * S + LOCKUP.col.gap * S + LOCKUP.col.word * S;
      const total = trio.length * groupH + (trio.length - 1) * g.groupGap * S + g.lockupGap * S + lockTotal;
      let y = (REF_H * S - total) / 2;
      trio.forEach((s, i) => { if (i) y += g.groupGap * S; y = group(ctx, cx, y, s, g.valueSize, S, "center"); });
      y += g.lockupGap * S;
      lockup(ctx, cx, y, "col", S, true, cx);
      break;
    }
  }
}

// vertical wordmark (E): draw each letter down the edge with letter-spacing.
function drawSpine(ctx: CanvasRenderingContext2D, x: number, y: number, sizeRef: number, trackEm: number, S: number) {
  setFont(ctx, 800, sizeRef, 0, S);
  ctx.textBaseline = "top";
  const px = sizeRef * S;
  const step = px + trackEm * px; // letter advance ≈ cap height + tracking
  let cy = y;
  for (const ch of "LEXFIT") {
    const w = ctx.measureText(ch).width;
    ctx.fillText(ch, x + (px - w) / 2, cy);
    cy += step;
  }
}
function spineApproxHeight(sizeRef: number, trackEm: number, S: number) {
  const px = sizeRef * S;
  return "LEXFIT".length * (px + trackEm * px);
}

function lockHeights(g: typeof GEO.C, c: ReturnType<typeof posterContent>, S: number) {
  // lockup() consumes max(iconH, word) — match it so the bottom-anchor is exact.
  let h = Math.max(LOCKUP.sm.iconH, LOCKUP.sm.word) * S + g.lockupGap * S;
  h += labelH(S) + 2 * S;                 // headline
  h += g.bigSize * S * g.bigLine;         // big number
  h += valueH(g.unitSize, S) + g.footGap * S;
  h += c.footnote.split("\n").length * g.headSize * S * g.footLine; // footnote lines
  return h;
}

function scalePath(d: string, S: number) {
  // scale the numeric tokens of a simple "M.. v.. h.." path
  return d.replace(/-?\d+(\.\d+)?/g, (n) => String(Number(n) * S));
}

function drawCover(ctx: CanvasRenderingContext2D, img: CanvasImageSource, W: number, H: number) {
  const iw = (img as HTMLVideoElement).videoWidth || (img as HTMLImageElement).width || (img as HTMLCanvasElement).width;
  const ih = (img as HTMLVideoElement).videoHeight || (img as HTMLImageElement).height || (img as HTMLCanvasElement).height;
  if (!iw || !ih) { ctx.fillStyle = "#221f1c"; ctx.fillRect(0, 0, W, H); return; }
  const scale = Math.max(W / iw, H / ih);
  const dw = iw * scale, dh = ih * scale;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

function drawScrim(ctx: CanvasRenderingContext2D, dir: OverlayDir, W: number, H: number) {
  ctx.save();
  let grad: CanvasGradient;
  if (dir === "C") { grad = ctx.createLinearGradient(0, H, 0, H * 0.54); grad.addColorStop(0, "rgba(0,0,0,0.5)"); grad.addColorStop(1, "rgba(0,0,0,0)"); }
  else {
    const [cx, cy] = dir === "A" ? [0, 0] : dir === "E" ? [0, H] : dir === "B" ? [W * 0.32, H * 0.62] : [W / 2, H / 2];
    grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
    grad.addColorStop(0, "rgba(0,0,0,0.42)"); grad.addColorStop(0.6, "rgba(0,0,0,0)");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
