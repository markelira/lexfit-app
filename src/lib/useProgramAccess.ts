"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getSubscription, isSubscribed, purchasedPrograms } from "@/lib/billing";
import { loadProgramIndex } from "@/lib/program-index";

/**
 * Which videos this viewer may actually open (P1).
 *
 * A programme buyer owns one playlist and nothing adjacent, so the app has to
 * be able to say so BEFORE they tap - a card that looks identical to every
 * other one and then bounces them off the player is a small betrayal at the
 * exact moment they were enthusiastic.
 *
 * The rule mirrors `lib/program-gate` on the server, deliberately: membership
 * opens everything; a grant opens the videos in that programme's playlist; a
 * video in no playlist is membership-only. This is the UI's copy of the rule -
 * the server's remains the one that decides.
 *
 * Challenge videos are free (see the gate) and are deliberately NOT special-
 * cased here: they live in `challengeVideos`, which the library never reads,
 * and they render through ChallengeCard, which has no lock. A code from that
 * collection cannot reach this function, so guarding against it would be an
 * extra fetch defending a path that does not exist.
 */
export interface ProgramAccess {
  /** Null until resolved. Callers must not render a lock before it lands. */
  ready: boolean;
  /** Whether this viewer is locked out of a given video. */
  locked: (code: string) => boolean;
  /** What they own outright, named - the upsell leads with it. */
  ownedLabel: string | null;
}

interface State {
  member: boolean;
  owned: Set<string>;
  ofVideo: Record<string, string>;
  ownedLabel: string | null;
}

export function useProgramAccess(): ProgramAccess {
  const { user } = useAuth();
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    if (!user) { setState(null); return; }
    let active = true;
    (async () => {
      try {
        const [sub, index] = await Promise.all([
          getSubscription(user.uid),
          loadProgramIndex(),
        ]);
        if (!active) return;
        const owned = purchasedPrograms(sub);
        setState({
          member: isSubscribed(sub),
          owned: new Set(owned),
          ofVideo: index.programOfVideo,
          ownedLabel: owned.map((s) => index.bySlug[s]?.title).filter(Boolean)[0] ?? null,
        });
      } catch {
        // Fail OPEN. A read error must never paint locks over content someone
        // has paid for; the server refuses anything they truly cannot play.
        if (active) setState({ member: true, owned: new Set(), ofVideo: {}, ownedLabel: null });
      }
    })();
    return () => { active = false; };
  }, [user]);

  const locked = useCallback(
    (code: string) => {
      // Never a lock before the answer is known: a flash of padlocks across a
      // member's home screen is worse than a moment with none.
      if (!state || state.member) return false;
      const slug = state.ofVideo[code];
      if (!slug) return true;              // outside every playlist → membership
      return !state.owned.has(slug);
    },
    [state],
  );

  return { ready: state != null, locked, ownedLabel: state?.ownedLabel ?? null };
}
