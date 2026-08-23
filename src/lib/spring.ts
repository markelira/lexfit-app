"use client";

// A tiny interruptible spring, parameterised the way Apple parameterises motion
// (skill: apple-design §4) - two designer-facing numbers, not mass/stiffness/
// damping:
//
//   bounce    0    = critically damped, no overshoot (the default for UI)
//             ~0.2 = a little overshoot; use ONLY after a gesture carried
//                    momentum (a flick, a drag release)
//   duration  seconds to reach the target. NOT a fixed duration - a spring has
//             none; settle time emerges from the parameters. This is Apple's
//             "response".
//
// Why hand-rolled rather than a library (plan D9): the codebase has zero
// animation dependencies, and CSS transitions are disqualified outright for
// anything gesture-driven - they cannot be grabbed and reversed mid-flight
// (§3). Two things animate in the funnel; 90 lines beats an 18KB dependency.
//
// The important properties, all of which §3/§5 require:
//   • integrates numerically, so re-targeting mid-flight is free
//   • always continues from the PRESENTATION value, never from the target,
//     so an interrupt never jumps
//   • carries velocity through a re-target, so a reversal has no "brick wall"
//   • accepts a release velocity for gesture → animation handoff

export interface SpringConfig {
  bounce?: number; // 0 = no overshoot (default)
  duration?: number; // seconds (default 0.4)
}

const TAU = Math.PI * 2;
// Integrate at a fixed 240Hz regardless of display rate: large frame gaps
// (a backgrounded tab, a slow frame) would otherwise make the integration
// explode rather than merely stutter.
const STEP = 1 / 240;
const MAX_FRAME = 0.064; // clamp a long gap to ~4 frames of catch-up

export class Spring {
  value: number;
  velocity = 0;
  target: number;
  private k: number; // stiffness
  private c: number; // damping
  private raf = 0;
  private last = 0;
  private onFrame: (v: number) => void;
  private onRest?: () => void;

  constructor(initial: number, onFrame: (v: number) => void, onRest?: () => void) {
    this.value = initial;
    this.target = initial;
    this.onFrame = onFrame;
    this.onRest = onRest;
    this.k = 0;
    this.c = 0;
    this.configure({});
  }

  configure({ bounce = 0, duration = 0.4 }: SpringConfig) {
    const w0 = TAU / Math.max(0.05, duration); // undamped natural frequency
    const zeta = Math.max(0, 1 - bounce); // damping ratio; bounce 0 → critically damped
    this.k = w0 * w0;
    this.c = 2 * zeta * w0;
    return this;
  }

  /** Re-target. Keeps the current value AND velocity unless `velocity` is given
   *  (hand the pointer's release velocity in, in px/s - §5). */
  set(target: number, opts: SpringConfig & { velocity?: number } = {}) {
    if (opts.bounce !== undefined || opts.duration !== undefined) this.configure(opts);
    this.target = target;
    if (opts.velocity !== undefined) this.velocity = opts.velocity;
    this.start();
  }

  /** Jump with no animation (used while a finger is driving the value 1:1). */
  snap(value: number, velocity = 0) {
    this.stop();
    this.value = value;
    this.velocity = velocity;
    this.target = value;
    this.onFrame(this.value);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.last = 0;
  }

  get isAnimating() {
    return this.raf !== 0;
  }

  private start() {
    if (this.raf) return; // already running - the new target is simply picked up
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const dt = Math.min(MAX_FRAME, (now - this.last) / 1000);
    this.last = now;

    let t = dt;
    while (t > 0) {
      const h = Math.min(STEP, t);
      // Semi-implicit Euler: stable, and trivially re-targetable because the
      // state IS the on-screen value.
      const a = -this.k * (this.value - this.target) - this.c * this.velocity;
      this.velocity += a * h;
      this.value += this.velocity * h;
      t -= h;
    }

    const restingDisplacement = Math.abs(this.value - this.target) < 0.05;
    const restingVelocity = Math.abs(this.velocity) < 0.05;
    if (restingDisplacement && restingVelocity) {
      this.value = this.target;
      this.velocity = 0;
      this.onFrame(this.value);
      this.stop();
      this.onRest?.();
      return;
    }

    this.onFrame(this.value);
    this.raf = requestAnimationFrame(this.tick);
  };
}

/** Apple's momentum projection (skill §6). NOT the textbook v²/2a - this is the
 *  exponential-decay form from the Designing Fluid Interfaces sample code, and
 *  it is what makes a flick feel like a throw rather than a snap-to-nearest. */
export function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance at a boundary (skill §9). Real things slow before
 *  they stop; a hard stop reads as "frozen", not as "there is nothing here". */
export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Tracks a short pointer history so release velocity is a real measurement
 *  rather than the last single delta, which is noisy (skill §2). */
export class VelocityTracker {
  private pts: { x: number; t: number }[] = [];
  add(x: number, t: number) {
    this.pts.push({ x, t });
    if (this.pts.length > 6) this.pts.shift();
  }
  reset() {
    this.pts = [];
  }
  /** px/s over the last ~80ms of movement. */
  get velocity() {
    if (this.pts.length < 2) return 0;
    const last = this.pts[this.pts.length - 1];
    let first = this.pts[0];
    for (const p of this.pts) {
      if (last.t - p.t <= 80) { first = p; break; }
    }
    const dt = (last.t - first.t) / 1000;
    if (dt <= 0) return 0;
    return (last.x - first.x) / dt;
  }
}
