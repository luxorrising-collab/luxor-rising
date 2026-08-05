"use client";

import styles from "./consent.module.css";
import { openConsentSettings } from "@/lib/consent";
import { useTrackingEnabled } from "./ConsentProvider";

/** A footer link that reopens the cookie preferences. Hidden when no tracking. */
export default function CookieSettingsButton({
  label = "Cookie settings",
}: {
  label?: string;
}) {
  const trackingEnabled = useTrackingEnabled();
  if (!trackingEnabled) return null;
  return (
    <button
      type="button"
      className={styles.footerLink}
      onClick={openConsentSettings}
    >
      {label}
    </button>
  );
}
