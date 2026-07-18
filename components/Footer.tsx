import Image from "next/image";
import Link from "next/link";
import styles from "./Footer.module.css";

type FooterLink = { href: string; label: string };
type FooterColumn = { title: string; links: FooterLink[] };

export function FullFooter({ columns }: { columns: FooterColumn[] }) {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <Image
                src="/images/logo-footer.png"
                alt="Luxor Rising"
                width={140}
                height={140}
              />
            </Link>
            <p className={styles.tagline}>
              Your private consigliere in Egypt — we arrange, you arrive.
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
          <div>© 2026 Luxor Rising — private concierge in Egypt</div>
          <div className={styles.langs}>
            <a>EN</a>
            <a>SK</a>
            <a>DE</a>
            <a>RU</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function MinimalFooter({
  links,
  showLangs = false,
  bottomText = "© 2026 Luxor Rising — private concierge in Egypt · Luxor & Hurghada, Egypt",
}: {
  links: FooterLink[];
  showLangs?: boolean;
  bottomText?: string;
}) {
  return (
    <footer className={`${styles.footer} ${styles.minimal}`}>
      <div className="wrap">
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/logo-footer.png"
            alt="Luxor Rising"
            width={120}
            height={120}
          />
        </Link>
        <p className={styles.tagline}>
          Your private consigliere in Egypt — we arrange, you arrive.
        </p>
        <div className={styles.minimalLinks}>
          {links.map((l, i) => (
            <Link key={i} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className={styles.bottom}>
          {bottomText}
          {showLangs && (
            <span className={styles.langs}>
              {" "}
              · <a>EN</a>
              <a>SK</a>
              <a>DE</a>
              <a>RU</a>
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
