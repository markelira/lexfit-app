"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Spring, VelocityTracker, project, rubberband, prefersReducedMotion } from "@/lib/spring";
import { haptic } from "@/lib/spring-haptics";

// The iOS navigation-stack transition for the /register wizard, MOBILE ONLY.
// docs/register-mobile-redesign-plan.md §4 · skill: apple-design
//
// Two layers, exactly as UIKit does a push/pop:
//
//   forward   incoming rides in from the right ON TOP;
//             outgoing slides 28% left UNDERNEATH and dims;
//             the photo behind both trails at 14% (slowest plane furthest back)
//   back      outgoing slides right OFF THE TOP;
//             incoming returns from 28% left and un-dims
//
// Enter and exit therefore travel the same path (§7 spatial consistency), and
// the swipe-back gesture tracks that same path 1:1 — which is the whole reason
// the transition is a full-width slide rather than a cheap 28px nudge. If the
// programmatic move and the finger described different distances, they would
// describe two different interfaces.
//
// DESKTOP RENDERS NONE OF THIS. The wizard passes `enabled={false}` above
// 768px and children render bare, so the finished desktop layout is untouched.

const OFFSET = 0.28; // how far the underlying screen sits to the left
// How far the PHOTO plane travels, as a fraction of the sheet's travel.
// Deliberately much less than OFFSET: the photo is a third plane sitting behind
// both screens, and a background that moves as fast as the midground is not
// parallax, it is just a moving background. It was 0.3 — the same rate as the
// under layer — which both flattened the depth and slid the photo off its own
// edge, exposing a ~120px band of shell down the left on every advance.
const PHOTO_PARALLAX = 0.14;
const DIM = 0.35; // how much the underlying screen is dimmed
const HYSTERESIS = 10; // px before a drag commits to an axis (§10)
const FLICK = 500; // px/s rightward that commits a back regardless of distance

export interface StepStageProps {
  /** Identifies the current step; a change drives the transition. */
  stepKey: string;
  /** Position in the flow. Direction comes from comparing indices, so the
   *  stage never has to guess whether a move was forward or backward. */
  stepIndex: number;
  /** The step a back-swipe goes to, or null if there is nowhere back. */
  backKey: string | null;
  /** Render any step by id. Called for the current step and, during a
   *  back-drag, for the previous one so the user sees where they are going. */
  render: (key: string) => React.ReactNode;
  /** Commit a back navigation (the gesture's equivalent of tapping ‹). */
  onBack: () => void;
  /** False on desktop and on `pay` (Stripe's iframe should not be dragged). */
  enabled: boolean;
  /** Per-frame parallax offset in px for the photo layer. The stage reports it
   *  rather than writing to someone else's ref — whoever owns that element
   *  owns its DOM. */
  onParallax?: (x: number) => void;
}

interface Shown {
  key: string;
  index: number;
}
type Move =
  /** A step change is animating: `from` is leaving, the current step arrives. */
  | { kind: "anim"; from: string; dir: 1 | -1 }
  /** A finger is dragging the current step back toward `to`. */
  | { kind: "drag"; to: string }
  | null;

