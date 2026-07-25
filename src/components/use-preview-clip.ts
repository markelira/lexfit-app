"use client";

import { useEffect, useRef, useState } from "react";
import { getPlaybackTokens, type PlaybackResponse } from "@/lib/playback";

// Shared 60-second muted-autoplay preview logic for the detail modal and the
// Foundation hero. Fetches a signed token for `code`, drives a 0→60s countdown
// (from real playback when a video is available, else a fake timer for the cover
// fallback), reveals the video once it's actually playing, caps at 60s, and falls
// back to the cover (pb=null) on any playback error or missing/forbidden asset.
// The consumer renders a <MuxPlayer ref={playerRef} muted={muted} autoPlay …/>
// when `pb` is set, and shows its cover art underneath until `videoReady`.
export function usePreviewClip(code: string) {
  const [pb, setPb] = useState<PlaybackResponse | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [sec, setSec] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const ended = sec >= 60;

  // (Pre)load the clip on mount / when the code changes.
  useEffect(() => {
    let active = true;
    setPb(null);
    setVideoReady(false);
    setSec(0);
    setMuted(true);
    getPlaybackTokens(code).then(
      (d) => { if (active) setPb(d); },
      () => {},
    );
    return () => { active = false; };
  }, [code]);

  // Cover-only fallback countdown (no preview video).
  useEffect(() => {
    if (pb || ended) return;
    const t = setInterval(() => setSec((s) => Math.min(60, s + 1)), 1000);
    return () => clearInterval(t);
  }, [pb, ended, code]);

  // Real playback: drive the countdown, reveal once playing, cap at 60s, fall back on error.
  useEffect(() => {
    const el = playerRef.current;
    if (!el || !pb) return;
    const onTime = () => {
      const t = el.currentTime ?? 0;
      if (t >= 60) { el.pause(); setSec(60); return; }
      setSec(Math.floor(t));
    };
    const onPlaying = () => setVideoReady(true);
    const onError = () => { setPb(null); setVideoReady(false); };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("error", onError);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("error", onError);
    };
  }, [pb, code]);

  const toggleMute = () => {
    const el = playerRef.current;
    const next = !muted;
    setMuted(next);
    if (el) el.muted = next;
  };
  const replay = () => {
    setSec(0);
    const el = playerRef.current;
    if (el) { el.currentTime = 0; el.play?.(); }
  };

  return { pb, videoReady, muted, sec, ended, playerRef, toggleMute, replay };
}
