import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ExperienceConfigurator from "@/components/ExperienceConfigurator";
import ExperienceTemplate from "@/components/ExperienceTemplate";
import { reader } from "@/lib/keystatic-reader";

async function getData(slug: string) {
  const [entry, globals, pricingRules] = await Promise.all([
    reader.collections.experiences.read(slug, { resolveLinkedFiles: true }),
    reader.singletons.productPageSettings.read(),
    reader.singletons.pricingRules.read(),
  ]);
  // Inactive experiences 404 rather than render at their direct URL.
  if (!entry || !entry.isActive) return null;
  return { entry, globals, pricingRules };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return {};
  const { entry } = data;
  const title = entry.metaTitle || entry.title;
  const description = entry.metaDescription || entry.hook;
  return {
    title,
    description,
    alternates: { canonical: `/experiences/${slug}` },
    openGraph: {
      type: "website",
      siteName: "Luxor Rising",
      title,
      description,
      images: entry.heroImage ? [entry.heroImage] : undefined,
      url: `/experiences/${slug}`,
    },
  };
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Medinet Habu has its own hand-built page at the top-level /medinet-habu
  // route (used throughout marketing links and JSON-LD) — send this path to
  // it instead of rendering a duplicate.
  if (slug === "medinet-habu") {
    redirect("/medinet-habu");
  }

  const data = await getData(slug);
  if (!data) notFound();
  const { entry, globals, pricingRules } = data;

  const heroImageUrl = entry.heroImage ? `https://luxorrising.com${entry.heroImage}` : undefined;
  const galleryImageUrls = entry.gallery.map((g) => `https://luxorrising.com${g.image}`);

  // Guest reviews also power star ratings in search results. Emitted ONLY once
  // reviewsVerified is true — i.e. every review is a real, attributable guest.
  // Sample reviews still render on the page, but never as structured data.
  const realReviews = (globals?.testimonials ?? []).filter((t) => t.quote && t.author);
  // Visual review summary (stars in the hero + on the price card). Shown for
  // sample reviews too — it's presentational only; structured data stays gated.
  const reviewCount = realReviews.length;
  const reviewAverage = reviewCount
    ? (realReviews.reduce((a, t) => a + (t.rating ?? 5), 0) / reviewCount).toFixed(1)
    : undefined;
  const reviewJsonLd =
    globals?.reviewsVerified && realReviews.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              realReviews.reduce((a, t) => a + (t.rating ?? 5), 0) / realReviews.length
            ).toFixed(1),
            reviewCount: realReviews.length,
          },
          review: realReviews.map((t) => ({
            "@type": "Review",
            reviewBody: t.quote,
            author: { "@type": "Person", name: t.author },
            ...(t.date ? { datePublished: t.date } : {}),
            reviewRating: {
              "@type": "Rating",
              ratingValue: String(t.rating ?? 5),
              bestRating: "5",
            },
          })),
        }
      : {};

  const JSON_LD = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://luxorrising.com/" },
          { "@type": "ListItem", position: 2, name: "Experiences", item: "https://luxorrising.com/experiences" },
          { "@type": "ListItem", position: 3, name: entry.title, item: `https://luxorrising.com/experiences/${slug}` },
        ],
      },
      {
        "@type": "Product",
        name: entry.title,
        image: heroImageUrl ? [heroImageUrl, ...galleryImageUrls] : galleryImageUrls,
        description: entry.hook,
        brand: { "@type": "Brand", name: "Luxor Rising" },
        category: "Private guided experience",
        ...reviewJsonLd,
        areaServed: "Luxor, Egypt",
        offers: {
          "@type": "Offer",
          price: String(entry.basePrice ?? 0),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `https://luxorrising.com/experiences/${slug}#book`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: entry.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={JSON_LD} />
      <Nav ctaHref="#book" ctaLabel="Reserve" />

      <ExperienceTemplate
        title={entry.title}
        hook={entry.hook}
        heroEyebrow={entry.heroEyebrow}
        heroImage={entry.heroImage ?? ""}
        glanceLead={entry.glanceLead}
        bestTime={entry.bestTime}
        duration={entry.duration}
        glanceIncludes={entry.glanceIncludes}
        highlights={entry.highlights.map((h) => ({ title: h.title, description: h.description }))}
        contentNode={entry.content.node}
        momentQuote={entry.momentQuote || undefined}
        gallery={entry.gallery.map((g) => ({ src: g.image ?? "", alt: g.caption, caption: g.caption }))}
        bookEyebrow={entry.bookEyebrow}
        bookTitle={entry.bookTitle}
        bookLead={entry.bookLead}
        bookNote={entry.bookNote || undefined}
        configurator={
          <ExperienceConfigurator
            name={entry.name || entry.title}
            slug={slug}
            basePrice={entry.basePrice ?? 0}
            groupSupplement={entry.groupSupplement.map((t) => ({
              minGuests: t.minGuests ?? 0,
              extraPerGuest: t.extraPerGuest ?? 0,
            }))}
            depositPercent={pricingRules?.depositPercent ?? 30}
            glanceIncludes={entry.glanceIncludes}
            includeItems={entry.takenCareOf.map((t) => ({ title: t.title, note: t.note || undefined }))}
            feelText={entry.glanceIncludes}
            reviewAverage={reviewAverage}
            reviewCount={reviewCount}
            image={entry.heroImage || undefined}
          />
        }
        valueStackRows={entry.valueStackRows.map((r) => ({ label: r.label, price: r.price }))}
        valueStackTotal={entry.valueStackTotal}
        basePrice={entry.basePrice ?? 0}
        priceNote={entry.priceNote}
        pricePerPerson={entry.pricePerPerson || undefined}
        faq={entry.faq.map((f) => ({ q: f.question, a: f.answer }))}
        howItWorksEyebrow={globals?.howItWorksEyebrow ?? "How it works"}
        howItWorksTitle={globals?.howItWorksTitle ?? "You choose a date. We arrange everything."}
        howItWorksSteps={(globals?.howItWorksSteps ?? []).map((s) => ({ title: s.title, description: s.description }))}
        disclosureText={globals?.disclosureText ?? ""}
        consigliereEyebrow={globals?.consigliereEyebrow}
        consigliereTitle={globals?.consigliereTitle}
        consigliereLead={globals?.consigliereLead}
        consigliereImage={globals?.consigliereImage || undefined}
        consiglierePoints={(globals?.consiglierePoints ?? []).map((p) => ({ title: p.title, description: p.description }))}
        guaranteeEyebrow={globals?.guaranteeEyebrow ?? "Our promise"}
        guaranteeTitle={globals?.guaranteeTitle ?? "Reserved with confidence — or we make it right."}
        guaranteeItems={(globals?.guaranteeItems ?? []).map((g) => ({ title: g.title, description: g.description }))}
        testimonialsEyebrow={globals?.testimonialsEyebrow ?? "From recent guests"}
        testimonialsTitle={globals?.testimonialsTitle ?? ""}
        testimonials={(globals?.testimonials ?? []).map((t) => ({
          quote: t.quote,
          author: t.author,
          rating: t.rating ?? undefined,
          date: t.date || undefined,
        }))}
        reviewsVerified={globals?.reviewsVerified ?? false}
        reviewAverage={reviewAverage}
        reviewCount={reviewCount}
        finalTitle={`Reserve ${entry.title}`}
        finalText={`Private, certified-guided, and arranged end to end — from €${entry.basePrice ?? 0}.`}
        finalCtaHref="#book"
        finalCtaLabel="Reserve this experience →"
      />

      <MinimalFooter
        links={[
          { href: "/", label: "Home" },
          { href: "/concierge-day", label: "Concierge Days" },
          { href: "/experiences", label: "Experiences" },
          { href: "/private-villas", label: "Private Villas" },
        ]}
        bottomText="© 2026 Luxor Rising — private concierge in Egypt · Luxor & Hurghada"
      />
    </>
  );
}
