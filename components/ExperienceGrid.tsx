"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../app/(site)/concierge-day/ConciergeDayPage.module.css";

export type ExperienceCardData = { src: string; h: string; p: string; k?: string };

/**
 * The "What your day can hold" grid. Square cards; only the first `initial`
 * show, with a Show-all toggle — same collapse idea as the gallery, so 11
 * experiences don't take over the page.
 */
export default function ExperienceGrid({
  cards,
  initial = 6,
}: {
  cards: ExperienceCardData[];
  initial?: number;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const collapsible = cards.length > initial;
  const visible = collapsible && !expanded ? cards.slice(0, initial) : cards;

  return (
    <>
      <div className={styles.expGrid}>
        {visible.map((e) => (
          <div className={styles.exp} key={e.h}>
            <Image src={e.src} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
            <span className={styles.expLocal} aria-hidden>
              <span className={styles.expLocalDot} />
              Local host
            </span>
            {e.k && <span className={styles.expBadge}>{e.k}</span>}
            <div className={styles.expScrim} />
            <div className={styles.expTx}>
              <h4>{e.h}</h4>
              <p>{e.p}</p>
            </div>
          </div>
        ))}
        {(!collapsible || expanded) && (
          <Link className={styles.expAll} href="#design">
            <div className={styles.expAllIn}>
              <div className="k">The full collection</div>
              <h4>Explore all experiences</h4>
              <p>
                Temples, tombs, the Nile, the desert and more — design your day and we&apos;ll build
                it from the full collection.
              </p>
              <span className={styles.expAllCta}>Design your day →</span>
            </div>
          </Link>
        )}
      </div>
      {collapsible && (
        <div className={styles.expMoreWrap}>
          <button type="button" className={styles.expMore} onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show fewer" : `Show all ${cards.length} experiences`}
          </button>
        </div>
      )}
    </>
  );
}
