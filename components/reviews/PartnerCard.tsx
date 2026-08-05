import Image from "next/image";
import styles from "./reviews.module.css";
import { hashtagsFor, type Partner } from "@/lib/partners";
import { SOURCE_LABELS } from "@/lib/reviews";

function fmtMonth(d: string | null) {
  if (!d) return "";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default function PartnerCard({ partner }: { partner: Partner }) {
  const sourceLabel = SOURCE_LABELS[partner.source] ?? partner.source;
  const hasNumbers = partner.rating > 0;
  const initial = partner.name.trim().charAt(0).toUpperCase() || "•";

  return (
    <article className={styles.partner}>
      <div className={styles.partnerHead}>
        {partner.logo ? (
          <Image
            src={partner.logo}
            alt={partner.name}
            width={44}
            height={44}
            className={styles.partnerLogo}
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden>
            {initial}
          </span>
        )}
        <div>
          <h3 className={styles.partnerName}>
            {partner.name}
            {partner.verified && (
              <span className={styles.partnerVerified} title="Verified partner">
                {" "}
                ✓
              </span>
            )}
          </h3>
          {partner.role && <p className={styles.partnerRole}>{partner.role}</p>}
        </div>
      </div>

      {hasNumbers && (
        <div className={styles.partnerScore}>
          <span className={styles.stars}>{"★".repeat(Math.round(partner.rating))}</span>
          <b>{partner.rating.toFixed(1)}</b>
          {partner.reviewCount > 0 && (
            <span className={styles.partnerCount}>
              · {partner.reviewCount.toLocaleString("en-GB")} reviews on {sourceLabel}
            </span>
          )}
          {partner.snapshotDate && (
            <span className={styles.partnerAsOf}> (as of {fmtMonth(partner.snapshotDate)})</span>
          )}
        </div>
      )}

      {partner.explanation && (
        <p className={styles.partnerExplain}>{partner.explanation}</p>
      )}

      <div className={styles.partnerFoot}>
        <div className={styles.hashtags}>
          {hashtagsFor(partner).map((t) => (
            <span key={t} className={styles.hashtag}>
              {t}
            </span>
          ))}
        </div>
        {partner.profileUrl && (
          <a
            className={styles.sourceLink}
            href={partner.profileUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            See all reviews on {sourceLabel} ↗
          </a>
        )}
      </div>
    </article>
  );
}
