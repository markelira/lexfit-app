"use client";

import { useEffect, useState } from "react";
import { FinishShare } from "@/components/finish/FinishShare";
import { DesktopHandoff } from "@/components/finish/DesktopHandoff";
import { useIsMobile } from "@/lib/useIsMobile";
import type { FinishData } from "@/lib/finish-overlays";

/**
 * Device-aware entry to the finish-share flow. On a phone the selfie is taken
 * inline (FinishShare). On desktop it's handed off to the phone via QR
 * (DesktopHandoff) - you can't take a good selfie on a laptop.
 */
export function FinishShareEntry({ data, open, onClose }: { data: FinishData; open: boolean; onClose: () => void }) {
  const isMobile = useIsMobile();
  // useIsMobile defaults false on first paint; render nothing until it resolves
  // so mobile never briefly mounts DesktopHandoff (which would POST a session).
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!open || !ready) return null;
  return isMobile ? <FinishShare data={data} onClose={onClose} /> : <DesktopHandoff data={data} onClose={onClose} />;
}
