"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
 *  respects prefers-reduced-motion.
 *  On wide screens the stage runs the full width of the page: the middle three
 *  cards keep their places, and the cards beyond them carry on outward, smaller
 *  and fading gradually into the page at both edges. */
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
  // On wide screens the coverflow opens up to five cards in view.
  const [wide, setWide] = useState(false);
  // The width of the centre column the middle three cards are laid out on; on
  // wide screens every position is measured from it, so they never move.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 980px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

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
    if (wide && cw) {
      // Positions in px from the centre of the full-width stage.
      const card = cw * 0.34;
      const at = (x: number) => `calc(50% + ${dir * x}px)`;
      if (a === 1)
        return { left: at(cw * 0.25), width: card, transform: `${base} scale(0.86)`, opacity: 0.85, filter: "brightness(0.78)", zIndex: 3, pointerEvents: "auto", cursor: "pointer" };
      // Beyond the middle three: each card a little smaller, overlapping the one
      // before it by the same share, and dimmer, until they leave the screen.
      let x = cw * 0.25;
      let prev = 0.86;
      let sc = prev;
      for (let k = 2; k <= a; k++) {
        sc = Math.max(0.5, 0.72 - 0.05 * (k - 2));
        x += ((prev + sc) / 2) * card * 0.75;
        prev = sc;
      }
      const dim = Math.max(0.28, 0.6 - 0.07 * (a - 2));
      return { left: at(x), width: card, transform: `${base} scale(${sc})`, opacity: Math.max(0.35, 0.8 - 0.08 * (a - 2)), filter: `brightness(${dim})`, zIndex: Math.max(0, 3 - a + 1), pointerEvents: a === 2 ? "auto" : "none", cursor: "pointer" };
    }
    if (a === 1)
      return { left: `${50 + dir * 33}%`, transform: `${base} scale(0.82)`, opacity: 0.62, filter: "brightness(0.7) blur(0.4px)", zIndex: 3, pointerEvents: "auto", cursor: "pointer" };
    if (a === 2)
      return { left: `${50 + dir * 57}%`, transform: `${base} scale(0.66)`, opacity: 0.28, filter: "brightness(0.5) blur(1.3px)", zIndex: 2, pointerEvents: "none" };
    return { left: `${50 + dir * 82}%`, transform: `${base} scale(0.58)`, opacity: 0, filter: "blur(2px)", zIndex: 1, pointerEvents: "none" };
  }

  return (
    <div
      ref={wrapRef}
      className={styles.wrap}
      style={{ "--cw": `${cw}px` } as React.CSSProperties}
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
              {t.image && Math.min((((i - idx) % n) + n) % n, (((idx - i) % n) + n) % n) <= (wide ? 6 : 2) && (
                <Image
                  className={styles.img}
                  src={t.image}
                  alt=""
                  aria-hidden
                  fill
                  sizes="(max-width: 760px) 82vw, 430px"
                  quality={75}
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
