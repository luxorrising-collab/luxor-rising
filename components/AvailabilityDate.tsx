"use client";

import { forwardRef, useMemo, useState } from "react";
import styles from "./AvailabilityDate.module.css";

// The checkout date field — a small month calendar in place of the browser's
// native picker, so every open date can carry its "available" mark. Right now
// a concierge is free on every date from tomorrow, so all of them are open;
// the earliest bookable day is tomorrow (local time).

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fromIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (s: string, n: number) => {
  const d = fromIso(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const fmtShort = (s: string) =>
  fromIso(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

export const fmtLongDate = (s: string) =>
  s
    ? fromIso(s).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    : "";

type Props = {
  value: string;
  /** How many days are booked — the calendar and summary show the whole stay. */
  days?: number;
  onChange: (iso: string) => void;
  error?: boolean;
};

const AvailabilityDate = forwardRef<HTMLButtonElement, Props>(function AvailabilityDate(
  { value, onChange, error, days = 1 },
  ref,
) {
  const [open, setOpen] = useState(false);
  // Tomorrow, and the last month we let anyone page to (18 months out).
  const minDay = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() + 1);
    return t;
  }, []);
  const [view, setView] = useState(() => {
    const base = value ? fromIso(value) : minDay;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const firstMonth = new Date(minDay.getFullYear(), minDay.getMonth(), 1);
  const lastMonth = new Date(minDay.getFullYear(), minDay.getMonth() + 18, 1);
  const canPrev = view > firstMonth;
  const canNext = view < lastMonth;

  // Monday-first grid: leading blanks, then the month's days.
  const lead = (view.getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
  ];

  const end = value && days > 1 ? addDays(value, days - 1) : value;
  const step = (n: number) => setView((v) => new Date(v.getFullYear(), v.getMonth() + n, 1));

  return (
    <div className={styles.wrap}>
      <button
        ref={ref}
        type="button"
        className={`${styles.field} ${error ? styles.err : ""} ${open ? styles.isOpen : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? styles.val : styles.ph}>
          {!value
            ? days > 1
              ? "Choose your first day"
              : "Choose your date"
            : days > 1
              ? `${fmtShort(value)} – ${fmtShort(end)}`
              : fmtLongDate(value)}
        </span>
        {value && (
          <span className={styles.avail}>
            <i aria-hidden /> {days > 1 ? `${days} days` : "Available"}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.cal} role="dialog" aria-label="Choose your date">
          <div className={styles.head}>
            <button type="button" onClick={() => step(-1)} disabled={!canPrev} aria-label="Previous month">
              ‹
            </button>
            <span>{view.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
            <button type="button" onClick={() => step(1)} disabled={!canNext} aria-label="Next month">
              ›
            </button>
          </div>
          <div className={styles.grid}>
            {WEEKDAYS.map((w) => (
              <span key={w} className={styles.wd}>
                {w}
              </span>
            ))}
            {cells.map((d, i) => {
              if (!d) return <span key={`b${i}`} />;
              const key = iso(d);
              const past = d < minDay;
              const sel = key === value;
              const inStay = !!value && days > 1 && key > value && key <= end;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={past}
                  className={`${styles.day} ${sel ? styles.sel : ""} ${inStay ? styles.stay : ""}`}
                  aria-pressed={sel}
                  aria-label={`${fmtLongDate(key)}${past ? "" : ", available"}`}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                  {!past && <i aria-hidden />}
                </button>
              );
            })}
          </div>
          <p className={styles.legend}>
            <i aria-hidden />
            <span>Available — a concierge is free on every open date</span>
          </p>
        </div>
      )}

      {value && !open && (
        <p className={styles.confirm}>
          <span className={styles.tick} aria-hidden>
            ✓
          </span>
          {days > 1 ? (
            <span>
              Your concierge is available for all <b>{days} days</b>, from <b>{fmtLongDate(value)}</b> to{" "}
              <b>{fmtLongDate(end)}</b>. We&apos;ll confirm your order within 24 hours.
            </span>
          ) : (
            <span>
              Your concierge is available on <b>{fmtLongDate(value)}</b>. We&apos;ll confirm your order
              within 24 hours.
            </span>
          )}
        </p>
      )}
    </div>
  );
});

export default AvailabilityDate;
