"use client";

import { useEffect, useState } from "react";
import styles from "./ReadingProgress.module.css";

export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className={styles.bar} style={{ width: `${pct}%` }} aria-hidden="true" />;
}
