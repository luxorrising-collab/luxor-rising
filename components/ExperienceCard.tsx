import Image from "next/image";
import Link from "next/link";
import styles from "./ExperienceCard.module.css";

export type ExperienceCardProps = {
  href: string;
  src: string;
  alt: string;
  title: string;
  place?: string;
  hook: string;
  meta?: string;
  facts?: React.ReactNode[];
  badge?: string;
  badgeVariant?: "default" | "signature";
  scarcity?: string;
  priceLabel: string;
  priceValue: string;
  priceNote?: string;
  ctaLabel: string;
  ctaVariant?: "primary" | "secondary";
  compact?: boolean;
  /** Cinematic listing variant: tall image, title over it, light footer. */
  filmic?: boolean;
};

export default function ExperienceCard({
  href,
  src,
  alt,
  title,
  place,
  hook,
  meta,
  facts,
  badge,
  badgeVariant = "default",
  scarcity,
  priceLabel,
  priceValue,
  priceNote,
  ctaLabel,
  ctaVariant = "primary",
  compact = false,
  filmic = false,
}: ExperienceCardProps) {
  const btnClass = `btn ${ctaVariant === "primary" ? "btn-primary" : "btn-line"}`;

  if (filmic) {
    return (
      <article className={`${styles.card} ${styles.filmic}`}>
        <Link href={href} className={styles.fMedia}>
          <Image src={src} alt={alt} fill sizes="(max-width: 1000px) 100vw, 33vw" loading="lazy" />
          <div className={styles.fScrim} aria-hidden />
          {badge && (
            <span className={`${styles.badge} ${badgeVariant === "signature" ? styles.sig : ""}`}>
              {badgeVariant === "signature" ? `★ ${badge}` : badge}
            </span>
          )}
          {scarcity && (
            <span className={styles.scarce}>
              <span className={styles.pulse} />
              {scarcity}
            </span>
          )}
          <div className={styles.fOverlay}>
            {place && <span className={styles.fPlace}>{place}</span>}
            <h3 className={styles.fTitle}>{title}</h3>
          </div>
        </Link>
        <div className={styles.fBody}>
          <p className={styles.fHook}>{hook}</p>
          {facts && facts.length > 0 && (
            <div className={styles.fFacts}>
              {facts.map((f, i) => (
                <span key={i}>{f}</span>
              ))}
            </div>
          )}
          <div className={styles.fFoot}>
            <div className={styles.fPrice}>
              <small>{priceLabel}</small>
              <b>{priceValue}</b> {priceNote && <i>{priceNote}</i>}
            </div>
            <Link href={href} className={btnClass}>
              {ctaLabel}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  if (compact) {
    return (
      <article className={`${styles.card} ${styles.compact}`}>
        <div className={styles.im}>
          <Image src={src} alt={alt} fill sizes="(max-width: 1000px) 100vw, 33vw" loading="lazy" />
        </div>
        <div className={styles.body}>
          {place && <div className={styles.place}>{place}</div>}
          <h3>{title}</h3>
          <p className={styles.hook}>{hook}</p>
          <div className={styles.compactFoot}>
            <span>
              <b>{priceValue}</b> {priceNote && <small>{priceNote}</small>}
            </span>
            <Link href={href} className={styles.compactGo}>
              {ctaLabel} →
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.im}>
        <Image src={src} alt={alt} fill sizes="(max-width: 1000px) 100vw, 33vw" loading="lazy" />
        {badge && (
          <span className={`${styles.badge} ${badgeVariant === "signature" ? styles.sig : ""}`}>
            {badgeVariant === "signature" ? `★ ${badge}` : badge}
          </span>
        )}
        {scarcity && (
          <span className={styles.scarce}>
            <span className={styles.pulse} />
            {scarcity}
          </span>
        )}
      </div>
      <div className={styles.body}>
        {meta && <div className={styles.meta}>{meta}</div>}
        {place && <div className={styles.place}>{place}</div>}
        <h3>{title}</h3>
        <p className={styles.hook}>{hook}</p>
        {facts && facts.length > 0 && (
          <div className={styles.facts}>
            {facts.map((f, i) => (
              <span key={i}>{f}</span>
            ))}
          </div>
        )}
        <div className={styles.foot}>
          <div className={styles.price}>
            <small>{priceLabel}</small>
            <b>{priceValue}</b> {priceNote && <i>{priceNote}</i>}
          </div>
          <Link href={href} className={btnClass}>
            {ctaLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
