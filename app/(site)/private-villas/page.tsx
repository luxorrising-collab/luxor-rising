import type { Metadata } from "next";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import EnquiryForm from "@/components/EnquiryForm";
import GalleryMosaic from "@/components/GalleryMosaic";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import { reader } from "@/lib/keystatic-reader";
import styles from "./VillasPage.module.css";

async function getData() {
  return reader.singletons.privateVillasPage.read();
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getData();
  if (!page) return {};
  return {
    title: page.metaTitle || "Private Villas",
    description: page.metaDescription,
    alternates: { canonical: "/private-villas" },
  };
}

function multiline(text: string) {
  return text.split("\n").map((line, i) => (
    <React.Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </React.Fragment>
  ));
}

export default async function PrivateVillasPage() {
  const page = await getData();
  if (!page) return null;

  return (
    <>
      <Nav scrollAware={false} ctaHref="#request" ctaLabel="Request availability" />

      {/* HERO */}
      <header className={styles.hero}>
        {page.heroImage && (
          <div className={styles.heroBg}>
            <Image src={page.heroImage} alt="" fill priority sizes="100vw" />
          </div>
        )}
        <div className={styles.heroScrim} />
        <Reveal className={`wrap ${styles.heroIn}`}>
          <span className="eyebrow">{page.heroEyebrow}</span>
          <h1 className="display">{multiline(page.heroTitle)}</h1>
          <p className="lead" style={{ maxWidth: "58ch", margin: "1rem auto 0" }}>
            {page.heroLead}
          </p>
          <div className={styles.rule} />
          <Link href="#request" className="btn btn-primary btn-lg">
            {page.heroCtaLabel}
          </Link>
        </Reveal>
      </header>

      {/* TRUST */}
      {page.trustItems.length > 0 && (
        <div className={styles.trust}>
          <div className={`wrap ${styles.trustIn}`}>
            {page.trustItems.map((item, i) => (
              <div className={styles.trustItem} key={item}>
                {i > 0 && <span className={styles.tdot} />}
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOW WE CHOOSE */}
      <section className={styles.intro}>
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">{page.introEyebrow}</span>
            <h2 className="display">{page.introTitle}</h2>
            {page.introLead && (
              <p
                className="lead"
                style={{ marginTop: ".7rem", maxWidth: "64ch", marginLeft: "auto", marginRight: "auto" }}
              >
                {page.introLead}
              </p>
            )}
          </div>
          {page.vibePoints.length > 0 && (
            <Reveal className={styles.pillars}>
              {page.vibePoints.map((p, i) => (
                <div className={styles.pillar} key={p.title || i}>
                  <div className={styles.pillarIcon} aria-hidden>
                    {["✦", "❖", "◆"][i % 3]}
                  </div>
                  <h4>{p.title}</h4>
                  <p>{p.description}</p>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      {/* PLACES — Hurghada & Luxor */}
      {page.places.length > 0 && (
        <section>
          <div className="wrap">
            <div className="center" style={{ marginBottom: "2.4rem" }}>
              <span className="eyebrow">{page.placesEyebrow}</span>
              <h2 className="display">{page.placesTitle}</h2>
            </div>
            {page.places.map((place, i) => (
              <Reveal
                className={`${styles.place} ${i % 2 === 1 ? styles.rev : ""}`}
                key={place.title || i}
              >
                <div className={styles.placeMedia}>
                  {place.image && <Image src={place.image} alt={place.title} fill sizes="(max-width: 900px) 100vw, 50vw" />}
                </div>
                <div className={styles.placeBody}>
                  <span className="eyebrow">{place.eyebrow}</span>
                  <h3>{place.title}</h3>
                  <p>{place.description}</p>
                  {place.points.length > 0 && (
                    <ul className={styles.placePoints}>
                      {place.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* FEATURES */}
      {page.features.length > 0 && (
        <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-cream-deep)", borderBottom: "1px solid var(--color-cream-deep)" }}>
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">{page.featuresEyebrow}</span>
              <h2 className="display">{page.featuresTitle}</h2>
            </div>
            <Reveal className={styles.features}>
              {page.features.map((f, i) => (
                <div className={styles.feature} key={f.title || i}>
                  <div className={styles.featIcon} aria-hidden>
                    {f.icon}
                  </div>
                  <h4>{f.title}</h4>
                  <p>{f.description}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* RETREAT BAND */}
      {page.retreatTitle && (
        <section className={styles.retreat}>
          {page.retreatImage && <Image src={page.retreatImage} alt="" fill sizes="100vw" />}
          <div className={styles.retreatScrim} />
          <Reveal className={`wrap ${styles.retreatIn}`}>
            <span className="eyebrow">{page.retreatEyebrow}</span>
            <h2 className="display">{page.retreatTitle}</h2>
            <p>{page.retreatLead}</p>
          </Reveal>
        </section>
      )}

      {/* GALLERY */}
      {page.gallery.length > 0 && (
        <section>
          <div className="wrap center" style={{ marginBottom: ".4rem" }}>
            <span className="eyebrow">{page.galleryEyebrow}</span>
            <h2 className="display">{page.galleryTitle}</h2>
          </div>
          <div className="wrap">
            <GalleryMosaic
              items={page.gallery.map((g) => ({ image: g.image ?? "", caption: g.caption }))}
            />
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      {page.steps.length > 0 && (
        <section style={{ background: "var(--color-paper)" }}>
          <Reveal className="wrap-narrow center">
            <span className="eyebrow">{page.stepsEyebrow}</span>
            <h2 className="display">{page.stepsTitle}</h2>
            <div className="steps3">
              {page.steps.map((s, i) => (
                <div className="s3" key={s.title || i}>
                  <div className="num">{String(i + 1).padStart(2, "0")}</div>
                  <h4>{s.title}</h4>
                  <p>{s.description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* FORM */}
      <section id="request">
        <Reveal className={`wrap ${styles.split}`}>
          <div>
            <span className="eyebrow">{page.formEyebrow}</span>
            <h2 className="display" style={{ margin: ".3rem 0 1rem" }}>
              {page.formTitle}
            </h2>
            <p style={{ color: "var(--color-muted)" }}>{page.formLead}</p>
            <p style={{ fontSize: ".88rem", marginTop: "1rem" }}>
              Want the days arranged too?{" "}
              <Link href="/private-guide" style={{ color: "var(--color-gold-deep)", borderBottom: "1px solid var(--color-gold-soft)" }}>
                Meet your consigliere →
              </Link>
            </p>
          </div>
          <EnquiryForm note={page.formNote} />
        </Reveal>
      </section>

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">{page.closerEyebrow}</span>
          <h2 className="display">{page.closerTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page.closerText}
          </p>
          <div style={{ marginTop: "1.8rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="#request" className="btn btn-primary btn-lg">
              Request availability →
            </Link>
            <Link href="/concierge-day" className="btn btn-line btn-lg">
              Design your day
            </Link>
          </div>
        </Reveal>
      </section>

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
