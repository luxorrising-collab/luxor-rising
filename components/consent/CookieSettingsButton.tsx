"use client";

import styles from "./consent.module.css";
import { hasTracking, openConsentSettings } from "@/lib/consent";

/** A footer link that reopens the cookie preferences. Hidden when no tracking. */
export default function CookieSettingsButton({
  label = "Cookie settings",
}: {
  label?: string;
}) {
  if (!hasTracking) return null;
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
