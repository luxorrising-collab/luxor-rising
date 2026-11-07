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
  /** The Design-Your-Day tiers that include this experience. */
  tiers?: string[];
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
  tiers,
}: ExperienceCardProps) {
  const btnClass = `btn ${ctaVariant === "primary" ? "btn-primary" : "btn-line"}`;

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
    <article className={`${styles.card} ${styles.film}`}>
      <div className={styles.im}>
        <Image src={src} alt={alt} fill sizes="(max-width: 1000px) 100vw, 33vw" loading="lazy" />
        <span className={styles.grain} aria-hidden="true" />
        <span className={styles.overTitle}>
          {place && <span className={styles.overPlace}>{place}</span>}
          <span className={styles.overH}>{title}</span>
        </span>
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
        {tiers && tiers.length > 0 && (
          <div className={styles.tiers} aria-label={`Included in ${tiers.join(", ")}`}>
            <span className={styles.tiersLabel}>Included in</span>
            {tiers.map((t) => (
              <span key={t} className={`${styles.tier} ${t === "Signature" ? styles.tierSig : ""}`}>
                {t}
              </span>
            ))}
          </div>
        )}
        <h3 className={styles.srOnly}>{title}</h3>
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
