export function Stub({ title, sub }: { title: string; sub: string }) {
  return (
    <div
      className="card"
      style={{ marginTop: 60, padding: "56px 48px", textAlign: "center" }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>{title}</h1>
      <p style={{ color: "var(--ink-2)", marginTop: 10, fontSize: 15.5 }}>{sub}</p>
      <p className="mono" style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 18 }}>
        [ következő körben épül ]
      </p>
    </div>
  );
}
