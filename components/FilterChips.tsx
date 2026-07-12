"use client";

import styles from "./FilterChips.module.css";

export type FilterOption = { value: string; label: string };

export default function FilterChips({
  options,
  active,
  onChange,
  ariaLabel,
}: {
  options: FilterOption[];
  active: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className={styles.row} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`${styles.chip} ${active === o.value ? styles.on : ""}`}
          onClick={() => onChange(o.value)}
          aria-pressed={active === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
