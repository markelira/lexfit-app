"use client";

import { useEffect, useState } from "react";
import { FinishOverlay } from "@/components/finish/FinishOverlay";
import { OVERLAY_DIRS, OVERLAY_NAME, type FinishData, type OverlayDir } from "@/lib/finish-overlays";
import { renderFinishImage } from "@/lib/finish-raster";
import { FinishShare } from "@/components/finish/FinishShare";
import { FinishShareEntry } from "@/components/finish/FinishShareEntry";

// Not linked anywhere — a visual bench for the 5 overlays (like /cards-preview).
const SAMPLE_REF: FinishData = { reps: 340, mins: 28, streak: 13, theme: "Fenék & comb", title: "Fenék & comb", week: 4 };
const SAMPLE_REAL: FinishData = { exercises: 12, workoutNo: 18, mins: 22, streak: 5, theme: "Alsótest", week: 2 };

// A dark room-ish gradient stands in for a real selfie so the white type is judgeable.
const PHOTO = "linear-gradient(158deg, #46413b 0%, #221f1c 52%, #524c45 100%)";

function Frame({ dir, data, scrim }: { dir: (typeof OVERLAY_DIRS)[number]; data: FinishData; scrim: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      <div
        style={{
          position: "relative",
          width: 284,
          aspectRatio: "9 / 16",
          borderRadius: 16,
          overflow: "hidden",
          background: PHOTO,
          boxShadow: "0 1px 3px rgba(0,0,0,.1), 0 16px 38px -16px rgba(0,0,0,.34)",
        }}
      >
        <FinishOverlay dir={dir} data={data} scrim={scrim} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#14100c", fontFamily: "var(--font)" }}>
        {dir} · {OVERLAY_NAME[dir]}
      </div>
    </div>
  );
}

function RasterRow({ data, scrim }: { data: FinishData; scrim: boolean }) {
  const [urls, setUrls] = useState<Partial<Record<OverlayDir, string>>>({});
  useEffect(() => {
    let alive = true;
    const made: string[] = [];
    (async () => {
      const out: Partial<Record<OverlayDir, string>> = {};
      for (const d of OVERLAY_DIRS) {
        const blob = await renderFinishImage({ photo: null, dir: d, data, scrim, width: 568 });
        const u = URL.createObjectURL(blob);
        made.push(u);
        out[d] = u;
      }
      if (alive) setUrls(out);
    })();
    return () => { alive = false; made.forEach((u) => URL.revokeObjectURL(u)); };
  }, [data, scrim]);
  return (
    <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 16 }}>
      {OVERLAY_DIRS.map((d) => (
        <div key={d} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          {urls[d] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={urls[d]} alt={d} width={284} style={{ borderRadius: 16, display: "block" }} />
          ) : (
            <div style={{ width: 284, aspectRatio: "9/16", borderRadius: 16, background: "#ddd" }} />
          )}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#14100c", fontFamily: "var(--font)" }}>{d} · raster</div>
        </div>
      ))}
    </div>
  );
}

export default function FinishPreviewPage() {
  const [scrim, setScrim] = useState(false);
  const [share, setShare] = useState<null | "mobile" | "entry" | "review">(null);
  useEffect(() => {
    // The ?share benches open the camera / create handoff sessions — dev only.
    if (typeof window === "undefined" || process.env.NODE_ENV === "production") return;
    const p = new URLSearchParams(window.location.search).get("share");
    if (p === "1") setShare("mobile");
    else if (p === "entry") setShare("entry");
    else if (p === "review") setShare("review");
  }, []);
  if (share === "mobile") return <FinishShare data={SAMPLE_REAL} onClose={() => setShare(null)} />;
  if (share === "review") return <FinishShare data={SAMPLE_REAL} startInReview onClose={() => setShare(null)} />;
  if (share === "entry") return <FinishShareEntry open data={SAMPLE_REAL} onClose={() => setShare(null)} />;

  return (
    <div style={{ background: "#eceae6", minHeight: "100vh", padding: "40px 32px 80px", fontFamily: "var(--font)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", margin: 0, color: "#14100c" }}>
          Finish overlays — preview
        </h1>
        <p style={{ color: "#7a736a", fontSize: 15, marginTop: 8 }}>
          The five directions at their exact reference geometry. Top row: reference sample (reps 340). Bottom row:
          real-data fallback (no reps → exercise count / workout #).
        </p>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 14, color: "#14100c" }}>
          <input type="checkbox" checked={scrim} onChange={(e) => setScrim(e.target.checked)} /> Scrim (bright-photo escape hatch)
        </label>

        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#355c4d", marginTop: 34 }}>Referencia adatok</h2>
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 16 }}>
          {OVERLAY_DIRS.map((d) => (
            <Frame key={d} dir={d} data={SAMPLE_REF} scrim={scrim} />
          ))}
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#355c4d", marginTop: 44 }}>Valós adat (reps nélkül)</h2>
        <div style={{ display: "flex", gap: 30, flexWrap: "wrap", marginTop: 16 }}>
          {OVERLAY_DIRS.map((d) => (
            <Frame key={d} dir={d} data={SAMPLE_REAL} scrim={scrim} />
          ))}
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#355c4d", marginTop: 44 }}>Canvas raszter (export — a megosztott kép)</h2>
        <p style={{ color: "#7a736a", fontSize: 13, margin: "4px 0 0" }}>Ugyanaz a geometria canvason kirajzolva — ez lesz a letöltött/megosztott JPEG.</p>
        <RasterRow data={SAMPLE_REF} scrim={scrim} />
      </div>
    </div>
  );
}
