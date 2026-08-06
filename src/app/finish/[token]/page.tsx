"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FinishShare } from "@/components/finish/FinishShare";
import type { FinishData } from "@/lib/finish-overlays";

// Public (no auth) — opened on the phone via the desktop handoff QR. The token
// carries the workout data; the selfie is taken + shared entirely on this device.
export default function FinishTokenPage() {
  const params = useParams();
  const token = String(params.token);
  const [data, setData] = useState<FinishData | null | undefined>(undefined);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/finish-share/${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("expired"))))
      .then((j) => setData((j.data ?? {}) as FinishData))
      .catch(() => setData(null));
  }, [token]);

  function report(status: "shared") {
    fetch(`/api/finish-share/${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  const wrap = (children: React.ReactNode) => (
    <div style={{ position: "fixed", inset: 0, background: "#0b0b0c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 28, fontFamily: "var(--font)" }}>
      {children}
    </div>
  );

  if (data === undefined) return wrap(<p style={{ fontFamily: "var(--mono)", opacity: 0.7 }}>Betöltés…</p>);
  if (data === null) return wrap(
    <div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>Ez a link lejárt.</div>
      <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, marginTop: 8 }}>Indítsd újra a megosztást a gépeden.</p>
    </div>,
  );
  if (done) return wrap(
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.025em" }}>Kész! 💪</div>
      <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, marginTop: 8 }}>Bezárhatod ezt az oldalt.</p>
    </div>,
  );

  return <FinishShare data={data} onShared={() => report("shared")} onClose={() => setDone(true)} />;
}
