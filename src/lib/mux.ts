import "server-only";
import Mux from "@mux/mux-node";

// Mux server client (Phase 3). Never import into a client component.
export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

/** Create an asset from a hosted file URL (used to seed a test video). Signed. */
export async function createAssetFromUrl(url: string, code: string) {
  return mux.video.assets.create({
    inputs: [{ url }],
    playback_policies: ["signed"],
    passthrough: code,
  });
}

// Kihívások day videos live in a SEPARATE collection (challengeVideos/) from the
// Videótár library (videos/). The shared Mux webhook can't tell them apart from
// the doc id alone, so challenge uploads namespace their passthrough with this
// prefix; `passthroughTarget` maps a passthrough back to the right collection.
export const CHALLENGE_PASSTHROUGH_PREFIX = "cv:";

/** Create a direct (browser) upload bound to a code. Signed playback.
 *  Pass `passthrough` to override the default (used to namespace challenge videos). */
export async function createDirectUpload(code: string, corsOrigin: string, opts?: { passthrough?: string }) {
  return mux.video.uploads.create({
    cors_origin: corsOrigin,
    new_asset_settings: {
      playback_policies: ["signed"],
      passthrough: opts?.passthrough ?? code,
    },
  });
}

/** Resolve a Mux asset passthrough to its Firestore collection + doc id. */
export function passthroughTarget(
  passthrough: string | null | undefined,
): { collection: "videos" | "challengeVideos"; code: string } | null {
  if (!passthrough) return null;
  if (passthrough.startsWith(CHALLENGE_PASSTHROUGH_PREFIX)) {
    return { collection: "challengeVideos", code: passthrough.slice(CHALLENGE_PASSTHROUGH_PREFIX.length) };
  }
  return { collection: "videos", code: passthrough };
}

export interface AssetState {
  status: "waiting" | "preparing" | "ready" | "errored";
  assetId?: string;
  playbackId?: string | null;
  duration?: number | null;
}

/** Resolve a direct upload to its asset + playback id (poll until ready). */
export async function getUploadAsset(uploadId: string): Promise<AssetState> {
  const upload = await mux.video.uploads.retrieve(uploadId);
  if (!upload.asset_id) return { status: "waiting" };
  const asset = await mux.video.assets.retrieve(upload.asset_id);
  return {
    status: asset.status as AssetState["status"],
    assetId: asset.id,
    playbackId: asset.playback_ids?.[0]?.id ?? null,
    duration: asset.duration ?? null,
  };
}

/**
 * Sign a playback id for the Mux Player. Returns video/thumbnail/storyboard
 * tokens so the poster and scrubbing previews work under the signed policy.
 */
export async function signPlaybackTokens(playbackId: string) {
  const tokens = (await mux.jwt.signPlaybackId(playbackId, {
    keyId: process.env.MUX_SIGNING_KEY_ID,
    keySecret: process.env.MUX_SIGNING_PRIVATE_KEY,
    type: ["video", "thumbnail", "storyboard"],
    expiration: "6h",
  })) as Record<string, string>;

  return {
    playback: tokens["playback-token"],
    thumbnail: tokens["thumbnail-token"],
    storyboard: tokens["storyboard-token"],
  };
}
