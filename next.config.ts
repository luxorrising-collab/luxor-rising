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
};

export default nextConfig;
