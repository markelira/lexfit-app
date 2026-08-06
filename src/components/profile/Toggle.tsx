"use client";

// 44×26 switch. Controlled. role="switch" + aria-checked (30 §30.4.1 / §30.9).
export function Toggle({
  checked, onChange, label, disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`pf-toggle${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="knob" />
    </button>
  );
}
