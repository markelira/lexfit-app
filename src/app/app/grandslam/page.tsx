"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Protected, Loader } from "@/components/Protected";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { getGrandSlam, redeemGrandSlam, type GrandSlamState } from "@/lib/billing";
import { PRICES } from "@/lib/pricing/config";
import { formatHuf, perWeekHuf } from "@/lib/pricing/display";
import styles from "./grandslam.module.css";

const EARNED = PRICES.annual_earned.amountHuf;
const EARNED_WEEK = perWeekHuf(EARNED);
const STD = PRICES.annual_std.amountHuf;

const BONUSES = [
  "Személyre szabott 8 hetes terved",
  "„Alapító” jelvény a közösségben",
  "A következő 4 zárt kihívás garantált helye",
];

function two(n: number) {
  return String(n).padStart(2, "0");
}

function GrandSlam() {
  const router = useRouter();
  const [state, setState] = useState<GrandSlamState | null | undefined>(undefined);
  const [remaining, setRemaining] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGrandSlam().then(setState).catch(() => setState(null));
  }, []);

  // Countdown from SERVER time: anchor to the offset between server and client
  // clocks at load, so the deadline can't be gamed by changing the local clock.
  useEffect(() => {
    if (!state?.offer?.expiresAt) return;
    const expiresAt = state.offer.expiresAt;
    const skew = Date.now() - state.serverNow;
    const tick = () => setRemaining(expiresAt - (Date.now() - skew));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [state]);

  if (state === undefined) return <Loader label="Ajánlat…" />;

  // Quiet, final "gone" state — no drama, no "lemaradtál!" (J4).
  const expired = !state || !state.redeemable || remaining <= 0;
  if (expired) {
    return (
      <div className="lx">
        <div className={styles.page}>
          <main className={styles.gone}>
            <p className={styles.eyebrow}>ALAPÍTÓ ÉVES</p>
            <h1 className={styles.goneTitle}>Ez az ajánlat már lezárult.</h1>
            <p className={styles.sub}>
              Az éves tagság továbbra is elérhető a szokásos áron a csomagoknál.
            </p>
            <button className={styles.ghost} onClick={() => router.push("/app")}>
              Vissza az appba →
            </button>
          </main>
        </div>
      </div>
    );
  }

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);

  return (
    <div className="lx">
      <div className={styles.page}>
        <main className={styles.card}>
          <p className={styles.eyebrow}>KIÉRDEMELTED · ALAPÍTÓ ÉVES</p>
          <h1 className={styles.title}>A te árad az első évre</h1>

          <div className={styles.priceRow}>
            <span className={styles.big}>{formatHuf(EARNED_WEEK)}</span>
            <span className={styles.unit}>/hét</span>
          </div>
          <p className={styles.price2}>{formatHuf(EARNED)} az első évre.</p>

          <ul className={styles.bonus}>
            {BONUSES.map((b) => (
              <li key={b}>
                <span className={styles.fk}><LxIcon d={lxPaths.check} size={12} sw={3} /></span>
                {b}
              </li>
            ))}
          </ul>

          <div className={styles.timer}>
            <span className={styles.timerLabel}>Az ajánlat eddig él:</span>
            <span className={styles.clock}>{two(h)}:{two(m)}:{two(s)}</span>
          </div>

          <button
            className={styles.cta}
            disabled={busy}
            onClick={async () => {
              setError(null);
              setBusy(true);
              try {
                await redeemGrandSlam();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Hiba történt.");
                setBusy(false);
              }
            }}
          >
            {busy ? "Átirányítás…" : "Feloldom az Alapító árat"}
          </button>

          {/* J1/J4: the step-up is written out, in plain sight. */}
          <p className={styles.stepup}>
            Az első év {formatHuf(EARNED)}, utána évente {formatHuf(STD)}, automatikusan
            megújul — bármikor egy kattintással lemondhatod.
          </p>
          {error && <p className={styles.error}>{error}</p>}
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Protected requireOnboarded={false}>
      <GrandSlam />
    </Protected>
  );
}
