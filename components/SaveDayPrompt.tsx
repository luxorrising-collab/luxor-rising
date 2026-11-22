"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { restorePicks, useMyDay } from "@/lib/my-day";
import { SAVE_DAY_EVT, openMyDay } from "@/components/MyDay";
import styles from "./SaveDayPrompt.module.css";

// "Email me my day". Offered once when a visitor with more than three picks is
// about to leave (desktop: the pointer leaves through the top of the window;
// phones: when they come back to the tab after switching away), and any time
// from the "Your day" drawer. Also restores a saved day from the link in the
// email (?day=slug,slug), then opens the drawer to show it.

const STORE = "lr-save-day";
const MIN_PICKS = 4; // "more than three"
const QUIET_DAYS = 3; // after a dismissal, don't ask again for this long

type Memory = { state: "saved" | "dismissed"; at: number };
const readMemory = (): Memory | null => {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Memory) : null;
  } catch {
    return null;
  }
};
const remember = (state: Memory["state"]) => {
  try {
    localStorage.setItem(STORE, JSON.stringify({ state, at: Date.now() }));
  } catch {
    /* storage blocked */
  }
};

export default function SaveDayPrompt() {
  const { picks } = useMyDay();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  // The listeners below read the latest count without re-subscribing.
  const picksRef = useRef(picks.length);
  useEffect(() => {
    picksRef.current = picks.length;
  }, [picks.length]);

  // Restore a day from the email link, once.
  useEffect(() => {
    const url = new URL(window.location.href);
    const day = url.searchParams.get("day");
    if (!day) return;
    restorePicks(day.split(",").map((s) => s.trim()).filter(Boolean));
    url.searchParams.delete("day");
    window.history.replaceState(null, "", url.pathname + (url.search ? url.search : "") + url.hash);
    window.setTimeout(openMyDay, 400);
  }, []);

  // Asked for from the drawer.
  useEffect(() => {
    const o = () => {
      setStatus("idle");
      setError("");
      setOpen(true);
    };
    window.addEventListener(SAVE_DAY_EVT, o);
    return () => window.removeEventListener(SAVE_DAY_EVT, o);
  }, []);

  // About to leave: offer it once (not after saving, not soon after a "no thanks").
  useEffect(() => {
    if (window.location.pathname.startsWith("/booking-confirmed")) return;
    const eligible = () => {
      if (picksRef.current < MIN_PICKS) return false;
      const m = readMemory();
      if (!m) return true;
      if (m.state === "saved") return false;
      return Date.now() - m.at > QUIET_DAYS * 86400000;
    };
    const show = () => {
      if (!eligible()) return;
      remember("dismissed"); // counts as asked, even if they just close it
      setStatus("idle");
      setOpen(true);
    };
    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) show();
    };
    let hiddenAt = 0;
    const onVis = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 8000) show();
    };
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch) document.addEventListener("visibilitychange", onVis);
    else document.addEventListener("mouseout", onOut);
    return () => {
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open]);

  if (!open || picks.length === 0) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/save-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newsletter, company, picks: picks.map((p) => p.slug) }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(out.error || "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      remember("saved");
      setStatus("sent");
    } catch {
      setError("We couldn't send it just now. Please try again.");
      setStatus("idle");
    }
  }

  const shown = picks.slice(0, 5);
  // Medinet Habu sets the scene, like the hero on the product pages.
  const hero = "/images/experiences/medinet-habu-hero.jpg";
  return (
    <div className={styles.wrap} role="dialog" aria-modal="true" aria-labelledby="save-day-h">
      <button type="button" className={styles.shade} aria-label="Close" onClick={() => setOpen(false)} />
      <div className={styles.box}>
        <span
          className={styles.bg}
          style={{ backgroundImage: `url(${hero})` }}
          aria-hidden
        />
        <span className={styles.scrim} aria-hidden />
        <button type="button" className={styles.close} aria-label="Close" onClick={() => setOpen(false)}>
          ×
        </button>
        {status === "sent" ? (
          <div className={styles.done}>
            <span className={styles.tick} aria-hidden>
              ✓
            </span>
            <h2 id="save-day-h" className={styles.h}>
              Your day is on its way
            </h2>
            <p className={styles.lead}>
              Check your inbox: your {picks.length} experiences, why each is worth it, and three ways to see them.
              One tap on &ldquo;Open my day&rdquo; brings it all back.
            </p>
            <button type="button" className={`btn btn-primary ${styles.cta}`} onClick={() => setOpen(false)}>
              Keep exploring
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className={styles.form}>
            <span className={styles.kicker}>Your day, saved</span>
            <h2 id="save-day-h" className={styles.h}>
              Keep your Luxor day
            </h2>
            <p className={styles.lead}>
              We&apos;ll send your {picks.length} experiences to your inbox, ready when you are, on any device.
            </p>
            {/* what they're picking up: their own experiences, as photos */}
            <ul className={styles.thumbs} aria-label="Your experiences">
              {shown.map((p) => (
                <li key={p.slug} title={p.name}>
                  <span style={{ backgroundImage: `url(/images/cards/tile/${p.slug}.jpg), url(/images/cards/${p.slug}.jpg)` }} />
                </li>
              ))}
              {picks.length > shown.length && <li className={styles.thumbMore}>+{picks.length - shown.length}</li>}
            </ul>
            {/* what the email holds — the reason to say yes */}
            <ul className={styles.gets}>
              <li>
                <b>Why each one is worth it</b> — a photo and a few lines for every experience
              </li>
              <li>
                <b>Three ways to see them with us</b> — what each day includes, and from what price
              </li>
              <li>
                <b>Good to know before Luxor</b> — the best hours, what to wear, what to carry
              </li>
            </ul>
            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.sr}>Your email</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" className={`btn btn-primary ${styles.cta}`} aria-disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send my day →"}
              </button>
            </div>
            {/* honeypot — hidden from people, irresistible to bots */}
            <input
              className={styles.hp}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              name="company"
            />
            <label className={styles.opt}>
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
              <span>
                Also send me the <b>Insider&apos;s letter</b>: one short note a month on Luxor&apos;s best hours and
                hidden places. Unsubscribe any time.
              </span>
            </label>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <p className={styles.fine}>
              One email with your day and one reminder, nothing else. See our{" "}
              <Link href="/legal/privacy" target="_blank">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
