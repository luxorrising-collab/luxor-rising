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
  /** A step number shown top-left in place of the icon (journey cards). */
  num?: string;
  /** A short practical line always shown under the title (journey cards). */
  sub?: string;
  /** Keep the title to a single line. */
  oneLine?: boolean;
  /** The photo's width ÷ height (server-read), so its sizes fit the crop. */
  aspect?: number;
  /** A tiny blurred preview (data URL), shown while the photo loads. */
  blur?: string;
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
// object-fit: cover draws a photo at whichever is larger: the card's width,
// or its height × the photo's aspect. Ask next/image for that width, so wide
// photos in tall cards aren't fetched at card width and stretched soft.
// Card boxes: phone strip 88vw × 76vh; strip 400px × ~64vh; grid 3:4 at full
// width on phones, 4:5 at 1/2 on tablets and 1/3 on desktop.
function cardSizes(a: number | undefined, strip: boolean) {
  if (!a) return "(max-width: 760px) 100vw, 33vw";
  const k = a.toFixed(3);
  if (strip) {
    const phone = a > 0.55 ? `calc(76vh * ${k})` : "88vw";
    return `(max-width: 560px) ${phone}, ${a > 0.69 ? `calc(64vh * ${k})` : "400px"}`;
  }
  const phone = a > 0.75 ? `${(122.7 * a).toFixed(1)}vw` : "92vw";
  const tablet = a > 0.8 ? `${(62.5 * a).toFixed(1)}vw` : "50vw";
  const desktop = a > 0.8 ? `${(41.25 * a).toFixed(1)}vw` : "33vw";
  return `(max-width: 560px) ${phone}, (max-width: 920px) ${tablet}, ${desktop}`;
}

