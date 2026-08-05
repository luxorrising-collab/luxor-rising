"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./consent.module.css";
import {
  ACCEPT_ALL,
  CONSENT_OPEN_EVENT,
  REJECT_ALL,
  applyConsent,
  getStoredConsent,
  saveConsent,
  type ConsentChoices,
} from "@/lib/consent";
import { useTrackingEnabled } from "./ConsentProvider";

type View = "hidden" | "banner" | "prefs";

export default function ConsentBanner() {
  const trackingEnabled = useTrackingEnabled();
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Decide on mount whether to show the banner, and wire the "reopen" event.
  useEffect(() => {
    if (!trackingEnabled) return; // tracking off → no banner
    const stored = getStoredConsent();
    if (!stored) setView("banner");

    const open = () => {
      const s = getStoredConsent();
      setAnalytics(s?.analytics ?? false);
      setMarketing(s?.marketing ?? false);
      setView("prefs");
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, [trackingEnabled]);

  function commit(choices: ConsentChoices) {
    saveConsent(choices);
    applyConsent(choices);
    setView("hidden");
  }

  if (view === "hidden") return null;

  return (
    <div
      className={styles.root}
      role="dialog"
      aria-modal={view === "prefs"}
      aria-label="Cookie preferences"
    >
      {view === "prefs" && (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Close cookie preferences"
          onClick={() => setView("hidden")}
        />
      )}

      <div className={`${styles.panel} ${view === "prefs" ? styles.panelPrefs : ""}`}>
        {view === "banner" ? (
          <>
            <div className={styles.copy}>
              <h2 className={styles.title}>A note on cookies</h2>
              <p className={styles.text}>
                We use essential cookies to run the site and make bookings work.
                With your permission we&apos;d also use analytics and marketing
                cookies to understand what resonates and reach travellers like
                you. You can decline without losing anything.{" "}
                <Link href="/legal" className={styles.link}>
                  Read our cookie policy
                </Link>
                .
              </p>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => {
                  setAnalytics(false);
                  setMarketing(false);
                  setView("prefs");
                }}
              >
                Customise
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => commit(REJECT_ALL)}
              >
                Decline
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={() => commit(ACCEPT_ALL)}
              >
                Accept all
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.copy}>
              <h2 className={styles.title}>Cookie preferences</h2>
              <p className={styles.text}>
                Choose what you&apos;re comfortable with. You can change this any
                time from the footer.
              </p>
            </div>

            <ul className={styles.cats}>
              <li className={styles.cat}>
                <div>
                  <span className={styles.catName}>Strictly necessary</span>
                  <span className={styles.catDesc}>
                    Required for the site and secure checkout to work. Always on.
                  </span>
                </div>
                <span className={styles.always}>Always on</span>
              </li>

              <li className={styles.cat}>
                <div>
                  <span className={styles.catName}>Analytics</span>
                  <span className={styles.catDesc}>
                    Anonymous usage stats (GA4) so we can improve the experience.
                  </span>
                </div>
                <Toggle
                  checked={analytics}
                  onChange={setAnalytics}
                  label="Analytics cookies"
                />
              </li>

              <li className={styles.cat}>
                <div>
                  <span className={styles.catName}>Marketing</span>
                  <span className={styles.catDesc}>
                    Lets us measure campaigns and reach similar travellers (Meta
                    Pixel, Google Ads).
                  </span>
                </div>
                <Toggle
                  checked={marketing}
                  onChange={setMarketing}
                  label="Marketing cookies"
                />
              </li>
            </ul>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.ghost}
                onClick={() => commit(REJECT_ALL)}
              >
                Decline all
              </button>
              <button
                type="button"
                className={styles.ghost}
                onClick={() =>
                  commit({ necessary: true, analytics, marketing })
                }
              >
                Save choices
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={() => commit(ACCEPT_ALL)}
              >
                Accept all
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.knob} />
    </button>
  );
}
