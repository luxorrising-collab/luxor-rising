import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Markdoc, { Tag, type Node } from "@markdoc/markdoc";
import Reveal from "./Reveal";
import Faq from "./Faq";
import Gallery from "./Gallery";
import styles from "./ExperienceTemplate.module.css";

const HIGHLIGHT_ICONS = ["✦", "❖", "◆", "✧"];

export type ExperienceHighlight = { title: string; description: string };
export type ExperienceGalleryItem = { src: string; alt: string; caption: string };
export type ValueStackRow = { label: string; price: string };
export type FaqItemData = { q: string; a: string };
export type HowItWorksStep = { title: string; description: string };
export type GuaranteeItem = { title: string; description: string };
export type Testimonial = { quote: string; author: string };

export type ExperienceTemplateProps = {
  title: string;
  hook: string;
  heroEyebrow: string;
  heroImage: string;
  glanceLead: string;
  bestTime: string;
  duration: string;
  glanceIncludes: string;
  highlights: ExperienceHighlight[];
  contentNode: Node;
  momentQuote?: string;
  gallery: ExperienceGalleryItem[];
  bookEyebrow: string;
  bookTitle: string;
  bookLead: string;
  bookNote?: string;
  configurator: React.ReactNode;
  valueStackRows: ValueStackRow[];
  valueStackTotal: string;
  basePrice: number;
  priceNote: string;
  pricePerPerson?: string;
  faq: FaqItemData[];
  howItWorksEyebrow: string;
  howItWorksTitle: string;
  howItWorksSteps: HowItWorksStep[];
  disclosureText: string;
  guaranteeEyebrow: string;
  guaranteeTitle: string;
  guaranteeItems: GuaranteeItem[];
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonials: Testimonial[];
  finalTitle: string;
  finalText: string;
  finalCtaHref: string;
  finalCtaLabel: string;
};

