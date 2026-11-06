"use client";

import { useState } from "react";
import styles from "./ConsigliereSection.module.css";

const CONS_ICONS = ["✦", "❖", "◆"];

// The concierge's three pillars. Wider screens: three columns, all open. On
// phones they fold like "The feel of it" — stacked headings with the symbol,
// the first open — so the band stays short over the photo.
export default function ConsPillars({ items }: { items: { title: string; description: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={styles.consPillars}>
      {items.map((p, i) => (
        <div className={`${styles.consPillar} ${open === i ? styles.consOpen : ""}`} key={p.title || i}>
          <h4 className={styles.consHead}>
            <button
              type="button"
              className={styles.consToggle}
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              <span className={styles.consPillarIcon} aria-hidden>
                {CONS_ICONS[i % CONS_ICONS.length]}
              </span>
              <span className={styles.consHeadTxt}>{p.title}</span>
              <span className={styles.consChevron} aria-hidden />
            </button>
          </h4>
          <p className={styles.consBody}>{p.description}</p>
        </div>
      ))}
    </div>
  );
}
