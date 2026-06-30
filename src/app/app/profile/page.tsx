"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getOnboarding } from "@/lib/user";
import { getSubscription, isSubscribed, openPortal, type Subscription } from "@/lib/billing";
import styles from "../app.module.css";

export default function ProfilePage() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [onb, setOnb] = useState<Record<string, unknown> | null>(null);
  const [sub, setSub] = useState<Subscription | null>(null);

  useEffect(() => {
    if (user) {
      getOnboarding(user.uid).then(setOnb);
      getSubscription(user.uid).then(setSub);
    }
  }, [user]);

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <p className={styles.kicker}>Profil</p>
        <h1 className={styles.title}>{user?.displayName ?? "Profil"}</h1>
        <p className={styles.sub}>Fiók és beállítások. Az előfizetés-kezelés a 6. fázisban érkezik.</p>

        <section className={styles.profile}>
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Cél" value={String(onb?.goal ?? "—")} />
          <Row label="Szint" value={String(onb?.experience ?? onb?.level ?? "—")} />
          <Row label="Heti napok" value={String(onb?.days ?? "—")} />
          <Row label="A miértem" value={String(onb?.why ?? onb?.motiv ?? "—")} />
        </section>

        <div className={styles.row} style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
          <span className={styles.rowLabel}>Előfizetés</span>
          <span className={styles.rowValue}>{isSubscribed(sub) ? `Aktív (${sub?.plan ?? "havi"})` : "Nincs"}</span>
        </div>
        {isSubscribed(sub) ? (
          <button className={styles.play} onClick={() => openPortal()}>Előfizetés kezelése</button>
        ) : (
          <button className={styles.play} onClick={() => router.push("/subscribe")}>Előfizetek</button>
        )}

        <button className={styles.signout} onClick={signOutUser}>
          Kijelentkezés
        </button>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}
