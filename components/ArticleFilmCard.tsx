"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./ArticleTemplate.module.css";

type Feat = { label: string; icon: React.ReactNode };

/**
 * The booking card's filmic image tile, as on Design Your Day: the experience's
 * photo drifts slowly under film grain; on hover its clip fades in. The clip is
 * only put on the page once a mouse first rests on the card, so phones never
 * download it.
 */
export default function ArticleFilmCard({
  href,
  image,
  kicker,
  title,
  feats,
  clip,
  clipPoster,
}: {
  href: string;
  image?: string;
  kicker?: string;
  title: string;
  feats: Feat[];
  clip?: string;
  clipPoster?: string;
}) {
  const [armed, setArmed] = React.useState(false);
  const vid = React.useRef<HTMLVideoElement | null>(null);
  const hovering = React.useRef(false);
  const play = (v: HTMLVideoElement | null) => {
    if (!v) return;
    v.play().catch(() => {
      /* autoplay refused: the photo stays */
    });
  };
  return (
    <Link
      href={href}
      className={styles.film}
      onMouseEnter={() => {
        hovering.current = true;
        if (!clip) return;
        if (!armed) setArmed(true);
        else play(vid.current);
      }}
      onMouseLeave={() => {
        hovering.current = false;
        vid.current?.pause();
      }}
    >
      {image && <Image src={image} alt="" fill sizes="300px" className={styles.filmImg} />}
      {clip && armed && (
        <video
          ref={(v) => {
            vid.current = v;
            if (v && hovering.current) play(v);
          }}
          className={styles.filmVid}
          src={clip}
          poster={clipPoster}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      )}
      <span className={styles.filmGrain} aria-hidden="true" />
      <span className={styles.filmTx}>
        {kicker && <span className={styles.filmKicker}>{kicker}</span>}
        <span className={styles.filmTitle}>{title}</span>
        <span className={styles.filmRule} />
        {feats.length > 0 && (
          <span className={styles.filmFeats}>
            {feats.slice(0, 4).map((f) => (
              <span key={f.label} className={styles.filmFeat}>
                <span className={styles.filmFeatIco}>{f.icon}</span>
                {f.label}
              </span>
            ))}
          </span>
        )}
      </span>
    </Link>
  );
}
