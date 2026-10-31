import Link from "next/link";

/**
 * The booking CTA for an experience that funnels into Design Your Day: a single
 * "Design your day →" button and the one-line price/transfer promise. Replaces
 * the single-experience checkout on every Luxor experience page.
 */
export default function DesignYourDayCta({ price = 330 }: { price?: number }) {
  return (
    <div className="center" style={{ marginTop: "1.6rem" }}>
      <Link href="/concierge-day#design" className="btn btn-primary btn-lg">
        Design your day →
      </Link>
      <p
        style={{
          marginTop: "1rem",
          opacity: 0.75,
          fontSize: ".92rem",
          maxWidth: "52ch",
          marginInline: "auto",
        }}
      >
        One private day, every detail arranged end to end — from €{price}, door-to-door transfer
        from Hurghada or Marsa Alam included.
      </p>
    </div>
  );
}
