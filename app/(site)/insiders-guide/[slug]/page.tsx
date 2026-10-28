import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
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
  if (!entry || entry.draft) return {};
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
  // Drafts exist in the CMS but must not be reachable on the live site.
  if (!entry || entry.draft) notFound();

  const author = ARTICLE_AUTHORS[entry.author] ?? { name: entry.author, bio: "" };
  const categoryLabel = ARTICLE_CATEGORY_LABELS[entry.category] ?? entry.category;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const publishedLabel = entry.publishedAt ? fmt(entry.publishedAt) : null;
  const updatedLabel = entry.updatedAt ? fmt(entry.updatedAt) : publishedLabel;

  // The brand byline "Luxor Rising" maps to an Organization; a named person → Person.
  const authorLd =
    author.name === "Luxor Rising"
      ? { "@type": "Organization", name: author.name }
      : {
          "@type": "Person",
          name: author.name,
          jobTitle: "Concierge, Luxor Rising",
          knowsAbout: ["Luxor", "Ancient Egypt", "Egypt travel"],
        };

  const faqs = (entry.faqs ?? []).filter((f) => f.question && f.answer);

  const JSON_LD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: entry.title,
        description: entry.excerpt,
        image: entry.heroImage ? [`https://luxorrising.com${entry.heroImage}`] : undefined,
        author: authorLd,
        reviewedBy: { "@type": "Person", name: "Dr. Nour", jobTitle: "Licensed Egyptologist" },
        publisher: { "@type": "Organization", name: "Luxor Rising" },
        datePublished: entry.publishedAt,
        dateModified: entry.updatedAt || entry.publishedAt,
        mainEntityOfPage: `https://luxorrising.com/insiders-guide/${slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://luxorrising.com/" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Insider's Guide",
            item: "https://luxorrising.com/insiders-guide",
          },
          { "@type": "ListItem", position: 3, name: entry.title },
        ],
      },
      ...(faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
    ],
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
        updatedLabel={updatedLabel ? `Updated ${updatedLabel}` : undefined}
        factCheckedBy="Fact-checked by Dr. Nour, licensed Egyptologist"
        heroImage={entry.heroImage ?? undefined}
        keyTakeaways={entry.keyTakeaways ? [...entry.keyTakeaways] : undefined}
        faqs={faqs.map((f) => ({ question: f.question, answer: f.answer }))}
        sources={(entry.sources ?? [])
          .filter((s): s is { label: string; url: string } => Boolean(s.label && s.url))
          .map((s) => ({ label: s.label, url: s.url }))}
        contentNode={entry.content.node}
      />

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
