import { IMAGE_CREDITS } from "@/lib/image-credits.generated";
import styles from "./PhotoCredits.module.css";

// "CC BY-SA 4.0" → https://creativecommons.org/licenses/by-sa/4.0/
const licenceUrl = (licence: string) => {
  const m = licence.match(/CC (BY(?:-SA)?) (\d\.\d)/i);
  return m ? `https://creativecommons.org/licenses/${m[1].toLowerCase()}/${m[2]}/` : undefined;
};

/** Attribution for the open-licence (CC BY / BY-SA) photos on a product page. */
export default function PhotoCredits({ slug }: { slug: string }) {
  const rows = IMAGE_CREDITS[slug];
  if (!rows?.length) return null;
  return (
    <p className={styles.credits}>
      Photo credits:{" "}
      {rows.map((r, i) => {
        const lic = licenceUrl(r.licence);
        return (
          <span key={r.image}>
            <a href={r.source} target="_blank" rel="noopener nofollow">{r.author}</a>
            {", "}
            {lic ? <a href={lic} target="_blank" rel="noopener nofollow">{r.licence}</a> : r.licence}
            {i < rows.length - 1 ? " · " : ""}
          </span>
        );
      })}
      {" "}· via Wikimedia Commons, resized.
    </p>
  );
}
