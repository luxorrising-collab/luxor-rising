"use client";

import { useEffect, useState } from "react";
import styles from "./StickyBar.module.css";

export default function StickyBar({
  name,
  meta,
  ctaHref,
  ctaLabel,
  revealOnScroll = false,
  revealAfter = 640,
}: {
  name: string;
  meta: string;
  ctaHref: string;
  ctaLabel: string;
  revealOnScroll?: boolean;
  revealAfter?: number;
}) {
  const [shown, setShown] = useState(!revealOnScroll);

  useEffect(() => {
    if (!revealOnScroll) return;
    function onScroll() {
      setShown(window.scrollY > revealAfter);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealOnScroll, revealAfter]);

  return (
    <div className={`${styles.bar} ${shown ? "" : styles.hidden}`}>
      <div className={styles.inner}>
        <div>
          <span className={styles.name}>{name}</span>
          <span className={styles.meta}>{meta}</span>
        </div>
        <a href={ctaHref} className={`btn btn-primary ${styles.btn}`}>
          {ctaLabel}
        </a>
      </div>
    </div>
  );
}
