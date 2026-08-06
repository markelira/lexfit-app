"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import type { FinishData } from "@/lib/finish-overlays";

type Status = "pending" | "opened" | "shared";
const STATUS_TEXT: Record<Status, string> = {
  pending: "Olvasd be a telefonoddal, és készítsd el a szelfit ott.",
  opened: "Megnyitva a telefonon — készítsd el a szelfit…",
  shared: "Kész ✓ — megosztva a telefonodról.",
};

/**
 * Desktop→phone handoff: mint a one-time session, show its QR, and reflect the
 * phone's live status via onSnapshot. The selfie is taken + shared entirely on
 * the phone; nothing comes back here.
 */
export function DesktopHandoff({ data, onClose }: { data: FinishData; onClose: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("pending");
  const [err, setErr] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);

  // Mount once: create ONE session + subscribe for its lifetime. Not keyed on
  // `data` (whose identity churns) — that would tear down the listener.
  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/finish-share/session", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
          body: JSON.stringify({ data }), // captured once at mount (effect runs once)
        });
        if (!active) return;
        if (!res.ok) { setErr("Nem sikerült elindítani. Próbáld újra."); return; }
        const { token } = (await res.json()) as { token: string };
        tokenRef.current = token;
        if (!active) return;
        const url = `${window.location.origin}/finish/${token}`;
        setQr(await QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: "#0b0b0c", light: "#ffffff" } }));
        if (!active) return;
        unsub = onSnapshot(doc(db, "shareSessions", token), (snap) => {
          if (active) setStatus((snap.data()?.status as Status) ?? "pending");
        });
      } catch {
        if (active) setErr("Nem sikerült elindítani. Próbáld újra.");
      }
    })();
    return () => {
      active = false;
      unsub?.();
      // Clean up the session doc so it doesn't linger until TTL.
      const t = tokenRef.current;
      if (t) auth.currentUser?.getIdToken().then((idt) =>
        fetch(`/api/finish-share/${t}`, { method: "DELETE", headers: { Authorization: `Bearer ${idt}` } }),
      ).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dho">
      <div className="dho-card">
        <button className="dho-x" onClick={onClose} aria-label="Bezárás"><LxIcon d={lxPaths.close} size={18} /></button>
        <div className="dho-h">Fejezd be a telefonodon</div>
        <p className="dho-s">Egy szelfit a laptop kamerájával nem érdemes — olvasd be ezt a kódot a telefonoddal, és ott készítsd el, az edzésadataiddal.</p>

        <div className="dho-qr">
          {err ? <div className="dho-err">{err}</div>
            : qr ? <img src={qr} alt="QR kód" width={220} height={220} />
            : <div className="dho-qr-load">Kód készítése…</div>}
        </div>

        <div className={`dho-status s-${status}`}>
          {status === "shared" && <LxIcon d={lxPaths.check} size={16} sw={2.6} />}
          {STATUS_TEXT[status]}
        </div>

        <button className="dho-skip" onClick={onClose}>Most nem</button>
      </div>

      <style>{`
        .dho { position: fixed; inset: 0; z-index: 120; display: flex; align-items: center; justify-content: center;
          background: rgba(10,10,12,.62); backdrop-filter: blur(3px); padding: 24px; }
        .dho-card { position: relative; width: 100%; max-width: 380px; background: var(--surface, #fff); border-radius: 20px;
          padding: 30px 28px 24px; text-align: center; box-shadow: 0 30px 80px -20px rgba(0,0,0,.45); font-family: var(--font); }
        .dho-x { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border: none; background: none;
          color: var(--ink-3, #999); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .dho-x svg { stroke: currentColor; }
        .dho-h { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--ink, #14100c); }
        .dho-s { font-size: 13.5px; color: var(--ink-2, #6b6b6b); line-height: 1.5; margin: 8px 0 0; }
        .dho-qr { display: flex; align-items: center; justify-content: center; width: 220px; height: 220px; margin: 20px auto 0;
          border-radius: 14px; background: #fff; border: 1px solid var(--line, #e6e3de); }
        .dho-qr img { display: block; border-radius: 8px; }
        .dho-qr-load, .dho-err { font-family: var(--mono); font-size: 12px; color: var(--ink-3, #999); }
        .dho-err { color: var(--accent-2, #8f4f20); }
        .dho-status { display: inline-flex; align-items: center; gap: 6px; margin-top: 18px; font-size: 13px; font-weight: 600;
          color: var(--ink-2, #6b6b6b); }
        .dho-status.s-opened { color: var(--accent-ink, #355c4d); }
        .dho-status.s-shared { color: var(--accent-2, #3f7a5f); }
        .dho-status svg { stroke: currentColor; }
        .dho-skip { margin-top: 16px; background: none; border: none; color: var(--ink-3, #999); font-size: 13px; cursor: pointer;
          font-family: inherit; }
      `}</style>
    </div>
  );
}
