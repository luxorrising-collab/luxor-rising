import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ReviewsWall from "@/components/reviews/ReviewsWall";
import PartnersTrackRecord from "@/components/reviews/PartnersTrackRecord";
import { aggregate, featuredFor } from "@/lib/reviews";
import { partnerAggregate } from "@/lib/partners";
import { getReviews } from "@/lib/reviews-server";
import { getPartners } from "@/lib/partners-server";
import styles from "@/components/reviews/reviews.module.css";

export const metadata: Metadata = {
  title: "Reviews — what guests say about their private days in Luxor",
  description:
    "Real, verified reviews of Luxor Rising's private concierge days — from Google, TripAdvisor and past guests.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const [reviews, partners] = await Promise.all([getReviews(), getPartners()]);
  const featured = featuredFor(reviews, "reviews-hero");

  // Overall rating = the real weighted total from verified partner sources
  // (e.g. Google's 5.0 from 9), falling back to the on-page reviews. This keeps
  // the headline honest to the live public totals, not just the cards shown.
  const agg = partnerAggregate(partners) ?? aggregate(reviews);

  // Reviews not tied to a partner show in the standalone wall; partner reviews
  // render under their partner.
  const directReviews = reviews.filter((r) => !r.partner);

  // Structured data ONLY from verified reviews — never emit stars for samples.
  const verified = reviews.filter((r) => r.verified);
  const structuredData =
    agg && verified.length
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Luxor Rising",
          url: "https://luxorrising.com",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(agg.average),
            reviewCount: String(agg.count),
            bestRating: "5",
          },
          review: verified.map((r) => ({
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
        <span className="eyebrow">Reviews</span>
        <h1 className="display" style={{ margin: ".3rem 0 0" }}>
          The day people don&apos;t stop talking about.
        </h1>

        {agg ? (
          <div className={styles.aggregate}>
            <span className={styles.stars}>{"★".repeat(Math.round(agg.average))}</span>
            <span className={styles.aggBig}>{agg.average.toFixed(1)}</span>
            <span>
              from {agg.count} verified {agg.count === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <span className={styles.sampleNote}>
            Sample reviews shown while we publish verified guest reviews — no
            rating is claimed until they&apos;re real.
          </span>
        )}

        {featured && (
          <figure className={styles.featured}>
            <span className={styles.stars}>{"★".repeat(Math.round(featured.rating))}</span>
            <blockquote className={styles.featuredQuote}>
              &ldquo;{featured.quote}&rdquo;
            </blockquote>
            <figcaption className={styles.featuredBy}>
              <b>{featured.author}</b>
              {featured.location ? ` · ${featured.location}` : ""}
              {featured.verified && featured.sourceUrl ? (
                <>
                  {" · "}
                  <a
                    href={featured.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={styles.sourceLink}
                  >
                    ✓ Verified ↗
                  </a>
                </>
              ) : null}
            </figcaption>
          </figure>
        )}
      </section>

      {/* Direct Luxor Rising guest reviews (not tied to a partner) get the
          standalone wall; partner reviews live under their partner below. */}
      {directReviews.length > 0 && (
        <section className="wrap">
          <ReviewsWall reviews={directReviews} />
        </section>
      )}

      {partners.length > 0 && (
        <section className="wrap">
          <div className={styles.sectionHead}>
            <span className="eyebrow">Our partners&apos; track record</span>
            <h2 className="display" style={{ margin: ".2rem 0 0" }}>
              We hand-pick specialists who already have a name.
            </h2>
            <p>
              We don&apos;t do everything ourselves — we choose the best local
              driver, guide and boatman, each with their own public reputation.
              Here&apos;s the receipts, straight from their profiles.
            </p>
            <span className={styles.vetBadge}>
              <span aria-hidden>🤝</span>
              <span>
                <strong>Every partner is hand-picked and personally tested</strong>{" "}
                — we work alongside them, for up to 30 days, before they ever
                touch your trip.
              </span>
            </span>
          </div>
          <PartnersTrackRecord partners={partners} reviews={reviews} />
        </section>
      )}

      <MinimalFooter
        links={[
          { href: "/", label: "Home" },
          { href: "/experiences", label: "Experiences" },
          { href: "/concierge-day", label: "Concierge Days" },
        ]}
        bottomText="© 2026 Luxor Rising — private concierge in Egypt · Luxor & Hurghada"
      />
    </>
  );
}
