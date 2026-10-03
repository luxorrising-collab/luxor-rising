import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { SiteFooter as FullFooter } from "@/components/FooterServer";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import JsonLd from "@/components/JsonLd";
import ExperienceConfigurator from "@/components/ExperienceConfigurator";
import ExperienceTemplate from "@/components/ExperienceTemplate";
import type { HeroShowItem } from "@/components/HeroShow";
import EnquiryForm from "@/components/EnquiryForm";
import { reader } from "@/lib/keystatic-reader";
import { getFinalPrice, parseEuro } from "@/lib/pricing";
import { getSocialProof } from "@/lib/social-proof";

async function getData(slug: string) {
  const [entry, globals, pricingRules, finalPrice, crossingPrice, socialProof] = await Promise.all([
    reader.collections.experiences.read(slug, { resolveLinkedFiles: true }),
    reader.singletons.productPageSettings.read(),
    reader.singletons.pricingRules.read(),
    getFinalPrice(slug),
    getFinalPrice("hurghada-to-luxor-crossing"),
    getSocialProof(),
  ]);
  // Inactive experiences 404 rather than render at their direct URL.
  if (!entry || !entry.isActive) return null;
  // Single source of truth: the Product-prices singleton wins when it has a
  // value for this product, so every price anchor below stays consistent.
  const basePrice = finalPrice ?? entry.basePrice ?? 0;
  const vst = parseEuro(entry.valueStackTotal);
  // Only show the struck-through "assembled separately" total while it stays
  // above our price — otherwise it reads as crossing out a smaller number.
  const showAssembledTotal = vst != null && vst > basePrice;
  return {
    entry,
    globals,
    pricingRules,
    basePrice,
    showAssembledTotal,
    socialProof,
    crossingPrice: crossingPrice ?? 675,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) return {};
  const { entry, basePrice } = data;
  // Keep the "from €X" figure in SEO title/description consistent with the live price.
  const swap = (s: string) =>
    entry.basePrice && basePrice !== entry.basePrice
      ? s.replace(new RegExp(`€\\s?${entry.basePrice}\\b`, "g"), `€${basePrice}`)
      : s;
  const title = swap(entry.metaTitle || entry.title);
  const description = swap(entry.metaDescription || entry.hook);
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
  const { entry, globals, pricingRules, basePrice, showAssembledTotal, socialProof, crossingPrice } = data;
  // Enquiry-only products (e.g. a bespoke multi-week retreat) reuse the standard
  // product page, but swap Stripe checkout for the enquiry form and drop the
  // fixed-price / "reserve" language.
  const isEnquiry = entry.bookingType === "enquiry";

  // Where the experience happens — labels the included door-to-door transfer,
  // and decides whether to offer the Hurghada ⇄ Luxor crossing add-on (it makes
  // no sense on the Red Sea / Hurghada experiences, or on the crossing itself).
  const isRedSea = /hurghada|red[- ]?sea/i.test(`${entry.heroEyebrow} ${slug}`);
  const region = isRedSea ? "Hurghada" : "Luxor";
  const hurghadaTransfer = isRedSea ? 0 : crossingPrice;

  // Cinematic hero slideshow, per product. Starts on the product's own hero
  // image (so first paint is unchanged / LCP-safe), then crossfades through
  // short muted desert clips (cut from the brand film) and real gallery photos.
  const g = (i: number) => `/images/experiences/${slug}/gallery/${i}/image.jpg`;
  const clip = (dir: string, name: string) => ({
    src: `/videos/${dir}/${name}.mp4`,
    poster: `/videos/${dir}/${name}-poster.jpg`,
  });

  // Temple products share one clip set (model welcomed in, a slow morning, a
  // local table in the hero; the drive and writing in the gallery). a/b are two
  // serene, people-free detail photos from this product's own gallery.
  const templeHero = (a: number, b: number): HeroShowItem[] => [
    { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("temple", "entering"), position: "40% 45%" },
    { type: "image", src: g(a), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("temple", "yoga"), position: "50% 40%" },
    { type: "image", src: g(b), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("temple", "table"), position: "50% 50%" },
  ];
  const templeGallery = [
    { video: "/videos/temple/driven.mp4", poster: "/videos/temple/driven-poster.jpg", caption: "The drive out, before the day begins." },
    { video: "/videos/temple/reading.mp4", poster: "/videos/temple/reading-poster.jpg", caption: "Time to sit with it, and write it down." },
  ];

  // Nile products: a private sail, dinner on the water, and a slow Nile hour,
  // alternating with serene river photos. a/b are two photos from the gallery.
  const nileHero = (a: number, b: number): HeroShowItem[] => [
    { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("nile", "felucca"), position: "50% 45%" },
    { type: "image", src: g(a), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("nile", "dinner"), position: "50% 45%" },
    { type: "image", src: g(b), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("nile", "nile"), position: "45% 50%" },
  ];
  const nileGallery = [
    { video: "/videos/temple/reading.mp4", poster: "/videos/temple/reading-poster.jpg", caption: "Time on the water to think it over." },
    { video: "/videos/temple/driven.mp4", poster: "/videos/temple/driven-poster.jpg", caption: "The quiet drive down to the river." },
  ];

  // Balloon products: the dawn ascent, the monuments you float over, and the
  // breakfast after. Sea products use the brand's quiet-luxury "feel" clips,
  // since there is no Red Sea footage — the sea is carried by the photos.
  const balloonHero = (a: number, b: number): HeroShowItem[] => [
    { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("sky", "balloon"), position: "50% 45%" },
    { type: "image", src: g(a), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("temple", "entering"), position: "40% 45%" },
    { type: "image", src: g(b), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("temple", "table"), position: "50% 50%" },
  ];
  const seaHero = (a: number, b: number): HeroShowItem[] => [
    { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("nile", "nile"), position: "45% 50%" },
    { type: "image", src: g(a), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("temple", "reading"), position: "50% 50%" },
    { type: "image", src: g(b), alt: entry.title, position: "50% 50%" },
    { type: "video", ...clip("temple", "driven"), position: "62% 45%" },
  ];
  const seaGallery = [
    { video: "/videos/desert/yoga.mp4", poster: "/videos/desert/yoga-poster.jpg", caption: "A quiet hour to yourself." },
    { video: "/videos/temple/table.mp4", poster: "/videos/temple/table-poster.jpg", caption: "A table set, just for you." },
  ];

  const HERO_MEDIA: Record<string, HeroShowItem[]> = {
    "private-desert-safari": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "60% 50%" },
      { type: "video", ...clip("desert", "desert-stars"), position: "38% 45%" },
      { type: "image", src: g(5), alt: "Red sand dunes at sunset", position: "50% 55%" },
      { type: "image", src: g(6), alt: "The desert camp, lanterns and carpets", position: "50% 45%" },
      { type: "video", ...clip("desert", "desert-camp"), position: "36% 45%" },
      { type: "image", src: g(8), alt: "The Milky Way over the dunes", position: "50% 55%" },
    ],
    "karnak-at-dawn": templeHero(0, 3),
    "luxor-temple": templeHero(0, 1),
    "hatshepsut-temple": templeHero(0, 1),
    "valley-of-the-kings": templeHero(0, 2),
    "colossi-of-memnon": templeHero(2, 0),
    "deir-el-medina": templeHero(0, 3),
    "dendera-abydos": templeHero(0, 2),
    "ramesseum-valley-of-queens": templeHero(1, 0),
    "luxor-by-night": templeHero(2, 3),
    // The Red Sea → Luxor crossing leads with the drive.
    "hurghada-to-luxor-crossing": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("temple", "driven"), position: "62% 45%" },
      { type: "image", src: g(1), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("temple", "entering"), position: "40% 45%" },
      { type: "image", src: g(3), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("temple", "table"), position: "50% 50%" },
    ],
    "felucca-sunset-sail": nileHero(1, 3),
    "banana-island-felucca": nileHero(0, 2),
    "sailing-lesson-nile": nileHero(3, 0),
    // Dinner cruise leads the hero with the table on the water.
    "nile-dinner-cruise": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("nile", "dinner"), position: "50% 45%" },
      { type: "image", src: g(0), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("nile", "nile"), position: "45% 50%" },
      { type: "image", src: g(3), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("nile", "felucca"), position: "50% 45%" },
    ],
    // Desert products.
    "desert-astronomy-night": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("desert", "desert-stars"), position: "38% 45%" },
      { type: "image", src: g(0), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("desert", "yoga"), position: "50% 40%" },
      { type: "image", src: g(3), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("desert", "desert-camp"), position: "36% 45%" },
    ],
    "camel-bedouin-breakfast": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("desert", "desert-camp"), position: "36% 45%" },
      { type: "image", src: g(2), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("desert", "yoga"), position: "50% 40%" },
      { type: "image", src: g(0), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("temple", "driven"), position: "62% 45%" },
    ],
    "reality-hunting": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("temple", "driven"), position: "62% 45%" },
      { type: "image", src: g(0), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("desert", "yoga"), position: "50% 40%" },
      { type: "image", src: g(1), alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("temple", "reading"), position: "50% 50%" },
    ],
    // Balloon.
    "hot-air-balloon-luxor": balloonHero(2, 3),
    "hot-air-balloon-private-vip": balloonHero(1, 3),
    // Red Sea.
    "private-yacht-red-sea": seaHero(2, 1),
    "red-sea-boat-snorkelling": seaHero(3, 1),
    // No gallery photos — hero image plus clips only.
    "deir-el-shelwit": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("temple", "entering"), position: "40% 45%" },
      { type: "video", ...clip("temple", "yoga"), position: "50% 40%" },
      { type: "video", ...clip("temple", "table"), position: "50% 50%" },
    ],
    "thirty-days-in-the-desert": [
      { type: "image", src: entry.heroImage ?? "", alt: entry.title, position: "50% 50%" },
      { type: "video", ...clip("desert", "desert-stars"), position: "38% 45%" },
      { type: "video", ...clip("desert", "yoga"), position: "50% 40%" },
      { type: "video", ...clip("temple", "reading"), position: "50% 50%" },
    ],
  };
  const heroMedia = HERO_MEDIA[slug];

  // Short "feel" clips shown as their own tiles inside the gallery mosaic.
  const GALLERY_VIDEOS: Record<
    string,
    { video: string; poster: string; caption: string; alt?: string }[]
  > = {
    "private-desert-safari": [
      { video: "/videos/desert/desert-stars.mp4", poster: "/videos/desert/desert-stars-poster.jpg", caption: "Under the Milky Way — a glimpse of the night." },
      { video: "/videos/desert/desert-camp.mp4", poster: "/videos/desert/desert-camp-poster.jpg", caption: "Golden hour into starlight — the evening's arc." },
    ],
    "karnak-at-dawn": templeGallery,
    "luxor-temple": templeGallery,
    "hatshepsut-temple": templeGallery,
    "valley-of-the-kings": templeGallery,
    "colossi-of-memnon": templeGallery,
    "deir-el-medina": templeGallery,
    "dendera-abydos": templeGallery,
    "ramesseum-valley-of-queens": templeGallery,
    "luxor-by-night": templeGallery,
    // Crossing uses the drive + entering in the hero, so the gallery gets the
    // quiet pair instead.
    "hurghada-to-luxor-crossing": [
      { video: "/videos/temple/yoga.mp4", poster: "/videos/temple/yoga-poster.jpg", caption: "A quiet hour, somewhere along the way." },
      { video: "/videos/temple/reading.mp4", poster: "/videos/temple/reading-poster.jpg", caption: "Time to sit with it, and write it down." },
    ],
    "felucca-sunset-sail": nileGallery,
    "banana-island-felucca": nileGallery,
    "sailing-lesson-nile": nileGallery,
    "nile-dinner-cruise": nileGallery,
    "desert-astronomy-night": [
      { video: "/videos/temple/reading.mp4", poster: "/videos/temple/reading-poster.jpg", caption: "Time to sit with it, and write it down." },
      { video: "/videos/temple/driven.mp4", poster: "/videos/temple/driven-poster.jpg", caption: "The drive out, past the last of the light." },
    ],
    "camel-bedouin-breakfast": [
      { video: "/videos/temple/reading.mp4", poster: "/videos/temple/reading-poster.jpg", caption: "A slow start, before the heat." },
      { video: "/videos/temple/table.mp4", poster: "/videos/temple/table-poster.jpg", caption: "Breakfast laid out at the desert's edge." },
    ],
    "reality-hunting": [
      { video: "/videos/temple/table.mp4", poster: "/videos/temple/table-poster.jpg", caption: "A table set, somewhere real." },
      { video: "/videos/nile/nile.mp4", poster: "/videos/nile/nile-poster.jpg", caption: "An hour by the river, doing nothing." },
    ],
    "hot-air-balloon-luxor": templeGallery,
    "hot-air-balloon-private-vip": templeGallery,
    "private-yacht-red-sea": seaGallery,
    "red-sea-boat-snorkelling": seaGallery,
  };
  const galleryVideos = GALLERY_VIDEOS[slug];

  const MOMENT_IMAGE: Record<string, string> = {
    "private-desert-safari": "/images/experiences/private-desert-safari/moment.jpg",
    "karnak-at-dawn": g(1),
    "luxor-temple": g(3),
    "hatshepsut-temple": g(0),
    "valley-of-the-kings": g(2),
    "colossi-of-memnon": g(2),
    "deir-el-medina": g(3),
    "dendera-abydos": g(1),
    "ramesseum-valley-of-queens": g(1),
    "luxor-by-night": g(3),
    "hurghada-to-luxor-crossing": g(3),
    "felucca-sunset-sail": g(0),
    "banana-island-felucca": g(1),
    "sailing-lesson-nile": g(2),
    "nile-dinner-cruise": g(2),
    "desert-astronomy-night": g(3),
    "camel-bedouin-breakfast": g(0),
    "reality-hunting": g(4),
    "hot-air-balloon-luxor": g(2),
    "hot-air-balloon-private-vip": g(3),
    "private-yacht-red-sea": g(2),
    "red-sea-boat-snorkelling": g(3),
  };
  const momentImage = MOMENT_IMAGE[slug];

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
        offers: isEnquiry
          ? {
              "@type": "Offer",
              priceSpecification: { "@type": "PriceSpecification", priceCurrency: "EUR" },
              availability: "https://schema.org/LimitedAvailability",
              url: `https://luxorrising.com/experiences/${slug}#book`,
            }
          : {
              "@type": "Offer",
              price: String(basePrice),
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
      <Nav ctaHref="#book" ctaLabel={isEnquiry ? "Enquire" : "Reserve"} />

      <ExperienceTemplate
        isEnquiry={isEnquiry}
        socialProof={socialProof}
        title={entry.title}
        hook={entry.hook}
        heroEyebrow={entry.heroEyebrow}
        heroImage={entry.heroImage ?? ""}
        heroMedia={heroMedia}
        glanceLead={entry.glanceLead}
        bestTime={entry.bestTime}
        duration={entry.duration}
        glanceIncludes={entry.glanceIncludes}
        highlights={entry.highlights.map((h) => ({ title: h.title, description: h.description }))}
        contentNode={entry.content.node}
        momentQuote={entry.momentQuote || undefined}
        momentImage={momentImage}
        gallery={entry.gallery.map((g) => ({ src: g.image ?? "", alt: g.caption, caption: g.caption }))}
        galleryVideos={galleryVideos}
        bookEyebrow={entry.bookEyebrow}
        bookTitle={entry.bookTitle}
        bookLead={entry.bookLead}
        bookNote={entry.bookNote || undefined}
        configurator={
          isEnquiry ? (
            <div className="wrap-narrow" style={{ paddingTop: "1.5rem" }}>
              {entry.takenCareOf.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1.1rem 2rem",
                    margin: "0 0 2.5rem",
                    textAlign: "left",
                  }}
                >
                  {entry.takenCareOf.map((t) => (
                    <div key={t.title} style={{ display: "flex", gap: ".8rem" }}>
                      <span aria-hidden style={{ color: "var(--color-gold)", fontFamily: "var(--font-display)", lineHeight: 1.3 }}>✦</span>
                      <div>
                        <b style={{ display: "block", color: "var(--color-ink)", fontWeight: 500 }}>{t.title}</b>
                        {t.note && <span style={{ color: "var(--color-muted)", fontSize: ".92rem", lineHeight: 1.55 }}>{t.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <EnquiryForm topic={entry.name || entry.title} note={entry.bookNote || undefined} />
            </div>
          ) : (
            <ExperienceConfigurator
              name={entry.name || entry.title}
              slug={slug}
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
              socialProof={socialProof}
              image={entry.heroImage || undefined}
              title={entry.title || undefined}
              region={region}
              hurghadaTransfer={hurghadaTransfer}
            />
          )
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
          signature: t.signature || undefined,
          signatureSub: t.signatureSub || undefined,
          signatureHref: t.signatureHref || undefined,
          image: t.image || undefined,
        }))}
        reviewsVerified={globals?.reviewsVerified ?? false}
        reviewAverage={reviewAverage}
        reviewCount={reviewCount}
        finalTitle={isEnquiry ? "Begin a private conversation" : `Reserve ${entry.title}`}
        finalText={
          isEnquiry
            ? "Fully bespoke and arranged end to end. Tell us what you’re carrying — we reply personally, within 24 hours."
            : `Private, certified-guided, and arranged end to end — from €${basePrice}.`
        }
        finalCtaHref="#book"
        finalCtaLabel={isEnquiry ? "Request an invitation →" : "Reserve this experience →"}
      />

      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
