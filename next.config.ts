import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Next resolves @keystatic/core/ui's "./ui" export using
  // Node's plain "node" > "default" condition instead of its "react-server"
  // condition, which serves a server-only stub that always renders null —
  // the admin UI at /keystatic ends up completely blank.
  transpilePackages: ["@keystatic/core", "@keystatic/next"],
  // Keystatic's reader always reads content/ straight off disk, regardless
  // of storage.kind. Static pages get the full repo for free at build time,
  // but dynamic routes (app/(site)/experiences/[slug], .../insiders-guide/
  // [slug]) run as real serverless functions on Vercel — their bundle only
  // includes files Next can statically trace, and a runtime-computed file
  // path like `content/experiences/${slug}/index.mdoc` isn't traceable.
  // Without this, those functions ship with no content/ files at all, so
  // every entry 404s in production despite working locally.
  outputFileTracingIncludes: {
    "/*": ["./content/**"],
  },
  // Next 16 only serves quality values declared here; hero photos use 90 for
  // crisp full-bleed rendering, everything else stays on the default 75.
  images: {
    qualities: [75, 90],
  },
  async headers() {
    const dev = process.env.NODE_ENV === "development";
    // CSP scoped to what the site actually loads: Google Fonts, GA/GTM, Meta
    // Pixel, and GitHub (Keystatic admin). Stripe is a full redirect to
    // checkout.stripe.com, so no Stripe origins are needed here. Inline scripts
    // (the consent-mode bootstrap, GA config) require 'unsafe-inline'; 'unsafe-
    // eval' + ws: are added in dev only, for React Fast Refresh.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self' https://github.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://connect.facebook.net`,
      `connect-src 'self'${dev ? " ws:" : ""} https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://*.facebook.com https://api.github.com https://github.com https://raw.githubusercontent.com`,
      "frame-src 'self' https://www.googletagmanager.com https://*.facebook.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
