"use client";

import * as React from "react";
import Image from "next/image";
import styles from "./GalleryCarousel.module.css";

type Item = { image: string; caption?: string };

export default function GalleryCarousel({ items }: { items: Item[] }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);

  const update = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // tolerance covers the track's inline gutter, where scroll-snap rests at each end
    const edge = 60;
    setAtStart(el.scrollLeft <= edge);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - edge);
  }, []);

  React.useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const nudge = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (!items?.length) return null;

  return (
    <div className={styles.carousel}>
      <button
        type="button"
        className={`${styles.arrow} ${styles.prev}`}
        aria-label="Previous images"
        onClick={() => nudge(-1)}
        disabled={atStart}
      >
        ‹
      </button>

      <div className={styles.track} ref={trackRef}>
        {items.map((it, i) => (
          <figure className={styles.slide} key={it.image || i}>
            <Image src={it.image ?? ""} alt={it.caption ?? ""} fill sizes="(max-width: 640px) 80vw, 380px" />
            {it.caption && <figcaption className={styles.cap}>{it.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.arrow} ${styles.next}`}
        aria-label="Next images"
        onClick={() => nudge(1)}
        disabled={atEnd}
      >
        ›
      </button>
    </div>
  );
}
