"use client";

import * as React from "react";
import Image from "next/image";
import styles from "./GalleryMosaic.module.css";

type Item = { image: string; caption?: string };

export default function GalleryMosaic({ items, initial = 6 }: { items: Item[]; initial?: number }) {
  const [expanded, setExpanded] = React.useState(false);
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  const collapsible = items.length > initial;
  const collapsed = collapsible && !expanded;
  const visible = collapsed ? items.slice(0, initial) : items;

  const close = React.useCallback(() => setOpenIdx(null), []);
  const step = React.useCallback(
    (dir: number) => setOpenIdx((i) => (i === null ? i : (i + dir + visible.length) % visible.length)),
    [visible.length],
  );

  React.useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIdx, close, step]);

  if (!items?.length) return null;
  const open = openIdx === null ? null : visible[openIdx];

  return (
    <div className={styles.wrap}>
      <div className={`${styles.mosaic} ${collapsed ? styles.isCollapsed : ""}`}>
        {visible.map((g, i) => (
          <button
            type="button"
            key={g.image || i}
            className={`${styles.gm} ${i === 0 ? styles.gmBig : ""}`}
            onClick={() => setOpenIdx(i)}
            aria-label={g.caption ? `Enlarge: ${g.caption}` : "Enlarge image"}
          >
            <Image
              src={g.image ?? ""}
              alt={g.caption ?? ""}
              fill
              sizes={i === 0 ? "(max-width: 560px) 100vw, 50vw" : "(max-width: 560px) 50vw, 25vw"}
            />
            {g.caption && <span className={styles.gmCap}>{g.caption}</span>}
            <span className={styles.zoom} aria-hidden>
              ⤢
            </span>
          </button>
        ))}
        {collapsed && <div className={styles.fade} aria-hidden />}
      </div>

      {collapsible && (
        <div className={styles.moreWrap}>
          <button
            type="button"
            className={styles.moreBtn}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : `Show all ${items.length} experiences`}
          </button>
        </div>
      )}

      {open && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={open.caption ?? "Image"} onClick={close}>
          <button type="button" className={styles.lbClose} aria-label="Close" onClick={close}>
            ✕
          </button>
          {visible.length > 1 && (
            <button
              type="button"
              className={`${styles.lbArrow} ${styles.lbPrev}`}
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
            >
              ‹
            </button>
          )}
          <figure className={styles.lbFigure} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lbImg}>
              <Image src={open.image} alt={open.caption ?? ""} fill sizes="92vw" />
            </div>
            {open.caption && <figcaption className={styles.lbCap}>{open.caption}</figcaption>}
          </figure>
          {visible.length > 1 && (
            <button
              type="button"
              className={`${styles.lbArrow} ${styles.lbNext}`}
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
