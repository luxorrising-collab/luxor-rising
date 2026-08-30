import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import JsonLd from "@/components/JsonLd";
import ExperienceConfigurator from "@/components/ExperienceConfigurator";
import ExperienceTemplate from "@/components/ExperienceTemplate";
import { reader } from "@/lib/keystatic-reader";
import { getFinalPrice, parseEuro } from "@/lib/pricing";

const SLUG = "medinet-habu";

async function getData() {
  const [entry, globals, pricingRules, finalPrice] = await Promise.all([
    reader.collections.experiences.read(SLUG, { resolveLinkedFiles: true }),
    reader.singletons.productPageSettings.read(),
    reader.singletons.pricingRules.read(),
    getFinalPrice(SLUG),
  ]);
  if (!entry) return null;
  const basePrice = finalPrice ?? entry.basePrice ?? 0;
  const vst = parseEuro(entry.valueStackTotal);
  const showAssembledTotal = vst != null && vst > basePrice;
  return { entry, globals, pricingRules, basePrice, showAssembledTotal };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getData();
  if (!data) return {};
  const { entry, basePrice } = data;
  const swap = (s: string) =>
    entry.basePrice && basePrice !== entry.basePrice
      ? s.replace(new RegExp(`€\\s?${entry.basePrice}\\b`, "g"), `€${basePrice}`)
      : s;
  const title = swap(entry.metaTitle || entry.title);
  const description = swap(entry.metaDescription || entry.hook);
  return {
    title,
    description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      type: "website",
      siteName: "Luxor Rising",
      title,
      description,
      images: entry.heroImage ? [entry.heroImage] : undefined,
      url: `/${SLUG}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: entry.heroImage ? [entry.heroImage] : undefined,
    },
  };
}

export default async function MedinetHabuPage() {
  const data = await getData();
  if (!data) notFound();
  const { entry, globals, pricingRules, basePrice, showAssembledTotal } = data;

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
        "@type": "Organization",
        "@id": "https://luxorrising.com/#org",
        name: "Luxor Rising",
        url: "https://luxorrising.com",
        logo: "https://luxorrising.com/images/logo-footer.png",
        description:
          "Private concierge and advisor for unhurried, certified-guided experiences in Luxor and the Egyptian Nile.",
        areaServed: "Luxor, Egypt",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://luxorrising.com/" },
          { "@type": "ListItem", position: 2, name: "Experiences", item: "https://luxorrising.com/#experiences" },
          { "@type": "ListItem", position: 3, name: "Medinet Habu", item: "https://luxorrising.com/medinet-habu" },
        ],
      },
      {
        "@type": "Product",
        name: "Medinet Habu - Private, Certified-Guided Experience",
        image: heroImageUrl ? [heroImageUrl, ...galleryImageUrls] : galleryImageUrls,
        description: entry.hook,
        brand: { "@type": "Brand", name: "Luxor Rising" },
        category: "Private guided experience",
        ...reviewJsonLd,
        areaServed: "Luxor, Egypt",
        offers: {
          "@type": "Offer",
          price: String(basePrice),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: "https://luxorrising.com/medinet-habu#book",
          seller: { "@id": "https://luxorrising.com/#org" },
        },
      },
      {
        "@type": "ImageGallery",
        name: "Medinet Habu - photo gallery",
        about: "Medinet Habu temple, Luxor, Egypt",
        associatedMedia: entry.gallery.map((g) => ({
          "@type": "ImageObject",
          contentUrl: `https://luxorrising.com${g.image}`,
          caption: g.caption,
        })),
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
            name="Medinet Habu"
            slug={SLUG}
            basePrice={basePrice}
            maxGuests={entry.maxGuests ?? 4}
            groupSupplement={entry.groupSupplement.map((t) => ({
              minGuests: t.minGuests ?? 0,
              extraPerGuest: t.extraPerGuest ?? 0,
            }))}
            depositPercent={pricingRules?.depositPercent ?? 50}
            glanceIncludes={entry.glanceIncludes}
            includeItems={entry.takenCareOf.map((t) => ({ title: t.title, note: t.note || undefined }))}
            feelText={entry.glanceIncludes}
            reviewAverage={reviewAverage}
            reviewCount={reviewCount}
            image={entry.heroImage || undefined}
            title={entry.title || undefined}
          />
        }
        valueStackRows={entry.valueStackRows.map((r) => ({ label: r.label, price: r.price }))}
        valueStackTotal={entry.valueStackTotal}
        showAssembledTotal={showAssembledTotal}
        basePrice={basePrice}
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
        finalTitle="Begin where everything began."
        finalText={`Private, certified-guided, and arranged end to end — from €${basePrice}. Reserve your hour at the mound.`}
        finalCtaHref="#book"
        finalCtaLabel="Reserve this experience →"
      />

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
