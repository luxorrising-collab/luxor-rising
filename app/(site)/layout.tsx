import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "../globals.css";
import ConsentProvider from "@/components/consent/ConsentProvider";
import ConsentManager from "@/components/consent/ConsentManager";
import ConsentBanner from "@/components/consent/ConsentBanner";
import { reader } from "@/lib/keystatic-reader";
import { EMPTY_CONFIG, type ConsentConfig } from "@/lib/consent";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await reader.singletons.tracking.read();
  const trackingConfig: ConsentConfig = t
    ? {
        enabled: t.enabled,
        gtmId: t.gtmId ?? "",
        ga4Id: t.ga4Id ?? "",
        metaPixelId: t.metaPixelId ?? "",
      }
    : EMPTY_CONFIG;

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConsentProvider config={trackingConfig}>
          <ConsentManager />
          {children}
          <ConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
