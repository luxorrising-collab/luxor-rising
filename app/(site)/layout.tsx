import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "../globals.css";
import ConsentProvider from "@/components/consent/ConsentProvider";
import ConsentManager from "@/components/consent/ConsentManager";
import ConsentBanner from "@/components/consent/ConsentBanner";
import JsonLd from "@/components/JsonLd";
import { reader } from "@/lib/keystatic-reader";
import { EMPTY_CONFIG, type ConsentConfig } from "@/lib/consent";

const SITE = "https://luxorrising.com";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luxorrising.com"),
  title: {
    default: "Luxor Rising — Your private concierge in Egypt",
    template: "%s | Luxor Rising",
  },
  description:
    "Private, unhurried days in ancient Egypt — arranged one experience at a time, for no more than four guests, by people who live here.",
  openGraph: {
    type: "website",
    siteName: "Luxor Rising",
    url: "/",
    images: [
      {
        url: "/images/heroImage.jpg",
        width: 1200,
        height: 630,
        alt: "Luxor Rising — private days in ancient Egypt",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  // Google Search Console "HTML tag" verification. Set GOOGLE_SITE_VERIFICATION
  // in the environment to the token Search Console gives you; when unset,
  // nothing is rendered. (A DNS "Domain property" needs no code at all.)
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [t, settings] = await Promise.all([
    reader.singletons.tracking.read(),
    reader.singletons.siteSettings.read(),
  ]);
  const trackingConfig: ConsentConfig = t
    ? {
        enabled: t.enabled,
        gtmId: t.gtmId ?? "",
        ga4Id: t.ga4Id ?? "",
        metaPixelId: t.metaPixelId ?? "",
      }
    : EMPTY_CONFIG;

  // Site-wide structured data: Organization (a travel agency) + WebSite, so
  // search engines can attach the brand, logo and socials to every page.
  const sameAs = [settings?.instagramUrl, settings?.facebookUrl, settings?.youtubeUrl].filter(
    (u): u is string => !!u,
  );
  const orgGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "TravelAgency"],
        "@id": `${SITE}/#org`,
        name: "Luxor Rising",
        url: SITE,
        logo: `${SITE}/images/logo-emblem.png`,
        image: `${SITE}/images/heroImage.jpg`,
        description:
          "Private, unhurried days in ancient Egypt — arranged one experience at a time, for no more than four guests, by people who live here.",
        areaServed: [
          { "@type": "City", name: "Luxor" },
          { "@type": "City", name: "Hurghada" },
          { "@type": "Country", name: "Egypt" },
        ],
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: SITE,
        name: "Luxor Rising",
        publisher: { "@id": `${SITE}/#org` },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={orgGraph} />
        <ConsentProvider config={trackingConfig}>
          <ConsentManager />
          {children}
          <ConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
