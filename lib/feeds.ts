import { reader } from "@/lib/keystatic-reader";
import { getFinalPriceMap } from "@/lib/pricing";
import { SLUG_TO_TIERS } from "@/lib/experience-cards";

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
// The "from" price every Luxor experience page now shows — a private day,
// door-to-door transfer included — since each funnels into Design Your Day.
// Kept in step with the hero price hardcoded on those pages.
const DAY_FROM = 330;

// Bump when the card's design changes, so Meta re-downloads every image.
const CARD_DESIGN_VERSION = 2;

// The branded "card" composition for the Meta feed image — the same graphic as
// the Design Your Day experience cards, with the logo as in our video theme,
// rendered to a PNG by /api/feed-card/[slug] and used as the catalogue image_link.
// There is deliberately no price on it: Meta shows the feed's price field beside
// the image, so a printed one would appear twice.
export type FeedCard = {
  /** Product name (front-loaded, for alt/debug). */
  name: string;
  /** Uppercase place line above the title, e.g. "Medinet Habu · Luxor, Egypt". */
  kicker: string;
  /** The poetic one-liner (the card's headline), e.g. "Begin where the world began." */
  charm: string;
  /** The "Included" badge, or null when no day package includes this experience.
   *  `note` names the day when it is not included in the €330 one. */
  badge: { note: string | null } | null;
  /** Local /public path of the hero, read from disk by the image route. */
  imagePath: string;
};

export type FeedProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  link: string;
  image: string;
  category: string;
  region: string;
  /** Data for the branded catalogue card image. */
  card: FeedCard;
};

const clean = (s?: string | null) => String(s ?? "").replace(/\s+/g, " ").trim();

// City/region for the title + segmentation label, from the slug + hero eyebrow.
const regionOf = (slug: string, eyebrow?: string | null): string =>
  /red[\s-]?sea|hurghada|snorkel|yacht/i.test(`${slug} ${eyebrow ?? ""}`)
    ? "Red Sea, Egypt"
    : "Luxor, Egypt";

// Meta title: product NAME first (front-loaded for search), then our charm
// subtitle (the page's poetic line), then a plain "private experience + city"
// tail so location and category stay explicit — e.g.
//   "Medinet Habu — Begin where the world began. Private experience in Luxor, Egypt"
const feedTitle = (name: string, charm: string, region: string): string => {
  const n = clean(name);
  const c = clean(charm);
  const place = /luxor|hurghada|red sea|egypt/i.test(n) ? "" : ` in ${region}`;
  if (c && c.toLowerCase() !== n.toLowerCase()) {
    const charmSentence = /[.!?…]$/.test(c) ? c : `${c}.`;
    return `${n} — ${charmSentence} Private experience${place}`;
  }
  return `${n} — private experience${place}`;
};

// Mirrors the "Included" label on the Design Your Day cards, but says which day
// includes it. Meta prints €330 beside the image, and only the €330 Adventure day
// includes everything a plain "Included" would imply; the balloon, say, comes with
// the Signature day.
const badgeFor = (slug: string): FeedCard["badge"] => {
  const tiers = SLUG_TO_TIERS[slug];
  if (!tiers?.length) return null;
  if (tiers.includes("Adventure")) return { note: null };
  return { note: tiers.includes("Original") ? "in the Original day" : "in the Signature day" };
};

// Meta shows the price field itself, so the ad copy must not repeat it. Our SEO
// descriptions quote one ("From €330."), and end on search phrasing like "Cost,
// timing and what's included.", so both kinds of sentence come out.
const withoutPriceSentences = (text: string): string =>
  text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !/€|\bcost\b/i.test(sentence))
    .join(" ");

// Meta's price field can't say "from" or "per day", so the copy supplies the unit.
const PER_DAY_NOTE = "Priced per private day, with door-to-door transfer included.";

