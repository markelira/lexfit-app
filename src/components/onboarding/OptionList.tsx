"use client";

import { useRef } from "react";
import { OptionRow, type OptionItem } from "./OptionRow";

// The option group (40 §40.4 / §40.12). Single-choice → role="radiogroup" with
// radio rows; multi → a checkbox group. Arrow keys move within the group (and,
// for radios, move the selection, per the WAI radiogroup pattern). Roving
// tabindex keeps the group a single tab stop. `exclusive` handles the
// "Nincs külön kérésem" option that clears the rest and vice-versa.
type Value = string | number;

interface BaseProps {
  items: OptionItem[];
  ariaLabel: string;
}

interface SingleProps extends BaseProps {
  multi?: false;
  value: Value | null;
  onChange: (v: Value | null) => void;
}

interface MultiProps extends BaseProps {
  multi: true;
  value: Value[];
  onChange: (v: Value[]) => void;
  exclusive?: Value; // the "none of the above" option
}

export function OptionList(props: SingleProps | MultiProps) {
  const { items, ariaLabel } = props;
  const multi = props.multi === true;
  const containerRef = useRef<HTMLDivElement>(null);

  const isSelected = (v: Value) =>
    multi ? (props.value as Value[]).includes(v) : props.value === v;

  const selectSingle = (v: Value) => {
    if (multi) return;
    props.onChange(props.value === v ? null : v);
  };

  const toggleMulti = (v: Value) => {
    if (!multi) return;
    const { value, onChange, exclusive } = props;
    if (exclusive !== undefined && v === exclusive) {
      onChange(value.includes(exclusive) ? [] : [exclusive]);
      return;
    }
    const base = exclusive !== undefined ? value.filter((x) => x !== exclusive) : value;
    onChange(base.includes(v) ? base.filter((x) => x !== v) : [...base, v]);
  };

  const onSelect = (v: Value) => (multi ? toggleMulti(v) : selectSingle(v));

  // Roving-tabindex target: the selected row, else the first.
  const rovingIdx = (() => {
    const sel = items.findIndex((it) => isSelected(it.v));
    return sel >= 0 ? sel : 0;
  })();

  const focusRow = (i: number) => {
    const btns = containerRef.current?.querySelectorAll<HTMLButtonElement>("[role]");
    btns?.[i]?.focus();
  };

  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const n = items.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    focusRow(next);
    // Radiogroup semantics: moving focus moves the selection. Checkboxes only move focus.
    if (!multi) selectSingle(items[next].v);
  };

  return (
    <div
      ref={containerRef}
      className="fnl-opts"
      role={multi ? "group" : "radiogroup"}
      aria-label={ariaLabel}
    >
      {items.map((it, i) => (
        <OptionRow
          key={String(it.v)}
          item={it}
          multi={multi}
          selected={isSelected(it.v)}
          tabIndex={multi ? 0 : i === rovingIdx ? 0 : -1}
          onSelect={() => onSelect(it.v)}
          onKeyDown={onKeyDown(i)}
        />
      ))}
    </div>
  );
}
