"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { watchPrefs, updatePrefs, type PrefsPatch } from "@/lib/prefs";
import type { Prefs } from "@/lib/profile";

// Live prefs with optimistic writes (30 §30.8: toggles flip immediately, revert on
// failure). watchPrefs keeps two tabs in sync; the ref holds the last good value so
// a rejected write can roll back.
export function useLivePrefs(uid: string | undefined, initial?: Prefs) {
  const [prefs, setPrefs] = useState<Prefs | null>(initial ?? null);
  const ref = useRef<Prefs | null>(initial ?? null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uid) return;
    return watchPrefs(uid, (p) => { ref.current = p; setPrefs(p); });
  }, [uid]);

  const write = useCallback(
    async (apply: (cur: Prefs) => Prefs, patch: PrefsPatch) => {
      if (!uid || !ref.current) return;
      const prev = ref.current;
      const next = apply(prev);
      ref.current = next;
      setPrefs(next);
      setError(false);
      try {
        await updatePrefs(uid, patch);
      } catch {
        ref.current = prev;
        setPrefs(prev);
        setError(true);
      }
    },
    [uid],
  );

  return { prefs, write, error, dismissError: useCallback(() => setError(false), []) };
}
