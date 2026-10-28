import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Markdoc, { type Node } from "@markdoc/markdoc";
import Faq from "./Faq";
import InlineCta from "./InlineCta";
import AuthorBox from "./AuthorBox";
import StickyBar from "./StickyBar";
import styles from "./ArticleTemplate.module.css";

export type ArticleFaq = { question: string; answer: string };
export type ArticleSource = { label: string; url: string };

export type ArticleTemplateProps = {
  breadcrumbLabel: string;
  breadcrumbHref: string;
  title: string;
  excerpt: string;
  categoryLabel?: string;
  readingTime: string;
  authorName: string;
  authorBio?: string;
  updatedLabel?: string;
  factCheckedBy?: string;
  heroImage?: string;
  keyTakeaways?: string[];
  faqs?: ArticleFaq[];
  sources?: ArticleSource[];
  contentNode: Node;
};

export default function ArticleTemplate({
  breadcrumbLabel,
  breadcrumbHref,
  title,
  excerpt,
  categoryLabel,
  readingTime,
  authorName,
  authorBio,
  updatedLabel,
  factCheckedBy,
  heroImage,
  keyTakeaways,
  faqs,
  sources,
  contentNode,
}: ArticleTemplateProps) {
  const transformed = Markdoc.transform(contentNode);
  const initial = authorName.trim().charAt(0).toUpperCase();
  const takeaways = (keyTakeaways ?? []).filter((t) => t && t.trim());
  const faqItems = (faqs ?? []).filter((f) => f.question && f.answer);
  const sourceItems = (sources ?? []).filter((s) => s.label && s.url);

  return (
    <div className="wrap">
      <nav className={styles.crumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={breadcrumbHref}>{breadcrumbLabel}</Link>
        <span>/</span>
        {title}
      </nav>

      <header className={styles.head}>
        <div className={styles.kicker}>
          {[categoryLabel, readingTime].filter(Boolean).join(" · ")}
        </div>
        <h1 className="display">{title}</h1>
        {excerpt && <p className={styles.standfirst}>{excerpt}</p>}
      </header>

      <div className={styles.byline}>
        <div className={styles.bylineAvatar} aria-hidden="true">
          {initial}
        </div>
        <div className={styles.bylineT}>
          <b>{authorName}</b>
          {authorBio && <span>{authorBio}</span>}
        </div>
        <div className={styles.bylineMeta}>
          {factCheckedBy && (
            <span className={styles.verified}>
              <span className={styles.check}>✓</span>
              {factCheckedBy}
            </span>
          )}
          {updatedLabel && <span>{updatedLabel}</span>}
        </div>
      </div>

      {heroImage && (
        <figure className={styles.heroImg}>
          <Image src={heroImage} alt={title} fill priority sizes="(max-width: 780px) 100vw, 780px" />
        </figure>
      )}

      {takeaways.length > 0 && (
        <div className={styles.takeaway}>
          <h4>The short version</h4>
          <ul>
            {takeaways.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <article className={styles.body}>{Markdoc.renderers.react(transformed, React, {})}</article>

      <div className={styles.cta}>
        <InlineCta
          eyebrow="The day this describes"
          title="We arrange it, you simply arrive"
          body="Every place in this guide, timed against the crowds and handled on the ground by someone who lives here. Private, from dawn, nothing for you to organise."
          ctaLabel="Design your day →"
          ctaHref="/concierge-day"
        />
      </div>

      {faqItems.length > 0 && (
        <section className={styles.faqSection}>
          <h2 className="display" id="faq">
            Questions we get asked
          </h2>
          <Faq items={faqItems.map((f) => ({ q: f.question, a: f.answer }))} />
        </section>
      )}

      {sourceItems.length > 0 && (
        <section className={styles.sources}>
          <h3>Sources &amp; how we checked</h3>
          <ul>
            {sourceItems.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="nofollow noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {authorBio && (
        <AuthorBox
          name={authorName}
          bio={authorBio}
          href={breadcrumbHref}
          ctaLabel="More from the guide →"
        />
      )}

      <StickyBar
        name="Design your day"
        meta="private · from dawn · free cancellation up to 7 days before"
        ctaHref="/concierge-day"
        ctaLabel="Start →"
        revealOnScroll
        revealAfter={700}
      />
    </div>
  );
}
