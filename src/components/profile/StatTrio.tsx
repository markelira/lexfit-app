// Three tabular numbers - the calm mirror of Haladásom, not a chart (30 §30.3.2).
export function StatTrio({ items }: { items: { n: string | number; k: string }[] }) {
  return (
    <div className="pf-stattrio">
      {items.map((s, i) => (
        <div className="stat" key={i}>
          <div className="n">{s.n}</div>
          <div className="k">{s.k}</div>
        </div>
      ))}
    </div>
  );
}
