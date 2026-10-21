"use client";

import * as React from "react";
import styles from "./GiftsSection.module.css";

type Media = { type: "image" | "video"; src: string; poster?: string; dur?: number };

const P = "/images/presents/web/";
const STAR: Media = {
  type: "video",
  src: `${P}star.mp4`,
  poster: `${P}star-poster.jpg`,
  dur: 3600, // fallback only; the clip (3.04s) advances on its own 'ended' event
};
const img = (name: string, dur?: number): Media => ({
  type: "image",
  src: `${P}${name}.jpg`,
  dur,
});

const DUR = (m: Media) => m.dur ?? (m.type === "video" ? 3200 : 4200);

// Stable module-level reels — same array identity across every render, so a
// page re-render never re-runs the reel's effects (which would restart a clip).
const MEDIA_INTRO: Media[] = [
  STAR,
  img("sistrum-a", 3600),
  img("ankh-a", 3600),
  img("crown-a", 3600),
  img("set", 3600),
  img("set-static-3", 3600),
];
const MEDIA_SISTRUM: Media[] = [img("sistrum-a"), img("sistrum-b")];
const MEDIA_ANKH: Media[] = [img("ankh-a"), img("ankh-b")];
const MEDIA_CROWN: Media[] = [img("crown-a"), img("crown-b")];
const MEDIA_SET: Media[] = [img("crown-b"), img("set-bronze-trio"), img("set-two-crowns")];

