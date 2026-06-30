"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getOnboarding } from "@/lib/user";
import { Protected } from "@/components/Protected";
import styles from "./app.module.css";

function AppHome() {
  const { user, signOutUser } = useAuth();
  const [onb, setOnb] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (user) getOnboarding(user.uid).then(setOnb);
  }, [user]);

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <p className={styles.kicker}>Belépve</p>
        <h1 className={styles.title}>
          Szia, {user?.displayName?.split(" ")[0] ?? "te"} 👋
        </h1>
        <p className={styles.sub}>
          A teljes app (Foundation, Videótár, Haladásom) a 4. fázisban épül. Addig
          itt látod, hogy a fiókod és az onboarding-válaszaid elmentődtek.
        </p>

        <section className={styles.profile}>
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Cél" value={String(onb?.goal ?? "—")} />
          <Row label="Szint" value={String(onb?.experience ?? onb?.level ?? "—")} />
          <Row label="Heti napok" value={String(onb?.days ?? "—")} />
          <Row label="A miértem" value={String(onb?.why ?? onb?.motiv ?? "—")} />
        </section>

        <a className={styles.play} href="/player/F023">
          ▶ Mai edzés indítása
        </a>

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

export default function Page() {
  return (
    <Protected>
      <AppHome />
    </Protected>
  );
}
