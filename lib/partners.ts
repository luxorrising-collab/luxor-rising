// Client-safe partner types + helpers. No server-only imports (see
// lib/partners-server.ts for the reader-backed loader).

export type Partner = {
  slug: string;
  name: string;
  channel: string;
  category: string;
  role: string;
  explanation: string;
  source: string;
  profileUrl: string | null;
  rating: number;
  reviewCount: number;
  snapshotDate: string | null;
  verified: boolean;
  tags: string;
  logo: string | null;
  order: number;
};

export const PARTNER_CATEGORY_LABELS: Record<string, string> = {
  transfers: "Transfers & drivers",
  guiding: "Guiding & Egyptology",
  nile: "Nile & boats",
  desert: "Desert & Bedouin",
  balloon: "Ballooning",
  redsea: "Red Sea & diving",
  stays: "Stays & hospitality",
};

/**
 * The real overall rating, weighted by each verified partner's actual review
 * count — so the headline matches the live public totals (e.g. Google's 5.0
 * from 9), not just the handful of individual reviews transcribed onto the page.
 */
export function partnerAggregate(
  partners: Partner[],
): { average: number; count: number; sources: number } | null {
  const v = partners.filter((p) => p.verified && p.rating > 0 && p.reviewCount > 0);
  if (!v.length) return null;
  const count = v.reduce((s, p) => s + p.reviewCount, 0);
  const weighted = v.reduce((s, p) => s + p.rating * p.reviewCount, 0) / count;
  return { average: Math.round(weighted * 10) / 10, count, sources: v.length };
}

/**
 * Section summary: overall rating, total review count, and the "as of" date
 * (the most recent snapshot among the sources) — best-practice for showing a
 * dated rating aggregated from external profiles.
 */
export function sourceStats(
  sources: Partner[],
): { average: number; count: number; asOf: string | null } | null {
  const agg = partnerAggregate(sources);
  if (!agg) return null;
  const dates = sources
    .filter((s) => s.verified && s.snapshotDate)
    .map((s) => s.snapshotDate as string)
    .sort();
  return { ...agg, asOf: dates.length ? dates[dates.length - 1] : null };
}

/** Turn a category + free-text tags field into clean #hashtags. */
export function hashtagsFor(partner: Partner): string[] {
  const base = "#" + partner.category;
  const extra = partner.tags
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : "#" + t));
  return [base, ...extra];
}
