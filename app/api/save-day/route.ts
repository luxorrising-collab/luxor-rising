import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { resolvePicks, picksLine, threeWays } from "@/lib/day-names";
import { sendSavedDayEmails } from "@/lib/email";
import { SITE_URL } from "@/lib/email-template";
import { planDays } from "@/lib/day-plan";

// "Email me my day": emails the visitor their picks with a link that restores
// them, records a warm lead (enquiries, source "saved-day") for the one
// reminder two days later, and — only if they ticked the box — their consent to
// the Insider's letter (customers.marketing_consent).
export const runtime = "nodejs";

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(s) && s.length <= 200;

// A light per-address throttle (per server instance): this sends email, so it
// must not be usable to spam a third party.
const recent = new Map<string, number[]>();
function throttled(key: string, max = 4, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > max;
}

export async function POST(req: Request) {
  let body: { email?: string; newsletter?: boolean; picks?: unknown; company?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  // Honeypot: bots fill the hidden field; pretend success, do nothing.
  if ((body.company ?? "").trim()) return NextResponse.json({ ok: true });

  const email = (body.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 422 });
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(`ip:${ip}`, 8) || throttled(`em:${email}`, 3)) {
    return NextResponse.json({ error: "We've just sent it — please check your inbox." }, { status: 429 });
  }

  const picks = await resolvePicks(body.picks);
  if (picks.length === 0) return NextResponse.json({ error: "Your day is empty." }, { status: 422 });
  const newsletter = body.newsletter === true;
  const link = `${SITE_URL}/concierge-day?day=${picks.map((p) => p.slug).join(",")}#design`;
  const days = planDays(picks.map((p) => p.slug)).days;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    // Customer by email: create if new; never downgrade an existing consent.
    const { data: existing } = await supabase.from("customers").select("id, marketing_consent").eq("email", email).maybeSingle();
    let customerId = existing?.id ?? null;
    if (!existing) {
      const { data: created } = await supabase
        .from("customers")
        .insert({ email, source: "saved-day", marketing_consent: newsletter })
        .select("id")
        .single();
      customerId = created?.id ?? null;
    } else if (newsletter && !existing.marketing_consent) {
      await supabase.from("customers").update({ marketing_consent: true }).eq("id", existing.id);
    }
    const { error } = await supabase.from("enquiries").insert({
      customer_id: customerId,
      email,
      message: [`Saved day: ${picksLine(picks)}`, `Link: ${link}`, `Insider's letter: ${newsletter ? "yes" : "no"}`].join("\n"),
      source: "saved-day",
      status: "new",
    });
    if (error) console.error("saved-day insert failed:", error.message);
  }

  await sendSavedDayEmails({ email, picks, link, days, newsletter, tiers: await threeWays(picks.map((p) => p.slug)) });
  return NextResponse.json({ ok: true });
}
