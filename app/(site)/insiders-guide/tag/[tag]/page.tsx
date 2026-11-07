import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import JsonLd from "@/components/JsonLd";
import ArticleCard from "@/components/ArticleCard";
import TagChips from "@/components/TagChips";
import { reader } from "@/lib/keystatic-reader";
import { ARTICLE_AUTHORS, ARTICLE_CATEGORY_LABELS } from "@/lib/article-labels";
import { articleTags, type ArticleTag } from "@/lib/article-tags";
import styles from "../../InsidersGuidePage.module.css";

/** Local dev only: drafts are listed so tags can be reviewed before publishing. */
const showDrafts = process.env.NODE_ENV === "development";

async function load() {
  const all = await reader.collections.articles.all();
  const live = all.filter((a) => a.entry.title && (showDrafts || !a.entry.draft));
  const byTag = new Map<string, { tag: ArticleTag; slugs: string[] }>();
  for (const a of live) {
    for (const t of articleTags(a.entry.tags)) {
      const cur = byTag.get(t.slug) ?? { tag: t, slugs: [] };
      cur.slugs.push(a.slug);
      byTag.set(t.slug, cur);
    }
  }
  return { live, byTag };
}

export async function generateStaticParams() {
  const { byTag } = await load();
  return [...byTag.keys()].map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const { byTag } = await load();
  const hit = byTag.get(tag);
  if (!hit) return {};
  const title = `${hit.tag.hashtag} — The Insider's Guide to Luxor`;
  const description = `Every Luxor Rising guide about ${hit.tag.label}: honest, specific and fact-checked, from people who live in Luxor.`;
  return {
    title,
    description,
    alternates: { canonical: `/insiders-guide/tag/${tag}` },
    openGraph: { title, description, url: `/insiders-guide/tag/${tag}` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const { live, byTag } = await load();
  const hit = byTag.get(tag);
  if (!hit) notFound();

  const posts = live
    .filter((a) => hit.slugs.includes(a.slug))
    .sort((a, b) => (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""));

  // every tag, most-used first, for browsing sideways
  const allTags = [...byTag.values()]
    .sort((a, b) => b.slugs.length - a.slugs.length || a.tag.label.localeCompare(b.tag.label))
    .map((v) => v.tag);
  const counts = Object.fromEntries([...byTag.entries()].map(([k, v]) => [k, v.slugs.length]));

  const JSON_LD = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${hit.tag.hashtag} — The Insider's Guide to Luxor`,
    url: `https://www.luxorrising.com/insiders-guide/tag/${tag}`,
    about: hit.tag.label,
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.entry.title,
      url: `https://www.luxorrising.com/insiders-guide/${p.slug}`,
    })),
  };

  return (
    <>
      <JsonLd data={JSON_LD} />
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />
      <header className={styles.hero}>
        <div className="wrap">
          <span className="eyebrow">The Insider&apos;s Guide · tag</span>
          <h1 className="display" style={{ margin: ".3rem 0 1rem", overflowWrap: "anywhere" }}>
            {hit.tag.hashtag}
          </h1>
          <p className="lead">
            {posts.length === 1 ? "One guide" : `${posts.length} guides`} about {hit.tag.label}.
          </p>
        </div>
      </header>
      <main className="wrap" style={{ paddingBottom: "4rem" }}>
        <div style={{ margin: "0 0 2.4rem" }}>
          <TagChips tags={allTags} label="Browse by tag" activeSlug={tag} counts={counts} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(290px, 100%), 1fr))",
            gap: "1.6rem",
          }}
        >
          {posts.map(({ slug, entry }) => (
            <ArticleCard
              key={slug}
              href={`/insiders-guide/${slug}`}
              src={entry.heroImage || "/images/valley-kings-tomb-pillar.jpg"}
              alt={entry.title}
              title={entry.title}
              excerpt={entry.excerpt ?? ""}
              authorName={ARTICLE_AUTHORS[entry.author]?.name ?? entry.author}
              readTime={entry.readingTime ?? ""}
              category={ARTICLE_CATEGORY_LABELS[entry.category] ?? undefined}
            />
          ))}
        </div>
      </main>
      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
