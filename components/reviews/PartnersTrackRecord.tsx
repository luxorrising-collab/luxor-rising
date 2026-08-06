"use client";

import { useMemo, useState } from "react";
import PartnerCard from "./PartnerCard";
import ReviewCard from "./ReviewCard";
import styles from "./reviews.module.css";
import { type Partner } from "@/lib/partners";
import type { Review } from "@/lib/reviews";

export default function PartnersTrackRecord({
  partners,
  reviews,
}: {
  partners: Partner[];
  reviews: Review[];
}) {
  const categories = useMemo(
    () => Array.from(new Set(partners.map((p) => p.category))).sort(),
    [partners],
  );
  const [active, setActive] = useState<string>("all");

  const shown = useMemo(
    () => (active === "all" ? partners : partners.filter((p) => p.category === active)),
    [partners, active],
  );

  const reviewsFor = (slug: string) => reviews.filter((r) => r.partner === slug);

  return (
    <div>
      {categories.length > 1 && (
        <div className={styles.filters} role="tablist" aria-label="Filter partners by type">
          <button
            type="button"
            className={`${styles.chip} ${active === "all" ? styles.chipOn : ""}`}
            aria-pressed={active === "all"}
            onClick={() => setActive("all")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.chip} ${active === c ? styles.chipOn : ""}`}
              aria-pressed={active === c}
              onClick={() => setActive(c)}
            >
              #{c}
            </button>
          ))}
        </div>
      )}

      <div className={styles.partnerBlocks}>
        {shown.map((p) => {
          const prs = reviewsFor(p.slug);
          return (
            <div key={p.slug} className={styles.partnerBlock}>
              <PartnerCard partner={p} />
              {prs.length > 0 && (
                <div className={styles.partnerReviews}>
                  {prs.map((r) => (
                    <ReviewCard key={r.slug} review={r} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