function ExpCard({
  e,
  clone = false,
  beyond = false,
  strip = false,
}: {
  e: ExperienceCardData;
  clone?: boolean;
  /** Rendered in the slideshow strip (sets the card box its photo fills). */
  strip?: boolean;
  /** Past the collapsed grid's first cards: hidden on wide screens, kept in the phone carousel. */
  beyond?: boolean;
}) {
  const vidRef = React.useRef<HTMLVideoElement>(null);
  const [open, setOpen] = React.useState(false);
  // The hover clip (and its poster) is only put on the page once a mouse first
  // rests on the card — so touch phones never download any of it, and nothing
  // competes with the photos on the way in.
  const [armed, setArmed] = React.useState(false);
  const hovering = React.useRef(false);
  const opened = React.useRef(false);
  // The photo fades in over its blurred preview once it has arrived.
  const [loaded, setLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  React.useEffect(() => {
    // already decoded before hydration (cache): no load event will come
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);
  // "Included in" + the days that include it sits top-left, the same chips as
  // the experience page hero (Signature in gold). It is the only place
  // Signature is named, so a Signature-only experience reads "Included in
  // Signature" and nothing else.
  const tiers = e.tiers ?? [];
  const showIncluded = tiers.length > 0;
  const play = (v: HTMLVideoElement | null) => {
    if (!v) return;
    try {
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* autoplay can be refused; the hero image stays */
    }
  };
  const start = () => {
    if (!e.clip) return;
    if (!armed) setArmed(true);
    else play(vidRef.current);
  };
  const onEnter = () => {
    hovering.current = true;
    start();
  };
  const toggleOpen = () => {
    const next = !open;
    opened.current = next;
    setOpen(next);
    if (next) start();
    else if (!hovering.current) vidRef.current?.pause();
  };
  const onLeave = () => {
    hovering.current = false;
    if (opened.current) return;
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
      className={`${styles.exp} ${open ? styles.expOpen : ""} ${beyond ? styles.expBeyond : ""}`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {e.blur && (
        <span
          className={`${styles.expBlur} ${loaded ? styles.expBlurOff : ""}`}
          style={{ backgroundImage: `url("${e.blur}")` }}
          aria-hidden
        />
      )}
      <Image
        ref={imgRef}
        src={e.src}
        alt=""
        fill
        sizes={cardSizes(e.aspect, strip)}
        className={e.blur ? (loaded ? styles.expImgOn : styles.expImgWait) : undefined}
        onLoad={() => setLoaded(true)}
      />
      {e.clip && armed && (
        <video
          ref={(v) => {
            vidRef.current = v;
            // first hover: start as soon as the clip is on the page
            if (v && (hovering.current || opened.current) && v.paused) play(v);
          }}
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
      {/* "Included in" + day chips — top-left on every experience. */}
      {showIncluded ? (
        <span className={`${styles.expTag} ${styles.expTiers}`} aria-label={`Included in ${tiers.join(", ")}`}>
          <span className={styles.expTiersLabel}>Included in</span>
          {tiers.map((t) => (
            <span key={t} className={`${styles.expTier} ${t === "Signature" ? styles.expTierSig : ""}`}>
              {t}
            </span>
          ))}
        </span>
      ) : e.num ? (
        <span className={styles.expNum} aria-hidden>
          {e.num}
        </span>
      ) : (
        e.icon && (
          <span className={styles.expIcon} aria-hidden>
            {e.icon}
          </span>
        )
      )}
      {/* "Signature experience" — top-right, only where no day chips name it already. */}
      {e.signature && !showIncluded && (
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
        <h4 className={e.oneLine ? styles.expOneLine : undefined}>{e.h}</h4>
        {e.sub && <p className={styles.expSub}>{e.sub}</p>}
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
            onClick={toggleOpen}
          >
            {open ? "Close" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}

const DRIFT_PX_PER_SEC = 28;

export type StripTail = { k: string; h: string; p: string; cta: string; image?: string };
const DEFAULT_TAIL: StripTail = {
  k: "The full collection",
  h: "Explore all experiences",
  p: "Temples, tombs, the Nile, the desert and more — designed into your day.",
  cta: "Design your day →",
};

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
  tail = DEFAULT_TAIL,
  progress = false,
}: {
  cards: ExperienceCardData[];
  initial?: number;
  /** "strip" renders a single horizontal, swipeable row instead of a grid. */
  layout?: "grid" | "strip";
  /** Where the cards and the "design your day" tail link point. */
  designHref?: string;
  /** "dark" lifts the strip cards for a dark/filmic backdrop. */
  tone?: "light" | "dark";
  /** Wording of the strip's closing "design your day" card. */
  tail?: StripTail;
  /** Strip only: a gold progress rail of the cards' icons in place of the
      arrows — it lights up as the strip drifts, and a stop jumps to its card. */
  progress?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const stripRef = React.useRef<HTMLDivElement>(null);
  const firstCloneRef = React.useRef<HTMLDivElement>(null);
  const nudgeRef = React.useRef<(dir: 1 | -1) => void>(() => {});
  const goToRef = React.useRef<(i: number) => void>(() => {});
  // The card at the centre of the strip (the closing card counts as the end).
  const [at, setAt] = React.useState(0);
  const atRef = React.useRef(0);

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
    // Phones swipe it themselves (scroll-snap): no drift under the thumb.
    const still = reduced || (window.matchMedia?.("(max-width: 560px)").matches ?? false);
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

    goToRef.current = (i) => {
      const set = setWidth();
      if (set <= 0) return;
      const step = set / (el.children.length / 2);
      const max = el.scrollWidth - el.clientWidth;
      // Centre card i, staying in whichever copy of the cards is showing.
      let to = Math.floor(el.scrollLeft / set) * set + i * step - (el.clientWidth - step) / 2;
      if (to < 0) to += set;
      if (to > max) to -= set;
      const start = performance.now();
      const dur = reduced ? 0 : 900;
      tween = { from: el.scrollLeft, to: Math.max(0, Math.min(to, max)), start, dur };
      holdUntil = start + dur + 3500;
    };

    const report = () => {
      const set = setWidth();
      if (set <= 0) return;
      const step = set / (el.children.length / 2);
      const i = Math.floor(((el.scrollLeft + el.clientWidth / 2) % set) / step) % (el.children.length / 2);
      if (i !== atRef.current) {
        atRef.current = i;
        setAt(i);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (tween) {
        const t = tween.dur ? Math.min(1, Math.max(0, (now - tween.start) / tween.dur)) : 1;
        pos = tween.from + (tween.to - tween.from) * (1 - (1 - t) ** 3);
        // scroll-snap would pull every animated step back to a card; let go of it meanwhile
        el.style.scrollSnapType = "none";
        el.scrollLeft = pos;
        if (t >= 1) {
          tween = null;
          el.style.scrollSnapType = "";
        }
      } else if (
        still ||
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
      report();
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
                  <ExpCard e={e} clone={clone} strip />
                </div>
              ))}
              <Link
                className={`${styles.expAll} ${tail.image ? styles.expAllPhoto : ""} ${itemClass}`}
                href={designHref}
                tabIndex={clone ? -1 : undefined}
                aria-hidden={clone || undefined}
              >
                {tail.image && (
                  <>
                    <Image
                      src={tail.image}
                      alt=""
                      fill
                      sizes="(max-width: 560px) calc(76vh * 0.75), calc(64vh * 0.75)"
                      className={styles.expAllImg}
                    />
                    <span className={styles.expAllScrim} aria-hidden />
                  </>
                )}
                <div className={styles.expAllIn}>
                  <div className="k">{tail.k}</div>
                  <h4>{tail.h}</h4>
                  {tail.image && <span className={styles.expAllRule} aria-hidden />}
                  <p>{tail.p}</p>
                  <span className={styles.expAllCta}>{tail.cta}</span>
                </div>
              </Link>
            </React.Fragment>
          ))}
        </div>
        {progress ? (
          <div className={styles.stripProg} data-hide-chat>
            <ol className={styles.progRail}>
              {cards.map((e, i) => {
                const lit = i <= at;
                return (
                  <li key={e.h} className={`${styles.progStop} ${lit ? styles.progLit : ""} ${i === Math.min(at, cards.length - 1) ? styles.progCur : ""}`}>
                    {i > 0 && <span className={`${styles.progSeg} ${lit ? styles.progSegLit : ""}`} aria-hidden />}
                    <button
                      type="button"
                      className={styles.progNode}
                      aria-label={`${i + 1}. ${e.h}`}
                      aria-current={i === at ? "step" : undefined}
                      onClick={() => goToRef.current(i)}
                    >
                      {e.icon}
                    </button>
                  </li>
                );
              })}
            </ol>
            <p className={styles.progCap} aria-live="polite">
              <span>
                {String(Math.min(at, cards.length - 1) + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
              </span>
              {cards[Math.min(at, cards.length - 1)]?.h}
            </p>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  // Every card is rendered (crawlable); the collapsed grid hides the ones past
  // `initial` until "Show all" — hidden cards' lazy photos never download.
  const collapsible = cards.length > initial;
  const collapsed = collapsible && !expanded;

  return (
    <>
      <div className={styles.expGrid}>
        {cards.map((e, i) => (
          <ExpCard e={e} key={e.href || e.h} beyond={collapsed && i >= initial} />
        ))}
        <Link className={`${styles.expAll} ${collapsed ? styles.expBeyond : ""}`} href="#design">
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
      </div>
      {collapsible && (
        <div className={styles.expMoreWrap}>
          <button type="button" className={styles.expMore} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show fewer" : "Show more experiences"}
          </button>
        </div>
      )}
    </>
  );
}
