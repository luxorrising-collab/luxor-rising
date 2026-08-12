import type { MetadataRoute } from "next";
import { reader } from "@/lib/keystatic-reader";

// Keep in sync with metadataBase in app/(site)/layout.tsx. Update when the real
// domain is connected.
const BASE = "https://luxorrising.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [experiences, articles, destinations] = await Promise.all([
    reader.collections.experiences.all(),
    reader.collections.articles.all(),
    reader.collections.destinations.all(),
  ]);

  const now = new Date();
  const staticRoutes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/experiences", priority: 0.9 },
    { path: "/concierge-day", priority: 0.9 },
    { path: "/medinet-habu", priority: 0.8 },
    { path: "/reviews", priority: 0.7 },
    { path: "/insiders-guide", priority: 0.7 },
    { path: "/private-guide", priority: 0.6 },
    { path: "/private-tours", priority: 0.6 },
    { path: "/private-villas", priority: 0.6 },
    { path: "/legal", priority: 0.3 },
    { path: "/legal/cookies", priority: 0.3 },
  ];

  const urls: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: BASE + r.path,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r.priority,
  }));

  for (const e of experiences) {
    if (!e.entry.isActive || e.slug === "medinet-habu") continue;
    urls.push({
      url: `${BASE}/experiences/${e.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }
  for (const a of articles) {
    urls.push({
      url: `${BASE}/insiders-guide/${a.slug}`,
      lastModified: a.entry.publishedAt ? new Date(a.entry.publishedAt) : now,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }
  for (const d of destinations) {
    urls.push({
      url: `${BASE}/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return urls;
}
