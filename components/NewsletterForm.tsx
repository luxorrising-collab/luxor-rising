"use client";

import { useState } from "react";
import styles from "./NewsletterForm.module.css";

export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return <p className={styles.done}>Thank you — you&apos;re on the list.</p>;
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <input type="email" placeholder="your@email.com" required aria-label="Email address" />
      <button type="submit" className={styles.btn}>
        Send it to me
      </button>
    </form>
  );
}
