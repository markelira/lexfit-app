"use client";

// Multimodal feedback (skill: apple-design §13). Three rules govern this file:
//
//   Causality — fire on the actual causal event (the option committing, the
//               screen snapping home), never on a timer near it.
//   Harmony   — fire on the SAME frame as the visual. Never behind a
//               transition, or the two senses come apart.
//   Utility   — only where it earns its place. This funnel has exactly two
//               moments worth a haptic: committing a choice, and committing a
//               back-swipe. Buzzing on every tap trains people to ignore all
//               of it.
//
// HONEST LIMITATION: the Vibration API is Android-only. iOS Safari ignores
// navigator.vibrate entirely and the web platform offers no equivalent, so
// iPhone users get the visual and nothing else. It costs two lines, so it is
// worth having for the Android half — but do not expect to feel it on an
// iPhone, and do not build anything on top of it that assumes it fired.

type Moment = "select" | "commit";

const PATTERN: Record<Moment, number> = {
  select: 8, // a choice landed
  commit: 12, // a swipe-back snapped home
};

export function haptic(moment: Moment) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  // Someone who has asked for less motion has not asked for less touch, but a
  // buzz is still vestibular-adjacent enough to drop with the rest of it.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(PATTERN[moment]);
  } catch {
    /* some browsers throw if the page has never been interacted with */
  }
}
