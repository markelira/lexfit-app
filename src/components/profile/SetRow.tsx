"use client";

import type { ReactNode } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { Toggle } from "./Toggle";

export type RowControl = "chevron" | "toggle" | "value" | "none";

export interface SetRowProps {
  icon?: keyof typeof lxPaths | string;
  label: string;
  desc?: string;
  value?: ReactNode;
  control?: RowControl;
  checked?: boolean;
  onToggle?: (v: boolean) => void;
  onClick?: () => void;
  danger?: boolean;
}

// One settings row: icon · label · description · value · trailing (chevron / toggle
// / nothing). Chevron only when the row opens something (30 §30.4.1, P-RULE 03).
export function SetRow({
  icon, label, desc, value, control = "none", checked, onToggle, onClick, danger,
}: SetRowProps) {
  const asButton = !!onClick && control !== "toggle";
  const cls = `pf-row${danger ? " danger" : ""}${asButton ? " tap" : ""}`;

  const inner = (
    <>
      {icon && (
        <span className="ic">
          <LxIcon d={lxPaths[icon] ?? (icon as string)} size={17} />
        </span>
      )}
      <span className="tx">
        <span className="lb">{label}</span>
        {desc && <span className="ds">{desc}</span>}
      </span>
      {value != null && <span className="vl">{value}</span>}
      {control === "chevron" && <LxIcon className="cv" d={lxPaths.chevronRight} size={16} />}
      {control === "toggle" && (
        <Toggle checked={!!checked} onChange={(v) => onToggle?.(v)} label={label} />
      )}
    </>
  );

  return asButton ? (
    <button type="button" className={cls} onClick={onClick}>{inner}</button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
