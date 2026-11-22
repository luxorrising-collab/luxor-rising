import "server-only";
import { reader } from "./keystatic-reader";
import { ORIGINAL_DAY_RATE } from "./pricing-math";

// The one canonical list of experiences a guest can add to their day: the
// builder's name for each (exactly as shown in Design Your Day) and the
// product's own poetic title. Everything that repeats a guest's picks — the
// basket, the booking summary, Stripe, the booking record, every email and the
// confirmation page — resolves slugs through this, so they always match.

export type DayPickInfo = {
  slug: string;
  name: string;
  title: string;
  /** The product page's opening lines (why it's worth it), for the saved-day email. */
  hook?: string;
};

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
      const hook = String(entry.hook ?? "").replace(/\s+/g, " ").trim();
      out[slug] = { slug, name: builderName[slug] ?? fallback, title: entry.title, hook: hook || undefined };
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

// The three ways to see the picks with us (Adventure first, Signature last), and
// how many of the picks each one includes — read from the same card data and
// pricing rules as Design Your Day.
export async function threeWays(slugs: string[]) {
  const [page, rules] = await Promise.all([
    reader.singletons.conciergeDayPage.read(),
    reader.singletons.pricingRules.read(),
  ]);
  const cards = page?.cards;
  const orig = new Set((cards?.original?.experiences ?? []).map((e) => e?.slug).filter(Boolean));
  const adv = new Set(
    (cards?.adventure?.experiences ?? []).filter((e) => e?.tag === "Included").map((e) => e?.slug).filter(Boolean),
  );
  return [
    {
      name: cards?.adventure?.title || "Adventure",
      kicker: cards?.adventure?.kicker || "The must-sees included",
      from: rules?.lightDayRate ?? 330,
      line: "The must-sees of Luxor included, with your concierge door to door. Anything more is arranged locally, on the day.",
      included: slugs.filter((s) => adv.has(s)).length,
    },
    {
      name: cards?.original?.title || "Original",
      kicker: cards?.original?.kicker || "Luxor without compromise",
      from: ORIGINAL_DAY_RATE,
      line: "The best of Luxor, fully hosted, with every entry included, local food stops, private moments and a gift from your concierge.",
      included: slugs.filter((s) => orig.has(s)).length,
    },
    {
      name: cards?.signature?.title || "Signature",
      kicker: cards?.signature?.kicker || "As deep as Luxor goes",
      from: rules?.dayRate ?? 800,
      line: "As deep as Luxor goes: insider access, your Egyptologist when you wish, the temples as private as it gets, tips settled and the Signature gift collection.",
      included: slugs.length,
    },
  ];
}
