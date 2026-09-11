"use client";

import { useMemo, useState } from "react";
import styles from "./ValueStack.module.css";
import { useDayCount } from "./DayCount";

export type PricedItem = { name: string; price: number; subtitle?: string; bonus?: boolean };
export type WorthItem = { name: string; worth: string };
export type VolumeTier = { minDays: number; discountPercent: number };

function euro(n: number) {
  return "€" + Math.round(n).toLocaleString("en-US");
}

function discountForDays(d: number, tiers: VolumeTier[]) {
  let best = 0;
  let bestMin = -1;
  for (const t of tiers) {
    if (d >= t.minDays && t.minDays > bestMin) {
      best = t.discountPercent;
      bestMin = t.minDays;
    }
  }
  return best;
}

export default function ValueStack({
  dayRate,
  volumeDiscount,
  experiencePlan,
  perDayServices,
  oneOffServices,
}: {
  dayRate: number;
  volumeDiscount: VolumeTier[];
  /** experiencePlan[0] = day 1 experiences, [1] = day-2 additions, [2] = day-3 additions */
  experiencePlan: PricedItem[][];
  /** The "priceless" value — always visible, above the price breakdown. */
  perDayServices: WorthItem[];
  /** The operational "handled" layer — revealed with the price breakdown. */
  oneOffServices: WorthItem[];
}) {
  const { days, setDays } = useDayCount();
  const [open, setOpen] = useState(false);

  const { experiences, count, bonusCount, alaCarte, concierge, saving } = useMemo(() => {
    const experiences = experiencePlan.slice(0, days).flat();
    const bonusCount = experiences.filter((x) => x.bonus).length;
    const count = experiences.length - bonusCount;
    const alaCarte = experiences.reduce((a, x) => a + x.price, 0);
    const concierge = Math.round(dayRate * days * (1 - discountForDays(days, volumeDiscount) / 100));
    return { experiences, count, bonusCount, alaCarte, concierge, saving: alaCarte - concierge };
  }, [days, dayRate, volumeDiscount, experiencePlan]);

  return (
    <div className={styles.stack}>
      <div className={styles.dayToggle} role="group" aria-label="Number of days">
        <span className={styles.dayLbl}>Your journey</span>
        {([1, 2, 3, 4] as const).map((d) => (
          <button
            key={d}
            type="button"
            className={`${styles.dayBtn} ${days === d ? styles.on : ""}`}
            aria-pressed={days === d}
            onClick={() => setDays(d)}
          >
            {d} day{d > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      <p className={styles.headline}>
        {count} experiences
        {bonusCount > 0 && (
          <>
            {" "}
            <span className={styles.bonusTag}>
              + {bonusCount} signature bonus{bonusCount > 1 ? "es" : ""}, free
            </span>
          </>
        )}
        , woven into one private {days > 1 ? "journey" : "day"}.
      </p>

      {/* Overall price — the anchor */}
      <div className={styles.totalRow}>
        <span>Booked one by one</span>
        <span className={styles.tv}>{euro(alaCarte)}</span>
      </div>
      <div className={styles.youRow}>
        <span className={styles.yl}>
          Your {days}-day concierge {days > 1 ? "journey" : "day"}
        </span>
        <span className={styles.yv}>{euro(concierge)}</span>
      </div>
      <div className={styles.saveRow}>
        <span className={styles.savePill}>You save {euro(saving)}</span>
      </div>

      {/* Priceless — always visible */}
      <div className={styles.group}>
        <div className={styles.groupHead}>And everything no price can cover</div>
        {perDayServices.map((x, i) => (
          <div className={styles.row} key={x.name + i}>
            <span className={styles.l}>{x.name}</span>
            <span
              className={styles.v}
              style={{ fontStyle: "italic", color: "var(--color-gold-deep)" }}
            >
              {x.worth}
            </span>
          </div>
        ))}
      </div>

      {/* Price breakdown — behind a toggle */}
      <button
        type="button"
        className={styles.bdToggle}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{open ? "Hide the price breakdown" : "See the price breakdown"}</span>
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className={styles.bd}>
          <div className={styles.groupHead}>Your experiences, one by one</div>
          {experiences.map((x, i) => (
            <div className={styles.row} key={x.name + i}>
              <span className={styles.l}>
                {x.name}
                {x.subtitle && (
                  <em
                    style={{
                      display: "block",
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontSize: ".82em",
                      color: "var(--color-muted)",
                      marginTop: "1px",
                    }}
                  >
                    {x.subtitle}
                  </em>
                )}
              </span>
              <span className={styles.v}>
                {x.bonus ? (
                  <span style={{ color: "var(--color-gold-deep)" }}>free</span>
                ) : x.price > 0 ? (
                  euro(x.price)
                ) : (
                  "included"
                )}
              </span>
            </div>
          ))}
          <div className={styles.groupHead}>And everything handled for you</div>
          {oneOffServices.map((x, i) => (
            <div className={styles.row} key={x.name + i}>
              <span className={styles.l}>{x.name}</span>
              <span
                className={styles.v}
                style={{ fontStyle: "italic", color: "var(--color-gold-deep)" }}
              >
                {x.worth}
              </span>
            </div>
          ))}
          <div className={styles.totalRow}>
            <span>Those experiences, booked one by one</span>
            <span className={styles.tv}>{euro(alaCarte)}</span>
          </div>
        </div>
      )}

      <div className={styles.saveNote}>
        Real prices from our own single experiences — everything handled is included, not extra.
      </div>
    </div>
  );
}
