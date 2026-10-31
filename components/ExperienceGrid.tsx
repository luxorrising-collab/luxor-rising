"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../app/(site)/concierge-day/ConciergeDayPage.module.css";

export type ExperienceCardData = {
  src: string;
  h: string;
  p: string;
  k?: string;
  /** Small place-name kicker above the poetic title. */
  place?: string;
  /** Product page the card links through to. */
  href?: string;
  /** Signature hero clip that plays on hover. */
  clip?: string;
  clipPoster?: string;
  position?: string;
  /** Custom line icon for this experience. */
  icon?: React.ReactNode;
  /** Marks a signature experience — shows a gold seal. */
  signature?: boolean;
  /** Which day packages include this experience (top-left labels). */
  tiers?: string[];
  /** Selling-point chips (icon + short label) shown on the card face. */
  features?: { icon: React.ReactNode; label: string }[];
};

/**
 * A single experience card: the product's poetic title with a short description,
 * links through to the product, and plays that product's hero clip on hover.
 */
function ExpCard({ e }: { e: ExperienceCardData }) {
  const vidRef = React.useRef<HTMLVideoElement>(null);
  const [open, setOpen] = React.useState(false);
  // "Included" sits top-left on every experience; the signature experiences also
  // get a "Signature experience" label top-right.
  const tiers = e.tiers ?? [];
  const showIncluded = tiers.length > 0;
  const onEnter = () => {
    const v = vidRef.current;
    if (!v) return;
    try {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* autoplay can be refused; the hero image stays */
    }
  };
  const onLeave = () => {
    const v = vidRef.current;
    if (v) {
      try {
        v.pause();
      } catch {
        /* no-op */
      }
    }
  };

  return (
    <div
      className={open ? `${styles.exp} ${styles.expOpen}` : styles.exp}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <Image src={e.src} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
      {e.clip && (
        <video
          ref={vidRef}
          className={styles.expVid}
          muted
          loop
          playsInline
          preload="none"
          poster={e.clipPoster}
          style={e.position ? { objectPosition: e.position } : undefined}
          aria-hidden
        >
          <source src={e.clip} type="video/mp4" />
        </video>
      )}
      {/* "Included" — top-left on every experience. */}
      {showIncluded ? (
        <span className={styles.expTag} aria-label="Included in your day">
          Included
        </span>
      ) : (
        e.icon && (
          <span className={styles.expIcon} aria-hidden>
            {e.icon}
          </span>
        )
      )}
      {/* "Signature experience" — top-right, only on the signature experiences. */}
      {e.signature && (
        <span
          className={`${styles.expTag} ${styles.expTagRight} ${styles.expTagSig}`}
          aria-label="A signature experience"
        >
          <svg className={styles.expTagStar} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 0.5l1.9 4.9 5.1 0.4-3.9 3.3 1.2 5-4.3-2.7-4.3 2.7 1.2-5L0.9 5.8 6 5.4z" />
          </svg>
          Signature experience
        </span>
      )}
      <div className={styles.expScrim} />
      <div className={styles.expTx}>
        {e.place && e.place !== e.h && <span className={styles.expKicker}>{e.place}</span>}
        <h4>{e.h}</h4>
        <span className={styles.expRule} aria-hidden />
        {e.features && e.features.length > 0 && (
          <ul className={styles.expFeats}>
            {e.features.map((ft) => (
              <li key={ft.label} className={styles.expFeat}>
                <span className={styles.expFeatIco} aria-hidden>
                  {ft.icon}
                </span>
                {ft.label}
              </li>
            ))}
          </ul>
        )}
        <div className={styles.expPanel}>
          {e.p && <p>{e.p}</p>}
          {e.href && (
            <Link className={styles.expView} href={e.href} prefetch={false}>
              View the experience →
            </Link>
          )}
        </div>
        {(e.p || e.href) && (
          <button
            type="button"
            className={styles.expReadBtn}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The "What your day can hold" grid. Square cards; only the first `initial`
 * show, with a Show-all toggle — same collapse idea as the gallery, so a dozen
 * experiences don't take over the page.
 */
export default function ExperienceGrid({
  cards,
  initial = 6,
  layout = "grid",
  designHref = "#design",
  tone = "light",
}: {
  cards: ExperienceCardData[];
  initial?: number;
  /** "strip" renders a single horizontal, swipeable row instead of a grid. */
  layout?: "grid" | "strip";
  /** Where the cards and the "design your day" tail link point. */
  designHref?: string;
  /** "dark" lifts the strip cards for a dark/filmic backdrop. */
  tone?: "light" | "dark";
}) {
  const [expanded, setExpanded] = React.useState(false);
  const stripRef = React.useRef<HTMLDivElement>(null);

  // Gentle, cinematic auto-drift for the slideshow — pauses on hover / touch,
  // reverses at each end (no jarring jump), and respects reduced-motion.
  React.useEffect(() => {
    if (layout !== "strip") return;
    const el = stripRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let paused = false;
    let dir = 1;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("touchstart", pause, { passive: true });
    // Gentle, always-on drift — perceptible but calm (~0.65px/frame ≈ 40px/s).
    const tick = () => {
      if (!paused && el.scrollWidth > el.clientWidth + 4) {
        el.scrollLeft += 0.65 * dir;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) dir = -1;
        else if (el.scrollLeft <= 0) dir = 1;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("touchstart", pause);
    };
  }, [layout]);

  // Single-row slideshow: every card in one swipeable strip, no collapse.
  if (layout === "strip") {
    const itemClass =
      tone === "dark" ? `${styles.expStripItem} ${styles.expStripItemDark}` : styles.expStripItem;
    const arrowClass =
      tone === "dark" ? `${styles.stripArrow} ${styles.stripArrowDark}` : styles.stripArrow;
    // Scroll one card at a time; pause the auto-drift briefly so the nudge lands.
    const nudge = (dir: 1 | -1) => {
      const el = stripRef.current;
      if (!el) return;
      const first = el.firstElementChild as HTMLElement | null;
      const step = first ? first.getBoundingClientRect().width + 14 : el.clientWidth * 0.85;
      el.scrollBy({ left: step * dir, behavior: "smooth" });
    };
    return (
      <div className={styles.stripShell}>
        <div className={styles.expStrip} ref={stripRef}>
          {cards.map((e) => (
            <div className={itemClass} key={e.href || e.h}>
              <ExpCard e={e} />
            </div>
          ))}
          <Link className={`${styles.expAll} ${itemClass}`} href={designHref}>
            <div className={styles.expAllIn}>
              <div className="k">The full collection</div>
              <h4>Explore all experiences</h4>
              <p>Temples, tombs, the Nile, the desert and more — designed into your day.</p>
              <span className={styles.expAllCta}>Design your day →</span>
            </div>
          </Link>
        </div>
        <div className={styles.stripNav}>
          <button type="button" aria-label="Previous" className={arrowClass} onClick={() => nudge(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" aria-label="Next" className={arrowClass} onClick={() => nudge(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  const collapsible = cards.length > initial;
  const visible = collapsible && !expanded ? cards.slice(0, initial) : cards;

  return (
    <>
      <div className={styles.expGrid}>
        {visible.map((e) => (
          <ExpCard e={e} key={e.href || e.h} />
        ))}
        {(!collapsible || expanded) && (
          <Link className={styles.expAll} href="#design">
            <div className={styles.expAllIn}>
              <div className="k">The full collection</div>
              <h4>Explore all experiences</h4>
              <p>
                Temples, tombs, the Nile, the desert and more — design your day and we&apos;ll build
                it from the full collection.
              </p>
              <span className={styles.expAllCta}>Design your day →</span>
            </div>
          </Link>
        )}
      </div>
      {collapsible && (
        <div className={styles.expMoreWrap}>
          <button type="button" className={styles.expMore} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show fewer" : `Show all ${cards.length} experiences`}
          </button>
        </div>
      )}
    </>
  );
}
