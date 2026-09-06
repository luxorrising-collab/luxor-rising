import { reader } from "@/lib/keystatic-reader";
import { getFinalPriceMap } from "@/lib/pricing";

// Marketing product feeds, generated live from the current Keystatic content:
//  - Meta: a product-catalogue feed (CSV) for Advantage+ Catalog / dynamic ads.
//  - Google: a Page Feed (CSV) for Performance Max — the right feed type for a
//    services/experiences business (no physical SKUs → not Merchant Center
//    Shopping); attached to PMax for final-URL expansion.

// Canonical host with www — the apex 301-redirects, and Meta flags feed links
// that redirect as "invalid values", so always emit the final URL.
const SITE = "https://www.luxorrising.com";
const BRAND = "Luxor Rising";
// A dependable static hero for the Concierge Day card.
const CONCIERGE_IMAGE = `${SITE}/images/experiences/karnak-at-dawn/heroImage.jpg`;

export type FeedProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  link: string;
  image: string;
  category: string;
  region: string;
};

const clean = (s?: string | null) => String(s ?? "").replace(/\s+/g, " ").trim();

// City/region for the title + segmentation label, from the slug + hero eyebrow.
const regionOf = (slug: string, eyebrow?: string | null): string =>
  /red[\s-]?sea|hurghada|snorkel|yacht/i.test(`${slug} ${eyebrow ?? ""}`)
    ? "Red Sea, Egypt"
    : "Luxor, Egypt";

// Best-practice Meta title: the clean product NAME first, plus the city — natural,
// under ~65 chars, no promotional/poetic copy (that stays in the description).
const feedTitle = (name: string, region: string): string => {
  const n = clean(name);
  return /luxor|hurghada|red sea|egypt/i.test(n)
    ? `${n} — private experience`
    : `${n} — private experience in ${region}`;
};

const priceBand = (v: number): string =>
  v < 350 ? "Under €350" : v < 600 ? "€350–599" : v < 1000 ? "€600–999" : "€1000+";

export async function getFeedProducts(): Promise<FeedProduct[]> {
  const [all, priceMap] = await Promise.all([
    reader.collections.experiences.all(),
    getFinalPriceMap(),
  ]);

  const products: FeedProduct[] = [
    {
      id: "design-your-day",
      title: "The Concierge Day — your private day in Luxor",
      description:
        "A full private day in Luxor: several experiences woven into one, your own licensed Egyptologist, and one concierge handling every ticket, transfer and timing.",
      price: priceMap.get("design-your-day") ?? 800,
      link: `${SITE}/concierge-day`,
      image: CONCIERGE_IMAGE,
      category: "Concierge day",
      region: "Luxor, Egypt",
    },
  ];

  for (const { slug, entry } of all) {
    const name = entry.name || entry.title;
    if (!entry.isActive || !name) continue;
    const price = priceMap.get(slug) ?? entry.basePrice ?? 0;
    if (!price) continue;
    const region = regionOf(slug, entry.heroEyebrow);
    products.push({
      id: slug,
      title: feedTitle(name, region),
      description: clean(entry.metaDescription || entry.hook),
      price,
      link: slug === "medinet-habu" ? `${SITE}/medinet-habu` : `${SITE}/experiences/${slug}`,
      image: entry.heroImage ? `${SITE}${entry.heroImage}` : "",
      category: entry.category || "Experience",
      region,
    });
  }
  return products;
}

// RFC-4180 CSV escaping.
const esc = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Meta product-catalogue feed (CSV). */
export async function buildMetaCsv(): Promise<string> {
  const products = await getFeedProducts();
  const cols = [
    "id", "title", "description", "availability", "condition",
    "price", "link", "image_link", "brand", "product_type",
    "custom_label_0", "custom_label_1",
  ];
  const rows = [cols.join(",")];
  for (const p of products) {
    if (!p.image) continue; // Meta rejects an item with no image_link
    rows.push(
      [
        p.id, p.title, p.description, "in stock", "new",
        `${p.price}.00 EUR`, p.link, p.image, BRAND, p.category,
        priceBand(p.price), p.region,
      ].map(esc).join(","),
    );
  }
  return rows.join("\n") + "\n";
}

// Commercial landing pages to steer PMax to, beyond the product pages.
const EXTRA_PAGES: [string, string][] = [
  ["/experiences", "collection"],
  ["/luxor", "destination"],
  ["/hurghada", "destination"],
  ["/private-guide", "service"],
  ["/private-villas", "service"],
  ["/private-tours", "service"],
];

/** Google Ads Page Feed (CSV) for Performance Max. */
export async function buildGooglePageFeedCsv(): Promise<string> {
  const products = await getFeedProducts();
  const rows = ["Page URL,Custom label"];
  const seen = new Set<string>();
  const add = (url: string, label: string) => {
    if (seen.has(url)) return;
    seen.add(url);
    rows.push([url, label].map(esc).join(","));
  };
  for (const p of products) add(p.link, p.category);
  for (const [path, label] of EXTRA_PAGES) add(`${SITE}${path}`, label);
  return rows.join("\n") + "\n";
}

/** Master switch from the "Marketing feeds" Keystatic singleton. */
export async function feedsEnabled(): Promise<boolean> {
  const s = await reader.singletons.marketingFeeds.read();
  return s?.enabled ?? true;
}
