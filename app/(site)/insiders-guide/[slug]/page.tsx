import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import JsonLd from "@/components/JsonLd";
import ArticleTemplate from "@/components/ArticleTemplate";
import { reader } from "@/lib/keystatic-reader";
import { ARTICLE_CATEGORY_LABELS, ARTICLE_AUTHORS } from "@/lib/article-labels";
import { dydExpHref, buildConciergeDayCards } from "@/lib/experience-cards";
import { articleTags } from "@/lib/article-tags";
import { ORIGINAL_DAY_RATE } from "@/lib/pricing-math";

async function getEntry(slug: string) {
  const entry = await reader.collections.articles.read(slug, { resolveLinkedFiles: true });
  if (!entry) return null;
  return entry;
}

/** Local dev only: let draft articles open by URL for review. */
const previewDrafts = process.env.NODE_ENV === "development";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);
  if (!entry || (entry.draft && !previewDrafts)) return {};
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
      images: entry.heroImage ? [{ url: entry.heroImage, alt: entry.title }] : undefined,
      publishedTime: entry.publishedAt || undefined,
      modifiedTime: entry.updatedAt || entry.publishedAt || undefined,
      authors: [ARTICLE_AUTHORS[entry.author]?.name ?? entry.author],
      section: ARTICLE_CATEGORY_LABELS[entry.category] ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: entry.heroImage ? [entry.heroImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [entry, pricingRules, allArticles, conciergePage, experiences] = await Promise.all([
    getEntry(slug),
    reader.singletons.pricingRules.read(),
    reader.collections.articles.all(),
    reader.singletons.conciergeDayPage.read(),
    reader.collections.experiences.all(),
  ]);
  // Drafts exist in the CMS but must not be reachable on the live site
  // (on the local dev server they open, so a draft can be read before publishing).
  if (!entry || (entry.draft && !previewDrafts)) notFound();

  const author = ARTICLE_AUTHORS[entry.author] ?? { name: entry.author, bio: "" };
  const categoryLabel = ARTICLE_CATEGORY_LABELS[entry.category] ?? entry.category;
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const publishedLabel = entry.publishedAt ? fmt(entry.publishedAt) : null;
  const updatedLabel = entry.updatedAt ? fmt(entry.updatedAt) : publishedLabel;

  // The brand byline "Luxor Rising" maps to an Organization; a named person → Person.
  const SITE = "https://www.luxorrising.com";
  const authorLd =
    author.name === "Luxor Rising"
      ? { "@type": "Organization", name: author.name, url: SITE }
      : {
          "@type": "Person",
          name: author.name,
          jobTitle: author.role ?? "Concierge, Luxor Rising",
          worksFor: { "@type": "Organization", name: "Luxor Rising", url: SITE },
          ...(author.url ? { url: `${SITE}${author.url}` } : {}),
          ...(author.image ? { image: `${SITE}${author.image}` } : {}),
          ...(author.sameAs?.length ? { sameAs: author.sameAs } : {}),
          knowsAbout: ["Luxor", "Ancient Egypt", "Egyptian temples", "Egypt travel"],
        };
  // Only claim the Egyptologist's review when the article uses the default line.
  const reviewedLd = entry.factCheck
    ? {}
    : { reviewedBy: { "@type": "Person", name: "Dr. Nour", jobTitle: "Licensed Egyptologist" } };
  const bodyImages = (JSON.stringify(entry.content.node).match(/\/images\/[^"\\)]+\.(?:jpe?g|png|webp)/g) ?? []).filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  const faqs = (entry.faqs ?? []).filter((f) => f.question && f.answer);
  const tags = articleTags(entry.tags);

  const relatedExperiences = (
    await Promise.all(
      (entry.relatedExperiences ?? []).filter(Boolean).map(async (expSlug) => {
        const e = await reader.collections.experiences.read(expSlug);
        if (!e || e.isActive === false || !e.heroImage) return null;
        return {
          href: dydExpHref(expSlug),
          src: e.heroImage,
          title: e.title || e.name || expSlug,
          place: e.name || undefined,
          hook: e.hook || "",
        };
      }),
    )
  ).filter((x): x is NonNullable<typeof x> => x !== null);

  // the Design-Your-Day gallery cards, with this article's experiences first
  const relatedHrefs = (entry.relatedExperiences ?? []).filter(Boolean).map((x) => dydExpHref(x));
  const allDayCards = buildConciergeDayCards({ cmsExperiences: conciergePage?.experiences, experiences });
  const dayCards = [
    ...relatedHrefs.flatMap((h) => allDayCards.filter((c) => c.href === h)),
    ...allDayCards.filter((c) => !c.href || !relatedHrefs.includes(c.href)),
  ];

  // the booking card's experience, as a second card
  const bookExpSlug = entry.bookCard?.experience?.trim();
  const bookExpEntry = bookExpSlug ? await reader.collections.experiences.read(bookExpSlug) : null;
  const bookExperience =
    bookExpSlug && bookExpEntry && bookExpEntry.isActive !== false
      ? {
          href: dydExpHref(bookExpSlug),
          name: bookExpEntry.name || bookExpEntry.title || bookExpSlug,
          image: bookExpEntry.heroImage || undefined,
        }
      : undefined;

  const moreArticles = allArticles
    .filter((a) => a.slug !== slug && !a.entry.draft)
    .sort((a, b) => (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""))
    .slice(0, 2)
    .map((a) => ({
      href: `/insiders-guide/${a.slug}`,
      title: a.entry.title,
      excerpt: a.entry.excerpt || undefined,
      image: a.entry.heroImage || undefined,
      label: ARTICLE_CATEGORY_LABELS[a.entry.category] ?? undefined,
    }));

  // the real place the article is about, for search engines
  const placeLd =
    entry.place?.name
      ? {
          about: {
            "@type": "TouristAttraction",
            name: entry.place.name,
            ...(entry.place.lat && entry.place.lng
              ? { geo: { "@type": "GeoCoordinates", latitude: Number(entry.place.lat), longitude: Number(entry.place.lng) } }
              : {}),
            ...(entry.place.sameAs ? { sameAs: entry.place.sameAs } : {}),
            containedInPlace: { "@type": "City", name: "Luxor", addressCountry: "EG" },
          },
        }
      : {};

  const JSON_LD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: entry.title,
        description: entry.excerpt,
        image: [entry.heroImage, ...bodyImages]
          .filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i)
          .map((p) => `${SITE}${p}`),
        author: authorLd,
        ...reviewedLd,
        ...placeLd,
        publisher: {
          "@type": "Organization",
          name: "Luxor Rising",
          url: SITE,
          logo: { "@type": "ImageObject", url: `${SITE}/images/logo-email.png` },
        },
        inLanguage: "en-GB",
        ...(tags.length ? { keywords: tags.map((t) => t.label).join(", ") } : {}),
        datePublished: entry.publishedAt,
        dateModified: entry.updatedAt || entry.publishedAt,
        mainEntityOfPage: `${SITE}/insiders-guide/${slug}`,
        ...(entry.sources?.length
          ? { citation: entry.sources.filter((x) => x.url).map((x) => ({ "@type": "CreativeWork", name: x.label, url: x.url })) }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.luxorrising.com/" },
          {
            "@type": "ListItem",
            position: 2,
            name: "Insider's Guide",
            item: "https://www.luxorrising.com/insiders-guide",
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
        authorRole={author.role}
        authorTagline={author.tagline}
        authorImage={author.image}
        authorSameAs={author.sameAs}
        publishedLabel={
          entry.updatedAt && entry.publishedAt && entry.updatedAt !== entry.publishedAt && publishedLabel
            ? `Published ${publishedLabel}`
            : undefined
        }
        updatedLabel={updatedLabel ? `Updated ${updatedLabel}` : undefined}
        factCheckedBy={entry.factCheck || "Fact-checked by Dr. Nour, licensed Egyptologist"}
        heroImage={entry.heroImage ?? undefined}
        gallery={(entry.gallery ?? [])
          .filter((g): g is { image: string; alt: string } => Boolean(g.image))
          .map((g) => ({ src: g.image, alt: g.alt || "" }))}
        keyTakeaways={entry.keyTakeaways ? [...entry.keyTakeaways] : undefined}
        bookCard={entry.bookCard ?? undefined}
        fromPrice={ORIGINAL_DAY_RATE}
        visit={entry.visit ?? undefined}
        relatedExperiences={relatedExperiences}
        dayCards={dayCards}
        bookExperience={bookExperience}
        moreArticles={moreArticles}
        tags={tags}
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
