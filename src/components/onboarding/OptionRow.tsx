import { forwardRef } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

export interface OptionItem {
  v: string | number;
  label: string;
  sub?: string;
  icon?: string | string[]; // lxPaths value for the 34px tile
  leading?: React.ReactNode; // replaces the icon tile entirely (e.g. FlameRating)
}

// A single option row (40 §40.4). Icon tile · bold label · sub · mark. The mark
// shape is the affordance: a circle for single-choice (radio), a rounded square
// for multi (checkbox). Presentational - semantics/keyboard live in OptionList.
export const OptionRow = forwardRef<
  HTMLButtonElement,
  {
    item: OptionItem;
    selected: boolean;
    multi: boolean;
    tabIndex: number;
    index?: number; // position in the group; drives the mobile entrance stagger
    onSelect: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  }
>(function OptionRow({ item, selected, multi, tabIndex, index = 0, onSelect, onKeyDown }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      tabIndex={tabIndex}
      // --i is the stagger index. Capped at 6 so a long list never makes the
      // last row feel like a queue the user is waiting behind (skill §1).
      style={{ "--i": Math.min(index, 6) } as React.CSSProperties}
      className={`fnl-opt${multi ? " multi" : ""}${item.sub ? " has-sub" : ""}${selected ? " on" : ""}`}
      onClick={onSelect}
      onKeyDown={onKeyDown}
    >
      {item.leading !== undefined ? (
        <span className="lead">{item.leading}</span>
      ) : (
        <span className="ic" aria-hidden="true">
          {item.icon && <LxIcon d={item.icon} size={17} />}
        </span>
      )}
      <span className="tx">
        <b>{item.label}</b>
        {item.sub && <small>{item.sub}</small>}
      </span>
      <span className={`mk${multi ? " sq" : ""}`} aria-hidden="true">
        {selected && <LxIcon d={lxPaths.check} size={13} sw={3} />}
      </span>
    </button>
  );
});
