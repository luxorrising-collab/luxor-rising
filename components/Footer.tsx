import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";
import CookieSettingsButton from "./consent/CookieSettingsButton";

type FooterLink = { href: string; label: string };
type FooterColumn = { title: string; links: FooterLink[] };
export type SocialLinksData = {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
};

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.15" cy="6.85" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" />
      <path
        d="M13.6 21v-7.2h2.2l.35-2.7h-2.55v-1.73c0-.78.2-1.32 1.32-1.32H16.3V5.63c-.24-.03-1.05-.1-1.98-.1-1.97 0-3.31 1.2-3.31 3.42v1.9H8.8v2.7h2.2V21"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="4" />
      <path d="M10.4 9.6l4.6 2.4-4.6 2.4z" fill="currentColor" stroke="none" strokeLinejoin="round" />
    </svg>
  );
}

function SocialLinks({ instagramUrl, facebookUrl, youtubeUrl }: SocialLinksData) {
  if (!instagramUrl && !facebookUrl && !youtubeUrl) return null;
  return (
    <div className={styles.social}>
      {instagramUrl && (
        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <IconInstagram />
        </a>
      )}
      {facebookUrl && (
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <IconFacebook />
        </a>
      )}
      {youtubeUrl && (
        <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <IconYoutube />
        </a>
      )}
    </div>
  );
}

export function FullFooter({
  columns,
  social,
}: {
  columns: FooterColumn[];
  social?: SocialLinksData;
}) {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <Image
                src="/images/logo-footer.jpg"
                alt="Luxor Rising"
                width={140}
                height={140}
              />
            </Link>
            <p className={styles.tagline}>
              Your private concierge in Egypt — we arrange, you arrive.
            </p>
            <span className={styles.brandDivider} aria-hidden="true" />
            <p className={styles.taglineSecondary}>
              Where reality meets tranquility and every moment becomes cherished.
            </p>
          </div>
          {columns.map((col) => (
            <div className={styles.col} key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) => (
                <Link key={l.label} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.bottom}>
          <div className={styles.bottomCopy}>
            © 2026 Luxor Rising — private concierge in Egypt ·{" "}
            <CookieSettingsButton />
          </div>
          {social && <SocialLinks {...social} />}
        </div>
      </div>
    </footer>
  );
}

export function MinimalFooter({
  links,
  social,
  bottomText = "© 2026 Luxor Rising — private concierge in Egypt · Luxor & Hurghada, Egypt",
}: {
  links: FooterLink[];
  social?: SocialLinksData;
  bottomText?: string;
}) {
  return (
    <footer className={`${styles.footer} ${styles.minimal}`}>
      <div className="wrap">
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/logo-footer.jpg"
            alt="Luxor Rising"
            width={120}
            height={120}
          />
        </Link>
        <p className={styles.tagline}>
          Your private concierge in Egypt — we arrange, you arrive.
        </p>
        <span className={styles.brandDivider} aria-hidden="true" />
        <p className={styles.taglineSecondary}>
          Where reality meets tranquility and every moment becomes cherished.
        </p>
        <div className={styles.minimalLinks}>
          {links.map((l, i) => (
            <Link key={i} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        {social && <SocialLinks {...social} />}
        <div className={styles.bottom}>
          {bottomText} · <CookieSettingsButton />
        </div>
      </div>
    </footer>
  );
}
