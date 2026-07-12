import Link from "next/link";
import styles from "./InlineCta.module.css";

export default function InlineCta({
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <Link href={ctaHref} className={styles.cta}>
      <div className={styles.in}>
        <div className={styles.text}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <b className={styles.title}>{title}</b>
          <span className={styles.body}>{body}</span>
        </div>
        <span className={styles.btn}>{ctaLabel}</span>
      </div>
    </Link>
  );
}
