import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ReviewsWall from "@/components/reviews/ReviewsWall";
import { aggregate, featuredFor } from "@/lib/reviews";
import { getReviews } from "@/lib/reviews-server";
import styles from "@/components/reviews/reviews.module.css";

export const metadata: Metadata = {
  title: "Reviews — what guests say about their private days in Luxor",
  description:
    "Real, verified reviews of Luxor Rising's private concierge days — from Google, TripAdvisor and past guests.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const reviews = await getReviews();
  const agg = aggregate(reviews); // null unless verified reviews exist
  const featured = featuredFor(reviews, "reviews-hero");

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

      <section className="wrap">
        {reviews.length ? (
          <ReviewsWall reviews={reviews} />
        ) : (
          <p style={{ textAlign: "center", padding: "2rem 0 4rem", color: "var(--color-muted)" }}>
            Reviews are being added. <Link href="/concierge-day">Design your day →</Link>
          </p>
        )}
      </section>

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
