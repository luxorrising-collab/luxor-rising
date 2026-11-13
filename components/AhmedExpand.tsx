"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AHMED } from "@/lib/ahmed-profile";
import styles from "./AhmedExpand.module.css";

// Ahmed's profile, folded into the concierge band (over its dark photo). Closed:
// one clean row with his round portrait, name, role and the title. Opened: one
// continuous text, with only Marian's own experiences set apart as quotes, the
// call to design the day with him, and a close link at the foot so phones never
// have to scroll back up. Left-aligned inside the centred band.
export default function AhmedExpand({ designHref = "#design" }: { designHref?: string }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const toggle = (next: boolean) => {
    setOpen(next);
    // Keep the profile's top in view when it opens or closes (long on phones).
    requestAnimationFrame(() => {
      const el = boxRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      if (top < 70 || top > window.innerHeight * 0.6) {
        window.scrollTo({ top: window.scrollY + top - 90, behavior: "smooth" });
      }
    });
  };

  return (
    <div ref={boxRef} className={`${styles.box} ${open ? styles.open : ""}`} id="ahmed">
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={() => toggle(!open)}
      >
        <span className={styles.avatar}>
          <Image src={AHMED.avatar} alt="" width={60} height={60} />
        </span>
        <span className={styles.who}>
          <span className={styles.kicker}>
            {AHMED.name} · {AHMED.role}
          </span>
          <b>{AHMED.headline}</b>
        </span>
        <span className={styles.chevron} aria-hidden />
      </button>

      {open && (
        <div className={styles.body}>
          {AHMED.blocks.map((b, i) =>
            b.kind === "text" ? (
              <p className={styles.text} key={i}>
                {b.text}
              </p>
            ) : (
              <blockquote className={styles.quote} key={i}>
                &ldquo;{b.text}&rdquo;
              </blockquote>
            ),
          )}
          <p className={styles.signed}>— {AHMED.quoteBy}</p>
          <div className={styles.cta}>
            <a href={designHref} className="btn btn-primary">
              Design your day with {AHMED.name}
            </a>
            <span>Popular dates go early.</span>
          </div>
          <button type="button" className={styles.close} onClick={() => toggle(false)}>
            Close profile
          </button>
        </div>
      )}
    </div>
  );
}
