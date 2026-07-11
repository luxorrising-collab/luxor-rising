"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./Nav.module.css";

export type NavLink = { href: string; label: string };

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
            {links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}
        <Link href={ctaHref} className={styles.cta}>
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
