"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { loadProfile } from "@/lib/profile-load";
import type { ProfileData } from "@/lib/profile";

export type LoadState = "loading" | "ready" | "error";

// One loader, both surfaces. `reload` re-reads after a write (P5) so the UI reflects
// the persisted value without a full navigation.
export function useProfile() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [nonce, setNonce] = useState(0);
  const reload = useCallback(() => { setState("loading"); setNonce((n) => n + 1); }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    loadProfile(user.uid)
      .then((d) => { if (active) { setData(d); setState("ready"); } })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [user, nonce]);

  return { data, state, reload };
}
