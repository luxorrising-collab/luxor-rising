// Client-safe partner types + helpers. No server-only imports (see
// lib/partners-server.ts for the reader-backed loader).

export type Partner = {
  slug: string;
  name: string;
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
