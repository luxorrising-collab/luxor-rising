import Image from "next/image";
import Link from "next/link";
import styles from "./AuthorBox.module.css";

export default function AuthorBox({
  name,
  role,
  image,
  bio,
  href,
  ctaLabel,
  sameAs,
  bookHref,
}: {
  name: string;
  role?: string;
  image?: string;
  bio: string;
  href: string;
  ctaLabel: string;
  /** Public profiles, e.g. LinkedIn — shown as a way to connect. */
  sameAs?: string[];
  /** Where "Plan a day with us" goes; omitted when not given. */
  bookHref?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase();
  const linkedin = sameAs?.find((u) => u.includes("linkedin.com"));

  return (
    <section className={styles.author}>
      <div className={styles.avatar} aria-hidden="true">
        {image ? <Image src={image} alt="" fill sizes="120px" /> : initial}
      </div>
      <div className={styles.text}>
        <div className={styles.eyebrow}>Written by</div>
        <h4>{name}</h4>
        {role && <div className={styles.role}>{role}</div>}
        <p>{bio}</p>
        <div className={styles.actions}>
          {bookHref && (
            <Link href={bookHref} className="btn btn-primary">
              Plan a day with us →
            </Link>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.connect}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
              </svg>
              Connect on LinkedIn
            </a>
          )}
          <Link href={href} className={styles.more}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
