import type { MetadataRoute } from "next";

const BASE = "https://www.luxorrising.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // The share images (/api/og) and catalogue cards (/api/feed-card) stay
      // crawlable, so Google and social previews can fetch them.
      allow: ["/", "/api/og/", "/api/feed-card/"],
      // Admin, API and the post-payment page shouldn't be indexed.
      disallow: ["/keystatic", "/api/", "/booking-confirmed"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
