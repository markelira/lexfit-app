import styles from "./page.module.css";

const SYSTEMS = [
  { label: "Next.js + TypeScript", state: "ok" as const },
  { label: "Firebase · Firestore (europe-west3)", state: "ok" as const },
  { label: "Vercel hosting", state: "ok" as const },
  { label: "Mux video", state: "ok" as const },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <p className={styles.kicker}>Foundation · Live</p>

        <h1 className={styles.wordmark}>
          LEXFIT<span className={styles.dot}>.</span>
        </h1>
        <p className={styles.tagline}>
          Vezetett, nőközpontú edzésprogram. Az alapok készen állnak — a képernyők
          következnek.
        </p>

        <section className={styles.status} aria-label="System status">
          {SYSTEMS.map((s) => (
            <div key={s.label} className={styles.row}>
              <span className={styles.pill}>● connected</span>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        <p className={styles.footer}>
          Prototype → Next.js · Firebase · Mux · Stripe · Vercel
        </p>
      </main>
    </div>
  );
}
