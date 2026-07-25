/** Placeholder body for admin sections not yet built. Replaced per migration phase. */
export function AdminStub({
  eyebrow,
  title,
  sub,
  phase,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  phase: string;
}) {
  return (
    <>
      <div className="adm-head">
        <div className="adm-titles">
          <div className="adm-eyebrow">{eyebrow}</div>
          <h1 className="adm-h1">{title}</h1>
          <p className="adm-sub">{sub}</p>
        </div>
      </div>
      <div className="adm-stub">
        <h2>Hamarosan</h2>
        <p>Ez a felület a következő fejlesztési körben készül el.</p>
        <p className="mono">[ {phase} ]</p>
      </div>
    </>
  );
}
