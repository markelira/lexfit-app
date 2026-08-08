import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://lexfit-app.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Authed/product surface and per-user pages stay out of the index.
        disallow: ["/app/", "/admin/", "/api/", "/player/", "/finish/", "/challenge/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
