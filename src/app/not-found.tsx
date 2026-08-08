import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 12,
      textAlign: "center", padding: 24,
    }}>
      <p style={{ fontFamily: "var(--mono, monospace)", letterSpacing: "0.18em", fontWeight: 700 }}>LEXFIT</p>
      <h1 style={{ fontSize: 22, margin: 0 }}>Ez az oldal nem található</h1>
      <p style={{ opacity: 0.7, margin: 0 }}>Lehet, hogy elgépelted a címet, vagy az oldal már nem létezik.</p>
      <Link href="/" style={{ marginTop: 8, textDecoration: "underline" }}>Vissza a főoldalra</Link>
    </div>
  );
}
