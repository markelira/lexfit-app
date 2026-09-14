"use client";

import { useEffect, useState } from "react";
import { CinemaReveal, type CinemaPlan } from "./CinemaReveal";
import "../ujrakezdes.css";

// /ujrakezdes/mozi - the cinematic reveal PROTOTYPE.
//
// A test surface, not a funnel step: nothing here is linked from the live
// funnel and no event is sent, so it can be looked at, argued with and thrown
// away without touching the running campaign. When a version is agreed, the
// component moves into the reveal as its opening act.
//
// Data: a demo plan by default (3 days a week, 20 minutes - the most common
// answer set in the lead base), or the REAL plan when a token is supplied as
// ?lt=..., so the same screen can be judged on someone's actual week.

const DEMO: CinemaPlan = {
  days: [
    { short: "H", training: true },
    { short: "K", training: false },
    { short: "Sze", training: true },
    { short: "Cs", training: false },
    { short: "P", training: true },
    { short: "Szo", training: false },
    { short: "V", training: false },
  ],
  trainingCount: 3,
  minutes: 20,
  firstWorkout: {
    title: "Láb alapokról",
    theme: "Alsótest",
    mins: 26,
    // NOT player-demo-poster.jpg: that is a screenshot OF THE PLAYER UI, so
    // beat 3 showed a picture of an interface instead of a workout. A real
    // training frame is the only honest stand-in until a token supplies the
    // member's own Mux poster.
    poster: "/cast-tv.jpg",
  },
};

export default function MoziPage() {
  const [plan, setPlan] = useState<CinemaPlan>(DEMO);
  const [done, setDone] = useState(false);
  const [start, setStart] = useState(0);
  const [round, setRound] = useState(0);   // remount key for "Újra megnézem"

  useEffect(() => {
    const b = Number(new URLSearchParams(window.location.search).get("beat"));
    if (b >= 1 && b <= 4) setStart(b - 1);
  }, []);

  // Real media when a plan token is given - the posters make or break beat 3,
  // and a demo image flatters the design in a way the live page cannot.
  useEffect(() => {
    const lt = new URLSearchParams(window.location.search).get("lt");
    if (!lt || !/^[0-9a-f]{32}$/.test(lt)) return;
    fetch(`/api/ujrakezdes-lead/media?lt=${lt}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { first?: { title: string; theme: string; mins: number; poster: string } } | null) => {
        if (b?.first) setPlan((p) => ({ ...p, firstWorkout: b.first! }));
      })
      .catch(() => { /* demo poster stands in */ });
  }, []);

  if (done) {
    return (
      <main className="lxu u2" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 28 }}>
        <div style={{ maxWidth: 420, textAlign: "center", display: "grid", gap: 14 }}>
          <p className="u2-eyebrow">A mozi vége</p>
          <h1 style={{ margin: 0, fontSize: 30, lineHeight: 1.1 }}>Itt folytatódna a teljes terved.</h1>
          <p className="u2-body" style={{ margin: 0 }}>
            Élesben innen görgetne tovább az oldal: a terv, a hónap, az ajánlat. Ez a prototípus
            csak a négy jelenetet mutatja.
          </p>
          <button
            type="button"
            className="u2-cta"
            style={{ justifySelf: "center" }}
            onClick={() => { setRound((r) => r + 1); setDone(false); }}
          >
            Újra megnézem
          </button>
        </div>
      </main>
    );
  }

  // `start` is read after mount (a render-time read would mismatch hydration),
  // so it has to be part of the key - otherwise the component is already
  // mounted at beat 0 by the time the value arrives and ?beat= does nothing.
  return <CinemaReveal key={`${round}-${start}`} plan={plan} start={start} onDone={() => setDone(true)} />;
}
