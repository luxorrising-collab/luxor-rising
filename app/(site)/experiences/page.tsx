import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import StickyBar from "@/components/StickyBar";
import ExperiencesClient, { type CmsExperienceItem } from "./ExperiencesClient";
import { reader } from "@/lib/keystatic-reader";
import styles from "./ExperiencesPage.module.css";

export const metadata: Metadata = {
  title: "Experiences in Luxor — Private, Curated, One Day at a Time",
  description:
    "Every Luxor Rising experience: private temples, tombs, sunrise balloon, desert and Nile. Curated by your consigliere, delivered by licensed local specialists. From €640 a day.",
  alternates: { canonical: "/experiences" },
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    title: "Experiences in Luxor — Private, Curated, One Day at a Time",
    description:
      "Private temples, tombs, sunrise balloon, desert and Nile. Curated by your consigliere in Luxor.",
    url: "/experiences",
  },
};

const BRAND = { "@type": "Brand", name: "Luxor Rising" };

// The hand-curated signature / concierge-day products. CMS experiences are
// appended to these at render time so the ItemList structured data always
// reflects the full, live catalogue (better SEO + answer-engine coverage).
const CURATED_PRODUCTS = [
  {
    "@type": "Product",
    name: "The Concierge Day",
    description:
      "A full private day in Luxor of several experiences woven into one — a signature temple at dawn, then tombs, river or desert, with one consigliere handling everything.",
    brand: BRAND,
    offers: { "@type": "Offer", price: "640", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
  },
];

export default async function ExperiencesPage() {
  const allExperiences = await reader.collections.experiences.all();
  // Medinet Habu already has its own hand-curated "Signature" card below —
  // skip it here so it isn't shown twice.
  const activeExperiences = allExperiences.filter(
    ({ slug, entry }) => entry.isActive && entry.title && slug !== "medinet-habu"
  );

  const cmsItems: CmsExperienceItem[] = activeExperiences.map(({ slug, entry }) => ({
    href: `/experiences/${slug}`,
    src: entry.heroImage || "/images/medinet-habu-facade.jpg",
    alt: entry.name || entry.title,
    title: entry.title,
    // Drop the trailing "· A single experience" — redundant on the listing page.
    place: entry.heroEyebrow.replace(/\s*·\s*A single experience\s*$/i, ""),
    hook: entry.hook,
    badge: entry.badge || undefined,
    scarcity: entry.scarcityNote || undefined,
    // At-a-glance facts reduce uncertainty (duration + group size are the two
    // questions every buyer has) — a small, proven conversion lift.
    facts: [entry.duration, entry.groupSize].filter((f): f is string => Boolean(f)),
    priceValue: entry.priceType === "included" ? "Included" : `€${entry.basePrice ?? 0}`,
    priceLabel: entry.priceType === "included" ? "Included" : "From",
    priceNote:
      entry.priceType === "included"
        ? "with any day"
        : entry.pricePerPerson || entry.priceNote || undefined,
    ctaLabel: entry.bookingType === "enquiry" ? "Enquire →" : "Reserve →",
  }));

  // Structured data: the full live catalogue (curated + every CMS product),
  // with names, prices and canonical URLs for search and answer engines.
  const cmsProducts = activeExperiences.map(({ slug, entry }) => ({
    "@type": "Product",
    name: entry.name || entry.title,
    description: entry.hook,
    brand: BRAND,
    category: entry.category,
    url: `https://luxorrising.com/experiences/${slug}`,
    image: entry.heroImage ? `https://luxorrising.com${entry.heroImage}` : undefined,
    offers: {
      "@type": "Offer",
      price: String(entry.basePrice ?? 0),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `https://luxorrising.com/experiences/${slug}#book`,
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Luxor Rising Experiences",
    description: "Private, single-day curated experiences in Luxor, Egypt.",
    itemListElement: [...CURATED_PRODUCTS, ...cmsProducts].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

      {/* HERO */}
      <header className={styles.hero}>
        <Reveal className={`wrap ${styles.heroIn}`}>
          <span className="eyebrow">The Collection</span>
          <h1 className="display" style={{ margin: ".3rem 0 1.3rem" }}>
            Everything we can open
            <br />
            for you in <em>Luxor</em>
          </h1>
          <p>
            Not a catalogue of tours. A collection of days — private, timed against the crowds,
            and delivered by the people who actually hold the keys.
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
            <b>Free cancellation</b> up to 7 days before
          </div>
          <div className={styles.trustItem}>
            <span className={styles.dot} />
            <b>4.9/5</b> from early guests
          </div>
        </div>
      </div>

      <main className="wrap">
        <ExperiencesClient cmsItems={cmsItems} />
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
              <p>Your consigliere builds the order and the timing so you land at each site in its best hour and miss the coaches entirely.</p>
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
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
            <Link href="/concierge-day" className="btn btn-line btn-lg">
              Let us propose one
            </Link>
          </div>
          <p className={styles.fine}>
            Free cancellation up to 7 days before · Secure payment · A licensed Egyptologist on
            every day
          </p>
        </Reveal>
      </section>

      <div style={{ paddingBottom: "64px" }}>
        <MinimalFooter
          links={[
            { href: "/", label: "Home" },
            { href: "/concierge-day", label: "Concierge Days" },
            { href: "/experiences", label: "Experiences" },
            { href: "/insiders-guide", label: "Insider's Guide" },
          ]}
        />
      </div>

      <StickyBar
        name="From €640"
        meta="a private day · free cancellation up to 7 days before"
        ctaHref="/concierge-day"
        ctaLabel="Design your day →"
        revealOnScroll
        revealAfter={620}
      />
    </>
  );
}
