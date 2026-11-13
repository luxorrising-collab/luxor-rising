"use client";

import { forwardRef, useMemo, useState } from "react";
import styles from "./AvailabilityDate.module.css";
import { AHMED } from "@/lib/ahmed-profile";

// The checkout date field — a small month calendar in place of the browser's
// native picker. Every date from tomorrow (local time) is open, but the calendar
// shows no "available" marks: a wide-open calendar reads as a day nobody books.
// Once a date is picked, the guest is congratulated and meets Ahmed, who will be
// their concierge personally.

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
  const [more, setMore] = useState(false);
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
        {value && days > 1 && <span className={styles.avail}>{days} days</span>}
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
                  aria-label={fmtLongDate(key)}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value && !open && (
        <div className={styles.welcome} role="status">
          <p className={styles.congrats}>
            <span className={styles.tick} aria-hidden>
              ✓
            </span>
            {days > 1 ? (
              <span>
                Wonderful — <b>{fmtLongDate(value)}</b> to <b>{fmtLongDate(end)}</b> are yours.
              </span>
            ) : (
              <span>
                Wonderful — <b>{fmtLongDate(value)}</b> is yours.
              </span>
            )}
          </p>
          <div className={styles.host}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AHMED.avatar} alt="Ahmed, your concierge" width={64} height={64} />
            <div>
              <p className={styles.hostName}>
                Ahmed <span>· free on your {days > 1 ? "dates" : "date"}, personally</span>
              </p>
              <p className={styles.hostBio}>
                He has spent twenty years opening doors in Luxor, for archaeologists, film crews and
                travellers along the Nile who wanted to see it properly. He meets you in person, and
                holds every detail of your {days > 1 ? "days" : "day"}.
              </p>
              <button type="button" className={styles.moreBtn} aria-expanded={more} onClick={() => setMore((m) => !m)}>
                {more ? "Less about Ahmed" : "More about Ahmed"}
                <span className={styles.moreChevron} aria-hidden />
              </button>
            </div>
          </div>
          {more && (
            <div className={styles.morePoints}>
              <span className={styles.moreRole}>{AHMED.role}</span>
              <b>{AHMED.headline}</b>
              {AHMED.blocks.map((b, i) =>
                b.kind === "text" ? (
                  <p className={styles.moreText} key={i}>
                    {b.text}
                  </p>
                ) : (
                  <blockquote className={styles.moreQuote} key={i}>
                    <p>&ldquo;{b.text}&rdquo;</p>
                  </blockquote>
                ),
              )}
              <span className={styles.moreSigned}>— {AHMED.quoteBy}</span>
            </div>
          )}
          <p className={styles.welcomeNote}>We&apos;ll confirm your order within 24 hours.</p>
        </div>
      )}
    </div>
  );
});

export default AvailabilityDate;
