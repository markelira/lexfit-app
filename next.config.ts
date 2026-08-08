import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Allow Firebase signInWithPopup to read window.closed without the
          // Cross-Origin-Opener-Policy warning, while keeping cross-origin
          // isolation otherwise.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // No page of ours is legitimately framed by anyone (the QR finish
          // page is opened directly) — kill clickjacking wholesale.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // Camera stays self-only (Finish Share selfie); the rest is unused.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
