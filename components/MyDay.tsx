"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { onDayPickAdded, useMyDay, dayLength, setDayNames, type DayPick, type DaySegment } from "@/lib/my-day";
import styles from "./MyDay.module.css";

const daysLabel = (d: number) => `about ${d} day${d > 1 ? "s" : ""}`;
const OPEN_EVT = "lr-my-day-open";
/** Open the "Your day" drawer from anywhere. */
export const openMyDay = () => window.dispatchEvent(new Event(OPEN_EVT));

/**
 * "+ Add to my day" / "✓ In your day". The same control everywhere an
 * experience appears, so the visitor can shop across pages and build the day.
 *  - hero: a ghost button beside the hero's main call to action
 *  - card: a round button in the corner of an experience card
 *  - tile: a small pill on a builder tile
 *  - pill: a labelled pill in a card's text area (cards, listings)
 */
export function AddToDay({
  slug,
  name,
  variant = "hero",
  className = "",
  tabIndex,
}: {
  slug: string;
  name: string;
  tabIndex?: number;
  variant?: "hero" | "card" | "tile" | "pill";
  className?: string;
}) {
  const { has, toggle } = useMyDay();
  const on = has(slug);
  const label = on ? `Remove ${name} from your day` : `Add ${name} to your day`;
  return (
    <button
      type="button"
      className={
        variant === "hero"
          ? `btn btn-ghost btn-lg ${styles.heroBtn} ${on ? styles.heroOn : ""} ${className}`
          : `${styles.add} ${styles[variant]} ${on ? styles.on : ""} ${className}`
      }
      aria-pressed={on}
      tabIndex={tabIndex}
      aria-label={variant === "card" ? label : undefined}
      title={variant === "card" ? label : undefined}
      onClick={(e) => {
        // cards are links: adding must not follow them
        e.preventDefault();
        e.stopPropagation();
        toggle({ slug, name });
      }}
    >
      {variant === "card" ? (
        <span aria-hidden>{on ? "✓" : "+"}</span>
      ) : on ? (
        <>
          <span aria-hidden>✓</span> In your day
        </>
      ) : (
        <>
          <span aria-hidden>+</span> Add to my day
        </>
      )}
    </button>
  );
}

/** Registers the canonical names (from the site layout), so every pick matches the builder. */
export function MyDayNames({ names }: { names: Record<string, string> }) {
  useEffect(() => setDayNames(names), [names]);
  return null;
}

/** True once the browser has read the stored picks (avoids a server/client mismatch). */
const noop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

// Consecutive days of the same multi-day experience share one label.
function runs(segs: DaySegment[]) {
  const out: { start: number; len: number; where: string; whole?: boolean }[] = [];
  segs.forEach((g, i) => {
    const last = out[out.length - 1];
    if (g.whole && last && last.whole && last.where === g.where) last.len++;
    else out.push({ start: i, len: 1, where: g.where, whole: g.whole });
  });
  return out;
}

/**
 * The day plan at a glance: one segment per day, filled by how full that day
 * is (full at three experiences, a fourth still fits), labelled with where it is. Used in the drawer,
 * the builder and the toast, so it reads the same everywhere.
 */
