import type { ProgramIcon } from "@/lib/programs";

// The 5 geometric program marks - the non-color cue that distinguishes programs.
// 24×24 viewBox, fill: currentColor. Keep any new marks as simple primitives so
// they read at small sizes and stay colorless / colourblind-safe.
const SHAPES: Record<ProgramIcon, React.ReactNode> = {
  dot: <circle cx="12" cy="12" r="6" />,
  square: <rect x="6" y="6" width="12" height="12" rx="2.5" />,
  bar: <rect x="3" y="10" width="18" height="4" rx="2" />,
  triangle: <path d="M12 4.5 L19.8 18 L4.2 18 Z" />,
  diamond: <path d="M12 3.5 L20.5 12 L12 20.5 L3.5 12 Z" />,
};

export function ProgramMark({ shape, size = 20 }: { shape: ProgramIcon; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {SHAPES[shape]}
    </svg>
  );
}
