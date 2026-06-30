"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Protected, Loader } from "@/components/Protected";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { getSubscription, isSubscribed, openPortal, startCheckout } from "@/lib/billing";
import styles from "./subscribe.module.css";

const PRICE = { amount: "19 990", cur: "Ft", period: "hó", perDay: "~666" };
const FEATURES = [
  "8 hetes Foundation program — 40 vezetett edzés",
  "Teljes videótár · F·B·R·T·N·M kódrendszer",
  "Alexa végig veled — follow-along minden edzésen",
  "Heti visszamérés — Hét 5 és Hét 8",
  "Csendes és ízület-kímélő variációk",
  "Új edzések és kihívások havonta",
];

function SubscribeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) getSubscription(user.uid).then((s) => setSubscribed(isSubscribed(s)));
  }, [user]);

  async function go(action: () => Promise<void>) {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hiba történt.");
      setBusy(false);
    }
  }

  if (subscribed === null) return <Loader label="Előfizetés…" />;

  return (
    <div className="lx">
      <div className={styles.page}>
        <main className={styles.card}>
          <p className={styles.eyebrow}>AKTIVÁLD A PROGRAMOD</p>
          <h1 className={styles.title}>
            {subscribed ? "Az előfizetésed aktív 💗" : "Készen állsz. Indítsuk élesben."}
          </h1>
          <p className={styles.sub}>
            {subscribed
              ? "Teljes hozzáférésed van a Foundation programhoz és a videótárhoz."
              : "Az előfizetés nyitja meg a teljes Foundation programot és a videótárat."}
          </p>

          {!subscribed && (
            <div className={styles.plan}>
              <div>
                <div className={styles.planName}>Havi tagság</div>
                <div className={styles.planPer}>{PRICE.perDay} {PRICE.cur}/nap · bármikor lemondható</div>
              </div>
              <div className={styles.planPrice}>
                <span className={styles.amt}>{PRICE.amount}</span>
                <span className={styles.per}>{PRICE.cur}/{PRICE.period}</span>
              </div>
            </div>
          )}

          <ul className={styles.feat}>
            {FEATURES.map((f) => (
              <li key={f}>
                <span className={styles.fk}><LxIcon d={lxPaths.check} size={13} sw={3} /></span>
                {f}
              </li>
            ))}
          </ul>

          {subscribed ? (
            <>
              <button className={styles.cta} onClick={() => go(openPortal)} disabled={busy}>
                Előfizetés kezelése
              </button>
              <button className={styles.ghost} onClick={() => router.push("/app")}>Belépek az appba →</button>
            </>
          ) : (
            <button className={styles.cta} onClick={() => go(startCheckout)} disabled={busy}>
              {busy ? "Átirányítás…" : `Előfizetek — ${PRICE.amount} ${PRICE.cur}/${PRICE.period}`}
            </button>
          )}

          {error && <p className={styles.error}>{error}</p>}
          <p className={styles.note}>Biztonságos fizetés a Stripe-pal · A közösség ingyenes marad.</p>
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Protected requireOnboarded={false}>
      <SubscribeScreen />
    </Protected>
  );
}
