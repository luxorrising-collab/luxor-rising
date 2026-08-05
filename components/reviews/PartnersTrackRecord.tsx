"use client";

import { useMemo, useState } from "react";
import PartnerCard from "./PartnerCard";
import styles from "./reviews.module.css";
import { PARTNER_CATEGORY_LABELS, type Partner } from "@/lib/partners";

export default function PartnersTrackRecord({ partners }: { partners: Partner[] }) {
  const categories = useMemo(() => {
    const present = Array.from(new Set(partners.map((p) => p.category)));
    return present.sort();
  }, [partners]);

  const [active, setActive] = useState<string>("all");

  const shown = useMemo(
    () => (active === "all" ? partners : partners.filter((p) => p.category === active)),
    [partners, active],
  );

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

      <div className={styles.partnerGrid}>
        {shown.map((p) => (
          <PartnerCard key={p.slug} partner={p} />
        ))}
      </div>

      {active !== "all" && (
        <p className={styles.partnerCat}>
          {PARTNER_CATEGORY_LABELS[active] ?? active}
        </p>
      )}
    </div>
  );
}
