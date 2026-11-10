"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./ConciergeChat.module.css";
import { trackLead } from "@/lib/analytics";

// A quiet "ask us" chat. It says "us", not "your concierge": the concierge comes
// with a booked day, so before booking the guest talks to Luxor Rising. No phone
// number is shown and nothing is pre-written: the guest leaves their name, email
// and (if they like) a WhatsApp number, writes in their own words, and we reply
// personally. It goes through /api/enquiry like every other form, so it lands in
// Supabase and counts as a lead. It stays out of the hero (appears once the
// visitor scrolls) and sits above the sticky booking bar.

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

export default function ConciergeChat({
  context = "Design Your Day",
  revealAfter = 520,
}: {
  /** Kept for the page's existing call; the number is no longer shown. */
  whatsappNumber?: string;
  /** Which page the guest is on — stored with the message and tags the event. */
  context?: string;
  revealAfter?: number;
}) {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const text = String(fd.get("message") ?? "").trim();
    if (!name || !isEmail(email) || !text) {
      setError("Please add your name, a valid email and your message.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: [text, phone && `WhatsApp: ${phone}`, `(Sent from the chat on ${context})`]
            .filter(Boolean)
            .join("\n\n"),
          topic: "ask-us",
          company: String(fd.get("company") ?? ""), // honeypot — left blank by people
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSent(true);
      trackLead({ form: "ask-us", topic: context });
    } catch {
      setError("We couldn't send that just now. Please try again, or email luxor.rising.com@gmail.com.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div ref={rootRef} className={`${styles.root} ${(shown && !yield_) || open ? styles.shown : ""}`}>
      {open && (
        <div className={styles.card} role="dialog" aria-label="Write to Luxor Rising">
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

          {sent ? (
            <div className={styles.body}>
              <p className={styles.bubble}>Thank you — your message is with us.</p>
              <p className={styles.bubble}>
                We&apos;ll read it personally and reply within 24 hours, by email or on WhatsApp if you left your
                number.
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.body}>
                <p className={styles.bubble}>Hello, and welcome.</p>
                <p className={styles.bubble}>
                  Write to us in your own words: your date, your hotel, anything on your mind. We reply
                  personally.
                </p>
              </div>
              <div className={styles.fields}>
                {/* Honeypot: hidden from people, catches bots. */}
                <input type="text" name="company" tabIndex={-1} autoComplete="off" className={styles.hp} aria-hidden />
                <textarea name="message" rows={3} placeholder="Your message" aria-label="Your message" required />
                <input type="text" name="name" placeholder="Your name" aria-label="Your name" autoComplete="name" required />
                <input type="email" name="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
                <input
                  type="tel"
                  name="phone"
                  placeholder="WhatsApp (optional)"
                  aria-label="WhatsApp number (optional)"
                  autoComplete="tel"
                />
                {error && <p className={styles.err}>{error}</p>}
                <button type="submit" className={`btn btn-primary ${styles.cta}`} disabled={sending}>
                  {sending ? "Sending…" : "Send"}
                </button>
                <span className={styles.num}>We reply within 24 hours, by email or WhatsApp</span>
              </div>
            </form>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.launch}
        aria-expanded={open}
        aria-label={open ? "Close" : "Write to us"}
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
