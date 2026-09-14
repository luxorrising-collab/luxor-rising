"use client";

import { useState } from "react";
import Link from "next/link";
import GuestStory from "./GuestStory";
import styles from "./reviews.module.css";
import type { Review } from "@/lib/reviews";

/** Shows the guest stories one at a time as cinematic cards, with arrows and
 *  dots to move between them — plus a closing teaser card pointing to the blog.
 *  A focused slider (a 3-up coverflow only reads well with several cards; these
 *  long stories are shown one in full). */
export default function GuestStoriesCarousel({
  stories,
  blogHref = "/insiders-guide",
}: {
  stories: Review[];
  blogHref?: string;
}) {
  const total = stories.length + 1; // stories + the "coming soon" teaser
  const [idx, setIdx] = useState(0);
  if (!stories.length) return null;
  const go = (i: number) => setIdx(((i % total) + total) % total);
  const isTeaser = idx >= stories.length;

  return (
    <div className={styles.storyCarousel}>
      <div className={styles.storyViewport}>
        {isTeaser ? (
          <figure className={styles.story}>
            <div className={styles.storyMedia}>
              <img
                className={styles.storyImg}
                src="/images/reviews/insiders-guide-felucca.jpg"
                alt=""
                aria-hidden="true"
                draggable={false}
              />
              <div className={styles.storyTint} aria-hidden="true" />
              <div className={styles.storyMediaBody}>
                <p className={styles.storyPull}>The story continues.</p>
              </div>
            </div>
            <div className={styles.storyText}>
              <span className={styles.storyEyebrow}>The Insider&apos;s Guide</span>
              <p className={styles.storyBody}>
                More insider stories from the ground in Luxor — where to stand at
                first light, which chamber to save for last, and how a private
                day really unfolds. Coming soon.
              </p>
              <div className={styles.storyBy}>
                <Link href={blogHref} className={styles.storyTeaserLink}>
                  Read the Insider&apos;s Guide →
                </Link>
              </div>
            </div>
          </figure>
        ) : (
          // Remount per slide so the "read more" state resets between stories.
          <GuestStory key={stories[idx].slug} review={stories[idx]} />
        )}
      </div>

      <div className={styles.storyNav}>
        <button
          type="button"
          className={styles.storyArrow}
          onClick={() => go(idx - 1)}
          aria-label="Previous story"
        >
          ‹
        </button>
        <div className={styles.storyDots} role="tablist" aria-label="Choose a story">
          {Array.from({ length: total }).map((_, i) => (
            <button
              type="button"
              key={i}
              className={`${styles.storyDot} ${i === idx ? styles.storyDotOn : ""}`}
              aria-label={i < stories.length ? `Story ${i + 1} of ${stories.length}` : "More coming soon"}
              aria-current={i === idx}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className={styles.storyArrow}
          onClick={() => go(idx + 1)}
          aria-label="Next story"
        >
          ›
        </button>
      </div>
    </div>
  );
}
