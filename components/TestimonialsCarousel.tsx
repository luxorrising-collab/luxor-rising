"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./TestimonialsCarousel.module.css";

export type Moment = { quote: string; author?: string | null; rating?: number | null };

/** A carousel of powerful review excerpts. The author repeats (mostly one guest
 *  for now) so it's kept quiet here; full attribution + verification live on the
 *  reviews page, which this links to. Auto-advances, pauses on hover/focus, and
 *  respects prefers-reduced-motion. */
export default function TestimonialsCarousel({
  items,
  reviewsHref = "/reviews",
}: {
  items: Moment[];
  reviewsHref?: string;
}) {
  const n = items.length;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (n <= 1 || paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % n), 5200);
    return () => clearInterval(t);
  }, [n, paused]);

  if (!n) return null;
  const go = (i: number) => setIdx(((i % n) + n) % n);

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.viewport}>
        <div className={styles.track} style={{ transform: `translateX(-${idx * 100}%)` }}>
          {items.map((t, i) => {
            const stars = Math.max(1, Math.min(5, Math.round(t.rating ?? 5)));
            return (
              <figure className={styles.slide} key={i} aria-hidden={i !== idx}>
                <div className={styles.stars} aria-label={`${stars} out of 5`}>
                  {"★".repeat(stars)}
                </div>
                <blockquote className={styles.quote}>&ldquo;{t.quote}&rdquo;</blockquote>
              </figure>
            );
          })}
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.prev}`}
              onClick={() => go(idx - 1)}
              aria-label="Previous review"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              onClick={() => go(idx + 1)}
              aria-label="Next review"
            >
              ›
            </button>
          </>
        )}
      </div>

      {n > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Choose a review">
          {items.map((_, i) => (
            <button
              type="button"
              key={i}
              className={`${styles.dot} ${i === idx ? styles.on : ""}`}
              aria-label={`Review ${i + 1} of ${n}`}
              aria-current={i === idx}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}

      <Link href={reviewsHref} className={styles.foot}>
        Verified guest reviews — read them in full ↗
      </Link>
    </div>
  );
}
