import { experienceFrom, experienceWhere, SLUG_TO_TIERS } from "@/lib/experience-cards";
import { dayLength } from "@/lib/day-plan";
import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import StickyBar from "@/components/StickyBar";
import ExperiencesClient, { type CmsExperienceItem } from "./ExperiencesClient";
import { reader } from "@/lib/keystatic-reader";
import { getFinalPriceMap } from "@/lib/pricing";
import { getSocialProof } from "@/lib/social-proof";
import styles from "./ExperiencesPage.module.css";

export const metadata: Metadata = {
  title: "Experiences in Luxor — Private, Curated, One Day at a Time",
  description:
    "Every Luxor Rising experience: private temples, tombs, sunrise balloon, desert and Nile. Curated by your concierge, delivered by licensed local specialists. From €330 a day.",
  alternates: { canonical: "/experiences" },
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    title: "Experiences in Luxor — Private, Curated, One Day at a Time",
    description:
      "Private temples, tombs, sunrise balloon, desert and Nile. Curated by your concierge in Luxor.",
    url: "/experiences",
  },
};

const BRAND = { "@type": "Brand", name: "Luxor Rising" };

// Experiences on / starting from the Red Sea coast; everything else is Luxor.
const HURGHADA_SLUGS = new Set([
  "private-yacht-red-sea",
  "red-sea-boat-snorkelling",
  "hurghada-to-luxor-crossing",
]);

// Location tags for the filter (separate from HURGHADA_SLUGS, which also decides
// the funnel): Aswan and the temple road south, and the coast products that
// still funnel into Design Your Day.
const ASWAN_LOCATION = new Set([
  "philae-temple-aswan",
  "elephantine-island-satet-aswan",
  "unfinished-obelisk-nubian-museum",
  "nubian-village-aswan-boat",
  "tombs-of-the-nobles-aswan-st-simeon",
  "abu-simbel-private-road-trip",
  "edfu-temple-of-horus",
  "kom-ombo-temple",
  "luxor-to-aswan-temples-private",
]);
const COAST_LOCATION = new Set([
  "el-quseir-wadi-el-gemal",
  "private-airport-pickup",
  "giftun-island-private-boat",
  "abu-dabbab-turtles-marsa-alam",
  "hurghada-museum-souq-evening",
  "coast-road-trip-egypt",
  "horse-ride-beach-hurghada",
]);
const locationOf = (slug: string) =>
  HURGHADA_SLUGS.has(slug) || COAST_LOCATION.has(slug) ? "hurghada" : ASWAN_LOCATION.has(slug) ? "aswan" : "luxor";

