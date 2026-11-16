import "server-only";
import { reader } from "./keystatic-reader";

// The one canonical list of experiences a guest can add to their day: the
// builder's name for each (exactly as shown in Design Your Day) and the
// product's own poetic title. Everything that repeats a guest's picks — the
// basket, the booking summary, Stripe, the booking record, every email and the
// confirmation page — resolves slugs through this, so they always match.

export type DayPickInfo = { slug: string; name: string; title: string };

let cache: Promise<Record<string, DayPickInfo>> | null = null;

export function getDayCatalogue(): Promise<Record<string, DayPickInfo>> {
  cache ??= (async () => {
    const [page, all] = await Promise.all([
      reader.singletons.conciergeDayPage.read(),
      reader.collections.experiences.all(),
    ]);
    const builderName: Record<string, string> = {};
    for (const e of page?.cards?.signature?.experiences ?? []) if (e.slug && e.name) builderName[e.slug] = e.name;
    const out: Record<string, DayPickInfo> = {};
    for (const { slug, entry } of all) {
      if (!entry.isActive || !entry.title) continue;
      const fallback = (entry.name || entry.title).replace(/^"|"$/g, "").split(/\s[—–-]\s/)[0].trim();
      out[slug] = { slug, name: builderName[slug] ?? fallback, title: entry.title };
    }
    return out;
  })();
  return cache;
}

/** Validate and resolve a guest's picks (slugs) to the canonical list. */
export async function resolvePicks(slugs: unknown): Promise<DayPickInfo[]> {
  if (!Array.isArray(slugs)) return [];
  const cat = await getDayCatalogue();
  const seen = new Set<string>();
  const out: DayPickInfo[] = [];
  for (const s of slugs) {
    if (typeof s !== "string" || !cat[s] || seen.has(s)) continue;
    seen.add(s);
    out.push(cat[s]);
    if (out.length >= 40) break;
  }
  return out;
}

/** "Karnak at Dawn · Medinet Habu · …" — the same wording everywhere. */
export const picksLine = (picks: { name: string }[]) => picks.map((p) => p.name).join(" · ");
