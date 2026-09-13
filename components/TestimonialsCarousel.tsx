"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./TestimonialsCarousel.module.css";

export type Moment = {
  quote: string;
  author?: string | null;
  rating?: number | null;
  signature?: string | null;
  signatureSub?: string | null;
  signatureHref?: string | null;
  image?: string | null;
};

/** A 3-D "coverflow" carousel of powerful review excerpts: one moment in focus,
 *  neighbours scaled back and faded for depth. The author repeats (mostly one
 *  guest for now) so it's kept quiet here — full attribution + verification live
 *  on the reviews page, linked below. Auto-advances, pauses on hover/focus, and
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

  // Position each slide by its signed distance from the focused one.
  function place(i: number): React.CSSProperties {
    let off = (((i - idx) % n) + n) % n;
    if (off > n / 2) off -= n;
    const a = Math.abs(off);
    const dir = off < 0 ? -1 : 1;
    const base = "translate(-50%, -50%)";
    if (off === 0)
      return { left: "50%", transform: `${base} scale(1)`, opacity: 1, filter: "none", zIndex: 4, pointerEvents: "auto" };
    if (a === 1)
      return { left: `${50 + dir * 33}%`, transform: `${base} scale(0.82)`, opacity: 0.62, filter: "brightness(0.7) blur(0.4px)", zIndex: 3, pointerEvents: "auto", cursor: "pointer" };
    if (a === 2)
      return { left: `${50 + dir * 57}%`, transform: `${base} scale(0.66)`, opacity: 0.28, filter: "brightness(0.5) blur(1.3px)", zIndex: 2, pointerEvents: "none" };
    return { left: `${50 + dir * 82}%`, transform: `${base} scale(0.58)`, opacity: 0, filter: "blur(2px)", zIndex: 1, pointerEvents: "none" };
  }

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.stage}>
        {items.map((t, i) => {
          const stars = Math.max(1, Math.min(5, Math.round(t.rating ?? 5)));
          const isCenter = (((i - idx) % n) + n) % n === 0;
          return (
            <figure
              key={i}
              className={styles.slide}
              style={place(i)}
              aria-hidden={!isCenter}
              onClick={!isCenter ? () => go(i) : undefined}
            >
              {t.image && (
                <img
                  className={styles.img}
                  src={t.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  draggable={false}
                />
              )}
              <div className={styles.tint} aria-hidden="true" />
              <div className={styles.body}>
                <div className={styles.stars} aria-label={`${stars} out of 5`}>
                  {"★".repeat(stars)}
                </div>
                <blockquote className={styles.quote}>&ldquo;{t.quote}&rdquo;</blockquote>
              </div>
              {t.signature && (
                <figcaption className={styles.sig}>
                  {t.signatureHref && isCenter ? (
                    <Link href={t.signatureHref} className={styles.sigLink}>
                      {t.signature}
                    </Link>
                  ) : (
                    <span className={styles.sigName}>{t.signature}</span>
                  )}
                  {t.signatureSub && <span className={styles.sigSub}>{t.signatureSub}</span>}
                </figcaption>
              )}
            </figure>
          );
        })}

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
