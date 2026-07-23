"use client";

import * as React from "react";
import Image from "next/image";
import styles from "./GalleryMosaic.module.css";

type Item = { image: string; caption?: string };

export default function GalleryMosaic({ items, initial = 6 }: { items: Item[]; initial?: number }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!items?.length) return null;

  const collapsible = items.length > initial;
  const collapsed = collapsible && !expanded;
  const visible = collapsed ? items.slice(0, initial) : items;

  return (
    <div className={styles.wrap}>
      <div className={`${styles.mosaic} ${collapsed ? styles.isCollapsed : ""}`}>
        {visible.map((g, i) => (
          <figure key={g.image || i} className={`${styles.gm} ${i === 0 ? styles.gmBig : ""}`}>
            <Image
              src={g.image ?? ""}
              alt={g.caption ?? ""}
              fill
              sizes={i === 0 ? "(max-width: 560px) 100vw, 50vw" : "(max-width: 560px) 50vw, 25vw"}
            />
            {g.caption && <figcaption className={styles.gmCap}>{g.caption}</figcaption>}
          </figure>
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
            {expanded ? "Show less" : `Show all ${items.length} moments`}
          </button>
        </div>
      )}
    </div>
  );
}
