import type { MetadataRoute } from "next";

const BASE = "https://luxorrising.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin, API and the post-payment page shouldn't be indexed.
      disallow: ["/keystatic", "/api/", "/booking-confirmed"],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
