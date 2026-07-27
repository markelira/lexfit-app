"use client";

import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// The one button. Size + emphasis; padding/type/icon derive from the size in
// lx-atoms.css. Radius is always --r-sm. See docs/design_handoff_buttons.
type Size = "s" | "m" | "l";
type Variant = "primary" | "secondary" | "ghost" | "destructive";
type IconPath = string | string[];

const LABEL_ICON: Record<Size, number> = { s: 15, m: 16, l: 18 };
const ICON_ONLY: Record<Size, number> = { s: 16, m: 18, l: 20 };

// Solid-glyph icons render filled, not outlined (play triangle, etc.).
const FILLED = new Set<IconPath>([lxPaths.play]);
const isFilled = (d?: IconPath) => (d != null && FILLED.has(d));

export function Button({
  size = "m",
  variant = "primary",
  iconLeft,
  iconRight,
  loading = false,
  fullWidth = false,
  onDark = false,
  solid = false,
  type = "button",
  className = "",
  children,
  ...rest
}: {
  size?: Size;
  variant?: Variant;
  iconLeft?: IconPath;
  iconRight?: IconPath; // directional meaning only ("goes somewhere")
  loading?: boolean;
  fullWidth?: boolean;
  onDark?: boolean; // primary inverts to white-fill on dark surfaces (hero, player)
  solid?: boolean; // destructive filled — confirm dialog only
  children?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const isz = LABEL_ICON[size];
  const cls = ["lxbtn", size, variant, onDark && "on-dark", solid && "solid", fullWidth && "wide", loading && "loading", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} aria-busy={loading || undefined} {...rest}>
      {loading ? (
        <span className="lxbtn-spin" style={{ width: isz, height: isz }} aria-hidden="true" />
      ) : (
        iconLeft && <LxIcon d={iconLeft} size={isz} fill={isFilled(iconLeft)} />
      )}
      {children}
      {iconRight && !loading && <LxIcon d={iconRight} size={isz} fill={isFilled(iconRight)} />}
    </button>
  );
}

/** Icon-only button — circular (actions) or square (toolbars). Always labelled. */
export function IconButton({
  size = "m",
  d,
  label,
  variant = "secondary",
  shape = "circle",
  onDark = false,
  className = "",
  ...rest
}: {
  size?: Size;
  d: IconPath;
  label: string; // aria-label + desktop tooltip (required)
  variant?: "secondary" | "ghost" | "primary";
  shape?: "circle" | "square";
  onDark?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = ["lxbtn-i", size, variant, shape === "square" && "sq", onDark && "on-dark", className].filter(Boolean).join(" ");
  return (
    <button type="button" className={cls} aria-label={label} title={label} {...rest}>
      <LxIcon d={d} size={ICON_ONLY[size]} fill={isFilled(d)} />
    </button>
  );
}
