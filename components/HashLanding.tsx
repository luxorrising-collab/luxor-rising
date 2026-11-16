"use client";

import { useEffect } from "react";

/**
 * Lands "#<id>" links exactly at the section's start, under the fixed header.
 * A plain anchor jump can end up off target when photos, fonts or the hero
 * finish loading above it and push the page down; this re-aligns once the page
 * has settled, unless the visitor has already started scrolling themselves.
 */
export default function HashLanding({ id, offset = 72 }: { id: string; offset?: number }) {
  useEffect(() => {
    let userMoved = false;
    const timers: number[] = [];
    const onUser = () => {
      userMoved = true;
    };
    const align = () => {
      if (userMoved || window.location.hash !== `#${id}`) return;
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: "auto" });
    };
    const land = () => {
      userMoved = false;
      [0, 150, 500, 1100].forEach((ms) => timers.push(window.setTimeout(align, ms)));
    };
    window.addEventListener("wheel", onUser, { passive: true });
    window.addEventListener("touchstart", onUser, { passive: true });
    window.addEventListener("keydown", onUser);
    window.addEventListener("hashchange", land);
    window.addEventListener("load", land, { once: true });
    land();
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("wheel", onUser);
      window.removeEventListener("touchstart", onUser);
      window.removeEventListener("keydown", onUser);
      window.removeEventListener("hashchange", land);
    };
  }, [id, offset]);
  return null;
}
