import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import Reveal from "@/components/Reveal";
import StickyBar from "@/components/StickyBar";
import GalleryMosaic from "@/components/GalleryMosaic";
import { reader } from "@/lib/keystatic-reader";
import styles from "./HomePage.module.css";

// Balloon rides (and other multi-page SEO variants) are sold under several
// experiences; the gallery shows each core experience once, so drop the extra
// variant slugs and keep the primary.
const GALLERY_VARIANT_SLUGS = new Set(["balloon-valley-of-the-kings", "hot-air-balloon-private-vip"]);
// Lead with the icons so the big tile and the collapsed view are the strongest.
const GALLERY_ORDER = [
  "valley-of-the-kings",
  "karnak-at-dawn",
  "hatshepsut-temple",
  "hot-air-balloon-luxor",
  "luxor-temple",
  "nile-dinner-cruise",
  "medinet-habu",
  "ramesseum-valley-of-queens",
];

export default async function HomePage() {
  const page = await reader.singletons.homePage.read();
  const heroTitleLines = (page?.heroTitle ?? "").split("\n");
  const positioningTitleLines = (page?.positioningTitle ?? "").split("\n");

  const galleryItems = (await reader.collections.experiences.all())
    .filter(({ slug, entry }) => entry.isActive && entry.heroImage && !GALLERY_VARIANT_SLUGS.has(slug))
    .sort((a, b) => {
      const ia = GALLERY_ORDER.indexOf(a.slug);
      const ib = GALLERY_ORDER.indexOf(b.slug);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    })
    .map(({ entry }) => ({ image: entry.heroImage as string, caption: entry.name || entry.title }));

  return (
    <>
      <Nav ctaHref="/concierge-day" ctaLabel="Design your day" />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBgs}>
          <div className={styles.heroBg}>
            <Image src={page?.heroImage ?? "/images/hero-desert-night.jpg"} alt="" fill priority sizes="100vw" />
          </div>
        </div>
        <div className={styles.heroScrim} />
        <div className={`wrap ${styles.heroContent}`}>
          <span className="eyebrow">{page?.heroEyebrow}</span>
          <h1 className={`display ${styles.heroClaim}`}>
            {heroTitleLines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </h1>
          <div className={styles.heroSub}>{page?.heroSubtitle}</div>
          <div className={styles.heroCta}>
            <Link href={page?.heroCtaHref ?? "/concierge-day"} className="btn btn-primary btn-lg">
              {page?.heroCtaLabel ?? "Design your day →"}
            </Link>
            <Link href={page?.heroSecondaryCtaHref ?? "#experiences"} className="btn btn-ghost btn-lg">
              {page?.heroSecondaryCtaLabel ?? "Explore experiences"}
            </Link>
          </div>
          <div className={styles.heroTrust}>
            <span className="stars">★ ★ ★ ★ ★</span> {page?.heroTrustLine}
          </div>
        </div>
        <div className={styles.scrollHint}>Scroll</div>
      </section>

      {/* TRUST STRIP */}
      <section className={styles.trustStrip}>
        <div className="wrap">
          <div className={styles.tsInner}>
            {(page?.trustItems ?? []).map((item, i) => (
              <div className={styles.tsItem} key={item}>
                {i > 0 && <span className={styles.tdot} />}
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSITIONING — text-only promise */}
      <section className={styles.posn}>
        <Reveal className={`wrap ${styles.posnGrid}`}>
          <div className={styles.posnHead}>
            <span className="eyebrow">{page?.positioningEyebrow}</span>
            <h2 className="display">
              {positioningTitleLines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <br />}
                  {line}
                </React.Fragment>
              ))}
            </h2>
          </div>
          <div className={styles.posnCopy}>
            {page?.positioningBadge && <span className={styles.posnKicker}>{page.positioningBadge}</span>}
            <p className="lead">{page?.positioningLead}</p>
            <Link href={page?.positioningLinkHref ?? "#how"} className={styles.linkArrow}>
              {page?.positioningLinkLabel}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* OFFERING */}
      <section id="offering" style={{ background: "var(--color-paper)" }}>
        <div className="wrap">
          <Reveal className="center" style={{ marginBottom: "2.2rem" }}>
            <span className="eyebrow">{page?.offeringEyebrow}</span>
            <h2 className="display">{page?.offeringTitle}</h2>
            <p
              className="lead"
              style={{ marginTop: ".7rem", maxWidth: "54ch", marginLeft: "auto", marginRight: "auto" }}
            >
              {page?.offeringLead}
            </p>
          </Reveal>
          <Reveal className={styles.offerGrid}>
            {(page?.offeringCards ?? []).map((card, i) => (
              <Link
                href={card.href}
                className={i === 0 ? `${styles.offer} ${styles.feature}` : styles.offer}
                key={card.title}
              >
                {card.tag && <span className={styles.offerTag}>{card.tag}</span>}
                <div className={styles.im}>
                  <Image src={card.image ?? ""} alt="" fill sizes="33vw" />
                </div>
                <div className={styles.bd}>
                  <div className={styles.k}>{card.kicker}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <div className={styles.offerFoot}>
                    {card.priceLabel && <span className={styles.price}>{card.priceLabel}</span>}
                    <span className={styles.go}>{card.ctaLabel}</span>
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* MOMENT */}
      <section className={styles.moment}>
        <Image src={page?.momentImage ?? ""} alt="" fill sizes="100vw" />
        <div className={styles.momentScrim} />
        <Reveal className={`wrap ${styles.momentIn}`}>
          <p>{page?.momentQuote}</p>
        </Reveal>
      </section>

      {/* EXPERIENCES / GALLERY */}
      <section id="experiences">
        <div className="wrap center" style={{ marginBottom: ".4rem" }}>
          <span className="eyebrow">{page?.galleryEyebrow}</span>
          <h2 className="display">{page?.galleryTitle}</h2>
          <p
            className="lead"
            style={{ marginTop: ".6rem", maxWidth: "60ch", marginLeft: "auto", marginRight: "auto" }}
          >
            {page?.galleryLead}
          </p>
        </div>
        <div className="wrap">
          <GalleryMosaic items={galleryItems} />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap-narrow center">
          <span className="eyebrow">{page?.howItWorksEyebrow}</span>
          <h2 className="display">{page?.howItWorksTitle}</h2>
          <div className="steps3">
            {(page?.howItWorksSteps ?? []).map((s, i) => (
              <div className="s3" key={s.title || i}>
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <h4>{s.title}</h4>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
          <div className="disclosure">{page?.disclosureText}</div>
        </Reveal>
      </section>

      {/* WHY */}
      <section id="about">
        <Reveal className="wrap center">
          <span className="eyebrow">{page?.whyEyebrow}</span>
          <h2 className="display">{page?.whyTitle}</h2>
          <div className={styles.whyGrid}>
            {(page?.whyItems ?? []).map((item) => (
              <div className={styles.whyI} key={item.title}>
                <div className="ic">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: "var(--color-paper)" }}>
        <Reveal className="wrap center">
          <span className="eyebrow">{page?.testimonialsEyebrow}</span>
          <h2 className="display">{page?.testimonialsTitle}</h2>
          <div className="tposts">
            {(page?.testimonials ?? []).map((t) => (
              <div className="tp" key={t.author}>
                <div className="st">★★★★★</div>
                <blockquote>&quot;{t.quote}&quot;</blockquote>
                <div className="who">— {t.author}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* VILLAS */}
      <section id="villas">
        <Reveal className={`wrap ${styles.villasGrid}`}>
          <div className={styles.villasMedia}>
            <Image src={page?.villasImage ?? ""} alt="" fill sizes="(max-width: 920px) 100vw, 55vw" />
          </div>
          <div>
            <span className="eyebrow">{page?.villasEyebrow}</span>
            <h2 className="display" style={{ margin: ".3rem 0 .8rem" }}>
              {page?.villasTitle}
            </h2>
            <p className="lead">{page?.villasLead}</p>
            <div style={{ marginTop: "1.6rem" }}>
              <Link href={page?.villasCtaHref ?? "/concierge-day"} className="btn btn-line">
                {page?.villasCtaLabel}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* INSIDER'S GUIDE */}
      <section id="guide" style={{ background: "var(--color-paper)" }}>
        <div className="wrap center" style={{ marginBottom: ".4rem" }}>
          <span className="eyebrow">{page?.guideEyebrow}</span>
          <h2 className="display">{page?.guideTitle}</h2>
        </div>
        <div className="wrap">
          <Reveal className={styles.blogGrid}>
            {(page?.guidePosts ?? []).map((post) => (
              <Link href={post.href} className={styles.post} key={post.title}>
                <div className={styles.postIm}>
                  <Image src={post.image ?? ""} alt="" fill sizes="33vw" />
                </div>
                <div className={styles.postBd}>
                  <div className={styles.postK}>{post.kicker}</div>
                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.final}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">{page?.finalEyebrow}</span>
          <h2 className="display">{page?.finalTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page?.finalLead}
          </p>
          <div style={{ marginTop: "1.8rem" }}>
            <Link href={page?.finalCtaHref ?? "/concierge-day"} className="btn btn-primary btn-lg">
              {page?.finalCtaLabel}
            </Link>
          </div>
        </Reveal>
      </section>

      <div className={styles.mobileBarSpacer}>
        <FullFooter columns={FOOTER_COLUMNS} />
      </div>

      {/* Mobile-only sticky action bar — thumb-reachable CTA for small screens */}
      <StickyBar
        name={page?.stickyBarPrice ?? "From €450"}
        meta={page?.stickyBarMeta ?? ""}
        ctaHref="/concierge-day"
        ctaLabel="Design your day →"
        revealOnScroll
        revealAfter={480}
        className={styles.mobileOnlyBar}
      />
    </>
  );
}
