import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { MinimalFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ExperienceConfigurator from "@/components/ExperienceConfigurator";
import ExperienceTemplate from "@/components/ExperienceTemplate";
import { reader } from "@/lib/keystatic-reader";

const SLUG = "medinet-habu";

async function getData() {
  const [entry, globals, pricingRules] = await Promise.all([
    reader.collections.experiences.read(SLUG, { resolveLinkedFiles: true }),
    reader.singletons.productPageSettings.read(),
    reader.singletons.pricingRules.read(),
  ]);
  if (!entry) return null;
  return { entry, globals, pricingRules };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getData();
  if (!data) return {};
  const { entry } = data;
  const title = entry.metaTitle || entry.title;
  const description = entry.metaDescription || entry.hook;
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
  const { entry, globals, pricingRules } = data;

  const heroImageUrl = entry.heroImage ? `https://luxorrising.com${entry.heroImage}` : undefined;
  const galleryImageUrls = entry.gallery.map((g) => `https://luxorrising.com${g.image}`);

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
        areaServed: "Luxor, Egypt",
        offers: {
          "@type": "Offer",
          price: String(entry.basePrice ?? 0),
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
            basePrice={entry.basePrice ?? 0}
            groupSupplement={entry.groupSupplement.map((t) => ({
              minGuests: t.minGuests ?? 0,
              extraPerGuest: t.extraPerGuest ?? 0,
            }))}
            depositPercent={pricingRules?.depositPercent ?? 30}
            glanceIncludes={entry.glanceIncludes}
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
        guaranteeEyebrow={globals?.guaranteeEyebrow ?? "Our promise"}
        guaranteeTitle={globals?.guaranteeTitle ?? "Reserved with confidence — or we make it right."}
        guaranteeItems={(globals?.guaranteeItems ?? []).map((g) => ({ title: g.title, description: g.description }))}
        testimonialsEyebrow={globals?.testimonialsEyebrow ?? "From recent guests"}
        testimonialsTitle={globals?.testimonialsTitle ?? ""}
        testimonials={(globals?.testimonials ?? []).map((t) => ({ quote: t.quote, author: t.author }))}
        finalTitle="Begin where everything began."
        finalText={`Private, certified-guided, and arranged end to end — from €${entry.basePrice ?? 0}. Reserve your hour at the mound.`}
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
