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
};

/**
 * A single experience card: the product's poetic title with a short description,
 * links through to the product, and plays that product's hero clip on hover.
 */
function ExpCard({ e }: { e: ExperienceCardData }) {
  const vidRef = React.useRef<HTMLVideoElement>(null);
  const [open, setOpen] = React.useState(false);
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
      {e.icon && (
        <span className={styles.expIcon} aria-hidden>
          {e.icon}
        </span>
      )}
      {e.signature ? (
        <span className={styles.expSignature} aria-label="A signature experience">
          <svg className={styles.expSigStar} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 0.5l1.9 4.9 5.1 0.4-3.9 3.3 1.2 5-4.3-2.7-4.3 2.7 1.2-5L0.9 5.8 6 5.4z" />
          </svg>
          Signature
        </span>
      ) : (
        e.k && <span className={styles.expBadge}>{e.k}</span>
      )}
      <div className={styles.expScrim} />
      <div className={styles.expTx}>
        {e.place && e.place !== e.h && <span className={styles.expKicker}>{e.place}</span>}
        <h4>{e.h}</h4>
        <span className={styles.expRule} aria-hidden />
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
}: {
  cards: ExperienceCardData[];
  initial?: number;
}) {
  const [expanded, setExpanded] = React.useState(false);
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
