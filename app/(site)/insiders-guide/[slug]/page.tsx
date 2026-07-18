import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ArticleTemplate from "@/components/ArticleTemplate";
import { reader } from "@/lib/keystatic-reader";
import { ARTICLE_CATEGORY_LABELS, ARTICLE_AUTHORS } from "@/lib/article-labels";

async function getEntry(slug: string) {
  const entry = await reader.collections.articles.read(slug, { resolveLinkedFiles: true });
  if (!entry) return null;
  return entry;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) return {};
  const title = entry.metaTitle || entry.title;
  const description = entry.metaDescription || entry.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/insiders-guide/${slug}` },
    openGraph: {
      type: "article",
      siteName: "Luxor Rising",
      title,
      description,
      url: `/insiders-guide/${slug}`,
      images: entry.heroImage ? [entry.heroImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry) notFound();

  const author = ARTICLE_AUTHORS[entry.author] ?? { name: entry.author, bio: "" };
  const categoryLabel = ARTICLE_CATEGORY_LABELS[entry.category] ?? entry.category;
  const updatedDate = entry.publishedAt
    ? new Date(entry.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const JSON_LD = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.excerpt,
    image: entry.heroImage ? [`https://luxorrising.com${entry.heroImage}`] : undefined,
    author: { "@type": "Person", name: author.name },
    publisher: { "@type": "Organization", name: "Luxor Rising" },
    datePublished: entry.publishedAt,
    dateModified: entry.publishedAt,
    mainEntityOfPage: `https://luxorrising.com/insiders-guide/${slug}`,
  };

  return (
    <>
      <JsonLd data={JSON_LD} />
      <Nav scrollAware={false} ctaHref="/concierge-day" ctaLabel="Design your day" />

      <ArticleTemplate
        breadcrumbLabel="Insider's Guide"
        breadcrumbHref="/insiders-guide"
        title={entry.title}
        excerpt={entry.excerpt}
        categoryLabel={categoryLabel}
        readingTime={entry.readingTime}
        authorName={author.name}
        authorBio={author.bio}
        updatedLabel={updatedDate ? `Updated ${updatedDate}` : undefined}
        heroImage={entry.heroImage ?? undefined}
        contentNode={entry.content.node}
      />

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
