import Image from "next/image";
import Link from "next/link";
import styles from "./ArticleCard.module.css";

export type ArticleCardProps = {
  href: string;
  src: string;
  alt: string;
  title: string;
  excerpt: string;
  authorName: string;
  readTime: string;
  category?: string;
  updated?: string;
  featured?: boolean;
};

export default function ArticleCard({
  href,
  src,
  alt,
  title,
  excerpt,
  authorName,
  readTime,
  category,
  updated,
  featured = false,
}: ArticleCardProps) {
  const initial = authorName.trim().charAt(0).toUpperCase();

  if (featured) {
    return (
      <Link href={href} className={`${styles.post} ${styles.feat}`}>
        <div className={styles.im}>
          <Image src={src} alt={alt} fill sizes="(max-width: 840px) 100vw, 55vw" priority />
          <span className={styles.pill}>Start here</span>
        </div>
        <div className={styles.featBody}>
          <div className={styles.kicker}>
            {category && <span>{category}</span>}
            <span className={styles.sep} />
            <span>{readTime}</span>
            {updated && (
              <>
                <span className={styles.sep} />
                <span>{updated}</span>
              </>
            )}
          </div>
          <h2>{title}</h2>
          <p>{excerpt}</p>
          <span className={styles.readmore}>Read the guide →</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className={styles.post}>
      <div className={styles.im}>
        <Image src={src} alt={alt} fill sizes="(max-width: 1000px) 100vw, 33vw" loading="lazy" />
      </div>
      <div className={styles.body}>
        <h3>{title}</h3>
        <p>{excerpt}</p>
        <div className={styles.foot}>
          <span className={styles.by}>
            <span className={styles.avatar} aria-hidden="true">
              {initial}
            </span>
            {authorName}
          </span>
          <span>{readTime}</span>
        </div>
      </div>
    </Link>
  );
}
