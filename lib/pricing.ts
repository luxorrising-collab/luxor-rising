import { reader } from "@/lib/keystatic-reader";

// Single source of truth for guest-facing prices. The "Product prices" Keystatic
// singleton (content/pricing/index.yaml) holds the FINAL PRODUCT PRICE per
// product, seeded/refreshed from the internal pricing chart. Every price anchor
// on the site resolves through here so one edit stays consistent everywhere.

export async function getFinalPriceMap(): Promise<Map<string, number>> {
  const p = await reader.singletons.pricing.read();
  const map = new Map<string, number>();
  for (const item of p?.products ?? []) {
    if (typeof item.finalPrice !== "number") continue;
    if (item.experienceSlug) map.set(item.experienceSlug, item.finalPrice);
    if (item.key) map.set(item.key, item.finalPrice);
  }
  return map;
}

/** FINAL price for a product (by experience slug or key), or undefined if unset. */
export async function getFinalPrice(slug: string): Promise<number | undefined> {
  return (await getFinalPriceMap()).get(slug);
}

/** Parse a value-stack total string like "€230+" to a number, or null. */
export function parseEuro(s?: string | null): number | null {
  if (!s) return null;
  const m = String(s).replace(/[, ]/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}
