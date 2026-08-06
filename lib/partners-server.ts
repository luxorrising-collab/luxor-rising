import { reader } from "./keystatic-reader";
import type { Partner } from "./partners";

/** All partners, normalised and sorted (explicit order, then rating desc). */
export async function getPartners(): Promise<Partner[]> {
  const all = await reader.collections.partners.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      name: entry.name,
      channel: entry.channel,
      category: entry.category,
      role: entry.role,
      explanation: entry.explanation,
      source: entry.source,
      profileUrl: entry.profileUrl,
      rating: entry.rating ?? 0,
      reviewCount: entry.reviewCount ?? 0,
      snapshotDate: entry.snapshotDate,
      verified: entry.verified,
      tags: entry.tags ?? "",
      logo: entry.logo,
      order: entry.order ?? 0,
    }))
    .sort((a, b) => a.order - b.order || b.rating - a.rating);
}
