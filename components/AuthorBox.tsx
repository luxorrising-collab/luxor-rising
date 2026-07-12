import Link from "next/link";
import styles from "./AuthorBox.module.css";

export default function AuthorBox({
  name,
  bio,
  href,
  ctaLabel,
}: {
  name: string;
  bio: string;
  href: string;
  ctaLabel: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <section className={styles.author}>
      <div className={styles.avatar} aria-hidden="true">
        {initial}
      </div>
      <div className={styles.text}>
        <div className={styles.eyebrow}>Written by</div>
        <h4>{name}</h4>
        <p>{bio}</p>
        <Link href={href} className="btn btn-line">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
