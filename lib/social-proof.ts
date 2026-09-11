import { reader } from "@/lib/keystatic-reader";

// Single source of truth for the main social-proof line, shown site-wide next
// to ★★★★★ (the stars are rendered in markup). Editable in Keystatic under
// Site settings → "Social proof claim (main)".
export const SOCIAL_PROOF_FALLBACK = "4.9 · 28+ private days arranged";

export async function getSocialProof(): Promise<string> {
  const s = await reader.singletons.siteSettings.read();
  const v = s?.socialProof?.trim();
  return v || SOCIAL_PROOF_FALLBACK;
}
