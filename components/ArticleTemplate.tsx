import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Markdoc, { Tag, type Node, type RenderableTreeNode } from "@markdoc/markdoc";
import Faq from "./Faq";
import InlineCta from "./InlineCta";
import AuthorBox from "./AuthorBox";
import StickyBar from "./StickyBar";
import ReadingProgress from "./ReadingProgress";
import ArticleToc, { type TocItem } from "./ArticleToc";
import ArticleVisit, { type ArticleVisitInfo } from "./ArticleVisit";
import { SLUG_TO_FEATURES, SLUG_TO_CLIP } from "@/lib/experience-cards";
import ArticleFilmCard from "./ArticleFilmCard";
import ArticleImage from "./ArticleImage";
import DayHoldSlideshow from "./DayHoldSlideshow";
import type { ExperienceCardData } from "./ExperienceGrid";
import TagChips from "./TagChips";
import type { ArticleTag } from "@/lib/article-tags";
import styles from "./ArticleTemplate.module.css";

export type ArticleFaq = { question: string; answer: string };
export type ArticleSource = { label: string; url: string };
/** An experience offered at the end ("Stand in it, don't just read about it"). */
export type ArticleRelatedExperience = { href: string; src: string; title: string; place?: string; hook: string };
/** Another article, for "Keep reading". */
export type ArticleMore = { href: string; title: string; excerpt?: string; image?: string; label?: string };

// Body photos go through next/image (sized, lazy, modern formats).
const MARKDOC_CONFIG = {
  nodes: {
    image: {
      render: "ArticleImage",
      attributes: { src: { type: String }, alt: { type: String }, title: { type: String } },
    },
  },
};
/** The booking card in the sticky sidebar (and the CTA halfway down). */
export type ArticleBookCard = {
  title?: string;
  text?: string;
  href?: string;
  ctaLabel?: string;
  /** A photo from the matching experience; defaults to the hero image. */
  image?: string;
  /** Small line over the title, e.g. "Medinet Habu · Luxor's West Bank". */
  kicker?: string;
  /** The experience's slug, for its selling-point chips. */
  experience?: string;
};

const BOOK_DEFAULTS = {
  title: "Have the day arranged for you",
  text: "Every place in this guide, timed for the quiet hour and handled on the ground by someone who lives here.",
  href: "/concierge-day#design",
  ctaLabel: "Design your day →",
};

const textOf = (n: RenderableTreeNode): string =>
  typeof n === "string" ? n : Tag.isTag(n) ? n.children.map(textOf).join("") : "";
const slugify = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

