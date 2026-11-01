"use client";

import * as React from "react";
import styles from "./GiftsSection.module.css";
import { GIFT_DEFAULTS, GIFT_SHORT, type GiftData, type GiftKey } from "@/lib/gifts";
import { CROWN_BARS, CROWN_BARS_STYLE, CROWN_OUTLINE, CROWN_OUTLINE_STYLE } from "./GiftMarks";

// One looping video behind the whole section: the hero's real footage with every
// frame graded to the same mean colour and the veil and crossfades already baked in
// (see scripts/build-gifts-reel.mjs). Nothing here animates opacity or swaps sources,
// and the poster is the file's own first frame, so the tint has nothing to jump on.
const REEL_SRC = "/videos/real/gifts-reel.mp4";
const REEL_POSTER = "/videos/real/gifts-reel-poster.jpg";

function GiftsBackdrop({ active }: { active: boolean }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  // Fetch nothing until the section first comes near the viewport.
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    setStarted(true);
    // With reduced motion, or if autoplay is refused, the poster simply stays up.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [active]);

  return (
    <div className={styles.reel} aria-hidden>
      <video
        ref={ref}
        className={styles.media}
        muted
        loop
        playsInline
        disablePictureInPicture
        preload={started ? "auto" : "none"}
        poster={REEL_POSTER}
      >
        <source src={REEL_SRC} type="video/mp4" />
      </video>
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
  return (
    <svg viewBox="0 0 120 120" className={styles.icon} role="img" aria-label="Crown">
      <path className={styles.fill} d={CROWN_OUTLINE} style={CROWN_OUTLINE_STYLE} />
      <path d={CROWN_BARS} style={CROWN_BARS_STYLE} />
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
  interactive = true,
}: {
  variant: "intro" | "day" | "complete";
  activeKey?: string;
  onPick: (key: string) => void;
  /** When false the nodes are purely visual (no jumping between gifts). */
  interactive?: boolean;
}) {
  return (
    <div
      className={`${styles.diagram} ${styles["dia_" + variant] ?? ""}`}
      role="group"
      aria-label="The three signature gifts"
    >
      {DAYS.map((d, i) => {
        const on = activeKey === d.key;
        let state = styles.nodeSoft;
        if (variant === "day") state = on ? styles.nodeOn : styles.nodeDim;
        else if (variant === "complete") state = styles.nodeLit;
        const label = `Day ${d.num} — the ${d.key === "ankh" ? "sceptre" : d.key}`;
        const inner = (
          <>
            <span className={styles.nodeGlow} aria-hidden />
            <span className={styles.nodeIcon}>
              <d.Icon />
            </span>
            <span className={styles.nodeNum}>{d.num}</span>
          </>
        );
        return (
          <React.Fragment key={d.key}>
            {i > 0 ? <span className={styles.diaLink} aria-hidden /> : null}
            {interactive ? (
              <button
                type="button"
                className={`${styles.node} ${state}`}
                aria-current={on || undefined}
                aria-label={label}
                onClick={() => onPick(d.key)}
              >
                {inner}
              </button>
            ) : (
              <div className={`${styles.node} ${state}`} aria-label={label}>
                {inner}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

type Card = {
  key: string;
  label: string;
  diagKey?: string;
  render: (goKey: (key: string) => void) => React.ReactNode;
};

// The diagram labels the Sceptre node "ankh" internally.
const GIFT_DIAGKEY: Record<GiftKey, string> = {
  sistrum: "sistrum",
  sceptre: "ankh",
  crown: "crown",
};
const GIFT_DAY_LABEL: Record<GiftKey, string> = {
  sistrum: "Day One",
  sceptre: "Day Two",
  crown: "Day Three",
};
const GIFT_DAY_SUFFIX: Record<GiftKey, string> = {
  sistrum: "received for the left hand",
  sceptre: "received for the right hand",
  crown: "the author’s day, worn",
};
/**
 * The signature-gift showcase.
 * - No props → the concierge-day set (intro → three gifts → the set).
 * - `featured` → an experience: lead with the gift received here, explain the
 *   set, and invite to Design Your Day (first and last slides), with the CTA
 *   pointing at `designHref`.
 */
export default function GiftsSection({
  featured,
  designHref = "#design",
  content,
}: {
  featured?: GiftKey;
  designHref?: string;
  content?: Record<GiftKey, GiftData>;
} = {}) {
  const [cur, setCur] = React.useState(0);
  const gifts = content ?? GIFT_DEFAULTS;

  // The reel is below the fold, so it stays on its poster until the section is
  // within a screen of the viewport, and pauses again once it scrolls well away.
  const stageRef = React.useRef<HTMLElement>(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const giftCard = (
    key: GiftKey,
    opts: { eyebrow?: string; badge?: React.ReactNode; invite?: string } = {}
  ): Card => {
    const g = gifts[key];
    return {
      key,
      label: GIFT_SHORT[key],
      diagKey: GIFT_DIAGKEY[key],
      render: (goKey) => (
        <>
          <DayDiagram
            variant="day"
            activeKey={GIFT_DIAGKEY[key]}
            onPick={goKey}
            interactive={!featured}
          />
          {opts.eyebrow ? <p className={styles.eyebrow}>{opts.eyebrow}</p> : null}
          <span className={styles.day}>
            {opts.badge ?? (
              <>
                <b>{GIFT_DAY_LABEL[key]}</b> <i>·</i> {GIFT_DAY_SUFFIX[key]}
              </>
            )}
          </span>
          <h3 className={styles.gname}>{g.name}</h3>
          <p className={styles.ghand}>{g.hand}</p>
          <p className={styles.gmeaning}>{g.meaning}</p>
          <div className={styles.tags}>
            {g.tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
          {opts.invite ? (
            <a className={styles.cta} href={designHref}>
              {opts.invite}
            </a>
          ) : null}
        </>
      ),
    };
  };

  const introCard: Card = {
    key: "intro",
    label: "The gifts",
    render: (goKey) =>
      featured ? (
        // On an experience this slide is "The story" — the deeper why.
        <>
          <DayDiagram variant="intro" onPick={goKey} interactive={false} />
          <p className={styles.eyebrow}>The story</p>
          <h2 className={styles.htitle}>
            Of all the places on earth, only a few hold what Luxor holds.
          </h2>
          <p className={styles.hsub}>
            To walk through Medinet Habu and Karnak and to be invited deeper is its own kind of
            passage.
          </p>
          <p className={styles.introLine}>
            So on a full Luxor Rising day, your concierge chooses a gift for you:{" "}
            <span className={styles.accent}>
              hand-picked for the occasion, made by local artisans from the stone and metal of
              this soil.
            </span>{" "}
            Some things can be bought. But it is far more beautiful to receive them. One per day,
            each tied in meaning to the place and experience.
          </p>
        </>
      ) : (
        // On Design Your Day this is the opening intro.
        <>
          <DayDiagram variant="intro" onPick={goKey} interactive />
          <p className={styles.eyebrow}>Signature gifts · received, not bought</p>
          <h2 className={styles.htitle}>Remembrances of the day</h2>
          <p className={styles.hsub}>
            From the full Luxor Rising experience — like achievements, unlocked.
          </p>
          <p className={styles.introLine}>
            On a full concierge day your concierge chooses a gift for you:{" "}
            <span className={styles.accent}>
              hand-picked for the occasion, made by local artisans from the stone and metal of
              this soil.
            </span>{" "}
            One per day — each tied in meaning to the place.
          </p>
        </>
      ),
  };

  const setCard: Card = {
    key: "set",
    label: "The set",
    render: (goKey) => (
      <>
        <DayDiagram variant="complete" onPick={goKey} interactive={!featured} />
        <p className={styles.eyebrow}>The full set</p>
        <h3 className={styles.gname}>Three days. Three gifts. One story.</h3>
        <p className={styles.gmeaning}>
          {featured
            ? "You receive one signature gift on this experience. Design your day — more days, more gifts — and the whole set becomes yours to keep."
            : "Of all the places on earth, only a few hold what Luxor holds — and some things are far more beautiful to receive than to buy. Each full concierge day carries its own signature gift, hand-picked and locally made. Design more of the day, and the set becomes yours to complete."}
        </p>
        <a className={styles.cta} href={designHref}>
          Design your day →
        </a>
        <p className={styles.fineprint}>
          One gift per group, per day · hand-picked by your concierge · made by local artisans
        </p>
      </>
    ),
  };

  // Experience pages tell a focused three-beat story: the gift received here →
  // the story of the gifts → the whole set, inviting into Design Your Day. The
  // diagram is non-interactive so the focus never jumps to another gift.
  const cards: Card[] = featured
    ? [
        giftCard(featured, {
          eyebrow: "Your signature gift · received on this experience",
          badge: (
            <>
              Received on this experience <i>·</i> yours to keep
            </>
          ),
          invite: "Design your day for the full set →",
        }),
        { ...introCard, label: "The story" },
        setCard,
      ]
    : [introCard, giftCard("sistrum"), giftCard("sceptre"), giftCard("crown"), setCard];

  const n = cards.length;
  const go = (i: number) => setCur((i + n) % n);
  const goKey = (key: string) => {
    const i = cards.findIndex((c) => c.diagKey === key);
    if (i >= 0) setCur(i);
  };

  return (
    <section ref={stageRef} className={styles.stage} id="gifts" aria-label="Signature gifts">
      {/* The background belongs to the whole section and never changes with the
          slide; only the gift text on top crossfades. */}
      <GiftsBackdrop active={inView} />
      <div className={styles.frame} aria-hidden />

      <div className={styles.deck}>
        {cards.map((c, i) => (
          <div key={c.key} className={i === cur ? `${styles.card} ${styles.cardOn}` : styles.card}>
            <div className={styles.content}>{c.render(goKey)}</div>
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
