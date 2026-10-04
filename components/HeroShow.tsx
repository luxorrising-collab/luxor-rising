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
 *  - Data-Saver → it still crossfades, but video items show their poster image
 *    instead of downloading the clip. (Mobile plays the clips, cropped to fill.)
 */
export default function HeroShow({ items }: { items: HeroShowItem[] }) {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(false);
  const [enableVideo, setEnableVideo] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  // Decide capabilities after mount so SSR and the first client render agree.
  useEffect(() => {
    const mq = (q: string) => window.matchMedia?.(q).matches ?? false;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
      ?.saveData;
    if (mq("(prefers-reduced-motion: reduce)")) return; // stay on the first item
    setCycle(true);
    // Play the clips on mobile too (cropped to fill); only Data-Saver falls
    // back to posters.
    setEnableVideo(!saveData);
  }, []);

  const FADE = 0.7;
  useEffect(() => {
    if (!cycle || items.length < 2) return;
    const advance = () => setActive((a) => (a + 1) % items.length);
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
  }, [active, cycle, enableVideo, items]);

  // A leaving clip keeps playing through its fade-out, then stops once it ends;
  // it's reset to the first frame whenever it becomes active again. Since clips
  // alternate with photos, only one is ever on screen at a time.

  return (
    <div className={styles.show} aria-hidden="true">
      {items.map((it, i) => {
        const asVideo = it.type === "video" && enableVideo;
        return (
          <div key={i} className={styles.layer} style={{ opacity: i === active ? 1 : 0 }}>
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
                <source src={it.src} type="video/mp4" />
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
