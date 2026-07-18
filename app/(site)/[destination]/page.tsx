import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { FullFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import DestinationTemplate from "@/components/DestinationTemplate";
import { FOOTER_COLUMNS } from "@/components/mainNav";
import { reader } from "@/lib/keystatic-reader";

async function getEntry(slug: string) {
  const entry = await reader.collections.destinations.read(slug, { resolveLinkedFiles: true });
  if (!entry || !entry.isActive) return null;
  return entry;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ destination: string }>;
}): Promise<Metadata> {
  const { destination } = await params;
  const entry = await getEntry(destination);
  if (!entry) return {};
  const title = entry.metaTitle || entry.heroTitle;
  const description = entry.metaDescription || entry.heroSubtitle;
  return {
    title,
    description,
    alternates: { canonical: `/${destination}` },
    openGraph: {
      type: "website",
      siteName: "Luxor Rising",
      title,
      description,
      images: entry.heroImage ? [entry.heroImage] : undefined,
      url: `/${destination}`,
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ destination: string }>;
}) {
  const { destination } = await params;
  const entry = await getEntry(destination);
  if (!entry) notFound();

  const data = {
    heroEyebrow: entry.heroEyebrow,
    heroTitle: entry.heroTitle,
    heroSubtitle: entry.heroSubtitle,
    heroImage: entry.heroImage ?? "",
    heroTrustLine: entry.heroTrustLine,
    primaryCtaLabel: entry.primaryCtaLabel,
    primaryCtaHref: entry.primaryCtaHref,
    secondaryCtaLabel: entry.secondaryCtaLabel,
    secondaryCtaHref: entry.secondaryCtaHref,
    trustItems: [...entry.trustItems],
    showFeature: entry.showFeature,
    featureEyebrow: entry.featureEyebrow,
    featureTitle: entry.featureTitle,
    featureBody: entry.featureBody,
    featureImage: entry.featureImage ?? "",
    featurePriceValue: entry.featurePriceValue,
    featurePriceNote: entry.featurePriceNote,
    featureCtaLabel: entry.featureCtaLabel,
    featureCtaHref: entry.featureCtaHref,
    experiencesEyebrow: entry.experiencesEyebrow,
    experiencesTitle: entry.experiencesTitle,
    experiencesLead: entry.experiencesLead,
    experiences: entry.experiences.map((e) => ({
      image: e.image ?? "",
      meta: e.meta,
      title: e.title,
      hook: e.hook,
      badge: e.badge,
      priceLabel: e.priceLabel,
      priceValue: e.priceValue,
      priceNote: e.priceNote,
      ctaLabel: e.ctaLabel,
      href: e.href,
    })),
    guideEyebrow: entry.guideEyebrow,
    guideTitle: entry.guideTitle,
    guideIntro: entry.guideIntro,
    guideSections: entry.guideSections.map((s) => ({ heading: s.heading, body: s.body })),
    guideLinkLabel: entry.guideLinkLabel,
    guideLinkHref: entry.guideLinkHref,
    faqTitle: entry.faqTitle,
    faq: entry.faq.map((f) => ({ question: f.question, answer: f.answer })),
    closerEyebrow: entry.closerEyebrow,
    closerTitle: entry.closerTitle,
    closerText: entry.closerText,
    closerCtaLabel: entry.closerCtaLabel,
    closerCtaHref: entry.closerCtaHref,
    closerSecondaryLabel: entry.closerSecondaryLabel,
    closerSecondaryHref: entry.closerSecondaryHref,
  };

  const JSON_LD = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: entry.heroTitle,
    description: entry.heroSubtitle,
    url: `https://luxorrising.com/${destination}`,
    image: entry.heroImage ? `https://luxorrising.com${entry.heroImage}` : undefined,
  };

  return (
    <>
      <JsonLd data={JSON_LD} />
      <Nav scrollAware ctaHref={entry.primaryCtaHref} ctaLabel="Design your day" />
      <DestinationTemplate data={data} />
      <FullFooter columns={FOOTER_COLUMNS} />
    </>
  );
}
