"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import styles from "./Gallery.module.css";

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  span?: "feat" | "wide";
  /** When set, this tile is a muted looping video (src is used as its poster). */
  video?: string;
  poster?: string;
};

export type GalleryPlaceholder = {
  placeholder: true;
  caption: string;
  span?: "feat" | "wide";
};

type Tile = GalleryImage | GalleryPlaceholder;

export default function Gallery({ tiles }: { tiles: Tile[] }) {
  const photos = tiles.filter((t): t is GalleryImage => !("placeholder" in t));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setOpenIndex((i) => {
        if (i === null) return i;
        return (i + delta + photos.length) % photos.length;
      });
    },
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex, close, step]);

  const active = openIndex !== null ? photos[openIndex] : null;
  let photoCursor = -1;

  return (
    <>
      <div className={styles.mosaic}>
        {tiles.map((t, i) => {
          if ("placeholder" in t) {
            return (
              <figure
                key={i}
                className={`${styles.tile} ${styles.placeholder} ${
                  t.span ? styles[t.span] : ""
                }`}
              >
                <div className={styles.placeholderFill} />
                <figcaption className={styles.caption}>
                  {t.caption}{" "}
                  <span className={styles.placeholderTag}>Photo coming</span>
                </figcaption>
              </figure>
            );
          }
          photoCursor++;
          const idx = photoCursor;
          return (
            <figure
              key={i}
              className={`${styles.tile} ${t.span ? styles[t.span] : ""}`}
              onClick={() => setOpenIndex(idx)}
            >
              {t.video ? (
                <>
                  <video
                    poster={t.poster ?? t.src}
                    muted
                    loop
                    playsInline
                    autoPlay={!reduced}
                    preload="metadata"
                  >
                    <source src={t.video} type="video/mp4" />
                  </video>
                  <span className={styles.playBadge}>Film</span>
                </>
              ) : (
                <Image src={t.src} alt={t.alt} fill sizes="(max-width: 680px) 50vw, 25vw" />
              )}
              <figcaption className={styles.caption}>{t.caption}</figcaption>
            </figure>
          );
        })}
      </div>

      <div
        className={`${styles.lightbox} ${active ? styles.open : ""}`}
        aria-hidden={!active}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <button className={styles.lbClose} aria-label="Close" onClick={close}>
          &times;
        </button>
        <button
          className={`${styles.lbNav} ${styles.lbPrev}`}
          aria-label="Previous"
          onClick={() => step(-1)}
        >
          &lsaquo;
        </button>
        <figure className={styles.lbFig}>
          {active && (
            <div className={styles.lbImgWrap}>
              {active.video ? (
                <video
                  src={active.video}
                  poster={active.poster ?? active.src}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Image
                  src={active.src}
                  alt={active.alt}
                  fill
                  sizes="90vw"
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
          )}
          <figcaption>{active?.caption}</figcaption>
        </figure>
        <button
          className={`${styles.lbNav} ${styles.lbNext}`}
          aria-label="Next"
          onClick={() => step(1)}
        >
          &rsaquo;
        </button>
      </div>
    </>
  );
}