export default async function ExperiencesPage() {
  const [allExperiences, priceMap, conciergePage, socialProof] = await Promise.all([
    reader.collections.experiences.all(),
    getFinalPriceMap(),
    reader.singletons.conciergeDayPage.read(),
    getSocialProof(),
  ]);
  const activeExperiences = allExperiences.filter(({ entry }) => entry.isActive && entry.title);
  // "Thirty Days in the Desert" is a by-invitation enquiry product shown in the
  // "Long experiences" section (below), so keep it out of the single-day grid.
  const gridExperiences = activeExperiences.filter(({ slug }) => slug !== "thirty-days-in-the-desert");
  // Single source of truth: the Product-prices singleton wins over the stored basePrice.
  const priceOf = (slug: string, entry: { basePrice?: number | null }) =>
    priceMap.get(slug) ?? entry.basePrice ?? 0;
  // The Concierge Day ("Design your day") "from" price — the day rate every
  // experience now funnels into — fed live into the "Start here" callout, the
  // sticky bar, the cards and structured data so it never drifts.
  const conciergeDayPrice = conciergePage?.startingPrice ?? 330;
  // Every Luxor experience is now sold as part of a day (from the day rate);
  // the Red Sea crossing keeps its own price, enquiry products their own flow.
  // The Hurghada ⇄ Luxor crossing funnels into Design Your Day too (its card and
  // page now sell "from €330 / day"); it stays tagged as a Hurghada location for
  // the filter. The paused standalone Red Sea boats would keep their own price.
  const isFunnel = (slug: string, bookingType?: string | null) =>
    bookingType !== "enquiry" &&
    (!HURGHADA_SLUGS.has(slug) || slug === "hurghada-to-luxor-crossing");

  // The hand-curated Concierge Day product for the ItemList structured data —
  // with a real image (required by Google for Product), a canonical URL, and the
  // live "from" price so it never drifts. CMS experiences are appended after it.
  const conciergeProduct = {
    "@type": "Product",
    name: "The Concierge Day",
    description:
      "A full private day in Luxor of several experiences woven into one — a signature temple at dawn, then tombs, river or desert, with one concierge handling everything.",
    brand: BRAND,
    category: "Concierge day",
    url: "https://www.luxorrising.com/concierge-day",
    image: "https://www.luxorrising.com/images/experiences/karnak-at-dawn-hero.jpg",
    offers: {
      "@type": "Offer",
      price: String(conciergeDayPrice),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://www.luxorrising.com/concierge-day",
    },
  };

  const cmsItems: CmsExperienceItem[] = gridExperiences.map(({ slug, entry }) => ({
    // Medinet Habu lives at the top level; link straight there rather than
    // bouncing through the /experiences/[slug] redirect.
    href: slug === "medinet-habu" ? "/medinet-habu" : `/experiences/${slug}`,
    src: entry.heroImage || "/images/medinet-habu-facade.jpg",
    alt: entry.name || entry.title,
    title: entry.title,
    // Drop the trailing "· A single experience" — redundant on the listing page.
    // the site's name only; where it is lives in the badge, so nothing repeats
    place: entry.heroEyebrow.replace(/\s*·\s*A single experience\s*$/i, "").split("·")[0].trim(),
    hook: entry.hook,
    // The location, plus the product's badge unless it only repeats the place
    // ("Luxor") or names a bank (redundant): never "Luxor, Egypt · Luxor".
    badge: [
      experienceWhere(slug),
      entry.badge && !/bank/i.test(entry.badge) && !experienceWhere(slug).toLowerCase().includes(entry.badge.toLowerCase())
        ? entry.badge
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    scarcity: entry.scarcityNote || undefined,
    // At-a-glance facts reduce uncertainty (duration + group size are the two
    // questions every buyer has) — a small, proven conversion lift.
    facts: [entry.duration, entry.groupSize].filter((f): f is string => Boolean(f)),
    priceValue:
      entry.priceType === "included"
        ? "Included"
        : isFunnel(slug, entry.bookingType)
          ? `€${experienceFrom(slug).price}`
          : `€${priceOf(slug, entry)}`,
    priceLabel:
      entry.priceType === "included"
        ? "Included"
        : isFunnel(slug, entry.bookingType)
          ? "Design it into your day from"
          : "From",
    tiers: isFunnel(slug, entry.bookingType) ? [...(SLUG_TO_TIERS[slug] ?? [])].reverse() : undefined,
    priceNote:
      entry.priceType === "included"
        ? "with any day"
        : isFunnel(slug, entry.bookingType)
          ? "/ day"
          : entry.priceNote || undefined,
    ctaLabel: entry.bookingType === "enquiry" ? "Enquire →" : "View experience →",
    category: entry.category,
    location: locationOf(slug),
    // the site-wide "add to my day" basket (not for transfers or enquiry products)
    daySlug:
      isFunnel(slug, entry.bookingType) && slug !== "private-airport-pickup" && slug !== "hurghada-to-luxor-crossing"
        ? slug
        : undefined,
    dayLength: dayLength(slug),
    dayName: (entry.name || entry.title).replace(/^"|"$/g, "").split(/s[—–-]s/)[0].trim(),
  }));

  // Structured data: the full live catalogue (curated + every CMS product),
  // with names, prices and canonical URLs for search and answer engines.
  const cmsProducts = activeExperiences.map(({ slug, entry }) => ({
    "@type": "Product",
    name: entry.name || entry.title,
    description: entry.hook,
    brand: BRAND,
    category: entry.category,
    url: `https://www.luxorrising.com/experiences/${slug}`,
    // Always emit an image (Google requires it for Product) — fall back to a
    // dependable static hero when an entry has none.
    image: `https://www.luxorrising.com${entry.heroImage || "/images/medinet-habu-facade.jpg"}`,
    offers: {
      "@type": "Offer",
      price: String(isFunnel(slug, entry.bookingType) ? experienceFrom(slug).price : priceOf(slug, entry)),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `https://www.luxorrising.com/experiences/${slug}#book`,
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Luxor Rising Experiences",
    description: "Private, single-day curated experiences in Luxor, Egypt.",
    itemListElement: [conciergeProduct, ...cmsProducts].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Nav scrollAware={false} ctaHref="/concierge-day#design" ctaLabel="Design your day" />

      {/* HERO */}
      <header className={styles.hero}>
        <Reveal className={`wrap ${styles.heroIn}`}>
          <span className="eyebrow">The Collection</span>
          <h1 className="display" style={{ margin: ".3rem 0 1.3rem" }}>
            Everything your Luxor
            <br />
            day can <em>hold</em>
          </h1>
          <p>
            Not a catalogue of tours — the experiences we weave into one private, unhurried day.
            Pick what calls to you, and we design the day around it.
          </p>
          <div className="divider-line" />
        </Reveal>
      </header>

      {/* TRUST STRIP */}
      <div className={styles.trust}>
        <div className={`wrap ${styles.trustIn}`}>
          <div className={styles.trustItem}>
            <span className={styles.dot} />
            <b>Private only</b> — never a group bus
          </div>
          <div className={styles.trustItem}>
            <span className={styles.dot} />
            <b>Licensed</b> Egyptologists &amp; drivers
          </div>
          <div className={styles.trustItem}>
            <span className={styles.dot} />
            <b>Free cancellation</b> until 48 hours before
          </div>
          <div className={styles.trustItem}>
            <span className={styles.dot} />
            <b>★</b> {socialProof}
          </div>
        </div>
      </div>

      <main className="wrap">
        <ExperiencesClient cmsItems={cmsItems} conciergeDayPrice={conciergeDayPrice} />
      </main>

      {/* HOW IT WORKS */}
      <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-line)", borderBottom: "1px solid var(--color-line)" }}>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">How a day is built</span>
          <div className="steps3">
            <div className="s3">
              <div className="num">01</div>
              <h4>Tell us the shape</h4>
              <p>How many days, how many of you, roughly when. Sixty seconds in the configurator — no account, no phone call.</p>
            </div>
            <div className="s3">
              <div className="num">02</div>
              <h4>We write the day</h4>
              <p>Your concierge builds the order and the timing so you land at each site in its best hour and miss the coaches entirely.</p>
            </div>
            <div className="s3">
              <div className="num">03</div>
              <h4>You just arrive</h4>
              <p>Tickets, transfers, the Egyptologist, the water in the car — handled. You walk in and look at things.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <h2 className="display">Not sure which day is yours?</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            Most people aren&apos;t, at first. Tell us who&apos;s coming and roughly when — we&apos;ll
            send back a day we&apos;d actually want to be on ourselves.
          </p>
          <div className={styles.closerActions}>
            <Link href="/concierge-day#design" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
            <Link href="/concierge-day" className="btn btn-line btn-lg">
              Let us propose one
            </Link>
          </div>
          <p className={styles.fine}>
            Free cancellation until 48 hours before · Secure payment · A licensed Egyptologist on
            every day
          </p>
        </Reveal>
      </section>

      <div style={{ paddingBottom: "64px" }}>
        <FullFooter columns={FOOTER_COLUMNS} />
      </div>

      <StickyBar
        name={`From €${conciergeDayPrice}`}
        meta="a private day · free cancellation until 48 hours before"
        ctaHref="/concierge-day#design"
        ctaLabel="Design your day →"
        revealOnScroll
        revealAfter={620}
      />
    </>
  );
}
