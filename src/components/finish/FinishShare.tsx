"use client";

import "./FinishShare.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { LxIcon } from "@/components/LxIcon";
import { lxPaths } from "@/lib/icons";
import { FinishOverlay } from "@/components/finish/FinishOverlay";
import { renderFinishImage } from "@/lib/finish-raster";
import { OVERLAY_DIRS, OVERLAY_NAME, REF_W, availableLeads, type FinishData, type LeadKey, type OverlayDir } from "@/lib/finish-overlays";

type Stage = "camera" | "review";

/**
 * The post-workout selfie + data-overlay flow (runs entirely on-device; the
 * selfie is never uploaded). Used inline on a phone finish, and on the desktop
 * handoff page. `data` is the workout's personalized numbers.
 */
export function FinishShare({ data, onClose, onShared, startInReview }: { data: FinishData; onClose?: () => void; onShared?: () => void; startInReview?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null); // holds the captured frame (mirrored)
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>(startInReview ? "review" : "camera");
  const [stillUrl, setStillUrl] = useState<string | null>(null); // captured frame for <img>
  const [camErr, setCamErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [scrim, setScrim] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 }); // drag-nudge, reference-space px
  const [lead, setLead] = useState<LeadKey | undefined>(undefined); // data-swap: hero metric
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const isFront = facing === "user";
  const dir: OverlayDir = OVERLAY_DIRS[idx];
  const shown: FinishData = { ...data, lead };
  const leads = availableLeads(shown);
  const LEAD_LABEL: Record<LeadKey, string> = { reps: "Ismétlés", exercises: "Gyakorlat", workoutNo: "Edzésem" };

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Open the camera while in the camera stage. A per-run `cancelled` flag ensures
  // a stream that resolves AFTER teardown (user closed during the permission
  // prompt) is stopped immediately - otherwise the camera would stay on.
  useEffect(() => {
    if (stage !== "camera") return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    (async () => {
      setCamErr(null);
      // Only hint a width - forcing a portrait 1080×1920 made the browser pick a
      // cropped/zoomed sensor mode. A width-only ideal keeps the native ~1x FOV;
      // the 9:16 crop happens on capture + object-fit on the preview.
      const constraints = (fm: MediaTrackConstraints["facingMode"]): MediaStreamConstraints => ({
        video: { facingMode: fm, width: { ideal: 1920 } },
        audio: false,
      });
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints({ exact: facing }));
        } catch {
          // No camera with that exact facing (e.g. laptop) → fall back to any.
          stream = await navigator.mediaDevices.getUserMedia(constraints(facing));
        }
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) setCamErr("A kamera nem elérhető. Engedélyezd a hozzáférést, vagy tölts fel egy képet.");
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (streamRef.current === stream) streamRef.current = null;
    };
  }, [stage, facing]);

  function capture() {
    const v = videoRef.current;
    const c = stillRef.current;
    if (!v || !c || !v.videoWidth) return;
    // 9:16 crop of the (mirrored) video frame.
    const vw = v.videoWidth, vh = v.videoHeight;
    const targetAR = 9 / 16;
    let sw = vw, sh = vw / targetAR;
    if (sh > vh) { sh = vh; sw = vh * targetAR; }
    const sx = (vw - sw) / 2, sy = (vh - sh) / 2;
    c.width = Math.round(sw); c.height = Math.round(sh);
    const ctx = c.getContext("2d")!;
    ctx.save();
    if (isFront) { ctx.translate(c.width, 0); ctx.scale(-1, 1); } // mirror the selfie (front only)
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, c.width, c.height);
    ctx.restore();
    setStillUrl(c.toDataURL("image/jpeg", 0.92));
    stopStream();
    setStage("review");
  }

  // Fallback: pick a photo from the device if the camera is unavailable.
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const c = stillRef.current!;
      const targetAR = 9 / 16;
      let sw = img.width, sh = img.width / targetAR;
      if (sh > img.height) { sh = img.height; sw = img.height * targetAR; }
      const sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      c.width = Math.round(sw); c.height = Math.round(sh);
      c.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      setStillUrl(c.toDataURL("image/jpeg", 0.92));
      stopStream();
      setStage("review");
    };
    img.src = URL.createObjectURL(file);
  }

  function retake() { setOffset({ x: 0, y: 0 }); setStage("camera"); }

  async function exportBlob(): Promise<File> {
    const blob = await renderFinishImage({ photo: stillRef.current, dir, data: shown, scrim, offset });
    return new File([blob], "lexfit.jpg", { type: "image/jpeg" });
  }

  // Drag the overlay to reposition (delta in real px → reference-space px).
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !frameRef.current) return;
    const s = frameRef.current.clientWidth / REF_W || 1;
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    setOffset({
      x: clamp(drag.current.ox + (e.clientX - drag.current.x) / s, 90),
      y: clamp(drag.current.oy + (e.clientY - drag.current.y) / s, 170),
    });
  }
  function onPointerUp() { drag.current = null; }

  async function share() {
    setBusy(true);
    try {
      const file = await exportBlob();
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: "LEXFIT" });
        onShared?.();
      } else {
        download(file);
        onShared?.(); // Web Share unavailable → still report done so the desktop clears
      }
    } catch { /* user cancelled share or it failed - no-op */ }
    finally { setBusy(false); }
  }

  async function downloadOnly() {
    setBusy(true);
    try { download(await exportBlob()); onShared?.(); }
    finally { setBusy(false); }
  }

  function download(file: File) {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  const step = (d: number) => setIdx((i) => (i + d + OVERLAY_DIRS.length) % OVERLAY_DIRS.length);

  return (
    <div className="fsh">
      <header className="fsh-top">
        {onClose && <button className="fsh-x" onClick={() => { stopStream(); onClose(); }}><LxIcon d={lxPaths.close} size={18} /></button>}
        <span className="fsh-ttl">{stage === "camera" ? "Szelfi az edzés után" : OVERLAY_NAME[dir]}</span>
        <span style={{ width: 30 }} />
      </header>

      <div className="fsh-stage">
        <div
          className={`fsh-frame${stage === "review" ? " draggable" : ""}`}
          ref={frameRef}
          onPointerDown={stage === "review" ? onPointerDown : undefined}
          onPointerMove={stage === "review" ? onPointerMove : undefined}
          onPointerUp={stage === "review" ? onPointerUp : undefined}
        >
          {stage === "camera" ? (
            <>
              <video ref={videoRef} className={`fsh-video${isFront ? " front" : ""}`} playsInline muted />
              {!camErr && (
                <button className="fsh-flip" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))} aria-label="Kamera váltása">
                  <LxIcon d={lxPaths.rotateCw} size={18} />
                </button>
              )}
              {camErr && (
                <div className="fsh-camerr">
                  <p>{camErr}</p>
                  <label className="fsh-btn sec">
                    Kép feltöltése
                    <input type="file" accept="image/*" hidden onChange={onFile} />
                  </label>
                </div>
              )}
            </>
          ) : (
            <>
              {stillUrl && <img className="fsh-still" src={stillUrl} alt="" />}
              <FinishOverlay dir={dir} data={shown} scrim={scrim} offset={offset} />
            </>
          )}
        </div>
        <canvas ref={stillRef} style={{ display: "none" }} />
      </div>

      {stage === "camera" ? (
        <div className="fsh-controls">
          <button className="fsh-shutter" onClick={capture} aria-label="Fotó" disabled={!!camErr}>
            <span />
          </button>
        </div>
      ) : (
        <div className="fsh-review">
          <div className="fsh-carousel">
            <button className="fsh-nav" onClick={() => step(-1)} aria-label="Előző"><LxIcon d={lxPaths.chevronLeft} size={18} /></button>
            <div className="fsh-dots">
              {OVERLAY_DIRS.map((d, i) => (
                <button key={d} className={i === idx ? "on" : ""} onClick={() => setIdx(i)} aria-label={OVERLAY_NAME[d]} />
              ))}
            </div>
            <button className="fsh-nav" onClick={() => step(1)} aria-label="Következő"><LxIcon d={lxPaths.chevronRight} size={18} /></button>
          </div>

          {leads.length > 1 && (
            <div className="fsh-leads">
              <span className="lbl">Kiemelt:</span>
              {leads.map((k) => (
                <button key={k} className={(lead ?? leads[0]) === k ? "on" : ""} onClick={() => setLead(k)}>{LEAD_LABEL[k]}</button>
              ))}
            </div>
          )}

          <label className="fsh-scrim-tog">
            <input type="checkbox" checked={scrim} onChange={(e) => setScrim(e.target.checked)} />
            Sötét háttér a szöveg mögé · húzd a szöveget a helyére
          </label>

          <div className="fsh-actions">
            <button className="fsh-btn sec" onClick={retake}><LxIcon d={lxPaths.rotateCcw} size={15} /> Újra</button>
            <button className="fsh-btn sec" onClick={downloadOnly} disabled={busy}><LxIcon d={lxPaths.download} size={15} /> Letöltés</button>
            <button className="fsh-btn pri" onClick={share} disabled={busy}>{busy ? "…" : "Megosztás"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
