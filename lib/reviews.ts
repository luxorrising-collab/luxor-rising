// Client-safe review types + pure helpers. No server-only imports here, so
// this module is safe to pull into client components (cards, the wall).
// Server-side loading lives in lib/reviews-server.ts.

export type Review = {
  slug: string;
  author: string;
  location: string;
  quote: string;
  rating: number;
  date: string | null;
  source: string;
  sourceUrl: string | null;
  verified: boolean;
  avatar: string | null;
  featured: boolean;
  placements: string[];
  partner: string | null;
  order: number;
};

export const SOURCE_LABELS: Record<string, string> = {
  google: "Google",
  facebook: "Facebook",
  tripadvisor: "TripAdvisor",
  airbnb: "Airbnb",
  whatsapp: "WhatsApp",
  direct: "Direct",
};

/**
 * The review to headline a given section: a featured one pinned to that
 * placement wins; otherwise any review pinned there; otherwise null (so the
 * caller can fall back to a written statement).
 */
export function featuredFor(
  reviews: Review[],
  placement: string,
): Review | null {
  return (
    reviews.find((r) => r.featured && r.placements.includes(placement)) ??
    reviews.find((r) => r.placements.includes(placement)) ??
    null
  );
}

/**
 * Aggregate rating — computed from VERIFIED reviews only, so we never emit
 * star structured data (or claim an average) built on sample content.
 */
export function aggregate(
  reviews: Review[],
): { average: number; count: number } | null {
  const verified = reviews.filter((r) => r.verified);
  if (!verified.length) return null;
  const avg = verified.reduce((s, r) => s + r.rating, 0) / verified.length;
  return { average: Math.round(avg * 10) / 10, count: verified.length };
}
