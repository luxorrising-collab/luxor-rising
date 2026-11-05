"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./HeroShow.module.css";

export type HeroShowItem = {
  type: "image" | "video";
  src: string;
  /** First-frame image for a video — also used in place of the video on
      mobile / data-saver, so the slideshow still runs without the download. */
  poster?: string;
  /** A video cropped to the tall phone frame (same footage, ~⅓ of the bytes),
      played on portrait phones in place of `src`. */
  mobileSrc?: string;
  alt?: string;
  /** object-position for the cover crop, e.g. "38% 50%" — point the crop at the
      subject so a tall mobile frame keeps the face/hero in view. */
  position?: string;
};

/**
 * A cinematic hero slideshow that crossfades through images AND short muted
 * video clips. The first item paints immediately (so it carries LCP, like a
 * normal hero image); the slideshow then advances on a timer — images dwell a
 * few seconds, clips run their length.
 *
 * Perf & accessibility, mirroring BackgroundVideo:
 *  - prefers-reduced-motion → the first item only, no cycling.
 *  - The first photo paints on its own: cycling (and so any clip download)
 *    starts only after the page has loaded and the browser is idle, so video
 *    never competes with the first screen or the page's scripts.
 *  - Portrait phones play `mobileSrc` — the clip pre-cropped to the tall frame,
 *    the same pixels they'd see anyway at about a third of the bytes.
 *  - Data-Saver or a 2G connection → it still crossfades, but video items show
 *    their poster image instead of downloading the clip.
 *  - Only the slide on screen, the one leaving and the next one are mounted;
 *    a slide stays mounted once shown, so nothing downloads twice and the rest
 *    of the clips never load up front.
 *  - Scrolled out of view (or a hidden tab) → it pauses: no clip plays, decodes
 *    or downloads while the visitor reads the rest of the page.
 */
export default function HeroShow({ items }: { items: HeroShowItem[] }) {
  // [active, previous] — the leaving slide is held fully opaque beneath the
  // incoming one (z-stacked) so the crossfade never opens a gap that would let
  // the tint flicker or lighten mid-fade.
  const [[active, prev], setAV] = useState<[number, number]>([0, 0]);
  const [cycle, setCycle] = useState(false);
  const [enableVideo, setEnableVideo] = useState(false);
  const [phoneCut, setPhoneCut] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  // Slides play in order, so everything up to the next one has been (or is
  // about to be) shown; after the first loop, all of them have.
  const [looped, setLooped] = useState(false);
  const isMounted = (i: number) => looped || i <= active + 1;

  // Decide capabilities after mount so SSR and the first client render agree,
  // and only once the page has loaded and gone idle.
  useEffect(() => {
    const mq = (q: string) => window.matchMedia?.(q).matches ?? false;
    if (mq("(prefers-reduced-motion: reduce)")) return; // stay on the first item
    const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const lean = !!conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "");
    let idle = 0;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      // tall screens (phones) get the clip pre-cropped to their frame
      setPhoneCut(mq("(max-aspect-ratio: 3/5)"));
      setEnableVideo(!lean);
      setCycle(true);
    };
    const whenIdle = () => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback;
      if (ric) idle = ric(start, { timeout: 1500 });
      else idle = window.setTimeout(start, 300);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", whenIdle);
      window.clearTimeout(idle);
    };
  }, []);

  // Pause while the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let inView = true;
    const sync = () => setOnScreen(inView && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const FADE = 0.7;
  useEffect(() => {
    if (!cycle || items.length < 2) return;
    if (!onScreen) {
      videoRefs.current[active]?.pause();
      return;
    }
    const advance = () => {
      if (active + 1 >= items.length) setLooped(true);
      setAV(([a]) => [(a + 1) % items.length, a]);
    };
    const isVideo = items[active].type === "video" && enableVideo;
    const el = isVideo ? videoRefs.current[active] : null;

    // Image slide — a simple dwell timer (the opening holds only briefly so it
    // carries LCP without lingering).
    if (!el) {
      const t = window.setTimeout(advance, active === 0 ? 2200 : 5000);
      return () => window.clearTimeout(t);
    }

    // Video slide — advance off the clip's REAL playback position, NOT a
    // wall-clock timer. A clip that is slow to decode (the first one on a page
    // especially) is then never cut mid-scene: we wait until it has actually
    // played to one fade-length (FADE) before its end, then the short crossfade
    // overlaps only that tail (still in motion), so the whole scene shows and
    // the handover lands as it finishes. A safety timeout still guarantees the
    // slideshow never stalls if playback is blocked (e.g. a hidden tab).
    let fired = false;
    const go = () => {
      if (fired) return;
      fired = true;
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", go);
      window.clearTimeout(safety);
      advance();
    };
    const onTime = () => {
      const d = isFinite(el.duration) && el.duration > 0 ? el.duration : 0;
      if (d && el.currentTime >= d - FADE) go();
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", go);
    // Backstop: clips are ~3s, so real playback trips `onTime` near 2.3s even
    // after a slow decode. 5s covers that, and bounds the wait if playback is
    // blocked (autoplay off / hidden tab) so the slideshow never hangs.
    const safety = window.setTimeout(go, 5000);
    try {
      el.currentTime = 0;
      const p = el.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* autoplay blocked — the poster shows; the safety timer advances */
    }
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", go);
      window.clearTimeout(safety);
    };
  }, [active, cycle, enableVideo, items, onScreen]);

  // A leaving clip keeps playing through its fade-out, then stops once it ends;
  // it's reset to the first frame whenever it becomes active again. Since clips
  // alternate with photos, only one is ever on screen at a time.

  return (
    <div className={styles.show} aria-hidden="true" ref={rootRef}>
      {items.map((it, i) => {
        const asVideo = it.type === "video" && enableVideo;
        if (!isMounted(i)) return <div key={i} className={styles.layer} style={{ opacity: 0 }} />;
        return (
          <div
            key={i}
            className={styles.layer}
            style={{
              opacity: i === active || i === prev ? 1 : 0,
              zIndex: i === active ? 2 : i === prev ? 1 : 0,
            }}
          >
            {asVideo ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                className={styles.media}
                poster={it.poster}
                muted
                playsInline
                preload="auto"
                style={it.position ? { objectPosition: it.position } : undefined}
              >
                <source src={phoneCut && it.mobileSrc ? it.mobileSrc : it.src} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={it.type === "video" ? it.poster ?? it.src : it.src}
                alt={it.alt ?? ""}
                fill
                priority={i === 0}
                sizes="100vw"
                quality={90}
                style={it.position ? { objectPosition: it.position } : undefined}
              />
            )}
          </div>
        );
      })}
      {/* A darkening layer over every slide so bright clips never wash out the
          headline (the hero's own scrim then adds the directional gradient). */}
      <div className={styles.tint} />
    </div>
  );
}