export function DayBar({ segments, picks, compact = false }: { segments: DaySegment[]; picks: DayPick[]; compact?: boolean }) {
  if (segments.length === 0) return null;
  const nameOf = (slug: string) => picks.find((p) => p.slug === slug)?.name ?? slug;
  const shown = segments.slice(0, 8);
  const more = segments.length - shown.length;
  // the first day with room left, for the hint
  const open = segments.find((g) => !g.whole && g.count < (g.cap ?? 4));
  const spare = open ? (open.cap ?? 4) - open.count : 0;
  return (
    <div className={`${styles.dayBar} ${compact ? styles.dayBarCompact : ""} ${shown.length > 4 ? styles.dayBarMany : ""}`}>
      <div
        className={styles.dayGrid}
        style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))${more > 0 ? " auto" : ""}` }}
        role="img"
        aria-label={`About ${segments.length} day${segments.length > 1 ? "s" : ""}`}
      >
        {shown.map((g, i) => (
          <span key={i} className={`${styles.daySeg} ${g.whole ? styles.dayWhole : ""}`} style={{ gridRow: 1 }}>
            <i style={{ width: `${Math.round(g.fill * 100)}%`, animationDelay: `${120 + i * 70}ms` }} />
          </span>
        ))}
        {more > 0 && (
          <span className={styles.dayMore} style={{ gridRow: 1 }}>
            +{more}
          </span>
        )}
        {!compact &&
          runs(shown).map((r) => (
            <span
              key={r.start}
              className={styles.dayLbl}
              style={{ gridRow: 2, gridColumn: `${r.start + 1} / span ${r.len}` }}
            >
              <b>{r.len > 1 ? `Days ${r.start + 1}–${r.start + r.len}` : `Day ${r.start + 1}`}</b>
              {r.whole ? nameOf(r.where) : r.where}
            </span>
          ))}
      </div>
      {/* narrow space and many days: one legend line instead of labels under each day */}
      {!compact && (
        <p className={styles.dayLegend}>
          {runs(shown)
            .map((r) => `${r.start + 1}${r.len > 1 ? `–${r.start + r.len}` : ""} ${r.whole ? nameOf(r.where) : r.where}`)
            .join(" · ")}
        </p>
      )}
      {!compact && (
        <p className={styles.dayHint}>
          {segments.length} day{segments.length > 1 ? "s" : ""}
          {open && spare > 0 ? ` · room for ${spare} more in ${open.where}` : " · each day full at the right pace"}
        </p>
      )}
    </div>
  );
}

/** A small gold count beside "Design your day" in the menu. */
export function MyDayCount() {
  const { picks } = useMyDay();
  const hydrated = useHydrated();
  if (!hydrated || picks.length === 0) return null;
  return (
    <span className={styles.count} aria-label={`${picks.length} in your day`}>
      {picks.length}
    </span>
  );
}

/** "Added to your day" confirmation, with the running total and the way on. */
export function MyDayToast({ designHref = "/concierge-day#design" }: { designHref?: string }) {
  const { picks, days, segments } = useMyDay();
  const [last, setLast] = useState<DayPick | null>(null);
  useEffect(() => {
    let t = 0;
    const off = onDayPickAdded((p) => {
      setLast(p);
      window.clearTimeout(t);
      t = window.setTimeout(() => setLast(null), 4200);
    });
    return () => {
      off();
      window.clearTimeout(t);
    };
  }, []);
  if (!last) return null;
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.toastTick} aria-hidden>
        ✓
      </span>
      <span className={styles.toastTx}>
        <b>{last.name}</b> is in your day
        <em>
          {picks.length} experience{picks.length > 1 ? "s" : ""} · {daysLabel(days)}
        </em>
        <DayBar segments={segments} picks={picks} compact />
      </span>
      <button
        type="button"
        className={styles.toastView}
        onClick={() => {
          setLast(null);
          openMyDay();
        }}
      >
        View
      </button>
      <Link href={designHref} className={styles.toastGo} onClick={() => setLast(null)}>
        Design your day →
      </Link>
    </div>
  );
}

/** The header's "Your day · n": always in view once something is picked; opens the drawer. */
export function MyDayButton({
  className,
  labelled = false,
  onOpen,
}: {
  className?: string;
  /** Show "Your day" beside the count (e.g. in the phone menu). */
  labelled?: boolean;
  /** Called as the drawer opens (e.g. to close the phone menu). */
  onOpen?: () => void;
}) {
  const { picks } = useMyDay();
  const hydrated = useHydrated();
  if (!hydrated || picks.length === 0) return null;
  return (
    <button
      type="button"
      className={className ?? styles.dayBtn}
      onClick={() => {
        onOpen?.();
        openMyDay();
      }}
      aria-label={`Your day: ${picks.length} experience${picks.length > 1 ? "s" : ""}. Open`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </svg>
      {className && labelled ? (
        <>
          <span>Your day</span>
          <span className={styles.dayBtnN}>{picks.length}</span>
        </>
      ) : className ? (
        <span>{picks.length}</span>
      ) : (
        <>
          <span className={styles.dayBtnTx}>Your day</span>
          <span className={styles.dayBtnN}>{picks.length}</span>
        </>
      )}
    </button>
  );
}

/** The mini-basket: what's in the day, how long it needs, and the way on. */
export function MyDayDrawer({
  designHref = "/concierge-day#design",
  lines = {},
}: {
  designHref?: string;
  /** slug → the experience's poetic line, shown under its name. */
  lines?: Record<string, string>;
}) {
  const { picks, days, segments, needsSignature, remove, clear } = useMyDay();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const o = () => setOpen(true);
    window.addEventListener(OPEN_EVT, o);
    return () => window.removeEventListener(OPEN_EVT, o);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);
  if (!open) return null;
  const close = () => setOpen(false);
  return (
    <div className={styles.drawerWrap} role="dialog" aria-modal="true" aria-label="Your day">
      <button type="button" className={styles.drawerShade} aria-label="Close" onClick={close} />
      <aside className={styles.drawer}>
        <div className={styles.drawerHead}>
          <span className={styles.drawerKicker}>Your day</span>
          <button type="button" className={styles.drawerClose} aria-label="Close" onClick={close}>
            ×
          </button>
        </div>
        {picks.length === 0 ? (
          <div className={styles.drawerEmpty}>
            <p>Nothing in your day yet.</p>
            <p>
              Tap <b>+ Add to my day</b> on any experience, and it waits here while you look around.
            </p>
            <Link href="/experiences" className="btn btn-primary" onClick={close}>
              See the experiences
            </Link>
          </div>
        ) : (
          <>
            <p className={styles.drawerSum}>
              {picks.length} experience{picks.length > 1 ? "s" : ""} · {daysLabel(days)}
              {needsSignature && <span className={styles.picksSig}>Signature</span>}
            </p>
            <DayBar segments={segments} picks={picks} />
            <ul className={styles.drawerList}>
              {picks.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={p.slug === "medinet-habu" ? "/medinet-habu" : `/experiences/${p.slug}`}
                    className={styles.drawerItem}
                    onClick={close}
                  >
                    <span className={styles.drawerThumb}>
                      <Image src={`/images/cards/thumb/${p.slug}.jpg`} alt="" fill unoptimized loading="lazy" />
                    </span>
                    <span className={styles.drawerText}>
                      <span className={styles.drawerName}>
                        {p.name}
                        {dayLength(p.slug) && <span className={styles.multiDay}>{dayLength(p.slug)}</span>}
                      </span>
                      {lines[p.slug] && <span className={styles.drawerLine}>{lines[p.slug]}</span>}
                    </span>
                  </Link>
                  <button
                    type="button"
                    className={styles.drawerRemove}
                    aria-label={`Remove ${p.name}`}
                    onClick={() => remove(p.slug)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.drawerNote}>
              Three to four experiences a day is the right pace. Your concierge shapes the order and the timing.
            </p>
            <div className={styles.drawerFoot}>
              <Link href={designHref} className="btn btn-primary" onClick={close}>
                Design your day →
              </Link>
              <button type="button" className={styles.drawerKeep} onClick={close}>
                Keep exploring
              </button>
            </div>
            <button type="button" className={styles.picksClear} onClick={clear}>
              Clear all
            </button>
          </>
        )}
      </aside>
    </div>
  );
}

/** Builder: the visitor's picks, the days they need, and a way to plan them. */
export function MyDayPicks({
  onPlanDays,
  currentDays,
}: {
  onPlanDays?: (days: number) => void;
  currentDays?: number;
}) {
  const { picks, days, segments, needsSignature, remove, clear } = useMyDay();
  const hydrated = useHydrated();
  if (!hydrated || picks.length === 0) return null;
  const fits = currentDays !== undefined && currentDays >= days;
  return (
    <div className={styles.picks}>
      <div className={styles.picksHead}>
        <span className={styles.picksTitle}>
          Your picks · {picks.length} · {daysLabel(days)}
          {needsSignature && <span className={styles.picksSig}>Signature</span>}
        </span>
        {onPlanDays && !fits && (
          <button type="button" className={styles.picksPlan} onClick={() => onPlanDays(days)}>
            Plan {days} day{days > 1 ? "s" : ""}
          </button>
        )}
      </div>
      <DayBar segments={segments} picks={picks} />
      <ul className={styles.picksList}>
        {picks.map((p) => (
          <li key={p.slug}>
            {p.name}
            <button type="button" aria-label={`Remove ${p.name}`} onClick={() => remove(p.slug)}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.picksClear} onClick={clear}>
        Clear all
      </button>
    </div>
  );
}
