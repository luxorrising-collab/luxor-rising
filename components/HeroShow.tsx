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

  // Advance through the slides. The timer is armed FIRST, so nothing about
  // video playback can stall the slideshow. A clip is left ~0.9s before its
  // final frame and keeps playing through the crossfade, so it fades out in
  // motion rather than freezing on a full-stop last frame.
  useEffect(() => {
    if (!cycle || items.length < 2) return;
    const isVideo = items[active].type === "video" && enableVideo;
    const el = isVideo ? videoRefs.current[active] : null;
    const dur = el && isFinite(el.duration) ? el.duration : 0;
    const dwell = isVideo
      ? dur > 1
        ? Math.max(1400, Math.round((dur - 0.9) * 1000))
        : 2300 // duration not known yet (first play) — a safe short hold
      : active === 0
        ? 2200 // opening still carries LCP but only holds briefly
        : 5000;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % items.length), dwell);
    if (el) {
      try {
        el.currentTime = 0;
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {
        /* autoplay may be blocked — the poster shows, which is fine */
      }
    }
    return () => window.clearTimeout(t);
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
