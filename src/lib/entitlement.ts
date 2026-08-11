import "server-only";

/**
 * Access model: all videos are gated - a user needs an active entitlement to
 * stream. Previews/catalog are free, playback is not.
 *
 * The decision now lives in the single source of truth (subscriptions/{uid},
 * driven by `accessUntil`). This module re-exports it so existing callers
 * (e.g. the Mux token route) keep working without knowing where it moved.
 */
export { hasAccess } from "@/lib/pricing/subscription";
