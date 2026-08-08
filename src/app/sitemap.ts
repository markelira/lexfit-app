import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://lexfit.hu";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/aszf`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/adatvedelem`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/impresszum`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
