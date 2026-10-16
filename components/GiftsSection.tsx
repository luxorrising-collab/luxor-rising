"use client";

import * as React from "react";
import styles from "./GiftsSection.module.css";

const SistrumIcon = () => (
  <svg viewBox="0 0 100 120" aria-hidden="true">
    <path className={styles.stroke} d="M50 112 V70 M30 70 Q50 30 70 70" />
    <line className={styles.stroke} x1="34" y1="60" x2="66" y2="60" />
    <line className={styles.stroke} x1="31" y1="68" x2="69" y2="68" />
    <circle className={styles.solid} cx="42" cy="60" r="3.2" />
    <circle className={styles.solid} cx="58" cy="60" r="3.2" />
    <circle className={styles.solid} cx="40" cy="68" r="3.2" />
    <circle className={styles.solid} cx="60" cy="68" r="3.2" />
    <path className={styles.stroke} d="M44 112 h12" />
  </svg>
);
const SceptreIcon = () => (
  <svg viewBox="0 0 100 120" aria-hidden="true">
    <ellipse className={styles.stroke} cx="50" cy="28" rx="13" ry="17" />
    <line className={styles.stroke} x1="50" y1="45" x2="50" y2="104" />
    <line className={styles.stroke} x1="34" y1="58" x2="66" y2="58" />
  </svg>
);
const CrownIcon = () => (
  <svg viewBox="0 0 120 110" aria-hidden="true">
    <path className={styles.stroke} d="M26 78 h68 M26 78 L22 44 L44 62 L60 34 L76 62 L98 44 L94 78" />
    <circle className={styles.solid} cx="60" cy="50" r="3.4" />
  </svg>
);

type Gift = {
  icon: React.ReactNode;
  badge: React.ReactNode;
  name: string;
  hand: string;
  meaning: string;
  tags: string[];
};

const GIFTS: Gift[] = [
  {
    icon: <SistrumIcon />,
    badge: (<><b>Day One</b> · for the left hand</>),
    name: "The Sistrum",
    hand: "A small instrument of metal — held, and gently shaken",
    meaning:
      "Its sound has been used for thousands of years to still the mind and clear a space — to settle what is heavy and call in what is good. It carries a soft, feminine current: receptivity, intuition, the grace of letting life move through you. A way to return to that stillness, anywhere.",
    tags: ["Received energy", "Hand-picked", "Locally made"],
  },
  {
    icon: <SceptreIcon />,
    badge: (<><b>Day Two</b> · for the right hand</>),
    name: "The Sceptre",
    hand: "Of stone or metal — the mark of one who holds their own authority",
    meaning:
      "In the oldest tradition, a sceptre in the right hand belonged to those who ruled themselves first. The looped cross it bears is a sign of life that endures — breath, continuity, the part of you that does not end. A strong, masculine current: will, direction, standing in your own power without force.",
    tags: ["Inner authority", "Hand-picked", "Locally made"],
  },
  {
    icon: <CrownIcon />,
    badge: (<><b>The author&apos;s day</b> · worn</>),
    name: "The Crown",
    hand: "A simple band of metal, chosen with a scarf for you and the occasion",
    meaning:
      "Light enough to wear, meant to be kept. A crown has always said one thing: remember who you are. Worn, or held in stillness, its small weight settles the body and quiets the nervous system — drawing you back to a calm, grounded sense of your own mastery and presence.",
    tags: ["Mastery & presence", "Hand-picked", "Locally made"],
  },
];

const SLIDES = 5;
const LABELS = ["Intro", "Sistrum", "Sceptre", "Crown", "The set"];

export default function GiftsSection() {
  const [cur, setCur] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => setCur((c) => (c + 1) % SLIDES), 7000);
    return () => window.clearInterval(t);
  }, [paused, cur]);

  const go = (i: number) => setCur((i + SLIDES) % SLIDES);
  const barFill = (day: number) => (cur >= day ? "100%" : "0");
  const slideClass = (i: number) => (cur === i ? `${styles.slide} ${styles.slideOn}` : styles.slide);

  return (
    <section className={styles.stage} id="gifts" aria-label="Signature gifts">
      <video
        className={styles.bgvid}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/videos/desert/desert-stars-poster.jpg"
        aria-hidden
      >
        <source src="/videos/desert/desert-stars.mp4" type="video/mp4" />
      </video>
      <div className={styles.scrim} aria-hidden />
      <div className={styles.frame} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>Signature gifts · received, not bought</p>
          <h2 className={styles.htitle}>Remembrances of the day</h2>
          <p className={styles.hsub}>From the full Luxor Rising experience — like achievements, unlocked.</p>
          <div className={styles.progress} aria-hidden>
            {[1, 2, 3].map((d) => (
              <div className={styles.pdot} key={d}>
                <span className={styles.pnum}>Day {d}</span>
                <span className={styles.pbar}>
                  <i style={{ width: barFill(d) }} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={styles.deck}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className={slideClass(0)}>
            <div className={styles.intro}>
              <p>
                Of all the places on earth, few hold what Luxor holds. To walk through Medinet Habu
                and Karnak — and to be invited deeper — is its own kind of passage.
              </p>
              <p>
                So on a full concierge day, your concierge chooses a gift for you:{" "}
                <span className={styles.accent}>
                  hand-picked for the occasion, made by local artisans from the stone and metal of
                  this soil.
                </span>
              </p>
              <p>
                Some things can be bought. It is far more beautiful to receive them.{" "}
                <span className={styles.accent}>One per day — each tied in meaning to the place.</span>
              </p>
            </div>
          </div>

          {GIFTS.map((g, i) => (
            <div key={g.name} className={slideClass(i + 1)}>
              <div className={styles.halo}>{g.icon}</div>
              <span className={styles.badge}>{g.badge}</span>
              <h3 className={styles.gname}>{g.name}</h3>
              <p className={styles.ghand}>{g.hand}</p>
              <p className={styles.gmeaning}>{g.meaning}</p>
              <div className={styles.tags}>
                {g.tags.map((t) => (
                  <span className={styles.tag} key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <div className={slideClass(4)}>
            <p className={styles.eyebrow}>The full set</p>
            <h3 className={styles.gname}>Three days. Three gifts. One story.</h3>
            <p className={styles.gmeaning}>
              Each full concierge day carries its own signature gift — hand-picked and locally made.
              Design more of the day, and the set becomes yours to complete.
            </p>
            <div className={styles.setrow} aria-hidden>
              <div className={styles.setitem}>
                <span className={styles.mini}><SistrumIcon /></span>Sistrum
              </div>
              <div className={styles.setitem}>
                <span className={styles.mini}><SceptreIcon /></span>Sceptre
              </div>
              <div className={styles.setitem}>
                <span className={styles.mini}><CrownIcon /></span>Crown
              </div>
            </div>
            <a className={styles.cta} href="#design">
              Design your day →
            </a>
            <p className={styles.fineprint}>
              One gift per group, per day · hand-picked by your concierge · made by local artisans
            </p>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {Array.from({ length: SLIDES }).map((_, i) => (
            <button
              key={i}
              className={cur === i ? `${styles.dot} ${styles.dotOn}` : styles.dot}
              aria-label={LABELS[i]}
              aria-current={cur === i}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <div className={styles.arrows}>
          <button className={styles.arrow} aria-label="Previous" onClick={() => go(cur - 1)}>
            ‹
          </button>
          <button className={styles.arrow} aria-label="Next" onClick={() => go(cur + 1)}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
