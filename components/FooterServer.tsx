import { reader } from "@/lib/keystatic-reader";
import { FullFooter, MinimalFooter, type SocialLinksData } from "./Footer";

type FooterLink = { href: string; label: string };
type FooterColumn = { title: string; links: FooterLink[] };

async function getSocialLinks(): Promise<SocialLinksData> {
  const s = await reader.singletons.siteSettings.read();
  return {
    instagramUrl: s?.instagramUrl ?? null,
    facebookUrl: s?.facebookUrl ?? null,
    youtubeUrl: s?.youtubeUrl ?? null,
  };
}

// Server wrapper: fetches the social links from Keystatic, then renders the
// presentational Footer. Kept out of Footer.tsx because that file is also
// imported by app/(site)/error.tsx, a Client Component — pulling the
// filesystem-backed `reader` into that bundle breaks the client build.
export async function SiteFooter({ columns }: { columns: FooterColumn[] }) {
  const social = await getSocialLinks();
  return <FullFooter columns={columns} social={social} />;
}

export async function SiteMinimalFooter({
  links,
  showSocial = false,
  bottomText,
}: {
  links: FooterLink[];
  showSocial?: boolean;
  bottomText?: string;
}) {
  const social = showSocial ? await getSocialLinks() : undefined;
  return <MinimalFooter links={links} social={social} bottomText={bottomText} />;
}
