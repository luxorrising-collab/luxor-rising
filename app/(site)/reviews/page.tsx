import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import JsonLd from "@/components/JsonLd";
import PartnersTrackRecord from "@/components/reviews/PartnersTrackRecord";
import GuestStoriesCarousel from "@/components/reviews/GuestStoriesCarousel";
import { sourceStats } from "@/lib/partners";
import { getReviews } from "@/lib/reviews-server";
import { getPartners } from "@/lib/partners-server";
import { getSocialProof } from "@/lib/social-proof";
import styles from "@/components/reviews/reviews.module.css";

export const metadata: Metadata = {
  title: "Reviews — what guests say about their private days in Luxor",
  description:
    "Real, verified reviews of Luxor Rising's private concierge days — from our own Google profile and our hand-picked local partners.",
  alternates: { canonical: "/reviews" },
};

function fmtMonth(d: string | null) {
  if (!d) return "";
  const p = new Date(d);
  return Number.isNaN(p.getTime())
    ? ""
    : p.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default async function ReviewsPage() {
  const [reviews, partners, socialProof] = await Promise.all([
    getReviews(),
    getPartners(),
    getSocialProof(),
  ]);

  const directSources = partners.filter((p) => p.channel === "direct");
  const partnerSources = partners.filter((p) => p.channel !== "direct");
  const partnerStats = sourceStats(partnerSources);

  // Our own Google Business Profile — the one link that proves the stories below.
  const ourProfile = directSources.find((p) => p.profileUrl) ?? null;

  // The long-form guest stories: our own verified reviews. Featured first,
  // then explicit order, then the fullest account.
  const stories = reviews
    .filter((r) => r.verified && directSources.some((s) => s.slug === r.partner))
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.order - b.order ||
        b.quote.length - a.quote.length,
    );

  // Structured data (Luxor Rising's own AggregateRating) is emitted ONLY from
  // our own verified reviews — never a partner's, which belong to the partner,
  // not us. Kept consistent with the stories actually shown on the page.
  const storyAvg = stories.length
    ? Math.round((stories.reduce((s, r) => s + r.rating, 0) / stories.length) * 10) / 10
    : 0;
  const structuredData = stories.length
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Luxor Rising",
        url: "https://luxorrising.com",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: String(storyAvg),
          reviewCount: String(stories.length),
          bestRating: "5",
        },
        review: stories.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.author },
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(r.rating),
            bestRating: "5",
          },
          ...(r.date ? { datePublished: r.date } : {}),
          reviewBody: r.quote,
        })),
      }
    : null;

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

      <section className={`wrap ${styles.hero}`}>
        <span className="eyebrow">Guest stories</span>
        <h1 className="display" style={{ margin: ".3rem 0 0" }}>
          The day people don&apos;t stop talking about.
        </h1>
        <p className={styles.heroLead}>
          A private day in Luxor has a way of staying with people. Here are a
          few of those days, told in full — in the words guests reached for
          afterwards.
        </p>
        <div className={styles.heroProof}>
          <span className={styles.stars}>★★★★★</span>
          <span className={styles.heroProofText}>{socialProof}</span>
          {ourProfile?.profileUrl && (
            <a
              className={styles.heroProofLink}
              href={ourProfile.profileUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              on Google ↗
            </a>
          )}
        </div>
      </section>

      {/* A few guest days, told in full — shown one at a time as a carousel. */}
      {stories.length > 0 && (
        <section className={`wrap ${styles.storiesSection}`}>
          <GuestStoriesCarousel stories={stories} />
        </section>
      )}

      {/* The receipts — the public track record of the specialists we hand-pick. */}
      {partnerSources.length > 0 && (
        <section className={styles.receipts}>
          <div className="wrap">
            <div className={styles.sectionHead}>
              <span className="eyebrow">The receipts</span>
              <h2 className="display" style={{ margin: ".2rem 0 0" }}>
                The specialists we hand-pick already have a name.
              </h2>
              <p>
                We don&apos;t do it all ourselves — we choose the best local
                driver, guide and boatman, each with their own public record.
                Straight from their profiles, unedited.
              </p>
              {partnerStats && (
                <div className={styles.sectionRating}>
                  <span className={styles.stars}>
                    {"★".repeat(Math.round(partnerStats.average))}
                  </span>
                  <b>{partnerStats.average.toFixed(1)}</b>
                  <span>
                    · {partnerStats.count}{" "}
                    {partnerStats.count === 1 ? "review" : "reviews"} on Google
                  </span>
                  {partnerStats.asOf && (
                    <span className={styles.asof}>· as of {fmtMonth(partnerStats.asOf)}</span>
                  )}
                </div>
              )}
              <span className={styles.vetBadge}>
                <span aria-hidden>🤝</span>
                <span>
                  <strong>Hand-picked and personally tested</strong> — we work
                  alongside every partner, for up to 30 days, before they ever
                  touch your trip.
                </span>
              </span>
            </div>
            <PartnersTrackRecord partners={partnerSources} reviews={reviews} />
          </div>
        </section>
      )}

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
