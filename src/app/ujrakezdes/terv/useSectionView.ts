"use client";

import { useCallback, useRef } from "react";
import { trackUjrakezdesSection } from "@/lib/track";

/**
 * Fire `lx_ujrakezdes_section` once when a reveal section first scrolls into
 * the top 60% of the viewport. Returns a ref callback — attach it to the
 * section element.
 *
 * NOT a visibility-percentage threshold: several reveal sections are taller
 * than the viewport, and a `threshold: 0.5` observer would simply never fire
 * for them. "Its top entered the upper 60% of the screen" is the reader's own
 * definition of "I got to this part".
 *
 * One observer per section rather than one shared observer with a lookup:
 * the reveal has ~9 instrumented sections, the cost is negligible, and the
 * per-section teardown stays trivially correct when blocks mount/unmount
 * (the guarantee band and calc line are conditional).
 *
 * `onFirstView` lets a section piggyback a side effect on the same
 * crossing — the curve starts its draw animation this way, so the analytics
 * event and the animation can never disagree about what "seen" means.
 */
export function useSectionView(
  name: string,
  onFirstView?: () => void,
): (el: HTMLElement | null) => void {
  const seen = useRef(false);
  const io = useRef<IntersectionObserver | null>(null);

  // `onFirstView` sits in the deps: an inline callback re-creates this ref
  // callback each render, so React re-attaches it - the observe/disconnect
  // pair below makes that churn harmless, and `seen` keeps the event single.
  return useCallback(
    (el: HTMLElement | null) => {
      io.current?.disconnect();
      io.current = null;
      if (!el || seen.current || typeof IntersectionObserver === "undefined") return;
      const obs = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          seen.current = true;
          obs.disconnect();
          io.current = null;
          trackUjrakezdesSection(name);
          onFirstView?.();
        },
        { rootMargin: "0px 0px -40% 0px", threshold: 0 },
      );
      obs.observe(el);
      io.current = obs;
    },
    [name, onFirstView],
  );
}
