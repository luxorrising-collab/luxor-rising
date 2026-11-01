import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import JsonLd from "@/components/JsonLd";
import ExperienceTemplate from "@/components/ExperienceTemplate";
import DayHoldSlideshow from "@/components/DayHoldSlideshow";
import DesignYourDayCta from "@/components/DesignYourDayCta";
import TakenCareOfSection from "@/components/TakenCareOfSection";
import type { HeroShowItem } from "@/components/HeroShow";
import { buildConciergeDayCards, dydExpHref } from "@/lib/experience-cards";
import { reader } from "@/lib/keystatic-reader";
import { getFinalPrice, parseEuro } from "@/lib/pricing";
import { LIGHT_DAY_RATE } from "@/lib/pricing-math";
import { getSocialProof } from "@/lib/social-proof";
import { resolveGift } from "@/lib/gifts";

const SLUG = "medinet-habu";

async function getData() {
  const [entry, globals, experiences, conciergePage, finalPrice, socialProof] = await Promise.all([
    reader.collections.experiences.read(SLUG, { resolveLinkedFiles: true }),
    reader.singletons.productPageSettings.read(),
    reader.collections.experiences.all(),
    reader.singletons.conciergeDayPage.read(),
    getFinalPrice(SLUG),
    getSocialProof(),
  ]);
  if (!entry) return null;
  const basePrice = finalPrice ?? entry.basePrice ?? 0;
  const vst = parseEuro(entry.valueStackTotal);
  const showAssembledTotal = vst != null && vst > basePrice;
  return { entry, globals, experiences, conciergePage, basePrice, showAssembledTotal, socialProof };
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
  const { entry, globals, experiences, conciergePage, basePrice, showAssembledTotal, socialProof } = data;

  // Gallery slideshow — the exact Design Your Day gallery cards (hover clips,
  // icons, tier labels + selling-point chips), as one swipeable row. Built from
  // the same shared builder and CMS source as /concierge-day, minus this temple.
  const selfHref = dydExpHref(SLUG);
  const stripCards = buildConciergeDayCards({
    cmsExperiences: conciergePage?.experiences,
    experiences,
  }).filter((c) => c.href !== selfHref);

  const heroImageUrl = entry.heroImage ? `https://luxorrising.com${entry.heroImage}` : undefined;
  const galleryImageUrls = entry.gallery.map((g) => `https://luxorrising.com${g.image}`);

  // Cinematic hero: the temple image, then short temple clips alternating with
  // real gallery photos. object-position keeps each subject in frame when the
  // landscape media is cropped into a tall mobile hero.
  const gi = (i: number) => `/images/experiences/medinet-habu/gallery/${i}/image.jpg`;
  // Alternating serene detail (no people) / clip — each clip used once across
  // the hero and gallery, with the quiet "feel" clips leading the hero.
  // Hero slideshow — real photographs only, in order (no "feel" clips), cross-
  // fading in our established slideshow style. Starts on the hero image (LCP).
  const heroMedia: HeroShowItem[] = [
    { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
    ...entry.gallery
      .map((g) => g.image)
      .filter((src): src is string => Boolean(src))
      .slice(0, 6)
      .map((src) => ({ type: "image" as const, src, alt: entry.title, position: "50% 50%" })),
  ];
  // Gallery "feel" clips — the remaining two, used nowhere else.
  const galleryVideos = [
    { video: "/videos/medinet/driven.mp4", poster: "/videos/medinet/driven-poster.jpg", caption: "The drive out, before the day begins." },
    { video: "/videos/medinet/reading.mp4", poster: "/videos/medinet/reading-poster.jpg", caption: "Time to sit with it, and write it down." },
    { video: "/videos/medinet/table.mp4", poster: "/videos/medinet/table-poster.jpg", caption: "A hand-picked local table — a real meal where locals eat." },
  ];

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
          // This page sells the day, so search data carries the day's price.
          price: String(LIGHT_DAY_RATE),
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
      <Nav ctaHref="/concierge-day#design" ctaLabel="Design your day" />

      <ExperienceTemplate
        socialProof={socialProof}
        title={entry.title}
        hook={entry.hook}
        heroEyebrow={entry.heroEyebrow}
        hidePrice
        heroPrice={{
          amount: 330,
          note: "/ day - including door to door transfer from Hurghada or Marsa Alam",
        }}
        heroCtaLabel="Design your day →"
        heroCtaHref="/concierge-day#design"
        heroImage={entry.heroImage ?? ""}
        heroMedia={heroMedia}
        glanceLead={entry.glanceLead}
        bestTime={entry.bestTime}
        duration={entry.duration}
        glanceIncludes={entry.glanceIncludes}
        highlights={entry.highlights.map((h) => ({ title: h.title, description: h.description }))}
        contentNode={entry.content.node}
        momentQuote={entry.momentQuote || undefined}
        momentImage={gi(7)}
        gallery={entry.gallery.map((g) => ({ src: g.image ?? "", alt: g.caption, caption: g.caption }))}
        galleryVideos={galleryVideos}
        bookEyebrow="Design your day"
        bookTitle="Make Medinet Habu part of your day"
        bookLead="Medinet Habu isn't sold as a ticket — it's one of the ways to spend a Luxor Rising day. Build the whole day around it: the temples and tombs you choose, in the order you like, with a private Egyptologist, insider access and everything arranged end to end."
        bookNote={undefined}
        configurator={<DesignYourDayCta />}
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
          signature: t.signature || undefined,
          signatureSub: t.signatureSub || undefined,
          signatureHref: t.signatureHref || undefined,
          image: t.image || undefined,
        }))}
        reviewsVerified={globals?.reviewsVerified ?? false}
        reviewAverage={reviewAverage}
        reviewCount={reviewCount}
        finalTitle="Begin where everything began."
        finalText="Medinet Habu is one of the ways to spend your day. Design the whole day around it — private, certified-guided, and arranged end to end, from €330."
        finalCtaHref="/concierge-day#design"
        finalCtaLabel="Design your day →"
        giftFeatured={resolveGift(entry.signatureGift, entry.category)}
        showValueAnchor={globals?.showValueAnchor ?? false}
        preBook={<DayHoldSlideshow cards={stripCards} />}
        postContent={
          <TakenCareOfSection
            title="Everything about Medinet Habu, handled"
            items={entry.takenCareOf.map((t) => ({ title: t.title, note: t.note || undefined }))}
          />
        }
      />

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
