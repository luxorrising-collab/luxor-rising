import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Markdoc, { type Node } from "@markdoc/markdoc";
import styles from "./ArticleTemplate.module.css";

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
  heroImage?: string;
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
  heroImage,
  contentNode,
}: ArticleTemplateProps) {
  const transformed = Markdoc.transform(contentNode);
  const initial = authorName.trim().charAt(0).toUpperCase();

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
        {updatedLabel && <div className={styles.bylineMeta}>{updatedLabel}</div>}
      </div>

      {heroImage && (
        <figure className={styles.heroImg}>
          <Image src={heroImage} alt={title} fill priority sizes="(max-width: 780px) 100vw, 780px" />
        </figure>
      )}

      <article className={styles.body}>{Markdoc.renderers.react(transformed, React, {})}</article>
    </div>
  );
}
