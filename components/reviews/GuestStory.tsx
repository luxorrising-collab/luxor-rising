"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./reviews.module.css";
import { type Review } from "@/lib/reviews";

function fmtDate(d: string | null) {
  if (!d) return "";
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** The opening line, used as the pull-quote when none is set. */
function openingLine(text: string): string {
  const m = text.match(/^([\s\S]*?[.!?])\s/);
  if (m && m[1].length <= 150) return m[1];
  const cut = text.lastIndexOf(" ", 130);
  return text.slice(0, cut > 60 ? cut : 130).trim() + "…";
}

/** A single long-form guest review, styled like the product-page moment cards
 *  but scaled for the full story: a cinematic tinted-image header carries the
 *  pull-quote, and the whole review reads below, expandable in place. */
export default function GuestStory({ review }: { review: Review }) {
  const [open, setOpen] = useState(false);
  const text = review.quote.trim();
  const pull = (review.pullQuote || openingLine(text)).trim();
  const long = text.length > 340;
  const shown = open || !long ? text : text.slice(0, 340).replace(/\s+\S*$/, "").trimEnd() + "…";
  const meta = [review.location, fmtDate(review.date)].filter(Boolean).join(" · ");
  const stars = Math.round(review.rating);

  return (
    <figure className={styles.story}>
      <div className={styles.storyMedia}>
        {review.heroImage && (
          <img
            className={styles.storyImg}
            src={review.heroImage}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        )}
        <div className={styles.storyTint} aria-hidden="true" />
        <div className={styles.storyMediaBody}>
          <span className={styles.storyStars} aria-label={`${review.rating} out of 5`}>
            {"★".repeat(stars)}
          </span>
          <p className={styles.storyPull}>&ldquo;{pull}&rdquo;</p>
          <Link href="/concierge-day" className={styles.storySignature}>
            Luxor Rising Concierge Day
            <span className={styles.storySignatureSub}>Luxor, Egypt</span>
          </Link>
        </div>
      </div>

      <div className={styles.storyText}>
        <span className={styles.storyEyebrow}>A traveller&apos;s story</span>
        <blockquote className={styles.storyBody}>
          {shown}
          {long && (
            <button
              type="button"
              className={styles.readMore}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Show less" : "Read the whole story"}
            </button>
          )}
        </blockquote>
        <figcaption className={styles.storyBy}>
          <span className={styles.author}>{review.author}</span>
          {meta && <span className={styles.meta}>{meta}</span>}
          {review.sourceUrl && (
            <a
              className={styles.storySource}
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              Google ↗
            </a>
          )}
        </figcaption>
      </div>
    </figure>
  );
}
