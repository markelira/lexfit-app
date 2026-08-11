"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A silent, looping screen recording shown inside the phone frame - the product
 * in motion rather than a still of it.
 *
 * Three behaviours it must get right, none of them the browser's default:
 *
 *  1. **Reduced motion.** A 22-second loop of moving UI is exactly the kind of
 *     ambient animation `prefers-reduced-motion` exists for. Under it the video
 *     never autoplays; the poster stands in and a play control appears, so the
 *     content is still reachable - reduced motion means "don't move without my
 *     say-so", not "you can't see this".
 *  2. **Off-screen.** Autoplaying video keeps decoding while scrolled past,
 *     burning battery on a page that is ~17 screens tall. It pauses when it
 *     leaves the viewport and resumes when it comes back.
 *  3. **iOS inline.** Without `playsInline` Safari takes the video fullscreen on
 *     play, which would hijack the page.
 */
export function PhoneVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  // Only meaningful under reduced motion, where playback is opt-in.
  const [manual, setManual] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Under reduced motion the user owns playback - never resume it for them.
    if (reduced && !manual) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, manual]);

  const play = () => {
    setManual(true);
    void ref.current?.play().catch(() => {});
  };

  return (
    <>
      <video
        ref={ref}
        className="phv"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        // No audio track exists, so there is nothing to control; the caption
        // below the frame carries the meaning for anyone who can't see it.
        aria-label={label}
        autoPlay={!reduced}
      />
      {reduced && !manual && (
        <button type="button" className="phv-play" onClick={play}>
          <span aria-hidden="true">▶</span> Lejátszás
        </button>
      )}
    </>
  );
}
