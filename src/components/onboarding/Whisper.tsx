import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// Alexa's aside line, used on 4 screens (why, reveal, first-entry, and the
// subscribe community note). One component so the voice reads identically
// everywhere (40 §P1.2). Quiet by default; `strong` for the reveal peak.
export function Whisper({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <p className={`fnl-whisper${strong ? " strong" : ""}`}>
      <span className="mark" aria-hidden="true">
        <LxIcon d={lxPaths.messageCircle} size={13} />
      </span>
      <span>{children}</span>
    </p>
  );
}
