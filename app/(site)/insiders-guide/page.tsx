import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import ArticleCard from "@/components/ArticleCard";
import NewsletterForm from "@/components/NewsletterForm";
import { reader } from "@/lib/keystatic-reader";
import { ARTICLE_CATEGORY_LABELS, ARTICLE_AUTHORS } from "@/lib/article-labels";
import GuideClient, { type CmsArticlePost } from "./GuideClient";
import styles from "./InsidersGuidePage.module.css";

export const metadata: Metadata = {
  title: "The Insider's Guide to Luxor — written by the people who live it",
  description:
    "Honest, specific guidance on Luxor: which tombs are worth it, when to go, what the guidebooks get wrong. Written by our consigliere in Luxor and a licensed Egyptologist.",
  alternates: { canonical: "/insiders-guide" },
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    title: "The Insider's Guide to Luxor",
    description: "Which tombs are worth it, when to go, what the guidebooks get wrong — from people who live there.",
    url: "/insiders-guide",
  },
};

// The other two entries here are placeholder posts with no page behind them
// yet (same as before this migration) — only the first, CMS-backed article
// is built dynamically below.
const PLACEHOLDER_BLOG_POSTS = [
  {
    "@type": "BlogPosting",
    headline: "The best month to come — and the one everyone gets wrong",
    author: { "@type": "Person", name: "Ahmed" },
    datePublished: "2026-06-18",
  },
  {
    "@type": "BlogPosting",
    headline: "Why Medinet Habu is the temple nobody tells you about",
    author: { "@type": "Person", name: "Dr. Nour" },
    datePublished: "2026-06-04",
  },
];

export default async function InsidersGuidePage() {
  const [allArticles, page] = await Promise.all([
    reader.collections.articles.all(),
    reader.singletons.insidersGuidePage.read(),
  ]);
  const featured = [...allArticles].sort((a, b) =>
    (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? "")
  )[0];
  const featuredAuthor = featured ? ARTICLE_AUTHORS[featured.entry.author]?.name ?? featured.entry.author : "Ahmed";
  const featuredCategoryLabel = featured
    ? ARTICLE_CATEGORY_LABELS[featured.entry.category] ?? featured.entry.category
    : undefined;

  // Every other CMS article (i.e. everything besides the one shown as
  // "Featured" above) is shown alongside the curated placeholder posts in
  // the grid below — new articles created in Keystatic land here
  // automatically.
  const cmsPosts: CmsArticlePost[] = allArticles
    .filter((a) => a.slug !== featured?.slug && a.entry.title)
    .map(({ slug, entry }) => ({
      cat: entry.category,
      href: `/insiders-guide/${slug}`,
      src: entry.heroImage || "/images/valley-kings-tomb-pillar.jpg",
      alt: entry.title,
      title: entry.title,
      excerpt: entry.excerpt,
      authorName: ARTICLE_AUTHORS[entry.author]?.name ?? entry.author,
      readTime: entry.readingTime,
    }));

  const JSON_LD = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "The Insider's Guide to Luxor",
    description: "Honest, specific guidance on Luxor from local experts and licensed Egyptologists.",
    publisher: { "@type": "Organization", name: "Luxor Rising" },
    blogPost: [
      ...(featured
        ? [
            {
              "@type": "BlogPosting",
              headline: featured.entry.title,
              author: { "@type": "Person", name: featuredAuthor },
              datePublished: featured.entry.publishedAt,
              url: `https://luxorrising.com/insiders-guide/${featured.slug}`,
            },
          ]
        : []),
      ...PLACEHOLDER_BLOG_POSTS,
    ],
  };

  return (
    <>
      <JsonLd data={JSON_LD} />
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

      {/* HERO */}
      <header className={styles.hero}>
        <Reveal className="wrap">
          <span className="eyebrow">{page?.heroEyebrow}</span>
          <h1 className="display" style={{ margin: ".3rem 0 1.2rem" }}>
            {page?.heroTitleLine1}
            <br />
            over <em>{page?.heroTitleEmphasis}</em>
          </h1>
          <p>{page?.heroLead}</p>
        </Reveal>
      </header>

      {/* AUTHORITY */}
      <div className={styles.auth}>
        <div className={`wrap ${styles.authIn}`}>
          {(page?.authors ?? []).map((author) => (
            <div className={styles.who} key={author.name}>
              <div className={styles.av} aria-hidden="true">
                {author.initial}
              </div>
              <div className={styles.whoT}>
                <b>{author.name}</b>
                <span>{author.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="wrap">
        {/* FEATURED */}
        {featured && (
          <Reveal className={styles.feat}>
            <ArticleCard
              featured
              href={`/insiders-guide/${featured.slug}`}
              src={featured.entry.heroImage ?? ""}
              alt={featured.entry.title}
              category={featuredCategoryLabel}
              readTime={featured.entry.readingTime ?? ""}
              updated={
                featured.entry.publishedAt
                  ? `Updated ${new Date(featured.entry.publishedAt).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}`
                  : undefined
              }
              title={featured.entry.title}
              excerpt={featured.entry.excerpt ?? ""}
              authorName={featuredAuthor}
            />
          </Reveal>
        )}

        <GuideClient cmsPosts={cmsPosts} />
      </main>

      {/* NEWSLETTER */}
      <section className={styles.news}>
        <div className={styles.newsIn}>
          <span className="eyebrow">{page?.newsletterEyebrow}</span>
          <h2 className="display">
            {page?.newsletterTitleLine1}
            <br />
            {page?.newsletterTitleLine2}
          </h2>
          <p>{page?.newsletterLead}</p>
          <NewsletterForm />
          <p className={styles.newsFine}>{page?.newsletterFinePrint}</p>
        </div>
      </section>

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">{page?.closerEyebrow}</span>
          <h2 className="display" style={{ marginTop: ".3rem" }}>
            {page?.closerTitleLine1}
            <br />
            {page?.closerTitleLine2}
          </h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            {page?.closerLead}
          </p>
          <div className={styles.closerActions}>
            <Link href={page?.closerPrimaryCtaHref ?? "/concierge-day"} className="btn btn-primary btn-lg">
              {page?.closerPrimaryCtaLabel}
            </Link>
            <Link href={page?.closerSecondaryCtaHref ?? "/experiences"} className="btn btn-line btn-lg">
              {page?.closerSecondaryCtaLabel}
            </Link>
          </div>
        </Reveal>
      </section>

      <MinimalFooter
        links={[
          { href: "/", label: "Home" },
          { href: "/concierge-day", label: "Concierge Days" },
          { href: "/experiences", label: "Experiences" },
          { href: "/insiders-guide", label: "Insider's Guide" },
        ]}
      />
    </>
  );
}
