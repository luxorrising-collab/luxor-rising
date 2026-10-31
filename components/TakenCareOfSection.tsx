import Reveal from "./Reveal";

export type TakenCareItem = { title: string; note?: string | null };

/**
 * "What we take care of" — the per-experience list of everything handled,
 * shown below the Design Your Day CTA and above the gifts/presents section.
 * Two-column on wide screens; renders nothing when there are no items.
 */
export default function TakenCareOfSection({
  title,
  items,
}: {
  title: string;
  items: TakenCareItem[];
}) {
  if (items.length === 0) return null;
  return (
    <section
      style={{
        background: "var(--color-paper)",
        paddingTop: "clamp(1.4rem, 3vw, 2.2rem)",
        paddingBottom: "clamp(1.8rem, 3.5vw, 2.8rem)",
      }}
    >
      <Reveal className="wrap center">
        <span className="eyebrow">What we take care of</span>
        <h2 className="display">{title}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "0 2.4rem",
            maxWidth: "900px",
            margin: "1.8rem auto 0",
            textAlign: "left",
          }}
        >
          {items.map((t) => (
            <div
              key={t.title}
              style={{
                display: "grid",
                gap: ".12rem",
                padding: ".7rem 0",
                borderTop: "1px solid rgba(201,160,99,.25)",
              }}
            >
              <b style={{ fontWeight: 600 }}>{t.title}</b>
              {t.note && <span style={{ opacity: 0.75, fontSize: ".92rem" }}>{t.note}</span>}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
