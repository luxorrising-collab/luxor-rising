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
function ExpCard({ e, clone = false }: { e: ExperienceCardData; clone?: boolean }) {
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
            <Link className={styles.expView} href={e.href} prefetch={false} tabIndex={clone ? -1 : undefined}>
              View the experience →
            </Link>
          )}
        </div>
        {(e.p || e.href) && (
          <button
            type="button"
            className={styles.expReadBtn}
            tabIndex={clone ? -1 : undefined}
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

const DRIFT_PX_PER_SEC = 28;

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
  const firstCloneRef = React.useRef<HTMLDivElement>(null);
  const nudgeRef = React.useRef<(dir: 1 | -1) => void>(() => {});

  // Slow, looping drift for the slideshow. The cards are rendered twice, so once
  // the first set has scrolled away the position jumps back by exactly one set and
  // the picture doesn't change. This loop is the only thing that moves the strip:
  // native smooth scrolling and scroll-snap would both fight it, so the arrows
  // animate through it too. Pauses on hover, touch and an open card; under reduced
  // motion only the arrows move it.
  React.useEffect(() => {
    if (layout !== "strip") return;
    const el = stripRef.current;
    const firstClone = firstCloneRef.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !firstClone || !first) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const setWidth = () => firstClone.offsetLeft - first.offsetLeft;
    const looping = () => setWidth() > 0 && el.scrollWidth - el.clientWidth >= setWidth();

    let raf = 0;
    let last = 0;
    let pos = 0;
    let hovering = false;
    let touching = false;
    let inView = true;
    let holdUntil = 0;
    let tween: { from: number; to: number; start: number; dur: number } | null = null;

    // The same picture one set further along, so there's room to scroll back.
    const makeRoom = () => {
      const set = setWidth();
      if (set > 0 && el.scrollLeft < set / 2) el.scrollLeft += set;
      pos = el.scrollLeft;
    };

    nudgeRef.current = (dir) => {
      if (!looping()) return;
      const set = setWidth();
      // Exact, unlike one card's rounded offset, so every landing stays on an edge.
      const step = set / (el.children.length / 2);
      const max = el.scrollWidth - el.clientWidth;
      let from = el.scrollLeft;
      let base = tween ? tween.to : from;
      if (dir < 0 && base - step < 0) {
        from += set;
        base += set;
      } else if (dir > 0 && base + step > max) {
        from -= set;
        base -= set;
      }
      el.scrollLeft = from;
      // Land on a card edge, whichever way the drift had left it.
      const to =
        dir > 0
          ? (Math.floor(base / step + 0.01) + 1) * step
          : (Math.ceil(base / step - 0.01) - 1) * step;
      const start = performance.now();
      const dur = reduced ? 0 : 700;
      tween = { from, to, start, dur };
      holdUntil = start + dur + 2500;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (tween) {
        const t = tween.dur ? Math.min(1, Math.max(0, (now - tween.start) / tween.dur)) : 1;
        pos = tween.from + (tween.to - tween.from) * (1 - (1 - t) ** 3);
        el.scrollLeft = pos;
        if (t >= 1) tween = null;
      } else if (
        reduced ||
        hovering ||
        touching ||
        !inView ||
        now < holdUntil ||
        el.querySelector(`.${styles.expOpen}, :focus-visible`)
      ) {
        pos = el.scrollLeft;
      } else if (looping()) {
        const set = setWidth();
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;
        pos += DRIFT_PX_PER_SEC * dt;
        if (pos >= set) pos -= set;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(tick);
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hovering = true;
      if (!tween) makeRoom();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") hovering = false;
    };
    const onTouchStart = () => {
      touching = true;
      tween = null;
      makeRoom();
    };
    const onTouchEnd = () => {
      touching = false;
      holdUntil = performance.now() + 2500;
    };
    // A flick keeps scrolling after the finger lifts; wait for it to settle.
    const onScroll = () => {
      const now = performance.now();
      if (!tween && now < holdUntil) holdUntil = Math.max(holdUntil, now + 1500);
    };
    const seen = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
    });

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    seen.observe(el);
    raf = requestAnimationFrame((now) => {
      last = now;
      tick(now);
    });
    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("scroll", onScroll);
    };
  }, [layout]);

  // Single-row slideshow: every card in one swipeable strip, no collapse.
  if (layout === "strip") {
    const itemClass =
      tone === "dark" ? `${styles.expStripItem} ${styles.expStripItemDark}` : styles.expStripItem;
    const arrowClass =
      tone === "dark" ? `${styles.stripArrow} ${styles.stripArrowDark}` : styles.stripArrow;
    return (
      <div className={styles.stripShell}>
        <div className={styles.expStrip} ref={stripRef}>
          {[false, true].map((clone) => (
            <React.Fragment key={String(clone)}>
              {cards.map((e, i) => (
                <div
                  className={itemClass}
                  key={e.href || e.h}
                  ref={clone && i === 0 ? firstCloneRef : undefined}
                  aria-hidden={clone || undefined}
                >
                  <ExpCard e={e} clone={clone} />
                </div>
              ))}
              <Link
                className={`${styles.expAll} ${itemClass}`}
                href={designHref}
                tabIndex={clone ? -1 : undefined}
                aria-hidden={clone || undefined}
              >
                <div className={styles.expAllIn}>
                  <div className="k">The full collection</div>
                  <h4>Explore all experiences</h4>
                  <p>Temples, tombs, the Nile, the desert and more — designed into your day.</p>
                  <span className={styles.expAllCta}>Design your day →</span>
                </div>
              </Link>
            </React.Fragment>
          ))}
        </div>
        <div className={styles.stripNav}>
          <button type="button" aria-label="Previous" className={arrowClass} onClick={() => nudgeRef.current(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" aria-label="Next" className={arrowClass} onClick={() => nudgeRef.current(1)}>
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