// Meta caches images by URL, so the URL has to change whenever the picture does:
// a short hash of everything drawn on the card, plus the design version.
const cardVersion = (card: FeedCard): string => {
  let h = 5381;
  for (const ch of JSON.stringify([CARD_DESIGN_VERSION, card])) {
    h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  }
  return h.toString(36);
};

const priceBand = (v: number): string =>
  v < 350 ? "Under €350" : v < 600 ? "€350–599" : v < 1000 ? "€600–999" : "€1000+";

export async function getFeedProducts(): Promise<FeedProduct[]> {
  const [all, priceMap, conciergePage] = await Promise.all([
    reader.collections.experiences.all(),
    getFinalPriceMap(),
    reader.singletons.conciergeDayPage.read(),
  ]);

  const conciergePrice = conciergePage?.startingPrice ?? DAY_FROM;
  const products: FeedProduct[] = [
    {
      id: "design-your-day",
      title: "The Concierge Day — your private day in Luxor",
      description:
        `A full private day in Luxor: several experiences woven into one, your own licensed Egyptologist, and one concierge handling every ticket, transfer and timing. ${PER_DAY_NOTE}`,
      // The "from" price the Concierge Day page advertises — kept in step with it.
      price: conciergePrice,
      link: `${SITE}/concierge-day`,
      image: CONCIERGE_IMAGE,
      category: "Concierge day",
      region: "Luxor, Egypt",
      card: {
        name: "The Concierge Day",
        kicker: "The Concierge Day · Luxor, Egypt",
        charm: "Your private day in Luxor.",
        badge: null,
        imagePath: "/images/experiences/karnak-at-dawn/heroImage.jpg",
      },
    },
  ];

  for (const { slug, entry } of all) {
    const name = entry.name || entry.title;
    if (!entry.isActive || !name) continue;
    const region = regionOf(slug, entry.heroEyebrow);
    // Luxor single-day experiences now funnel into Design Your Day: their pages
    // sell the day "from €330", not a single-experience price. The crossing
    // (Red Sea transfer) and enquiry products keep their own price. Keep the
    // feed price — and any "€X" in the description — consistent with the page.
    const isEnquiry = entry.bookingType === "enquiry";
    // The Hurghada ⇄ Luxor crossing funnels into Design Your Day as well now, so
    // it sells the €330 day with the coast transfer included.
    const isLuxorFunnel =
      !isEnquiry && (region !== "Red Sea, Egypt" || slug === "hurghada-to-luxor-crossing");
    const price = isLuxorFunnel ? DAY_FROM : priceMap.get(slug) ?? entry.basePrice ?? 0;
    if (!price) continue;
    const copy = withoutPriceSentences(clean(entry.metaDescription || entry.hook));
    const description = isLuxorFunnel ? `${copy} ${PER_DAY_NOTE}` : copy;
    // The card kicker is the page's place line (minus the "single experience" tail).
    const kicker =
      clean(entry.heroEyebrow).replace(/\s*·\s*A single experience\s*$/i, "") ||
      `${name} · ${region}`;
    products.push({
      id: slug,
      title: feedTitle(name, entry.title, region),
      description,
      price,
      link: slug === "medinet-habu" ? `${SITE}/medinet-habu` : `${SITE}/experiences/${slug}`,
      image: entry.heroImage ? `${SITE}${entry.heroImage}` : "",
      category: entry.category || "Experience",
      region,
      card: {
        name,
        kicker,
        charm: clean(entry.title) || name,
        badge: badgeFor(slug),
        imagePath: entry.heroImage || "",
      },
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
    if (!p.card.imagePath) continue; // no hero → no branded card, so skip it
    // The image_link is our branded catalogue card (the Design Your Day card
    // graphic rendered to a PNG), not the plain hero photo.
    const imageLink = `${SITE}/api/feed-card/${p.id}?v=${cardVersion(p.card)}`;
    rows.push(
      [
        p.id, p.title, p.description, "in stock", "new",
        `${p.price}.00 EUR`, p.link, imageLink, BRAND, p.category,
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
