"use client";

// This page must be a Client Component. @keystatic/core's schema objects
// (fields.slug/image/etc.) carry functions (parse/serialize/validate, and
// React Input components) that cannot cross a Server->Client prop boundary
// via RSC serialization — the config has to be imported directly inside a
// "use client" module, not passed in as a prop from a server page.
import { Keystatic } from "@keystatic/core/ui";
import type { Config } from "@keystatic/core";
import keystaticConfig from "../../../keystatic.config";

export default function KeystaticPage() {
  return (
    <Keystatic
      config={keystaticConfig as Config}
      appSlug={{
        envName: "NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG",
        value: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
      }}
    />
  );
}
