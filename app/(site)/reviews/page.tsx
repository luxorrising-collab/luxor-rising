import type { Metadata } from "next";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import JsonLd from "@/components/JsonLd";
import PartnersTrackRecord from "@/components/reviews/PartnersTrackRecord";
import { featuredFor } from "@/lib/reviews";
import { sourceStats } from "@/lib/partners";
import { getReviews } from "@/lib/reviews-server";
import { getPartners } from "@/lib/partners-server";
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

function SectionRating({
  stats,
}: {
  stats: { average: number; count: number; asOf: string | null };
}) {
  return (
    <div className={styles.sectionRating}>
      <span className={styles.stars}>{"★".repeat(Math.round(stats.average))}</span>
      <b>{stats.average.toFixed(1)}</b>
      <span>
        · {stats.count} {stats.count === 1 ? "review" : "reviews"}
      </span>
      {stats.asOf && <span className={styles.asof}>· as of {fmtMonth(stats.asOf)}</span>}
    </div>
  );
}

export default async function ReviewsPage() {
  const [reviews, partners] = await Promise.all([getReviews(), getPartners()]);
  const featured = featuredFor(reviews, "reviews-hero");

  const directSources = partners.filter((p) => p.channel === "direct");
  const partnerSources = partners.filter((p) => p.channel !== "direct");
  const directStats = sourceStats(directSources);
  const partnerStats = sourceStats(partnerSources);

  // Structured data (Luxor Rising's own AggregateRating) is emitted ONLY from
  // our own verified channels — never from a partner's reviews, which belong to
  // the partner, not us. Nothing is claimed until our direct reviews are real.
  const directVerified = reviews.filter(
    (r) => r.verified && directSources.some((s) => s.slug === r.partner),
  );
  const structuredData =
    directStats && directVerified.length
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Luxor Rising",
          url: "https://luxorrising.com",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(directStats.average),
            reviewCount: String(directStats.count),
            bestRating: "5",
          },
          review: directVerified.map((r) => ({
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

      {/* Section 1 — our own channels (Google Business Profile etc.). */}
      {directSources.length > 0 && (
        <section className="wrap">
          <div className={styles.sectionHead}>
            <span className="eyebrow">On our own channels</span>
            <h2 className="display" style={{ margin: ".2rem 0 0" }}>
              Reviewed directly for Luxor Rising.
            </h2>
            <p>
              Reviews guests leave us directly — on our Google Business Profile
              and to our team. We&apos;re new, and building these the honest way.
            </p>
            {directStats ? (
              <SectionRating stats={directStats} />
            ) : (
              <span className={styles.sampleNote}>
                Template reviews shown — real ones appear here as guests post
                them, with no rating claimed until then.
              </span>
            )}
          </div>
          <PartnersTrackRecord partners={directSources} reviews={reviews} />
        </section>
      )}

      {/* Section 2 — our hand-picked partners' track record. */}
      {partnerSources.length > 0 && (
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
            {partnerStats && <SectionRating stats={partnerStats} />}
            <span className={styles.vetBadge}>
              <span aria-hidden>🤝</span>
              <span>
                <strong>Every partner is hand-picked and personally tested</strong>{" "}
                — we work alongside them, for up to 30 days, before they ever
                touch your trip.
              </span>
            </span>
          </div>
          <PartnersTrackRecord partners={partnerSources} reviews={reviews} />
        </section>
      )}

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
