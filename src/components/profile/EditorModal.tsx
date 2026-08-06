"use client";

import { useEffect, type ReactNode } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";

// Explicit editor (30 §30.8): title, one control, Mentés (disabled until dirty),
// Mégsem. Desktop modal; below --bp-mobile the same markup renders as a bottom
// sheet (CSS). Escape closes. In P1 saving is fixture-only.
export function EditorModal({
  open, title, dirty, onClose, onSave, children, saveLabel = "Mentés", saving,
}: {
  open: boolean;
  title: string;
  dirty: boolean;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
  saveLabel?: string;
  saving?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="pf-modal-scrim" onClick={onClose}>
      <div className="pf-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="pf-modal-head">
          <h2>{title}</h2>
          <button type="button" className="pf-modal-x hit44" aria-label="Bezárás" onClick={onClose}>
            <LxIcon d={lxPaths.close} size={18} />
          </button>
        </div>
        <div className="pf-modal-body">{children}</div>
        <div className="pf-modal-foot">
          <button type="button" className="lxbtn m ghost" onClick={onClose}>Mégsem</button>
          <button type="button" className="lxbtn m primary" disabled={!dirty || saving} onClick={onSave}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