export type ArticleTemplateProps = {
  breadcrumbLabel: string;
  breadcrumbHref: string;
  title: string;
  excerpt: string;
  categoryLabel?: string;
  readingTime: string;
  authorName: string;
  authorBio?: string;
  /** A short byline line under the headline; the full bio is kept for the author box. */
  authorTagline?: string;
  authorRole?: string;
  authorImage?: string;
  /** Public profiles (e.g. LinkedIn), offered as a way to connect. */
  authorSameAs?: string[];
  /** e.g. "Published 6 November 2026" — shown next to the updated date when different. */
  publishedLabel?: string;
  updatedLabel?: string;
  factCheckedBy?: string;
  heroImage?: string;
  /** Full-width photo gallery under the headline; replaces the hero image. */
  gallery?: { src: string; alt: string }[];
  keyTakeaways?: string[];
  bookCard?: ArticleBookCard;
  /** "From €… / day" on the booking card — the Design Your Day entry price. */
  fromPrice?: number;
  /** The "Plan your visit" infographic, placed before "How to …". */
  visit?: ArticleVisitInfo;
  faqs?: ArticleFaq[];
  sources?: ArticleSource[];
  relatedExperiences?: ArticleRelatedExperience[];
  /** The Design Your Day gallery cards, the article's experiences first. */
  dayCards?: ExperienceCardData[];
  /** The booking card's experience, offered as a second, smaller card. */
  bookExperience?: { href: string; name: string; image?: string };
  /** #hashtags, each linking to every article with that tag. */
  tags?: ArticleTag[];
  moreArticles?: ArticleMore[];
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
  authorTagline,
  authorRole,
  authorImage,
  authorSameAs,
  publishedLabel,
  updatedLabel,
  factCheckedBy,
  heroImage,
  gallery,
  keyTakeaways,
  bookCard,
  fromPrice,
  visit,
  faqs,
  sources,
  dayCards,
  bookExperience,
  moreArticles,
  tags,
  contentNode,
}: ArticleTemplateProps) {
  const transformed = Markdoc.transform(contentNode, MARKDOC_CONFIG);
  const mdComponents = { components: { ArticleImage } };
  // Give every ## heading an id, for the sticky "On this page" list.
  const blocks: RenderableTreeNode[] = Tag.isTag(transformed) ? transformed.children : [transformed];
  const toc: TocItem[] = [];
  const used = new Set<string>();
  blocks.forEach((b) => {
    if (Tag.isTag(b) && b.name === "h2") {
      const label = textOf(b).trim();
      let id = slugify(label) || "section";
      while (used.has(id)) id += "-2";
      used.add(id);
      b.attributes.id = id;
      toc.push({ id, label });
    }
  });
  // The booking CTA sits halfway down, before the middle ## heading.
  const h2Idx = blocks.flatMap((b, i) => (Tag.isTag(b) && b.name === "h2" ? [i] : []));
  const split = h2Idx.length >= 4 ? h2Idx[Math.floor(h2Idx.length / 2)] : blocks.length;
  const book = {
    title: bookCard?.title || BOOK_DEFAULTS.title,
    text: bookCard?.text || BOOK_DEFAULTS.text,
    href: bookCard?.href || BOOK_DEFAULTS.href,
    ctaLabel: bookCard?.ctaLabel || BOOK_DEFAULTS.ctaLabel,
    image: bookCard?.image || heroImage,
    kicker: bookCard?.kicker || "",
    feats: (bookCard?.experience && SLUG_TO_FEATURES[bookCard.experience]) || [],
    clip: bookCard?.experience ? SLUG_TO_CLIP[bookCard.experience] : undefined,
  };
  // The visit infographic sits just before the "How to …" section (or at the end).
  const hasVisit = Boolean(visit && (visit.where || visit.hours || visit.ticket || visit.plan === "medinet-habu"));
  const howIdx = blocks.findIndex(
    (b) => Tag.isTag(b) && b.name === "h2" && /^how-to/.test(String(b.attributes.id ?? "")),
  );
  const visitAt = hasVisit ? (howIdx >= 0 ? howIdx : blocks.length) : -1;
  // Body pieces between the inserts, rendered in order.
  const cuts = [...new Set([0, split, visitAt, blocks.length].filter((n) => n >= 0))].sort((a, b) => a - b);
  const initial = authorName.trim().charAt(0).toUpperCase();
  const takeaways = (keyTakeaways ?? []).filter((t) => t && t.trim());
  const faqItems = (faqs ?? []).filter((f) => f.question && f.answer);
  const sourceItems = (sources ?? []).filter((s) => s.label && s.url);
  const photos = (gallery ?? []).filter((g) => g.src).slice(0, 5);
  // With a hero photo (and no gallery), the short version sits in its dark band.
  const heroBand = Boolean(heroImage) && photos.length === 0;
  const takeawayBox =
    takeaways.length > 0 ? (
      <div className={styles.takeaway}>
        <h4>
          <span>In brief</span>
        </h4>
        <ul>
          {takeaways.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <div className="wrap">
      <ReadingProgress />
      <nav className={styles.crumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={breadcrumbHref}>{breadcrumbLabel}</Link>
        <span className={styles.crumbHere}>/</span>
        <em className={styles.crumbHere} aria-current="page">
          {title}
        </em>
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
          {authorImage ? <Image src={authorImage} alt="" fill sizes="52px" /> : initial}
        </div>
        <div className={styles.bylineT}>
          <b>
            {authorName}
            {authorRole && <em className={styles.bylineRole}>{authorRole}</em>}
          </b>
          {(authorTagline || authorBio) && <span>{authorTagline || authorBio}</span>}
        </div>
        <div className={styles.bylineMeta}>
          {factCheckedBy && (
            <span className={styles.verified}>
              <span className={styles.check}>✓</span>
              {factCheckedBy}
            </span>
          )}
          {sourceItems.length > 0 && (
            <a href="#sources" className={styles.bylineSources}>
              {sourceItems.length} sources, listed at the end ↓
            </a>
          )}
          <span>
            {[publishedLabel, updatedLabel].filter(Boolean).join(" · ")}
          </span>
        </div>
      </div>

      {photos.length > 0 ? (
        <section
          className={`${styles.gallery} ${styles[`gallery${photos.length}`] ?? ""}`}
          aria-label="Photo gallery"
        >
          {photos.map((p, i) => (
            <figure key={p.src} className={styles.galleryItem}>
              <Image
                src={p.src}
                alt={p.alt}
                fill
                priority={i === 0}
                sizes={i === 0 ? "(max-width: 760px) 86vw, 50vw" : "(max-width: 760px) 86vw, 25vw"}
              />
            </figure>
          ))}
        </section>
      ) : heroBand && (
        <section className={styles.heroBand}>
          <div className={styles.heroBg}>
            <Image src={heroImage!} alt={title} fill priority sizes="100vw" />
          </div>
          <div className={`wrap ${styles.heroInner}`}>{takeawayBox}</div>
        </section>
      )}

      <div className={styles.cols}>
        <div className={styles.main}>
      {!heroBand && takeawayBox}

      <article className={styles.body}>
        {cuts.slice(0, -1).map((from, i) => (
          <React.Fragment key={from}>
            {from === split && from < blocks.length && (
              <div className={styles.midCta}>
                <InlineCta
                  eyebrow="Do it properly"
                  title={book.title}
                  body={book.text}
                  ctaLabel={book.ctaLabel}
                  ctaHref={book.href}
                />
              </div>
            )}
            {from === visitAt && visit && <ArticleVisit info={visit} />}
            {Markdoc.renderers.react(blocks.slice(from, cuts[i + 1]), React, mdComponents)}
          </React.Fragment>
        ))}
        {visitAt === blocks.length && visit && <ArticleVisit info={visit} />}
      </article>

      {tags && tags.length > 0 && (
        <div className={styles.endTags}>
          <TagChips tags={tags} label="Filed under" />
        </div>
      )}

      <div className={styles.cta}>
        <InlineCta
          eyebrow="The day this describes"
          title="We arrange it, you simply arrive"
          body="Every place in this guide, timed against the crowds and handled on the ground by someone who lives here. Private, from dawn, nothing for you to organise."
          ctaLabel="Design your day →"
          ctaHref="/concierge-day"
        />
      </div>
        </div>

        <aside className={styles.side}>
          <div className={styles.bookcard}>
            <ArticleFilmCard
              href={book.href}
              image={book.image}
              kicker={book.kicker}
              title={book.title}
              feats={book.feats}
              clip={book.clip?.src}
              clipPoster={book.clip?.poster}
            />
            <div className={styles.bookcardBody}>
              <p className={styles.bcText}>{book.text}</p>
              {fromPrice ? (
                <div className={styles.bcPrice}>
                  <small>From</small> <b>€{fromPrice}</b> <i>/ day, private</i>
                </div>
              ) : null}
              <Link href={book.href} className="btn btn-primary" style={{ width: "100%" }}>
                {book.ctaLabel}
              </Link>
              <p className={styles.bcTrust}>Door-to-door transfer included · free cancellation up to 7 days before</p>
            </div>
          </div>
          {bookExperience && (
            <Link href={bookExperience.href} className={styles.expMini}>
              {bookExperience.image && (
                <span className={styles.expMiniIm}>
                  <Image src={bookExperience.image} alt="" fill sizes="84px" />
                </span>
              )}
              <span className={styles.expMiniTx}>
                <span className={styles.expMiniEyebrow}>The experience</span>
                <b>{bookExperience.name}</b>
                <span className={styles.expMiniGo}>See the experience →</span>
              </span>
            </Link>
          )}
          {toc.length > 2 && <ArticleToc items={toc} />}
        </aside>
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
        <section className={styles.sources} id="sources">
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
          role={authorRole}
          image={authorImage}
          bio={authorBio}
          href={breadcrumbHref}
          ctaLabel="More from the guide →"
          sameAs={authorSameAs}
          bookHref={book.href}
        />
      )}

      {dayCards && dayCards.length > 0 && (
        <div className={styles.relBand}>
          <DayHoldSlideshow
            cards={dayCards}
            eyebrow="From the page to the place"
            title="Stand in it, don't just read about it"
            lead={`Every experience in this guide, private and timed for the quiet hour, in a day shaped around you. From €${fromPrice ?? 330} a day, door-to-door transfer included.`}
          />
        </div>
      )}

      {moreArticles && moreArticles.length > 0 && (
        <section className={styles.more}>
          <h3>Keep reading</h3>
          <div className={styles.moreGrid}>
            {moreArticles.map((a) => (
              <Link key={a.href} href={a.href} className={styles.moreCard}>
                {a.image && (
                  <span className={styles.moreIm}>
                    <Image src={a.image} alt="" fill sizes="(max-width: 760px) 100vw, 360px" />
                  </span>
                )}
                <span className={styles.moreTx}>
                  {a.label && <span className={styles.moreLabel}>{a.label}</span>}
                  <b>{a.title}</b>
                  {a.excerpt && <span className={styles.moreEx}>{a.excerpt}</span>}
                </span>
              </Link>
            ))}
          </div>
        </section>
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
