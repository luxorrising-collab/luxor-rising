"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lazy, muted, looping background video with an instant poster image.
 *
 * Performance: the poster paints immediately (so it never affects LCP), and the
 * clip is only fetched + played once the section scrolls near the viewport
 * (IntersectionObserver + preload="none"). On reduced-motion, Data-Saver, or
 * small screens, ONLY the poster is shown — no video download at all.
 *
 * Decorative only (aria-hidden); layer your tint + text on top as usual.
 */
export default function BackgroundVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = (q: string) => window.matchMedia?.(q).matches;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    // Respect motion/data preferences and skip video on phones — poster stays.
    if (mq("(prefers-reduced-motion: reduce)") || mq("(max-width: 768px)") || saveData) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!load) return;
    const el = ref.current;
    if (!el) return;
    el.load();
    el.play().catch(() => {
      /* autoplay may be blocked — the poster remains, which is fine */
    });
  }, [load]);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    >
      {load && <source src={src} type="video/mp4" />}
    </video>
  );
}
