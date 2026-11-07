import * as React from "react";
import { FEAT } from "@/lib/experience-cards";
import styles from "./ArticleVisit.module.css";

/** The facts a visitor needs, set as an infographic inside an article. */
export type ArticleVisitInfo = {
  title?: string;
  where?: string;
  hours?: string;
  best?: string;
  ticket?: string;
  duration?: string;
  built?: string;
  note?: string;
  /** A schematic site plan with the walking route ("medinet-habu"), or none. */
  plan?: string;
};

const Hourglass = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9" />
  </svg>
);

const Pin = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

export default function ArticleVisit({ info }: { info: ArticleVisitInfo }) {
  const tiles = [
    { icon: Pin, label: "Where", value: info.where },
    { icon: FEAT.crowd, label: "Opening hours", value: info.hours },
    { icon: FEAT.dawn, label: "Best time", value: info.best },
    { icon: FEAT.ticket, label: "Ticket", value: info.ticket },
    { icon: Hourglass, label: "Time to allow", value: info.duration },
    { icon: FEAT.temple, label: "Built", value: info.built },
  ].filter((t) => t.value && t.value.trim());
  if (!tiles.length && info.plan !== "medinet-habu") return null;

  return (
    <aside className={styles.visit} aria-label={info.title || "Visiting at a glance"}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>Plan your visit</span>
        <h3>{info.title || "At a glance"}</h3>
      </div>

      {tiles.length > 0 && (
        <dl className={styles.tiles}>
          {tiles.map((t) => (
            <div key={t.label} className={styles.tile}>
              <span className={styles.ico}>{t.icon}</span>
              <dt>{t.label}</dt>
              <dd>{t.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {info.plan === "medinet-habu" && <MedinetHabuPlan />}

      {info.note && <p className={styles.note}>{info.note}</p>}
    </aside>
  );
}

/* A schematic (not to scale) of Medinet Habu, read left to right as you walk in:
   the High Gate in the east, the small temple of Amun on your right (north), the
   God's Wives' chapels on your left (south), then the great temple westwards. */
function MedinetHabuPlan() {
  const steps = [
    "The High Gate",
    "Small temple of Amun",
    "Chapels of the God's Wives",
    "First pylon & court",
    "Second court",
    "Halls & sanctuary",
  ];
  const dot = (n: number, x: number, y: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r="11" className={styles.stepDot} />
      <text x={x} y={y + 4} textAnchor="middle" className={styles.stepNum}>
        {n}
      </text>
    </g>
  );
  return (
    <figure className={styles.plan}>
      <div className={styles.planDraw}>
        <svg viewBox="0 0 660 300" role="img" aria-label="Schematic plan of Medinet Habu with the suggested walking route">
          {/* enclosure wall */}
          <rect x="18" y="16" width="624" height="268" rx="6" className={styles.wall} />
          {/* High Gate (migdol), east */}
          <rect x="6" y="128" width="40" height="44" rx="2" className={styles.gate} />
          {/* small temple of Amun, north (right as you enter) */}
          <rect x="96" y="44" width="116" height="62" rx="2" className={styles.holy} />
          <text x="154" y="80" textAnchor="middle" className={styles.lbl}>Small temple</text>
          {/* God's Wives chapels, south (left as you enter) */}
          <rect x="104" y="200" width="30" height="34" className={styles.bld} />
          <rect x="140" y="200" width="30" height="34" className={styles.bld} />
          <rect x="176" y="200" width="30" height="34" className={styles.bld} />
          <text x="155" y="256" textAnchor="middle" className={styles.lblS}>God&apos;s Wives</text>
          {/* the great temple, east → west */}
          <rect x="252" y="84" width="14" height="132" className={styles.bld} />
          <rect x="266" y="104" width="96" height="92" className={styles.court} />
          <rect x="362" y="96" width="12" height="108" className={styles.bld} />
          <rect x="374" y="108" width="84" height="84" className={styles.court} />
          <rect x="458" y="112" width="148" height="76" className={styles.bld} />
          <text x="532" y="178" textAnchor="middle" className={styles.lblD}>Halls</text>
          <text x="314" y="184" textAnchor="middle" className={styles.lblS}>1st court</text>
          <text x="416" y="184" textAnchor="middle" className={styles.lblS}>2nd court</text>
          {/* the route */}
          <path d="M26 150 C 70 150, 110 132, 140 112 M154 106 C 150 150, 150 170, 155 198 M170 214 C 210 200, 230 160, 259 150 L 600 150" className={styles.route} />
          {dot(1, 26, 150)}
          {dot(2, 154, 112)}
          {dot(3, 155, 200)}
          {dot(4, 259, 150)}
          {dot(5, 416, 150)}
          {dot(6, 600, 150)}
          {/* compass */}
          <g className={styles.compass}>
            <path d="M622 64 l6 -18 l6 18 l-6 -5 z" />
            <text x="628" y="80" textAnchor="middle">N</text>
          </g>
        </svg>
      </div>
      <figcaption>
        <ol className={styles.steps}>
          {steps.map((s, i) => (
            <li key={s}>
              <b>{i + 1}</b>
              {s}
            </li>
          ))}
        </ol>
        <span className={styles.scale}>Schematic, not to scale</span>
      </figcaption>
    </figure>
  );
}
