import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// The level control's intensity marker (40 §P1.0 / §40.4 Q2). Replaces the
// prototype's repeated-emoji string + inline font-size arithmetic with n filled
// flame glyphs. `n` is 1–3; extra positions render as faint outlines so all
// three levels share one footprint and the difference reads at a glance.
export function FlameRating({ n, size = 16 }: { n: 1 | 2 | 3; size?: number }) {
  return (
    <span className="fnl-flames" role="img" aria-label={`Intenzitás: ${n} / 3`}>
      {[1, 2, 3].map((i) => (
        <LxIcon
          key={i}
          d={lxPaths.flame}
          size={size}
          fill={i <= n}
          className={i <= n ? "on" : "off"}
        />
      ))}
    </span>
  );
}
