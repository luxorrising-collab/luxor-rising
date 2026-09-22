"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  CONSENT_DEFAULT_GRANTED,
  applyConsent,
  effectiveConsent,
  isTrackingEnabled,
} from "@/lib/consent";
import { useConsentConfig } from "./ConsentProvider";

/**
 * Loads the tracking scripts in a consent-safe order:
 *
 *  1. `beforeInteractive` — set Consent Mode v2 DEFAULTS to denied *before* GTM
 *     runs, reading any previously saved choice so returning visitors aren't
 *     re-asked and their tracking resumes immediately (no flash of "denied").
 *  2. `afterInteractive` — GTM, and (optionally) GA4 loaded directly. Both honour
 *     the consent defaults above, so nothing is stored until the visitor opts in.
 *
 * Meta Pixel is deliberately NOT here — it is hard-gated in lib/consent.ts and
 * only injected once marketing consent is granted.
 */
export default function ConsentManager() {
  const config = useConsentConfig();
  const { gtmId, ga4Id } = config;
  const pathname = usePathname();

  // On mount, apply the effective choice so Meta loads for returning opt-ins
  // (and, in testing mode, for everyone by default).
  useEffect(() => {
    const c = effectiveConsent();
    if (c) applyConsent(c);
  }, []);

  // SPA page views: Next client navigations don't reload the page, so fire a
  // page_view / PageView on route change for whichever service is consented.
  useEffect(() => {
    const c = effectiveConsent();
    if (!c) return;
    if (c.analytics && ga4Id) {
      window.gtag?.("event", "page_view", { page_path: pathname });
    }
    if (c.marketing) {
      window.fbq?.("track", "PageView");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!isTrackingEnabled(config)) return null;

  return (
    <>
      {/* 1. Consent Mode v2 defaults — MUST run before GTM. */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`(function(){
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  var dg=${CONSENT_DEFAULT_GRANTED ? "true" : "false"};
  var a=dg, m=dg;
  try {
    var x = document.cookie.match(/(?:^|; )${CONSENT_COOKIE}=([^;]*)/);
    if (x) { var c = JSON.parse(decodeURIComponent(x[1])); if (c && c.v===${CONSENT_VERSION}) { a=!!c.analytics; m=!!c.marketing; } }
  } catch(e){}
  gtag('consent','default',{
    ad_storage: m?'granted':'denied',
    ad_user_data: m?'granted':'denied',
    ad_personalization: m?'granted':'denied',
    analytics_storage: a?'granted':'denied',
    functionality_storage:'granted',
    security_storage:'granted',
    wait_for_update: 500
  });
  gtag('js', new Date());
})();`}
      </Script>

      {/* 2a. Google Tag Manager (respects the consent defaults above). */}
      {gtmId && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {/* 2b. GA4 direct (optional — use this OR a GA4 tag inside GTM, not both). */}
      {ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`gtag('js', new Date()); gtag('config', '${ga4Id}');`}
          </Script>
        </>
      )}
    </>
  );
}
