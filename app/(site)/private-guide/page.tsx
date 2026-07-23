import type { Metadata } from "next";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import EnquiryForm from "@/components/EnquiryForm";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import { reader } from "@/lib/keystatic-reader";
import styles from "./PrivatePage.module.css";

async function getData() {
  return reader.singletons.privateGuidePage.read();
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getData();
  if (!page) return {};
  return {
    title: page.metaTitle || "Private Guide",
    description: page.metaDescription,
    alternates: { canonical: "/private-guide" },
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

export default async function PrivateGuidePage() {
  const page = await getData();
  if (!page) return null;

  return (
    <>
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

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

      {/* WHAT IS A CONSIGLIERE */}
      {page.consigliereTitle && (
        <section style={{ background: "var(--color-cream)", borderTop: "1px solid var(--color-cream-deep)", borderBottom: "1px solid var(--color-cream-deep)" }}>
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">{page.consigliereEyebrow}</span>
              <h2 className="display">{page.consigliereTitle}</h2>
              {page.consigliereLead && (
                <p
                  className="lead"
                  style={{ marginTop: ".7rem", maxWidth: "64ch", marginLeft: "auto", marginRight: "auto" }}
                >
                  {page.consigliereLead}
                </p>
              )}
            </div>
            {page.consiglierePoints.length > 0 && (
              <Reveal className={styles.pillars}>
                {page.consiglierePoints.map((p, i) => (
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
      )}

      {/* MOMENT — breaks up the text between the consigliere definition and the comparison */}
      {page.momentQuote && (
        <section className={styles.moment}>
          {page.momentImage && <Image src={page.momentImage} alt="" fill sizes="100vw" />}
          <div className={styles.momentScrim} />
          <Reveal className={`wrap ${styles.momentIn}`}>
            <p>{page.momentQuote}</p>
          </Reveal>
        </section>
      )}

      {/* CONTRAST */}
      <section>
        <div className="wrap">
          <div className="center">
            <span className="eyebrow">{page.contrastEyebrow}</span>
            <h2 className="display">{page.contrastTitle}</h2>
            {page.contrastLead && (
              <p className="lead" style={{ marginTop: ".6rem", maxWidth: "56ch", marginLeft: "auto", marginRight: "auto" }}>
                {page.contrastLead}
              </p>
            )}
          </div>
          <Reveal className={styles.cmp}>
            <div className={`${styles.col} ${styles.bad}`}>
              <h4>{page.agencyTitle}</h4>
              <ul>
                {page.agencyItems.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className={`${styles.col} ${styles.good}`}>
              <h4>{page.hostTitle}</h4>
              <ul>
                {page.hostItems.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOSTS */}
      {page.hosts.length > 0 && (
        <section style={{ background: "var(--color-paper)", borderTop: "1px solid var(--color-cream-deep)", borderBottom: "1px solid var(--color-cream-deep)" }}>
          <div className="wrap">
            <div className="center">
              <span className="eyebrow">{page.hostsEyebrow}</span>
              <h2 className="display">{page.hostsTitle}</h2>
              {page.hostsLead && <p className="lead" style={{ marginTop: ".6rem" }}>{page.hostsLead}</p>}
            </div>
            <Reveal className={styles.hosts}>
              {page.hosts.map((h) => (
                <div className={styles.host} key={h.name}>
                  <div className={styles.hostImg}>
                    <Image src={h.image ?? ""} alt={h.name} fill sizes="(max-width: 640px) 100vw, 320px" />
                  </div>
                  <div className={styles.hostBody}>
                    <h4>{h.name}</h4>
                    <div className={styles.hostRole}>{h.role}</div>
                    <p>{h.bio}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
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
              Prefer to build and see prices yourself first?{" "}
              <Link href="/concierge-day" style={{ color: "var(--color-gold-deep)", borderBottom: "1px solid var(--color-gold-soft)" }}>
                Design your day →
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
              Request your host →
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
