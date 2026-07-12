"use client";

import { useEffect, useState } from "react";
import styles from "./ArticleToc.module.css";

export type TocItem = { id: string; label: string };

export default function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -65% 0px" }
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className={styles.toc} aria-label="On this page">
      <h5>On this page</h5>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} className={activeId === i.id ? styles.on : undefined}>
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
