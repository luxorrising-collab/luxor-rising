"use client";

import { useMemo, useState } from "react";
import ReviewCard from "./ReviewCard";
import styles from "./reviews.module.css";
import { SOURCE_LABELS, type Review } from "@/lib/reviews";

export default function ReviewsWall({ reviews }: { reviews: Review[] }) {
  const sources = useMemo(() => {
    const present = Array.from(new Set(reviews.map((r) => r.source)));
    return present.sort();
  }, [reviews]);

  const [active, setActive] = useState<string>("all");

  const shown = useMemo(
    () => (active === "all" ? reviews : reviews.filter((r) => r.source === active)),
    [reviews, active],
  );

  return (
    <div>
      {sources.length > 1 && (
        <div className={styles.filters} role="tablist" aria-label="Filter by source">
          <button
            type="button"
            className={`${styles.chip} ${active === "all" ? styles.chipOn : ""}`}
            aria-pressed={active === "all"}
            onClick={() => setActive("all")}
          >
            All
          </button>
          {sources.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.chip} ${active === s ? styles.chipOn : ""}`}
              aria-pressed={active === s}
              onClick={() => setActive(s)}
            >
              {SOURCE_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {shown.map((r) => (
          <ReviewCard key={r.slug} review={r} />
        ))}
      </div>
    </div>
  );
}
