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
import GuideClient from "./GuideClient";
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
  const allArticles = await reader.collections.articles.all();
  const featured = [...allArticles].sort((a, b) =>
    (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? "")
  )[0];
  const featuredAuthor = featured ? ARTICLE_AUTHORS[featured.entry.author]?.name ?? featured.entry.author : "Ahmed";
  const featuredCategoryLabel = featured
    ? ARTICLE_CATEGORY_LABELS[featured.entry.category] ?? featured.entry.category
    : undefined;

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
      <Nav
        scrollAware={false}
        links={[
          { href: "/", label: "Home" },
          { href: "/concierge-day", label: "Concierge Days" },
          { href: "/experiences", label: "Experiences" },
          { href: "/insiders-guide", label: "Insider's Guide" },
        ]}
        ctaHref="/concierge-day"
        ctaLabel="Design your day"
      />

      {/* HERO */}
      <header className={styles.hero}>
        <Reveal className="wrap">
          <span className="eyebrow">The Insider&apos;s Guide</span>
          <h1 className="display" style={{ margin: ".3rem 0 1.2rem" }}>
            What we&apos;d tell you
            <br />
            over <em>coffee</em>
          </h1>
          <p>
            No listicles, no affiliate padding, no &quot;top 10 things to do.&quot; Just what&apos;s
            actually worth your morning in Luxor — and what isn&apos;t — from the people who wake
            up there.
          </p>
        </Reveal>
      </header>

      {/* AUTHORITY */}
      <div className={styles.auth}>
        <div className={`wrap ${styles.authIn}`}>
          <div className={styles.who}>
            <div className={styles.av} aria-hidden="true">
              A
            </div>
            <div className={styles.whoT}>
              <b>Ahmed</b>
              <span>Our consigliere in Luxor · born on the west bank</span>
            </div>
          </div>
          <div className={styles.who}>
            <div className={styles.av} aria-hidden="true">
              N
            </div>
            <div className={styles.whoT}>
              <b>Dr. Nour</b>
              <span>Licensed Egyptologist · every article fact-checked</span>
            </div>
          </div>
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

        <GuideClient />
      </main>

      {/* NEWSLETTER */}
      <section className={styles.news}>
        <div className={styles.newsIn}>
          <span className="eyebrow">The letter</span>
          <h2 className="display">
            One letter a month.
            <br />
            Nothing you could have Googled.
          </h2>
          <p>
            What&apos;s just reopened, which tomb is worth the detour this season, and the
            occasional thing our team sends us that we probably shouldn&apos;t publish.
          </p>
          <NewsletterForm />
          <p className={styles.newsFine}>No spam, no selling your address. Unsubscribe in one click.</p>
        </div>
      </section>

      {/* CLOSER */}
      <section className={styles.closer}>
        <Reveal className="wrap-narrow">
          <span className="eyebrow">Ready when you are</span>
          <h2 className="display" style={{ marginTop: ".3rem" }}>
            Reading is one thing.
            <br />
            Standing in it is another.
          </h2>
          <p className="lead" style={{ marginTop: ".8rem" }}>
            Everything in this guide, we can put in front of you — timed properly, entries
            handled, with someone who can read the walls.
          </p>
          <div className={styles.closerActions}>
            <Link href="/concierge-day" className="btn btn-primary btn-lg">
              Design your day →
            </Link>
            <Link href="/experiences" className="btn btn-line btn-lg">
              See all experiences
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
