import Reveal from "./Reveal";
import ExperienceGrid, { type ExperienceCardData } from "./ExperienceGrid";
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
}: {
  cards: ExperienceCardData[];
  eyebrow?: string;
  title?: string;
  lead?: string;
  designHref?: string;
}) {
  if (cards.length === 0) return null;
  return (
    <div className={styles.band}>
      <Reveal className={`wrap center ${styles.head}`}>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="display">{title}</h2>
        <p className="lead">{lead}</p>
      </Reveal>
      <div className={styles.stripWrap}>
        <ExperienceGrid cards={cards} layout="strip" designHref={designHref} tone="dark" />
      </div>
    </div>
  );
}
