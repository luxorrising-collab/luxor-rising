// Lightweight, self-built cookie-consent core.
//
// Design: Google Consent Mode v2 for anything Google (GTM + GA4), plus a HARD
// gate for Meta Pixel (Meta does not honour Consent Mode, so its script must
// never load until the visitor opts in). "Reject" therefore means genuinely
// nothing non-essential is set — which is the whole compliance test.
//
// Tracking IDs come from env vars, so nothing is hardcoded and the banner only
// appears once at least one service is configured.

export type ConsentCategory = "necessary" | "analytics" | "marketing";

/** The visitor's choice. `necessary` is always true — it is not optional. */
export type ConsentChoices = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

/** What we persist in the cookie. `v` lets us re-ask if the categories change. */
export type StoredConsent = ConsentChoices & { v: number; ts: number };

/** Bump this if you add/rename a category — old consents are then re-requested. */
export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "lr_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

/** Custom events used to decouple the banner, the footer link and the scripts. */
export const CONSENT_OPEN_EVENT = "lr:consent-open"; // reopen the preferences UI
export const CONSENT_CHANGE_EVENT = "lr:consent-change"; // a choice was saved

/** Tracking config — sourced from Keystatic ("Tracking & analytics"). */
export type ConsentConfig = {
  enabled: boolean;
  gtmId: string;
  ga4Id: string;
  metaPixelId: string;
};

export const EMPTY_CONFIG: ConsentConfig = {
  enabled: false,
  gtmId: "",
  ga4Id: "",
  metaPixelId: "",
};

// The live config is set once by <ConsentProvider> (from the Keystatic value)
// so plain helpers like applyConsent() can reach the Meta Pixel ID without
// prop-drilling. Kept in module scope; the provider is the single writer.
let _config: ConsentConfig = EMPTY_CONFIG;

export function configureConsent(cfg: ConsentConfig): void {
  _config = cfg;
}
export function getConsentConfig(): ConsentConfig {
  return _config;
}

/** Tracking is live only if switched on AND at least one ID is present. */
export function isTrackingEnabled(cfg: ConsentConfig): boolean {
  return cfg.enabled && Boolean(cfg.gtmId || cfg.ga4Id || cfg.metaPixelId);
}

export const REJECT_ALL: ConsentChoices = {
  necessary: true,
  analytics: false,
  marketing: false,
};
export const ACCEPT_ALL: ConsentChoices = {
  necessary: true,
  analytics: true,
  marketing: true,
};

/** Read the saved choice, or null if none / from an outdated version. */
export function getStoredConsent(): StoredConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + CONSENT_COOKIE + "=([^;]*)"),
  );
  if (!match) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as StoredConsent;
    if (!parsed || parsed.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Persist a choice as a first-party cookie (Lax, Secure on https). */
export function saveConsent(choices: ConsentChoices): StoredConsent {
  const stored: StoredConsent = {
    ...choices,
    necessary: true,
    v: CONSENT_VERSION,
    ts: Date.now(),
  };
  if (typeof document !== "undefined") {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(stored))}` +
      `; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  }
  return stored;
}

/**
 * Push the visitor's choice to the live scripts:
 *  - Google (GTM/GA4) via Consent Mode v2 `update`
 *  - Meta Pixel via a hard load-on-grant (never loaded while denied)
 */
export function applyConsent(choices: ConsentChoices): void {
  if (typeof window === "undefined") return;

  window.gtag?.("consent", "update", {
    ad_storage: choices.marketing ? "granted" : "denied",
    ad_user_data: choices.marketing ? "granted" : "denied",
    ad_personalization: choices.marketing ? "granted" : "denied",
    analytics_storage: choices.analytics ? "granted" : "denied",
  });

  if (choices.marketing && _config.metaPixelId) {
    loadMetaPixel(_config.metaPixelId);
  } else {
    // Already loaded earlier this session? Tell Meta to stop firing.
    window.fbq?.("consent", "revoke");
  }

  window.dispatchEvent(
    new CustomEvent(CONSENT_CHANGE_EVENT, { detail: choices }),
  );
}

/** Inject the Meta Pixel exactly once, only after marketing consent. */
export function loadMetaPixel(pixelId: string): void {
  if (typeof window === "undefined") return;
  if (window._lrMetaLoaded) {
    window.fbq?.("consent", "grant");
    return;
  }
  window._lrMetaLoaded = true;

  /* Standard Meta Pixel base code (only reached once the visitor opts in). */
  /* eslint-disable */
  // @ts-ignore - third-party snippet defines fbq on window
  !(function (f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */

  window.fbq?.("consent", "grant");
  window.fbq?.("init", pixelId);
  window.fbq?.("track", "PageView");
}

/** Programmatically reopen the preferences panel (used by the footer link). */
export function openConsentSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    _lrMetaLoaded?: boolean;
  }
}
