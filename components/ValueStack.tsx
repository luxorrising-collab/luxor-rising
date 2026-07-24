"use client";

import { useMemo, useState } from "react";
import styles from "./ValueStack.module.css";

export type PricedItem = { name: string; price: number };
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
  perDayServices: PricedItem[];
  oneOffServices: PricedItem[];
}) {
  const [days, setDays] = useState(3);

  const { experiences, services, alaCarte, concierge, saving } = useMemo(() => {
    const experiences = experiencePlan.slice(0, days).flat();
    const services = [
      ...perDayServices.map((s) => ({ name: s.name, price: s.price * days, per: true })),
      ...oneOffServices.map((s) => ({ name: s.name, price: s.price, per: false })),
    ];
    const alaCarte =
      experiences.reduce((a, x) => a + x.price, 0) + services.reduce((a, x) => a + x.price, 0);
    const concierge = Math.round(dayRate * days * (1 - discountForDays(days, volumeDiscount) / 100));
    return { experiences, services, alaCarte, concierge, saving: alaCarte - concierge };
  }, [days, dayRate, volumeDiscount, experiencePlan, perDayServices, oneOffServices]);

  return (
    <div className={styles.stack}>
      <div className={styles.dayToggle} role="group" aria-label="Choose number of days">
        <span className={styles.dayLbl}>Compare</span>
        {[1, 2, 3].map((d) => (
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
            <span className={styles.l}>{x.name}</span>
            <span className={styles.v}>{euro(x.price)}</span>
          </div>
        ))}
      </div>

      <div className={styles.group}>
        <div className={styles.groupHead}>And everything handled for you</div>
        {services.map((x, i) => (
          <div className={styles.row} key={x.name + i}>
            <span className={styles.l}>
              {x.name}
              {x.per && <em className={styles.per}> × {days}</em>}
            </span>
            <span className={styles.v}>{euro(x.price)}</span>
          </div>
        ))}
      </div>

      <div className={styles.totalRow}>
        <span>Assembled piece by piece</span>
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
          — and every ticket, transfer and timing is handled, not just cheaper.
        </span>
      </div>
    </div>
  );
}
