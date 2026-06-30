"use client";

import { auth } from "@/lib/firebase";

export interface PlaybackResponse {
  playbackId: string;
  tokens: { playback: string; thumbnail: string; storyboard: string };
}

/** Fetch signed Mux playback tokens for a workout (sends the Firebase ID token). */
export async function getPlaybackTokens(code: string): Promise<PlaybackResponse> {
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch(`/api/mux/token?code=${encodeURIComponent(code)}`, {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "playback unavailable");
  }
  return res.json();
}
