import Link from "next/link";
import Reveal from "./Reveal";
import ExperienceGrid, { type ExperienceCardData, type StripTail } from "./ExperienceGrid";
import styles from "./DayHoldSlideshow.module.css";

/**
 * The "what your Luxor Rising day can hold" slideshow, shown on every
 * experience page: the full Design-Your-Day gallery cards as one swipeable,
 * gently drifting row, set in a dark filmic band so each card reads like a
 * film still. Funnels into Design Your Day.
 */
const DEFAULT_LEAD =
  "You choose what calls to you; your concierge quietly arranges the rest, in the order you like, with a certified Egyptologist at the monuments and every detail handled end to end. Just your day, shaped the way you'd want it.";

export default function DayHoldSlideshow({
  cards,
  eyebrow = "More than one day",
  title = "See what your Luxor Rising day can hold",
  lead = DEFAULT_LEAD,
  designHref = "/concierge-day#design",
  tail,
  progress,
  facts,
  cta,
  flush = false,
}: {
  cards: ExperienceCardData[];
  eyebrow?: string;
  title?: string;
  lead?: string;
  designHref?: string;
  tail?: StripTail;
  /** Show the gold progress rail instead of arrows. */
  progress?: boolean;
  /** Key facts shown as icon chips under the lead. */
  facts?: { icon: React.ReactNode; label: string }[];
  /** A call to action under the facts. */
  cta?: { href: string; label: string };
  /** No heading: the band grows out of the section above it. */
  flush?: boolean;
}) {
  if (cards.length === 0) return null;
  return (
    <div className={`${styles.band} ${flush ? styles.flush : ""}`}>
      {(eyebrow || title || lead || facts?.length || cta) && (
      <Reveal className={`wrap center ${styles.head}`}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h2 className="display">{title}</h2>}
        {lead && <p className="lead">{lead}</p>}
        {facts && facts.length > 0 && (
          <ul className={styles.facts}>
            {facts.map((f) => (
              <li key={f.label} className={styles.fact}>
                <span className={styles.factIco} aria-hidden>
                  {f.icon}
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        )}
        {cta && (
          <div className={styles.cta}>
            <Link href={cta.href} className="btn btn-primary btn-lg">
              {cta.label}
            </Link>
          </div>
        )}
      </Reveal>
      )}
      <div className={styles.stripWrap}>
        <ExperienceGrid cards={cards} layout="strip" designHref={designHref} tone="dark" tail={tail} progress={progress} />
      </div>
    </div>
  );
}
