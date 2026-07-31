import Image from "next/image";
import Reveal from "./Reveal";
import styles from "./ConsigliereSection.module.css";

const CONS_ICONS = ["✦", "❖", "◆", "✧", "◈", "❋"];

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
  /** Optional split background — one slice per person (consigliere, Egyptologist,
   *  guard). When two or more are given, they replace the single cover image. */
  images?: ConsigliereSlice[];
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
  images,
  howItWorks,
  points,
  disclosure,
}: ConsigliereSectionProps) {
  if (!title) return null;
  const steps = howItWorks?.steps ?? [];
  const slices = images && images.length > 1 ? images : null;
  return (
    <>
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
            <Image src={image} alt={eyebrow || ""} fill sizes="100vw" />
          </div>
        ) : null}
        <div className={styles.consCoverScrim} />
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
