import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import Faq from "./Faq";
import ExperienceCard from "./ExperienceCard";
import styles from "./DestinationTemplate.module.css";

export type DestinationCard = {
  image: string;
  meta: string;
  title: string;
  hook: string;
  badge?: string;
  priceLabel: string;
  priceValue: string;
  priceNote?: string;
  ctaLabel: string;
  href: string;
};
export type GuideSection = { heading: string; body: string };
export type FaqItem = { question: string; answer: string };

export type DestinationData = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroTrustLine: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustItems: string[];
  showFeature: boolean;
  featureEyebrow: string;
  featureTitle: string;
  featureBody: string;
  featureImage: string;
  featurePriceValue: string;
  featurePriceNote: string;
  featureCtaLabel: string;
  featureCtaHref: string;
  experiencesEyebrow: string;
  experiencesTitle: string;
  experiencesLead: string;
  experiences: DestinationCard[];
  guideEyebrow: string;
  guideTitle: string;
  guideIntro: string;
  guideSections: GuideSection[];
  guideLinkLabel: string;
  guideLinkHref: string;
  faqTitle: string;
  faq: FaqItem[];
  closerEyebrow: string;
  closerTitle: string;
  closerText: string;
  closerCtaLabel: string;
  closerCtaHref: string;
  closerSecondaryLabel: string;
  closerSecondaryHref: string;
};

export default function DestinationTemplate({ data }: { data: DestinationData }) {
  return (
    <>
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroBg}>
          <Image src={data.heroImage} alt="" fill priority sizes="100vw" />
        </div>
        <div className={styles.heroScrim} />
        <div className={`wrap ${styles.heroContent}`}>
          <span className="eyebrow">{data.heroEyebrow}</span>
          <h1 className="display">{data.heroTitle}</h1>
          <p className={styles.heroSub}>{data.heroSubtitle}</p>
          <div className={styles.heroCta}>
            <Link href={data.primaryCtaHref} className="btn btn-primary btn-lg">
              {data.primaryCtaLabel}
            </Link>
            {data.secondaryCtaLabel && (
              <Link href={data.secondaryCtaHref} className="btn btn-ghost btn-lg">
                {data.secondaryCtaLabel}
              </Link>
            )}
          </div>
          {data.heroTrustLine && (
            <div className={styles.heroTrust}>
              <span className="stars">★ ★ ★ ★ ★</span> {data.heroTrustLine}
            </div>
          )}
        </div>
      </header>

      {/* TRUST STRIP */}
      {data.trustItems.length > 0 && (
        <div className={styles.trust}>
          <div className={`wrap ${styles.trustIn}`}>
            {data.trustItems.map((item, i) => (
              <div className={styles.trustItem} key={item}>
                {i > 0 && <span className={styles.tdot} />}
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURE BLOCK (optional) */}
      {data.showFeature && (
        <section>
          <Reveal className={`wrap ${styles.split}`}>
            <div className={styles.splitMedia}>
              <Image src={data.featureImage} alt="" fill sizes="(max-width: 820px) 100vw, 50vw" />
            </div>
            <div className={styles.splitCopy}>
              <span className="eyebrow">{data.featureEyebrow}</span>
              <h2 className="display" style={{ margin: ".3rem 0 1rem" }}>
                {data.featureTitle}
              </h2>
              <p style={{ color: "var(--color-espresso)", opacity: 0.85 }}>{data.featureBody}</p>
              <div className={styles.priceRow}>
                <b>{data.featurePriceValue}</b> <small>{data.featurePriceNote}</small>
                <Link href={data.featureCtaHref} className="btn btn-primary" style={{ marginLeft: "auto" }}>
                  {data.featureCtaLabel}
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* EXPERIENCES */}
      {data.experiences.length > 0 && (
        <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-cream-deep)", borderBottom: "1px solid var(--color-cream-deep)" }}>
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">{data.experiencesEyebrow}</span>
              <h2 className="display">{data.experiencesTitle}</h2>
              {data.experiencesLead && (
                <p className="lead" style={{ marginTop: ".6rem", maxWidth: "52ch", marginLeft: "auto", marginRight: "auto" }}>
                  {data.experiencesLead}
                </p>
              )}
            </div>
            <Reveal className={styles.grid}>
              {data.experiences.map((e) => (
                <ExperienceCard
                  key={e.title}
                  href={e.href}
                  src={e.image}
                  alt={e.title}
                  meta={e.meta}
                  title={e.title}
                  hook={e.hook}
                  badge={e.badge || undefined}
                  priceLabel={e.priceLabel}
                  priceValue={e.priceValue}
                  priceNote={e.priceNote || undefined}
                  ctaLabel={e.ctaLabel}
                  ctaVariant="secondary"
                />
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* GUIDE / THINGS TO DO */}
      {data.guideSections.length > 0 && (
        <section id="guide">
          <Reveal className={`wrap-narrow ${styles.guideWrap}`}>
            <span className="eyebrow">{data.guideEyebrow}</span>
            <h2 className="display" style={{ margin: ".3rem 0 1rem" }}>
              {data.guideTitle}
            </h2>
            {data.guideIntro && <p style={{ color: "var(--color-muted)", marginBottom: "1.2rem" }}>{data.guideIntro}</p>}
            {data.guideSections.map((s) => (
              <div key={s.heading}>
                <h3>{s.heading}</h3>
                <p>{s.body}</p>
              </div>
            ))}
            {data.guideLinkLabel && (
              <p style={{ marginTop: "1rem" }}>
                <Link
                  href={data.guideLinkHref}
                  style={{ color: "var(--color-gold-deep)", borderBottom: "1px solid var(--color-gold-soft)", paddingBottom: ".2rem", fontSize: ".85rem" }}
                >
                  {data.guideLinkLabel}
                </Link>
              </p>
            )}
          </Reveal>
        </section>
      )}

      {/* FAQ */}
      {data.faq.length > 0 && (
        <section style={{ background: "var(--color-paper)" }}>
          <Reveal className="wrap-narrow">
            <div className="center" style={{ marginBottom: "1.6rem" }}>
              <span className="eyebrow">Good to know</span>
              <h2 className="display">{data.faqTitle}</h2>
            </div>
            <Faq items={data.faq.map((f) => ({ q: f.question, a: f.answer }))} />
          </Reveal>
        </section>
      )}

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">{data.closerEyebrow}</span>
          <h2 className="display">{data.closerTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {data.closerText}
          </p>
          <div style={{ marginTop: "1.8rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={data.closerCtaHref} className="btn btn-primary btn-lg">
              {data.closerCtaLabel}
            </Link>
            {data.closerSecondaryLabel && (
              <Link href={data.closerSecondaryHref} className="btn btn-line btn-lg">
                {data.closerSecondaryLabel}
              </Link>
            )}
          </div>
        </Reveal>
      </section>
    </>
  );
}
