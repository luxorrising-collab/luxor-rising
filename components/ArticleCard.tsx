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
  /** The author's portrait, shown beside the name. */
  authorImage?: string;
  /** e.g. "Founder · Author". */
  authorRole?: string;
};

function Avatar({ name, image, size }: { name: string; image?: string; size: number }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size }} aria-hidden="true">
      {image ? <Image src={image} alt="" fill sizes={`${size}px`} /> : name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/** An Insider's Guide article, as a filmic card: the photo carries the title,
 *  a dark film strip below carries the promise and the byline. The featured
 *  variant is a full-width cinematic opener. */
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
  authorImage,
  authorRole,
}: ArticleCardProps) {
  if (featured) {
    return (
      <Link href={href} className={styles.feat}>
        <div className={styles.featIm}>
          <Image src={src} alt={alt} fill sizes="100vw" priority />
        </div>
        <span className={styles.grain} aria-hidden="true" />
        <div className={styles.featBody}>
          <span className={styles.pill}>Start here</span>
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
          <div className={styles.featFoot}>
            <span className={styles.by}>
              <Avatar name={authorName} image={authorImage} size={40} />
              <span className={styles.byT}>
                <b>{authorName}</b>
                {authorRole && <small>{authorRole}</small>}
              </span>
            </span>
            <span className={`btn btn-primary ${styles.featCta}`}>Read the guide →</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className={styles.post}>
      <div className={styles.im}>
        <Image src={src} alt={alt} fill sizes="(max-width: 1000px) 100vw, 33vw" loading="lazy" />
        <span className={styles.grain} aria-hidden="true" />
        {category && <span className={styles.chip}>{category}</span>}
        <h3 className={styles.overH}>{title}</h3>
      </div>
      <div className={styles.body}>
        <p>{excerpt}</p>
        <div className={styles.foot}>
          <span className={styles.by}>
            <Avatar name={authorName} image={authorImage} size={28} />
            {authorName}
          </span>
          <span>{readTime}</span>
        </div>
        <span className={styles.readmore}>Read the guide →</span>
      </div>
    </Link>
  );
}
