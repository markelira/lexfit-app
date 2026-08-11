"use client";

import MuxUploader from "@mux/mux-uploader-react";
import { useRef, useState } from "react";
import { adminJson } from "@/lib/admin-fetch";
import type { MuxStatus } from "@/lib/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Admin video upload. The file goes straight to Mux (chunked/resumable via
 * @mux/mux-uploader). The app then plays it through SIGNED Mux playback -
 * we only ever store the playbackId here, never the file.
 */
export function VideoUploader({
  code,
  initialStatus,
  initialPlaybackId,
  onBound,
  uploadPath = "/api/mux/upload",
  finalizePath = "/api/mux/finalize",
}: {
  code: string;
  initialStatus: MuxStatus;
  initialPlaybackId: string | null;
  /** Fired when an upload starts and binds to this code (so the code can be locked). */
  onBound?: () => void;
  /** Override the Mux endpoints (e.g. the challengeVideos pipeline). */
  uploadPath?: string;
  finalizePath?: string;
}) {
  const [status, setStatus] = useState<MuxStatus>(initialStatus);
  const [playbackId, setPlaybackId] = useState<string | null>(initialPlaybackId);
  const [replacing, setReplacing] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const uploadIdRef = useRef<string | null>(null);

  const attached = status === "ready" && playbackId && !replacing;

  // Called by MuxUploader when the upload starts - mint a signed direct-upload URL.
  async function getEndpoint(): Promise<string> {
    setIsError(false);
    setMsg("Feltöltés előkészítése…");
    onBound?.(); // the upload creates videos/{code} - lock the code from here
    const { url, uploadId } = await adminJson<{ url: string; uploadId: string }>(uploadPath, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    uploadIdRef.current = uploadId;
    setStatus("uploading");
    setMsg("");
    return url;
  }

  async function onUploadSuccess() {
    setStatus("processing");
    setMsg("Mux feldolgozás… (ez eltarthat egy percig)");
    const uploadId = uploadIdRef.current;
    if (!uploadId) return;
    for (let i = 0; i < 40; i++) {
      try {
        const state = await adminJson<{ status: string; playbackId?: string | null }>(finalizePath, {
          method: "POST",
          body: JSON.stringify({ code, uploadId }),
        });
        if (state.status === "ready" && state.playbackId) {
          setPlaybackId(state.playbackId);
          setStatus("ready");
          setReplacing(false);
          setMsg("");
          return;
        }
        if (state.status === "errored") {
          setStatus("error");
          setIsError(true);
          setMsg("A Mux feldolgozás hibázott.");
          return;
        }
      } catch {
        /* transient - keep polling */
      }
      await sleep(3000);
    }
    setMsg("A feldolgozás még tart - töltsd újra az oldalt kicsit később a státuszért.");
  }

  function onUploadError(e: unknown) {
    setStatus("error");
    setIsError(true);
    const detail = (e as { detail?: { message?: string } })?.detail?.message;
    // UpChunk reports a dropped connection as "Server responded with 0".
    const netDrop = detail?.includes("responded with 0");
    setMsg(
      netDrop
        ? "Megszakadt az internetkapcsolat a feltöltés közben. Ellenőrizd a hálózatot, majd próbáld újra."
        : detail ? `Feltöltési hiba: ${detail}` : "Feltöltési hiba.",
    );
  }

  return (
    <div className="adm-upload">
      <div className="adm-upload-hd">Videó</div>
      <div className="adm-upload-sub">
        A fájl közvetlenül a Muxba töltődik fel. Az appban aláírt (védett) lejátszással jelenik meg - előfizetés
        nélkül nem nézhető.
      </div>

      {attached ? (
        <div className="adm-upload-done">
          <span className="adm-badge ready">● Csatolva</span>
          <span className="pid">playbackId: {playbackId}</span>
          <button className="adm-btn" style={{ marginLeft: "auto" }} onClick={() => setReplacing(true)}>
            Csere
          </button>
        </div>
      ) : (
        <>
          <MuxUploader
            endpoint={getEndpoint}
            onSuccess={onUploadSuccess}
            onUploadError={onUploadError}
            pausable
            dynamicChunkSize
            style={{ ["--uploader-background-color" as string]: "transparent" }}
          />
          {msg && <div className={`adm-upload-status${isError ? " error" : ""}`}>{msg}</div>}
          {replacing && (
            <button className="adm-btn" style={{ marginTop: 10 }} onClick={() => setReplacing(false)}>
              Mégse
            </button>
          )}
        </>
      )}
    </div>
  );
}