export default function ExperienceTemplate({
  title,
  hook,
  heroEyebrow,
  heroImage,
  glanceLead,
  bestTime,
  duration,
  glanceIncludes,
  highlights,
  contentNode,
  momentQuote,
  gallery,
  bookEyebrow,
  bookTitle,
  bookLead,
  bookNote,
  configurator,
  valueStackRows,
  valueStackTotal,
  basePrice,
  priceNote,
  pricePerPerson,
  faq,
  howItWorksEyebrow,
  howItWorksTitle,
  howItWorksSteps,
  disclosureText,
  guaranteeEyebrow,
  guaranteeTitle,
  guaranteeItems,
  testimonialsEyebrow,
  testimonialsTitle,
  testimonials,
  finalTitle,
  finalText,
  finalCtaHref,
  finalCtaLabel,
}: ExperienceTemplateProps) {
  const transformed = Markdoc.transform(contentNode);
  const contentChildren = Tag.isTag(transformed) ? transformed.children : [transformed];

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image src={heroImage} alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.heroScrim} />
        <div className={`wrap ${styles.heroContent}`}>
          <span className="eyebrow">{heroEyebrow}</span>
          <h1 className="display">{title}</h1>
          <div className={styles.heroSub}>{hook}</div>
          <div className={styles.priceRow}>
            <span className="from">From</span>
            <span className="amt">€{basePrice}</span>
            <span className="per">{[pricePerPerson, priceNote].filter(Boolean).join(" · ")}</span>
          </div>
          <div className={styles.heroCta}>
            <Link href="#book" className="btn btn-primary btn-lg">
              Reserve this experience →
            </Link>
            <Link href="#content" className="btn btn-ghost btn-lg">
              Why it matters
            </Link>
          </div>
        </div>
      </section>

      {/* AT A GLANCE */}
      <section className={styles.glance}>
        <div className="wrap">
          <p className={styles.glanceLead}>{glanceLead}</p>
          <div className={styles.glanceRule} />
          <div className={styles.glanceFacts}>
            <div className={styles.gf}>
              <span>Duration</span>
              {duration}
            </div>
            <div className={styles.gf}>
              <span>Best time</span>
              {bestTime}
            </div>
            <div className={styles.gf}>
              <span>From</span>€{basePrice}
              {pricePerPerson ? ` · ${pricePerPerson}` : ""}
            </div>
            <div className={styles.gf}>
              <span>Cancellation</span>Free, up to 7 days
            </div>
          </div>
          {glanceIncludes && <p className={styles.glanceIncl}>{glanceIncludes}</p>}
        </div>
      </section>

      {/* CONTENT (flowing narrative from markdoc) */}
      <section id="content">
        <Reveal className={`wrap ${styles.body}`}>
          {Markdoc.renderers.react(contentChildren, React, {})}
        </Reveal>
      </section>

      {/* MOMENT (optional dramatic break) */}
      {momentQuote && (
        <section className={styles.moment}>
          <Image src={heroImage} alt="" fill sizes="100vw" />
          <div className={styles.momentScrim} />
          <Reveal className={`wrap ${styles.momentIn}`}>
            <p>{momentQuote}</p>
          </Reveal>
        </section>
      )}

      {/* HIGHLIGHTS */}
      {highlights.length > 0 && (
        <section style={{ background: "var(--color-paper)" }}>
          <div className="wrap">
            <div className="center" style={{ marginBottom: ".4rem" }}>
              <span className="eyebrow">On the day</span>
              <h2 className="display">What you&apos;ll experience</h2>
            </div>
            <Reveal className={styles.seeGrid}>
              {highlights.map((h, i) => (
                <div className={styles.see} key={h.title || i}>
                  <div className="ix">{HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]}</div>
                  <div>
                    <h4>{h.title}</h4>
                    <p>{h.description}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section id="gallery">
          <div className="wrap">
            <div className="center" style={{ marginBottom: "1.8rem" }}>
              <span className="eyebrow">A closer look</span>
              <h2 className="display">Moments from this experience</h2>
            </div>
            <Gallery
              tiles={gallery.map((g, i) => ({
                src: g.src,
                alt: g.alt || g.caption,
                caption: g.caption,
                width: 1600,
                height: 1000,
                span: i === 0 ? "feat" : undefined,
              }))}
            />
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">{howItWorksEyebrow}</span>
          <h2 className="display">{howItWorksTitle}</h2>
          <div className="steps3">
            {howItWorksSteps.map((s, i) => (
              <div className="s3" key={s.title || i}>
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <h4>{s.title}</h4>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
          {disclosureText && <div className="disclosure">{disclosureText}</div>}
        </Reveal>
      </section>

      {/* BOOK / CONFIGURATOR */}
      <section id="book" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <div className="center" style={{ marginBottom: ".3rem" }}>
            <span className="eyebrow">{bookEyebrow}</span>
            <h2 className="display">{bookTitle}</h2>
            <p className="lead" style={{ marginTop: ".6rem" }}>
              {bookLead}
            </p>
            {bookNote && (
              <p style={{ marginTop: ".5rem", fontSize: ".82rem", color: "var(--color-gold-deep)" }}>
                {bookNote}
              </p>
            )}
          </div>
          {configurator}
        </div>
      </section>

      {/* VALUE STACK */}
      {valueStackRows.length > 0 && (
        <section>
          <Reveal className="wrap-narrow center">
            <span className="eyebrow">What&apos;s handled for you</span>
            <h2 className="display">The entry ticket is the cheap part.</h2>
            <div className={styles.stack}>
              {valueStackRows.map((row, i) => (
                <div className={styles.stackRow} key={row.label || i}>
                  <span>{row.label}</span>
                  <span className="v">{row.price}</span>
                </div>
              ))}
              {valueStackTotal && (
                <div className={`${styles.stackRow} ${styles.tot}`}>
                  <span>Assembled separately</span>
                  <span className="v">
                    <s>{valueStackTotal}</s>
                  </span>
                </div>
              )}
              <div className={`${styles.stackRow} ${styles.fin}`}>
                <span>Your private experience, from</span>
                <span className="v">€{basePrice}</span>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* GUARANTEE */}
      <section className={styles.guarantee}>
        <Reveal className="wrap">
          <span className="eyebrow" style={{ color: "var(--color-gold-soft)" }}>
            {guaranteeEyebrow}
          </span>
          <h2 className="display">{guaranteeTitle}</h2>
          <div className={styles.grGrid}>
            {guaranteeItems.map((g, i) => (
              <div className={styles.gr} key={g.title || i}>
                <h4>{g.title}</h4>
                <p>{g.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section style={{ background: "var(--color-paper)" }}>
          <Reveal className="wrap center">
            <span className="eyebrow">{testimonialsEyebrow}</span>
            <h2 className="display">{testimonialsTitle}</h2>
            <div className="tposts">
              {testimonials.map((t, i) => (
                <div className="tp" key={t.author || i}>
                  <div className="st">★★★★★</div>
                  <blockquote>&quot;{t.quote}&quot;</blockquote>
                  <div className="who">— {t.author}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section>
          <Reveal className="wrap-narrow">
            <div className="center" style={{ marginBottom: "1.6rem" }}>
              <span className="eyebrow">Good to know</span>
              <h2 className="display">Questions, answered</h2>
            </div>
            <Faq items={faq.map((f) => ({ q: f.q, a: f.a }))} />
          </Reveal>
        </section>
      )}

      {/* FINAL */}
      <section className={styles.final}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">Your date is waiting</span>
          <h2 className="display">{finalTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {finalText}
          </p>
          <div
            style={{
              marginTop: "1.8rem",
              display: "flex",
              gap: ".8rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href={finalCtaHref} className="btn btn-primary btn-lg">
              {finalCtaLabel}
            </Link>
            <Link href="/concierge-day" className="btn btn-line btn-lg">
              Or build a whole day
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
