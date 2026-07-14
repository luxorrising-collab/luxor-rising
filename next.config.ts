import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Next resolves @keystatic/core/ui's "./ui" export using
  // Node's plain "node" > "default" condition instead of its "react-server"
  // condition, which serves a server-only stub that always renders null —
  // the admin UI at /keystatic ends up completely blank.
  transpilePackages: ["@keystatic/core", "@keystatic/next"],
};

export default nextConfig;
