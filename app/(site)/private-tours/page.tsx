import type { Metadata } from "next";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import { reader } from "@/lib/keystatic-reader";
import styles from "../private-guide/PrivatePage.module.css";

async function getData() {
  return reader.singletons.privateToursPage.read();
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getData();
  if (!page) return {};
  return {
    title: page.metaTitle || "Private Tours of Egypt",
    description: page.metaDescription,
    alternates: { canonical: "/private-tours" },
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

export default async function PrivateToursPage() {
  const page = await getData();
  if (!page) return null;

  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

      {/* HERO */}
      <header className={styles.hero}>
        <Reveal className={`wrap ${styles.heroIn}`}>
          <span className="eyebrow">{page.heroEyebrow}</span>
          <h1 className="display">{multiline(page.heroTitle)}</h1>
          <p className="lead" style={{ maxWidth: "60ch", margin: "1rem auto 0" }}>
            {page.heroLead}
          </p>
          <div className={styles.rule} />
          <Link href={page.heroCtaHref} className="btn btn-primary btn-lg">
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

      {/* CONTRAST */}
      <section>
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">{page.contrastEyebrow}</span>
            <h2 className="display">{page.contrastTitle}</h2>
          </div>
          <Reveal className={styles.cmp}>
            <div className={`${styles.col} ${styles.bad}`}>
              <h4>{page.badTitle}</h4>
              <ul>
                {page.badItems.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.col} ${styles.good}`}>
              <h4>{page.goodTitle}</h4>
              <ul>
                {page.goodItems.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* EXAMPLE TOURS */}
      {page.tours.length > 0 && (
        <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-cream-deep)", borderBottom: "1px solid var(--color-cream-deep)" }}>
          <div className="wrap">
            <div className="center" style={{ marginBottom: "2.2rem" }}>
              <span className="eyebrow">{page.toursEyebrow}</span>
              <h2 className="display">{page.toursTitle}</h2>
              {page.toursLead && <p className="lead" style={{ marginTop: ".6rem" }}>{page.toursLead}</p>}
            </div>
            {page.tours.map((t, i) => (
              <Reveal className={`${styles.tourSplit} ${i % 2 === 1 ? styles.rev : ""}`} key={t.title}>
                <div className={styles.tourMedia}>
                  <Image src={t.image ?? ""} alt={t.title} fill sizes="(max-width: 820px) 100vw, 50vw" />
                </div>
                <div>
                  <span className="eyebrow">{t.eyebrow}</span>
                  <h3 className="display" style={{ fontSize: "1.8rem", margin: ".3rem 0 .8rem" }}>
                    {t.title}
                  </h3>
                  <p style={{ color: "var(--color-muted)" }}>{t.body}</p>
                  <div className={styles.tourPrice}>
                    <b>{t.priceValue}</b> <small>{t.priceNote}</small>
                    <Link href={t.ctaHref} className="btn btn-primary" style={{ marginLeft: "auto" }}>
                      {t.ctaLabel}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* VALUE */}
      {page.valueRows.length > 0 && (
        <section>
          <Reveal className="wrap-narrow center">
            <span className="eyebrow">{page.valueEyebrow}</span>
            <h2 className="display">{page.valueTitle}</h2>
            <div className={styles.stack}>
              {page.valueRows.map((r) => (
                <div className={styles.stackRow} key={r.label}>
                  <span>{r.label}</span>
                  <span className="v">{r.price}</span>
                </div>
              ))}
              <div className={`${styles.stackRow} ${styles.fin}`}>
                <span>{page.valueFinalLabel}</span>
                <span className="v">{page.valueFinalPrice}</span>
              </div>
            </div>
            <p className="muted" style={{ fontSize: ".78rem", marginTop: "1rem" }}>
              Values illustrative — final price is shown in the builder before you pay.
            </p>
          </Reveal>
        </section>
      )}

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">{page.closerEyebrow}</span>
          <h2 className="display">{page.closerTitle}</h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page.closerText}
          </p>
          <div style={{ marginTop: "1.8rem", display: "flex", gap: ".8rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={page.closerCtaHref} className="btn btn-primary btn-lg">
              {page.closerCtaLabel}
            </Link>
            <Link href="/private-guide" className="btn btn-line btn-lg">
              Or meet your host first
            </Link>
          </div>
        </Reveal>
      </section>

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
