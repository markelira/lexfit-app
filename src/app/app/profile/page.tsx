"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getOnboarding } from "@/lib/user";
import styles from "../app.module.css";

export default function ProfilePage() {
  const { user, signOutUser } = useAuth();
  const [onb, setOnb] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (user) getOnboarding(user.uid).then(setOnb);
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
