import Link from "next/link";
import type { ArticleTag } from "@/lib/article-tags";
import styles from "./TagChips.module.css";

/** A row of #hashtag links, each opening every article with that tag. */
export default function TagChips({
  tags,
  label,
  activeSlug,
  counts,
}: {
  tags: ArticleTag[];
  label?: string;
  activeSlug?: string;
  counts?: Record<string, number>;
}) {
  if (!tags.length) return null;
  return (
    <nav className={styles.row} aria-label={label || "Tags"}>
      {label && <span className={styles.label}>{label}</span>}
      <ul>
        {tags.map((t) => (
          <li key={t.slug}>
            <Link
              href={t.href}
              className={`${styles.chip} ${activeSlug === t.slug ? styles.on : ""}`}
              aria-current={activeSlug === t.slug ? "page" : undefined}
            >
              {t.hashtag}
              {counts?.[t.slug] ? <span className={styles.count}>{counts[t.slug]}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
