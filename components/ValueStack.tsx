"use client";

import { useMemo } from "react";
import styles from "./ValueStack.module.css";
import { useDayCount } from "./DayCount";

export type PricedItem = { name: string; price: number; subtitle?: string };
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
  /** "Everything handled for you" — shown with a priceless/timeless value, never a euro cost. */
  perDayServices: WorthItem[];
  oneOffServices: WorthItem[];
}) {
  const { days, setDays } = useDayCount();

  const { experiences, services, alaCarte, concierge, saving } = useMemo(() => {
    const experiences = experiencePlan.slice(0, days).flat();
    // Services are the "priceless" layer — deliberately no euro figure, so we
    // never publish what a guide, guard or car actually costs. Only the real,
    // publicly-priced experiences drive the "book it yourself" comparison.
    const services = [...perDayServices, ...oneOffServices];
    const alaCarte = experiences.reduce((a, x) => a + x.price, 0);
    const concierge = Math.round(dayRate * days * (1 - discountForDays(days, volumeDiscount) / 100));
    return { experiences, services, alaCarte, concierge, saving: alaCarte - concierge };
  }, [days, dayRate, volumeDiscount, experiencePlan, perDayServices, oneOffServices]);

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

      <div className={styles.group}>
        <div className={styles.groupHead}>Your experiences, booked one by one</div>
        {experiences.map((x, i) => (
          <div className={styles.row} key={x.name + i}>
            <span className={styles.l}>
              {x.name}
              {x.subtitle && (
                <em
                  style={{
                    display: "block",
                    fontStyle: "italic",
                    fontSize: ".82em",
                    color: "var(--color-muted)",
                    marginTop: "1px",
                  }}
                >
                  {x.subtitle}
                </em>
              )}
            </span>
            <span className={styles.v}>{euro(x.price)}</span>
          </div>
        ))}
      </div>

      <div className={styles.group}>
        <div className={styles.groupHead}>And everything handled for you</div>
        {services.map((x, i) => (
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

      <div className={styles.totalRow}>
        <span>Those experiences, booked one by one</span>
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
        <span className={styles.saveNote}>
          — and everything handled above is included, not extra. That part is priceless.
        </span>
      </div>
    </div>
  );
}
