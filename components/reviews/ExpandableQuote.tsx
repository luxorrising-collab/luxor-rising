"use client";

import { useState } from "react";
import styles from "./reviews.module.css";

/** A review quote that truncates when long, with an in-place "Read more" toggle
 *  so guests never have to leave the page to read a review in full. */
export default function ExpandableQuote({
  text,
  limit = 260,
}: {
  text: string;
  limit?: number;
}) {
  const [open, setOpen] = useState(false);
  const isLong = text.length > limit + 20;
  const shown =
    open || !isLong ? text : text.slice(0, limit).replace(/\s+\S*$/, "").trimEnd() + "…";

  return (
    <blockquote className={styles.quote}>
      {shown}
      {isLong && (
        <button
          type="button"
          className={styles.readMore}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </blockquote>
  );
}
