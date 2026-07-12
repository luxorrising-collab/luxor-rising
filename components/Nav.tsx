"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

export type NavLink = { href: string; label: string };

function isActiveLink(href: string, pathname: string) {
  if (href.startsWith("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav({
  scrollAware = true,
  links,
  ctaHref,
  ctaLabel,
  brandHref = "/",
}: {
  scrollAware?: boolean;
  links?: NavLink[];
  ctaHref: string;
  ctaLabel: string;
  brandHref?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!scrollAware) return;
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollAware]);

  const solid = !scrollAware || scrolled;

  return (
    <header className={`${styles.nav} ${solid ? styles.solid : ""}`}>
      <div className={styles.inner}>
        <Link href={brandHref} className={styles.brand}>
          <Image
            className={styles.brandMark}
            src="/images/logo-emblem.png"
            alt="Luxor Rising emblem"
            width={32}
            height={32}
          />
          Luxor<span> Rising</span>
        </Link>
        {links && links.length > 0 && (
          <nav className={styles.links}>
            {links.map((l) => {
              const active = isActiveLink(l.href, pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={active ? styles.active : undefined}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}
        <Link href={ctaHref} className={styles.cta}>
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
