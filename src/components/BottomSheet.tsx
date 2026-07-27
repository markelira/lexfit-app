"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";

// The mobile modal (01 §1.5). Rises from the bottom, above the ever-present tab bar
// (M-RULE 01). Radius --r-lg on the top corners only; grab handle; scrim dismisses;
// Escape closes; focus trapped while open and returned to the trigger on close.
export function BottomSheet({
  open,
  onClose,
  ariaLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = sheetRef.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const raf = requestAnimationFrame(() => {
      sheetRef.current
        ?.querySelector<HTMLElement>('button,a[href],input,[tabindex]:not([tabindex="-1"])')
        ?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      restoreFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="lx bsheet-root">
      <div className="bsheet-scrim" onClick={onClose} aria-hidden="true" />
      <div className="bsheet" ref={sheetRef} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        <div className="bsheet-grab" aria-hidden="true" />
        {children}
      </div>
    </div>,
    document.body,
  );
}
