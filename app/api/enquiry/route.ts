import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// Supabase JS needs the Node runtime (not Edge).
export const runtime = "nodejs";

type Body = {
  name?: string;
  email?: string;
  dates?: string;
  group?: string;
  base?: string;
  message?: string;
};

// Map the form's group label to an approximate party size.
const GROUP_SIZE: Record<string, number> = {
  "Just me": 1,
  "Two of us": 2,
  "3–4": 4,
  "5+": 5,
};

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  if (!name || !isEmail(email)) {
    return NextResponse.json(
      { error: "Please give us your name and a valid email." },
      { status: 422 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const dates = (body.dates ?? "").trim();
  const group = (body.group ?? "").trim();
  const base = (body.base ?? "").trim();
  const userMessage = (body.message ?? "").trim();
  const partySize = GROUP_SIZE[group] ?? null;
  const context = [group && `Group: ${group}`, base && `Staying: ${base}`]
    .filter(Boolean)
    .join(" · ");
  const message = [userMessage, context && `(${context})`].filter(Boolean).join("\n\n");

  // Upsert the customer by email; keep going even if that hiccups — the enquiry
  // itself also carries name + email, so a lead is never lost.
  const { data: customer } = await supabase
    .from("customers")
    .upsert({ email, name, source: "enquiry" }, { onConflict: "email" })
    .select("id")
    .single();

  const { error: enquiryError } = await supabase.from("enquiries").insert({
    customer_id: customer?.id ?? null,
    name,
    email,
    party_size: partySize,
    preferred_dates: dates || null,
    message: message || null,
    source: "website",
  });

  if (enquiryError) {
    console.error("enquiry insert failed:", enquiryError.message);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
