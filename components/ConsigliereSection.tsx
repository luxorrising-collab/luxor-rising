import Image from "next/image";
import Link from "next/link";
import styles from "./ConsigliereSection.module.css";

const CONS_ICONS = ["✦", "❖", "◆"];

export type ConsigliereePoint = { title: string; description: string };
export type ConsHowItWorks = {
  label?: string;
  steps: { title: string; description: string }[];
};
export type ConsigliereSlice = { src: string; label?: string; position?: string };

type ConsigliereSectionProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  /** Optional split background — one slice per person. */
  images?: ConsigliereSlice[];
  /** Accepted for compatibility; not rendered (the how-it-works flow lives on
   *  the Private Guide page). */
  howItWorks?: ConsHowItWorks;
  points?: ConsigliereePoint[];
  moreHref?: string;
  moreLabel?: string;
  disclosure?: string;
};

/**
 * "Who runs your day" band: the Private Guide concierge explanation
 * (eyebrow · title · lead · three pillars) laid over a full-bleed portrait of
 * Ahmed on the Nile, with a link through to the full story. Shared by the
 * concierge-day and experience pages so it reads the same everywhere.
 */
export default function ConsigliereSection({
  eyebrow,
  title,
  lead,
  image,
  images,
  points = [],
  moreHref = "/private-guide",
  moreLabel = "Meet your concierge →",
}: ConsigliereSectionProps) {
  if (!title) return null;
  const slices = images && images.length > 1 ? images : null;
  const pillars = points.slice(0, 3);

  return (
    <section className={styles.consCover}>
      {slices ? (
        <div className={styles.consSlices}>
          {slices.map((s, i) => (
            <div className={styles.consSlice} key={s.src || i}>
              <Image
                src={s.src}
                alt={s.label || ""}
                fill
                sizes="(max-width: 860px) 34vw, 22vw"
                style={s.position ? { objectPosition: s.position } : undefined}
              />
            </div>
          ))}
        </div>
      ) : image ? (
        <div className={styles.consCoverBg}>
          <Image src={image} alt={eyebrow || ""} fill sizes="100vw" priority={false} />
        </div>
      ) : null}
      <div className={slices ? styles.consSlicesScrim : styles.consCoverScrim} />
      {slices && (
        <div className={styles.consCaps} aria-hidden>
          {slices.map((s, i) => (
            <span key={s.src || i}>{s.label}</span>
          ))}
        </div>
      )}
      <div className={`wrap ${styles.consCoverIn}`}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="display">{title}</h2>
        {lead && <p className={styles.consCoverLead}>{lead}</p>}
        {pillars.length > 0 && (
          <div className={styles.consPillars}>
            {pillars.map((p, i) => (
              <div className={styles.consPillar} key={p.title || i}>
                <span className={styles.consPillarIcon} aria-hidden>
                  {CONS_ICONS[i % CONS_ICONS.length]}
                </span>
                <h4>{p.title}</h4>
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        )}
        <Link href={moreHref} className={styles.consMore}>
          {moreLabel}
        </Link>
      </div>
    </section>
  );
}