function MediaReel({ media, active }: { media: Media[]; active: boolean }) {
  const [i, setI] = React.useState(0);
  const vids = React.useRef<Array<HTMLVideoElement | null>>([]);
  const n = media.length;
  // Keep the previous, current and next layers live: the previous one is still
  // cross-fading out, the next is preloading. The rest mount lazily — so a card
  // never pulls its whole reel at once, and no slide blanks mid-fade.
  const near = (idx: number) =>
    idx === i || idx === (i + 1) % n || idx === (i - 1 + n) % n;

  React.useEffect(() => {
    if (!active) {
      setI(0); // always restart a card from its first frame (the stargazing clip on intro)
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || media.length < 2) return;

    const m = media[i];
    const advance = () => setI((x) => (x + 1) % media.length);

    // A video in a slideshow plays once and advances when it ends — never
    // looping back mid-view. The timer is only a fallback for blocked autoplay.
    if (m.type === "video") {
      const v = vids.current[i];
      if (v) {
        v.addEventListener("ended", advance);
        const fb = window.setTimeout(advance, DUR(m));
        return () => {
          v.removeEventListener("ended", advance);
          window.clearTimeout(fb);
        };
      }
    }

    const t = window.setTimeout(advance, DUR(m));
    return () => window.clearTimeout(t);
  }, [active, i, media]);

  React.useEffect(() => {
    media.forEach((m, idx) => {
      const v = vids.current[idx];
      if (!v) return;
      if (active && idx === i) {
        try {
          v.currentTime = 0;
          const p = v.play();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch {
          /* autoplay may be refused; poster shows */
        }
      } else {
        try {
          v.pause();
        } catch {
          /* no-op */
        }
      }
    });
  }, [i, active, media]);

  return (
    <div className={styles.reel} aria-hidden>
      {media.map((m, idx) => {
        // Videos keep their <source>, but preload="none" means no bytes load
        // until this layer is the active one. Images only mount near their turn.
        const showImg = active && near(idx);
        return (
          <div key={idx} className={styles.layer} style={{ opacity: active && idx === i ? 1 : 0 }}>
            {m.type === "video" ? (
              <video
                ref={(el) => {
                  vids.current[idx] = el;
                }}
                className={styles.media}
                muted
                loop={media.length < 2}
                playsInline
                preload="auto"
                poster={m.poster}
              >
                <source src={m.src} type="video/mp4" />
              </video>
            ) : showImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={styles.media} src={m.src} alt="" loading="lazy" />
            ) : (
              <div className={styles.media} aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Gold product marks — soft, detailed, drawn in perspective and outlined in
   our gold. They double as the nodes of the day diagram.
---------------------------------------------------------------------------- */

function IconSistrum() {
  return (
    <svg viewBox="0 0 120 172" className={styles.icon} role="img" aria-label="Sistrum">
      <path d="M60 114 L60 158" />
      <path d="M51 158 H69" />
      <path d="M35 114 H85" />
      <path className={styles.fill} d="M40 114 V74 Q40 32 60 32 Q80 32 80 74 V114" />
      <circle cx="60" cy="25" r="5" />
      <path d="M43 56 H77" />
      <ellipse className={styles.fill} cx="52" cy="56" rx="6.5" ry="4" />
      <ellipse className={styles.fill} cx="68" cy="56" rx="6.5" ry="4" />
      <path d="M43 76 H77" />
      <ellipse className={styles.fill} cx="52" cy="76" rx="6.5" ry="4" />
      <ellipse className={styles.fill} cx="68" cy="76" rx="6.5" ry="4" />
      <path d="M43 96 H77" />
      <ellipse className={styles.fill} cx="52" cy="96" rx="6.5" ry="4" />
      <ellipse className={styles.fill} cx="68" cy="96" rx="6.5" ry="4" />
    </svg>
  );
}

function IconAnkh() {
  // Looped cross whose stem ends in a clean straight line (no foot).
  return (
    <svg viewBox="0 0 120 172" className={styles.icon} role="img" aria-label="Sceptre with ankh">
      <ellipse className={styles.fill} cx="60" cy="46" rx="21" ry="26" />
      <path d="M31 82 H89" />
      <path d="M60 72 V158" />
    </svg>
  );
}

function IconCrown() {
  // Our brand crown — three points over a horizontal ground line, as in the mark.
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} role="img" aria-label="Crown">
      <path
        className={styles.fill}
        d="M24 78 L34 38 L52 58 L60 28 L68 58 L86 38 L96 78 Z"
      />
      <path d="M24 96 H96" />
    </svg>
  );
}

/* ----------------------------------------------------------------------------
   The day diagram — the three days and their gifts, as a single linked path.
   Nodes are the gift marks themselves; the current day glows brightest.
---------------------------------------------------------------------------- */

const DAYS: Array<{ key: string; num: string; card: number; Icon: () => React.ReactElement }> = [
  { key: "sistrum", num: "I", card: 1, Icon: IconSistrum },
  { key: "ankh", num: "II", card: 2, Icon: IconAnkh },
  { key: "crown", num: "III", card: 3, Icon: IconCrown },
];

function DayDiagram({
  variant,
  activeKey,
  onPick,
}: {
  variant: "intro" | "day" | "complete";
  activeKey?: string;
  onPick: (card: number) => void;
}) {
  return (
    <div
      className={`${styles.diagram} ${styles["dia_" + variant] ?? ""}`}
      role="group"
      aria-label="The three days and their gifts"
    >
      {DAYS.map((d, i) => {
        const on = activeKey === d.key;
        let state = styles.nodeSoft;
        if (variant === "day") state = on ? styles.nodeOn : styles.nodeDim;
        else if (variant === "complete") state = styles.nodeLit;
        return (
          <React.Fragment key={d.key}>
            {i > 0 ? <span className={styles.diaLink} aria-hidden /> : null}
            <button
              type="button"
              className={`${styles.node} ${state}`}
              aria-current={on || undefined}
              aria-label={`Day ${d.num} — the ${d.key === "ankh" ? "sceptre" : d.key}`}
              onClick={() => onPick(d.card)}
            >
              <span className={styles.nodeGlow} aria-hidden />
              <span className={styles.nodeIcon}>
                <d.Icon />
              </span>
              <span className={styles.nodeNum}>{d.num}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

type Card = {
  key: string;
  label: string;
  media: Media[];
  render: (go: (i: number) => void) => React.ReactNode;
};

export default function GiftsSection() {
  const [cur, setCur] = React.useState(0);

  const cards: Card[] = [
    {
      key: "intro",
      label: "The gifts",
      media: MEDIA_INTRO,
      render: (go) => (
        <>
          <DayDiagram variant="intro" onPick={go} />
          <p className={styles.eyebrow}>Signature gifts · received, not bought</p>
          <h2 className={styles.htitle}>Remembrances of the day</h2>
          <p className={styles.hsub}>
            From the full Luxor Rising experience — like achievements, unlocked.
          </p>
          <p className={styles.introLine}>
            On a full concierge day your concierge chooses a gift for you:{" "}
            <span className={styles.accent}>
              hand-picked for the occasion, made by local artisans from the stone and metal of this
              soil.
            </span>{" "}
            One per day — each tied in meaning to the place.
          </p>
        </>
      ),
    },
    {
      key: "sistrum",
      label: "Sistrum",
      media: MEDIA_SISTRUM,
      render: (go) => (
        <>
          <DayDiagram variant="day" activeKey="sistrum" onPick={go} />
          <span className={styles.day}>
            Day One <i>·</i> received for the left hand
          </span>
          <h3 className={styles.gname}>The Sistrum</h3>
          <p className={styles.ghand}>A small instrument of metal — held, and gently shaken</p>
          <p className={styles.gmeaning}>
            Its sound has been used for thousands of years to still the mind and clear a space. A
            soft, feminine current: receptivity, intuition, the grace of letting life move through
            you — a way to return to that stillness, anywhere.
          </p>
          <div className={styles.tags}>
            <span className={styles.tag}>Received energy</span>
            <span className={styles.tag}>Hand-picked</span>
            <span className={styles.tag}>Locally made</span>
          </div>
        </>
      ),
    },
    {
      key: "ankh",
      label: "Sceptre",
      media: MEDIA_ANKH,
      render: (go) => (
        <>
          <DayDiagram variant="day" activeKey="ankh" onPick={go} />
          <span className={styles.day}>
            Day Two <i>·</i> received for the right hand
          </span>
          <h3 className={styles.gname}>The Sceptre</h3>
          <p className={styles.ghand}>Of stone or metal — the mark of one who holds their own authority</p>
          <p className={styles.gmeaning}>
            The looped cross it bears is a sign of life that endures — breath, continuity, the part
            of you that does not end. A strong, masculine current: will, direction, standing in your
            own power without force.
          </p>
          <div className={styles.tags}>
            <span className={styles.tag}>Inner authority</span>
            <span className={styles.tag}>Hand-picked</span>
            <span className={styles.tag}>Locally made</span>
          </div>
        </>
      ),
    },
    {
      key: "crown",
      label: "Crown",
      media: MEDIA_CROWN,
      render: (go) => (
        <>
          <DayDiagram variant="day" activeKey="crown" onPick={go} />
          <span className={styles.day}>
            Day Three <i>·</i> the author&apos;s day, worn
          </span>
          <h3 className={styles.gname}>The Crown</h3>
          <p className={styles.ghand}>A simple band of metal, chosen with a scarf for the occasion</p>
          <p className={styles.gmeaning}>
            Light enough to wear, meant to be kept. Worn, or held in stillness or on special
            occasions, its small weight settles the body and quiets the nervous system, drawing you
            back to a calm, grounded sense of your own inner authority and presence.
          </p>
          <div className={styles.tags}>
            <span className={styles.tag}>Mastery &amp; presence</span>
            <span className={styles.tag}>Hand-picked</span>
            <span className={styles.tag}>Locally made</span>
          </div>
        </>
      ),
    },
    {
      key: "set",
      label: "The set",
      media: MEDIA_SET,
      render: (go) => (
        <>
          <DayDiagram variant="complete" onPick={go} />
          <p className={styles.eyebrow}>The full set</p>
          <h3 className={styles.gname}>Three days. Three gifts. One story.</h3>
          <p className={styles.gmeaning}>
            Each full concierge day carries its own signature gift — hand-picked and locally made.
            Design more of the day, and the set becomes yours to complete.
          </p>
          <a className={styles.cta} href="#design">
            Design your day →
          </a>
          <p className={styles.fineprint}>
            One gift per group, per day · hand-picked by your concierge · made by local artisans
          </p>
        </>
      ),
    },
  ];

  const n = cards.length;
  const go = (i: number) => setCur((i + n) % n);

  return (
    <section className={styles.stage} id="gifts" aria-label="Signature gifts">
      <div className={styles.frame} aria-hidden />

      <div className={styles.deck}>
        {cards.map((c, i) => (
          <div key={c.key} className={i === cur ? `${styles.card} ${styles.cardOn}` : styles.card}>
            <MediaReel media={c.media} active={i === cur} />
            <div className={styles.scrim} aria-hidden />
            <div className={styles.content}>{c.render(go)}</div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.steps} role="tablist" aria-label="Choose a gift">
          {cards.map((c, i) => (
            <button
              key={c.key}
              className={i === cur ? `${styles.step} ${styles.stepOn}` : styles.step}
              aria-current={i === cur}
              onClick={() => go(i)}
            >
              <span className={styles.stepDot} aria-hidden />
              {c.label}
            </button>
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
