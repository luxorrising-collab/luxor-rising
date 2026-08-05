import Image from "next/image";
import styles from "./reviews.module.css";
import { SOURCE_LABELS, type Review } from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5`}>
      {"★".repeat(full)}
      <span className={styles.starsOff}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

function fmtDate(d: string | null) {
  if (!d) return "";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function ReviewCard({ review }: { review: Review }) {
  const sourceLabel = SOURCE_LABELS[review.source] ?? review.source;
  const initial = review.author.trim().charAt(0).toUpperCase() || "•";

  return (
    <figure className={styles.card}>
      <div className={styles.cardTop}>
        <Stars rating={review.rating} />
        {/* Verified source link is the proof — real reviews carry it. */}
        {review.verified && review.sourceUrl ? (
          <a
            className={styles.verified}
            href={review.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            ✓ Verified · {sourceLabel} ↗
          </a>
        ) : review.sourceUrl ? (
          <a
            className={styles.sourceLink}
            href={review.sourceUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {sourceLabel} ↗
          </a>
        ) : (
          <span className={styles.sourceTag}>{sourceLabel}</span>
        )}
      </div>

      <blockquote className={styles.quote}>{review.quote}</blockquote>

      <figcaption className={styles.by}>
        {review.avatar ? (
          <Image
            src={review.avatar}
            alt={review.author}
            width={40}
            height={40}
            className={styles.avatar}
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden>
            {initial}
          </span>
        )}
        <span className={styles.byText}>
          <span className={styles.author}>{review.author}</span>
          <span className={styles.meta}>
            {[review.location, fmtDate(review.date)].filter(Boolean).join(" · ")}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
