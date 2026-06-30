"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import styles from "./page.module.css";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <p className={styles.kicker}>LEXFIT · OTTHONI EDZÉS</p>

        <h1 className={styles.wordmark}>
          LEXFIT<span className={styles.dot}>.</span>
        </h1>
        <p className={styles.tagline}>
          Vezetett, nőközpontú edzésprogram. 30 perc, csak egy matrac, és egy
          közösség mögötted.
        </p>

        <div className={styles.cta}>
          {loading ? (
            <span className={styles.ctaGhost}>…</span>
          ) : user ? (
            <Link href="/app" className={styles.ctaBtn}>
              Belépek az appba →
            </Link>
          ) : (
            <Link href="/login" className={styles.ctaBtn}>
              Belépés →
            </Link>
          )}
        </div>

        <p className={styles.footer}>
          Prototype → Next.js · Firebase · Mux · Stripe · Vercel
        </p>
      </main>
    </div>
  );
}
