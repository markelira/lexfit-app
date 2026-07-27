"use client";

import { useEffect, useState } from "react";

/** True below the 840px mobile breakpoint (00 §0.6). Client-only; false on first
 *  paint (SSR assumes desktop), then corrects on mount. */
export function useIsMobile(query = "(max-width: 840px)"): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return mobile;
}
