"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// Subscribe plan selector (40 §40.7). Radio semantics — one fixed CTA lives
// below the group, not per card. Price/terms strings are pre-formatted by the
// caller (from PRICES in P6; from _mock in P1). Selected = accent border +
// accent-soft fill + filled tick.
export function PlanCard({
  label,
  price,
  unit,
  terms,
  badge,
  selected,
  onSelect,
  tabIndex,
  onKeyDown,
}: {
  label: string; // mono, e.g. "ÉVES"
  price: string; // e.g. "767 Ft"
  unit: string; // e.g. "/ hét"
  terms: React.ReactNode;
  badge?: string; // e.g. "LEGNÉPSZERŰBB"
  selected: boolean;
  onSelect: () => void;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      className={`fnl-plan${selected ? " on" : ""}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      {badge && <span className="badge mono">{badge}</span>}
      <span className="plan-label mono">{label}</span>
      <span className="plan-price">
        <b className="tabular">{price}</b>
        <em>{unit}</em>
      </span>
      <span className="plan-terms">{terms}</span>
      <span className="mk" aria-hidden="true">
        {selected && <LxIcon d={lxPaths.check} size={13} sw={3} />}
      </span>
    </button>
  );
}
