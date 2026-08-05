// Client-side ecommerce event layer.
//
// One helper set that feeds all three destinations at once:
//  - window.dataLayer  → Google Tag Manager (GA4 / Meta tags configured there)
//  - window.gtag       → GA4 loaded directly (when a GA4 ID is set)
//  - window.fbq        → Meta Pixel (loaded directly on marketing consent)
//
// Consent is respected automatically: gtag/fbq only exist once the visitor has
// opted in (and Google tags honour Consent Mode), so declined visitors push to
// the dataLayer only — no GA4/Meta hit. Values follow the GA4 recommended
// ecommerce schema so GTM tags map with zero extra config.

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
};

function dl(obj: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(obj);
}

function contentIds(items: AnalyticsItem[]) {
  return items.map((i) => i.item_id);
}

/** Fired when the visitor commits to pay (Reserve click / checkout opens). */
export function trackBeginCheckout(p: {
  value: number;
  currency?: string;
  items: AnalyticsItem[];
}) {
  const currency = p.currency ?? "EUR";
  dl({ ecommerce: null }); // clear the previous ecommerce object (GA4 guidance)
  dl({
    event: "begin_checkout",
    ecommerce: { currency, value: p.value, items: p.items },
  });
  window.gtag?.("event", "begin_checkout", {
    currency,
    value: p.value,
    items: p.items,
  });
  window.fbq?.("track", "InitiateCheckout", {
    value: p.value,
    currency,
    content_type: "product",
    content_ids: contentIds(p.items),
  });
}

/**
 * Fired once on the confirmation page with the REAL amount Stripe charged
 * (retrieved server-side). De-duplicated per transaction so a refresh or a
 * back-button never counts a sale twice — and `transaction_id` / `eventID`
 * give GA4 and Meta their own native de-dup keys (and future Meta CAPI match).
 */
export function trackPurchase(p: {
  transactionId: string;
  value: number;
  currency?: string;
  items: AnalyticsItem[];
}) {
  if (typeof window === "undefined") return;
  const guardKey = "lr_purchase_" + p.transactionId;
  try {
    if (localStorage.getItem(guardKey)) return; // already counted this order
    localStorage.setItem(guardKey, String(Date.now()));
  } catch {
    // localStorage blocked — fall through; native de-dup keys still protect us.
  }

  const currency = p.currency ?? "EUR";
  dl({ ecommerce: null });
  dl({
    event: "purchase",
    ecommerce: {
      transaction_id: p.transactionId,
      value: p.value,
      currency,
      items: p.items,
    },
  });
  window.gtag?.("event", "purchase", {
    transaction_id: p.transactionId,
    value: p.value,
    currency,
    items: p.items,
  });
  window.fbq?.(
    "track",
    "Purchase",
    {
      value: p.value,
      currency,
      content_type: "product",
      content_ids: contentIds(p.items),
      contents: p.items.map((i) => ({
        id: i.item_id,
        quantity: i.quantity ?? 1,
      })),
    },
    { eventID: p.transactionId },
  );
}
