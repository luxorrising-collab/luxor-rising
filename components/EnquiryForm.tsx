"use client";

import { useState } from "react";
import styles from "./EnquiryForm.module.css";

export default function EnquiryForm({ note }: { note?: string }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // Prototype: no backend wired yet. In production this posts to an API
    // route / email service. For now we confirm inline.
    setSent(true);
  }

  if (sent) {
    return (
      <div className={styles.ok}>
        <h4>Request received.</h4>
        <p>
          Thank you — your consigliere will read this personally and reply within 24 hours with who&apos;d host
          you and a suggested shape for your days.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="eq-name">
            Name <span className={styles.req}>*</span>
          </label>
          <input id="eq-name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className={styles.field}>
          <label htmlFor="eq-email">
            Email <span className={styles.req}>*</span>
          </label>
          <input id="eq-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="eq-dates">Travel dates</label>
          <input id="eq-dates" name="dates" type="text" placeholder="e.g. 12–19 March, or flexible" />
        </div>
        <div className={styles.field}>
          <label htmlFor="eq-group">Group size</label>
          <select id="eq-group" name="group" defaultValue="Two of us">
            <option>Just me</option>
            <option>Two of us</option>
            <option>3–4</option>
            <option>5+</option>
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor="eq-base">Where are you based / staying?</label>
        <select id="eq-base" name="base" defaultValue="Luxor">
          <option>Luxor</option>
          <option>Hurghada / Red Sea</option>
          <option>Not booked yet</option>
          <option>Elsewhere in Egypt</option>
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="eq-message">What are you hoping for?</label>
        <textarea
          id="eq-message"
          name="message"
          placeholder="Temples, the Nile, a special occasion, travelling with kids — anything that helps us match you."
        />
      </div>
      <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
        Send my request →
      </button>
      {note && <p className={styles.note}>{note}</p>}
    </form>
  );
}
