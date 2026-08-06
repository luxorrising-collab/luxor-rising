import { reader } from "./keystatic-reader";
import type { Review } from "./reviews";

/** All reviews, normalised and sorted (explicit order, then newest first). */
export async function getReviews(): Promise<Review[]> {
  const all = await reader.collections.reviews.all();
  return all
    .map(({ slug, entry }) => ({
      slug,
      author: entry.author,
      location: entry.location,
      quote: entry.quote,
      rating: entry.rating ?? 5,
      date: entry.date,
      source: entry.source,
      sourceUrl: entry.sourceUrl,
      verified: entry.verified,
      avatar: entry.avatar,
      featured: entry.featured,
      placements: [...(entry.placements ?? [])],
      partner: entry.partner,
      order: entry.order ?? 0,
    }))
    .sort(
      (a, b) => a.order - b.order || (b.date ?? "").localeCompare(a.date ?? ""),
    );
}
