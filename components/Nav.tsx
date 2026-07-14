"use client";

import { useEffect, useId, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();

  // Close the mobile menu whenever the route changes (e.g. back/forward
  // navigation that doesn't go through a link's own onClick handler).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!scrollAware) return;
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollAware]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const solid = !scrollAware || scrolled || menuOpen;
  const hasLinks = Boolean(links && links.length > 0);

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
        {hasLinks && (
          <nav className={styles.links}>
            {links!.map((l) => {
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
        <Link href={ctaHref} className={`${styles.cta} ${hasLinks ? styles.ctaCollapsible : ""}`}>
          {ctaLabel}
        </Link>
        {hasLinks && (
          <button
            type="button"
            className={styles.burger}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`${styles.burgerBar} ${menuOpen ? styles.burgerBarOpen : ""}`} />
          </button>
        )}
      </div>

      {hasLinks && (
        <div
          id={menuId}
          className={styles.mobileMenu}
          style={{ maxHeight: menuOpen ? 520 : 0, opacity: menuOpen ? 1 : 0 }}
        >
          <nav className={styles.mobileLinks}>
            {links!.map((l) => {
              const active = isActiveLink(l.href, pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={active ? styles.active : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href={ctaHref}
            className={`btn btn-primary ${styles.mobileCta}`}
            onClick={() => setMenuOpen(false)}
          >
            {ctaLabel}
          </Link>
        </div>
      )}
    </header>
  );
}