export function StepStage({
  stepKey, stepIndex, backKey, render, onBack, enabled, onParallax,
}: StepStageProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const underRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const springRef = useRef<Spring | null>(null);
  // Which way the running spring is painting. Needed to convert a spring that
  // gets grabbed mid-flight into a drag that continues from the same pixels.
  const springDirRef = useRef<1 | -1>(-1);

  // Derived state on prop change (the React-sanctioned alternative to syncing
  // in an effect): compare indices to learn the direction, with no refs read
  // during render and no setState inside an effect body.
  const [shown, setShown] = useState<Shown>({ key: stepKey, index: stepIndex });
  const [move, setMove] = useState<Move>(null);
  // A committed swipe has already animated both screens into their final
  // places, so the step change it triggers must NOT start the motion again.
  // State rather than a ref: this is read during render, and a ref read during
  // render is exactly the thing that does not reliably re-render.
  const [settledByGesture, setSettledByGesture] = useState(false);
  // Reduced-motion path: cross-fade the single layer instead of sliding two.
  const [fading, setFading] = useState(false);

  // The latest onBack, held in a ref so it is NOT a dependency of the pointer
  // effect below. Re-arming those listeners mid-drag resets their closure state
  // and strands the gesture, and the parent has no way to know a drag is in
  // flight — so the effect must not care how often the parent re-renders.
  const onBackRef = useRef(onBack);
  useEffect(() => { onBackRef.current = onBack; });

  if (shown.key !== stepKey) {
    const dir: 1 | -1 = stepIndex >= shown.index ? 1 : -1;
    setShown({ key: stepKey, index: stepIndex });
    if (settledByGesture) {
      setSettledByGesture(false);
      setMove(null);
    } else {
      // Reduced motion cross-fades a single layer, so there is no second screen
      // to mount - don't build one just to leave it invisible behind the first.
      //
      // `pay` is excluded as an OUTGOING step too. It is excluded from the
      // gesture (enabled=false) but leaving it flips enabled back to true in
      // the same render, so the outgoing layer would mount a fresh PayStep -
      // tearing down Stripe's live embedded checkout and replacing it with a
      // blank consent state for the 400ms of the pop. The screen you watch
      // slide away must be the one you were looking at.
      const twoUp = enabled && shown.key !== "pay" && !prefersReducedMotion();
      setMove(twoUp ? { kind: "anim", from: shown.key, dir } : null);
      if (!twoUp && enabled) setFading(true);
    }
  }

  // Paint one frame. `p` is 0..1. On a forward move the NEW screen is on top;
  // on a back move the OLD screen is on top — see the header comment.
  const paint = useCallback(
    (p: number, dir: 1 | -1) => {
      const w = hostRef.current?.offsetWidth || window.innerWidth || 390;
      const top = topRef.current;
      const under = underRef.current;
      const topX = dir === 1 ? (1 - p) * w : p * w;
      // Forward the under screen recedes (p); back it returns (1 - p).
      const underP = dir === 1 ? p : 1 - p;
      if (top) top.style.transform = `translate3d(${topX}px,0,0)`;
      if (under) {
        under.style.transform = `translate3d(${-OFFSET * w * underP}px,0,0)`;
        under.style.setProperty("--fnl-dim", String(DIM * underP));
      }
      // The photo plane trails the sheet — the depth cue iOS uses on every
      // push/pop, with the background moving slowest of the three planes.
      onParallax?.(topX * PHOTO_PARALLAX);
    },
    [onParallax],
  );

  const reset = useCallback(() => {
    for (const el of [topRef.current, underRef.current]) {
      if (el) {
        el.style.transform = "";
        el.style.removeProperty("--fnl-dim");
      }
    }
    onParallax?.(0);
  }, [onParallax]);

  // ── Drive the programmatic transition ───────────────────────────────────
  // No setState in this effect body: it only starts an external animation, and
  // the state change happens in the spring's rest callback.
  // Reduced motion: a gentler equivalent, not the absence of feedback (§14) —
  // a short cross-fade of the one layer, no translate, no parallax.
  useLayoutEffect(() => {
    if (!fading) return;
    const el = topRef.current;
    if (el) {
      el.style.transition = "none";
      el.style.opacity = "0";
      requestAnimationFrame(() => {
        el.style.transition = "opacity 180ms ease";
        el.style.opacity = "1";
      });
    }
    const t = setTimeout(() => {
      if (el) { el.style.transition = ""; el.style.opacity = ""; }
      setFading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [fading]);

  useLayoutEffect(() => {
    if (move?.kind !== "anim") return;
    const dir = move.dir;
    const sp = new Spring(0, (v) => paint(v, dir), () => {
      reset();
      setMove(null);
    });
    springRef.current?.stop();
    springRef.current = sp;
    springDirRef.current = dir;
    paint(0, dir);
    // Apple's move preset: damping 1.0 / response 0.4. No overshoot — nothing
    // was flicked, this came from a tap.
    sp.set(1, { bounce: 0, duration: 0.4 });
    return () => sp.stop();
  }, [move, paint, reset]);

  // ── Swipe-back ──────────────────────────────────────────────────────────
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !enabled || !backKey) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let axis: "none" | "x" | "y" = "none";
    let dragging = false;
    let lastP = 0; // last painted progress, so a release continues from what is on screen
    let base = 0; // progress the drag starts from — non-zero when a spring was grabbed
    const track = new VelocityTracker();

    const width = () => host.offsetWidth || window.innerWidth || 390;

    // A drag that begins on scrolled-away content is a scroll, never a nav.
    const scrolledAway = (t: EventTarget | null) => {
      let el = t as HTMLElement | null;
      while (el && el !== host) {
        if (el.scrollTop > 2) return true;
        el = el.parentElement;
      }
      return false;
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (pointerId !== null) return;

      // Deliberately does NOT touch a running spring. Stopping it here meant a
      // plain tap — or a vertical scroll — during the 400ms after every answer
      // killed the push transition permanently: Spring.stop() never fires
      // onRest, so `reset()` never ran and `move` stayed "anim", leaving both
      // layers frozen mid-slide with the previous step dimmed underneath. The
      // spring is now only interrupted once a horizontal drag actually wins the
      // axis (see onMove), which is the only case that has somewhere to hand the
      // motion off to.
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      axis = "none";
      dragging = false;
      base = 0;
      lastP = 0;
      track.reset();
      track.add(e.clientX, e.timeStamp);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      track.add(e.clientX, e.timeStamp);

      // Detect both axes from the first move, then confidently cancel the
      // loser once intent is clear (§10).
      if (axis === "none") {
        if (Math.abs(dx) < HYSTERESIS && Math.abs(dy) < HYSTERESIS) return;
        if (Math.abs(dy) > Math.abs(dx) || scrolledAway(e.target)) { axis = "y"; return; }
        axis = "x";
        dragging = true;

        // §3, the single most important principle here: a moving screen can be
        // grabbed and redirected at any instant, and the new motion must
        // continue from the PRESENTATION value — what is on screen right now —
        // never from the logical start. Starting a fresh drag at 0 made a
        // screen settling at 261px snap to 0 the moment it was touched.
        //
        // A forward push converts cleanly too: at forward progress p the top
        // layer sits at (1-p)·w, which is exactly where a back-drag at progress
        // (1-p) puts it — and the under layer matches as well, since both show
        // the same previous step. Seamless in both directions.
        const running = springRef.current;
        if (running?.isAnimating) {
          base = springDirRef.current === 1 ? 1 - running.value : running.value;
          running.stop();
        }
        // Consume EXACTLY the hysteresis as slop, not the whole first delta.
        // Rebasing to e.clientX threw away however far this event happened to
        // travel — fine for a 10px threshold crossing, badly wrong for a re-grab
        // that arrives as one 90px move, which then painted nothing at all.
        startX += Math.sign(dx) * HYSTERESIS;
        lastP = base;

        setMove({ kind: "drag", to: backKey });
        host.setPointerCapture(e.pointerId); // keep tracking outside the bounds
        host.classList.add("is-dragging");
        // Fall through and paint this event: the movement past the threshold is
        // real travel and must show up on the same frame it happened (§1).
      }
      if (axis !== "x") return;

      e.preventDefault();
      const w = width();
      // Recomputed, because the axis latch above may have just rebased startX to
      // absorb the hysteresis — the `dx` from the top of this handler is stale.
      // Offset from wherever the grab started, so a re-grab continues the motion
      // instead of restarting it. Rightward = back; leftward cannot commit (the
      // question is unanswered) so it rubber-bands rather than hard-stopping (§9).
      const want = base + (e.clientX - startX) / w;
      lastP = want >= 0 ? Math.min(1, want) : -rubberband(-want * w, w) / w;
      lastP = Math.max(-0.25, lastP);
      paint(lastP, -1);
    };

    const finish = (e: PointerEvent, cancelled = false) => {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragging) { host.classList.remove("is-dragging"); return; }
      dragging = false;
      // NB: `is-dragging` is deliberately NOT removed here. It gates the
      // backdrop-filter guard, and the 350ms settle spring below is the phase
      // where the blurred surface is transformed fastest - exactly the cost the
      // guard exists to avoid. Released on rest instead.

      const w = width();
      // Decide from where the screen actually IS, not from how far the finger
      // travelled — after a re-grab those differ by `base`.
      const dx = Math.max(0, lastP * w);
      const v = track.velocity;

      // Decide from the PROJECTED resting point and the velocity SIGN, not from
      // where the finger happened to stop (§6). A fast short flick commits; a
      // long slow drag that reverses does not.
      //
      // A CANCELLED pointer is never a commit. The browser cancels when it
      // takes the gesture over, or when the touch is interrupted — the user has
      // not decided anything, so the only honest response is to put the screen
      // back. Treating cancel like a release (which this did at first) navigated
      // people backwards out of gestures they never finished, because a
      // cancel's last-known velocity projects a long way.
      const projected = dx + project(v);
      const commit = !cancelled && (v > FLICK || (v > -FLICK && projected > w * 0.5));
      if (commit) haptic("commit"); // on the decision, not the arrival (§13 causality)

      // Start from what is ON SCREEN, not from the logical drag distance — a
      // rubber-banded leftward drag ends at negative progress, and starting the
      // spring at 0 would visibly jump (§3).
      const sp = new Spring(lastP, (p) => paint(p, -1), () => {
        host.classList.remove("is-dragging"); // restore the blur on settle
        if (commit) {
          // Navigate FIRST: the screens are already where they belong (the old
          // one fully off to the right, the destination at rest), so the
          // parent's re-render swaps content behind a correct picture.
          // Resetting before navigating would flash the old step.
          setSettledByGesture(true);
          onBackRef.current();
          requestAnimationFrame(() => {
            reset();
            setMove(null);
          });
        } else {
          reset();
          setMove(null);
        }
      });
      springRef.current?.stop();
      springRef.current = sp;
      springDirRef.current = -1;
      // Velocity handed off so there is no seam between finger and animation
      // (§5). A snap-back gets a little bounce because momentum preceded it; a
      // commit does not, because it is arriving, not rebounding (§4).
      sp.set(commit ? 1 : 0, {
        bounce: commit ? 0 : 0.2,
        duration: 0.35,
        velocity: v / w,
      });
    };

    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove, { passive: false });
    const onUp = (e: PointerEvent) => finish(e, false);
    const onCancel = (e: PointerEvent) => finish(e, true);
    host.addEventListener("pointerup", onUp);
    host.addEventListener("pointercancel", onCancel);
    return () => {
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onCancel);
    };
  }, [enabled, backKey, paint, reset]);

  useEffect(() => {
    const sp = springRef;
    return () => sp.current?.stop();
  }, []);

  // Even with the stage disabled the step id must be on an element, because
  // the mobile CSS keys layout off it. .fnl-solo is `display: contents`, so it
  // carries the attribute without existing as a box - desktop is unaffected.
  if (!enabled) return <div className="fnl-solo" data-step={stepKey}>{render(stepKey)}</div>;

  // The CURRENT step and, during a transition, the OTHER one. Keyed by step id
  // and rendered in a fixed slot order, with stacking decided by z-index rather
  // than DOM order. Two bugs came out of doing it the other way round:
  //
  //   • On a back navigation the incoming screen was the `under` layer, which
  //     carried aria-hidden/inert — so the parent's focus effect called
  //     .focus() into an inert subtree, it silently did nothing, and 400ms
  //     later the focused element was removed and focus fell to <body>.
  //   • When the transition ended, the destination moved from the under slot to
  //     the top slot. Different slot, same position, so React unmounted and
  //     remounted it: scroll position reset, component state reset, effects
  //     re-ran, and the row stagger replayed after the slide had landed.
  //
  // Keying on the step id fixes both: the current step keeps its identity for
  // the whole transition, and `inert` follows "not the current step" instead of
  // "underneath", so the screen being navigated TO is never inert.
  const otherKey =
    move?.kind === "anim" ? move.from
    : move?.kind === "drag" ? move.to
    : null;
  // Only a back animation puts the current step underneath.
  const currentOnTop = !(move?.kind === "anim" && move.dir === -1);

  const layer = (key: string, isCurrent: boolean) => (
    <div
      key={key}
      className={`fnl-layer ${isCurrent === currentOnTop ? "top" : "under"}`}
      data-step={key}
      ref={isCurrent === currentOnTop ? topRef : underRef}
      {...(isCurrent ? {} : { "aria-hidden": true as const, inert: true })}
    >
      {render(key)}
    </div>
  );

  return (
    <div className="fnl-nav" ref={hostRef}>
      {otherKey && layer(otherKey, false)}
      {layer(shown.key, true)}
    </div>
  );
}
