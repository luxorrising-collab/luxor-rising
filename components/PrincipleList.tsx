"use client";

import { useState } from "react";
import styles from "../app/(site)/concierge-day/ConciergeDayPage.module.css";

// "The feel of it" principles: two columns on wider screens, all open. On
// phones each one folds to its heading — the first starts open — so the
// section stays short and the reader opens what interests them.
export default function PrincipleList({ items }: { items: readonly { time: string; label: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className={styles.principles}>
      {items.map((s, i) => (
        <div className={`${styles.prItem} ${open === i ? styles.prOpen : ""}`} key={s.time || i}>
          <h3 className={styles.prHead}>
            <button
              type="button"
              className={styles.prToggle}
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? -1 : i)}
            >
              {s.time}
              <span className={styles.prChevron} aria-hidden />
            </button>
          </h3>
          <p className={styles.prBody}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
