"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./ConciergeChat.module.css";
import { trackWhatsAppClick } from "@/lib/analytics";

// A quiet "ask us" chat that hands the conversation to WhatsApp, where a real
// person at Luxor Rising answers. It says "us", not "your concierge": the
// concierge comes with a booked day, so before booking the guest talks to us. It stays out of the hero (appears once the
// visitor scrolls), sits above the sticky booking bar, and opens a small card
// with conversation starters that pre-fill the first WhatsApp message.

const TOPICS = [
  { label: "Is my date free?", text: "Is my date free? We're thinking of " },
  { label: "Which day suits us?", text: "Which day would suit us best? We are " },
  { label: "Pickup from my hotel", text: "Could you pick us up from our hotel? We're staying at " },
  { label: "Something else", text: "" },
];

const WaGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden width="18" height="18">
    <path
      fill="currentColor"
      d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3Z"
    />
  </svg>
);

export default function ConciergeChat({
  whatsappNumber,
  context = "Design Your Day",
  revealAfter = 520,
}: {
  whatsappNumber: string;
  /** Which page the guest is on — opens their first message and tags the event. */
  context?: string;
  revealAfter?: number;
}) {
  const digits = whatsappNumber.replace(/\D/g, "").replace(/^00/, "");
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  // Steps aside while the payment controls are on screen, so it never covers them.
  const [yield_, setYield] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > revealAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [revealAfter]);

  useEffect(() => {
    const els = document.querySelectorAll("[data-hide-chat]");
    if (!els.length) return;
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setYield(seen.size > 0);
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (!digits) return null;

  const link = (topic: string) =>
    `https://wa.me/${digits}?text=${encodeURIComponent(`Hello Luxor Rising, I'm looking at ${context}. ${topic}`.trim())}`;
  const go = (topic: string) => trackWhatsAppClick({ location: context, topic });
  const pretty = whatsappNumber.trim().startsWith("+") ? whatsappNumber.trim() : `+${digits}`;

  return (
    <div ref={rootRef} className={`${styles.root} ${(shown && !yield_) || open ? styles.shown : ""}`}>
      {open && (
        <div className={styles.card} role="dialog" aria-label="Chat with Luxor Rising">
          <div className={styles.head}>
            <span className={styles.avatar}>
              <Image src="/images/logo-emblem.png" alt="" width={40} height={40} />
            </span>
            <span className={styles.who}>
              <b>Luxor Rising</b>
              <span>
                <i aria-hidden /> A real person, never a bot
              </span>
            </span>
            <button type="button" className={styles.close} aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className={styles.body}>
            <p className={styles.bubble}>Hello, and welcome.</p>
            <p className={styles.bubble}>
              Ask anything about your day: your date, pickup from your hotel, which day suits you. You&apos;ll
              get a personal reply on WhatsApp.
            </p>
            <div className={styles.topics}>
              {TOPICS.map((t) => (
                <a
                  key={t.label}
                  href={link(t.text)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.topic}
                  onClick={() => go(t.label)}
                >
                  {t.label}
                </a>
              ))}
            </div>
          </div>
          <div className={styles.foot}>
            <a
              href={link("")}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-primary ${styles.cta}`}
              onClick={() => go("open")}
            >
              <WaGlyph /> Chat on WhatsApp
            </a>
            <span className={styles.num}>Opens WhatsApp · {pretty}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.launch}
        aria-expanded={open}
        aria-label={open ? "Close the chat" : "Ask us on WhatsApp"}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.launchAvatar}>
          <Image src="/images/logo-emblem.png" alt="" width={34} height={34} />
          <i className={styles.dot} aria-hidden />
        </span>
        <span className={styles.launchText}>
          <b>Ask us</b>
          <span>A real person replies</span>
        </span>
      </button>
    </div>
  );
}
