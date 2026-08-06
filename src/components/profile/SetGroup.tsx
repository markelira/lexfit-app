import type { ReactNode } from "react";

// Small-caps group label + a bordered container whose rows divide with 1px --line
// and no divider after the last (30 §30.4.1).
export function SetGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="pf-group-wrap">
      {label && <div className="pf-glbl">{label}</div>}
      <div className="pf-group">{children}</div>
    </div>
  );
}
