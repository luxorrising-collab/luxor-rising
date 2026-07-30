import Image from "next/image";
import Reveal from "./Reveal";
import styles from "./ConsigliereSection.module.css";

const CONS_ICONS = ["✦", "❖", "◆", "✧", "◈", "❋"];

export type ConsigliereePoint = { title: string; description: string };
export type ConsHowItWorks = {
  label?: string;
  steps: { title: string; description: string }[];
};

type ConsigliereSectionProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
  /** How-it-works steps, folded into the cover overlay as a slim numbered flow. */
  howItWorks?: ConsHowItWorks;
  points: ConsigliereePoint[];
  disclosure?: string;
};

/**
 * Full-bleed portrait of the consigliere with the intro (and optional
 * how-it-works flow) as an overlay, then the "what he does" points below.
 * Shared by the experience template and the concierge-day page so the
 * "who runs your day" story looks identical everywhere.
 */
export default function ConsigliereSection({
  eyebrow,
  title,
  lead,
  image,
  howItWorks,
  points,
  disclosure,
}: ConsigliereSectionProps) {
  if (!title) return null;
  const steps = howItWorks?.steps ?? [];
  return (
    <>
      <section className={styles.consCover}>
        {image && (
          <div className={styles.consCoverBg}>
            <Image src={image} alt={eyebrow || ""} fill sizes="100vw" />
          </div>
        )}
        <div className={styles.consCoverScrim} />
        <div className={`wrap ${styles.consCoverIn}`}>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className="display">{title}</h2>
          {lead && <p className={styles.consCoverLead}>{lead}</p>}
          {steps.length > 0 && (
            <>
              {howItWorks?.label && <div className={styles.flowLabel}>{howItWorks.label}</div>}
              <ol className={styles.flow}>
                {steps.map((s, i) => (
                  <li key={s.title || i}>
                    <span className={styles.flowNum}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.flowText}>
                      <b>{s.title}.</b> {s.description}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </section>

      {(points.length > 0 || disclosure) && (
        <section className={styles.consigliere}>
          <div className="wrap">
            {points.length > 0 && (
              <Reveal className={styles.consGrid}>
                {points.map((p, i) => (
                  <div className={styles.consItem} key={p.title || i}>
                    <span className={styles.consIcon} aria-hidden>
                      {CONS_ICONS[i % CONS_ICONS.length]}
                    </span>
                    <h4>{p.title}</h4>
                    <p>{p.description}</p>
                  </div>
                ))}
              </Reveal>
            )}
            {disclosure && (
              <div className="disclosure" style={{ marginTop: points.length > 0 ? "2.4rem" : 0 }}>
                {disclosure}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
