-- Luxor Rising — client database (Supabase / Postgres)
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent).

create extension if not exists "pgcrypto";

-- ── Customers / leads ──────────────────────────────────────────────────────
create table if not exists public.customers (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  name              text,
  email             text unique,
  phone             text,
  marketing_consent boolean not null default false,
  source            text,                 -- 'enquiry' | 'booking' | ...
  notes             text
);

-- ── Enquiries (contact / enquiry form submissions) ─────────────────────────
create table if not exists public.enquiries (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  customer_id     uuid references public.customers(id) on delete set null,
  name            text,
  email           text,
  phone           text,
  party_size      int,
  preferred_dates text,
  message         text,
  source          text not null default 'website',
  status          text not null default 'new'   -- new | contacted | won | lost
);

-- ── Bookings (created by the Stripe webhook when a payment is confirmed) ────
create table if not exists public.bookings (
  id                         uuid primary key default gen_random_uuid(),
  created_at                 timestamptz not null default now(),
  customer_id                uuid references public.customers(id) on delete set null,
  stripe_checkout_session_id text unique,   -- idempotency key for the webhook
  stripe_payment_intent_id   text,
  product_slug               text,
  product_name               text,
  guests                     int,
  trip_date                  date,
  amount_total_cents         int,
  currency                   text default 'eur',
  pay_mode                   text,          -- 'full' | 'deposit'
  payment_status             text,          -- 'paid' | ...
  notes                      text,          -- client's design-your-day preferences
  -- Balance auto-charge (deposit bookings): the card is saved at checkout and
  -- the remaining balance is charged off-session the day before the trip.
  stripe_customer_id         text,
  stripe_payment_method_id   text,
  balance_cents              int  not null default 0,
  balance_status             text not null default 'none', -- none|scheduled|charging|paid|failed|link_sent
  balance_charged_at         timestamptz,
  balance_last_error         text,
  -- Lifecycle automations (sent once each, guarded by these timestamps).
  reminder_sent_at           timestamptz,
  review_request_sent_at     timestamptz,
  status                     text not null default 'confirmed'
);
-- If the bookings table already exists from an earlier run, add the columns:
alter table public.bookings add column if not exists notes text;
alter table public.bookings add column if not exists stripe_customer_id text;
alter table public.bookings add column if not exists stripe_payment_method_id text;
alter table public.bookings add column if not exists balance_cents int not null default 0;
alter table public.bookings add column if not exists balance_status text not null default 'none';
alter table public.bookings add column if not exists balance_charged_at timestamptz;
alter table public.bookings add column if not exists balance_last_error text;
alter table public.bookings add column if not exists reminder_sent_at timestamptz;
alter table public.bookings add column if not exists review_request_sent_at timestamptz;

create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists bookings_created_idx  on public.bookings  (created_at desc);
create index if not exists bookings_customer_idx on public.bookings  (customer_id);
-- Fast lookup for the balance-charging cron (due, still scheduled).
create index if not exists bookings_balance_due_idx on public.bookings (balance_status, trip_date);

-- ── Row Level Security ─────────────────────────────────────────────────────
-- Lock everything down. There is no end-user login: all reads/writes happen
-- server-side with the SECRET key, which bypasses RLS. With RLS enabled and
-- NO policies, the public/anon key can do nothing — which is exactly what we
-- want for a private business database.
alter table public.customers enable row level security;
alter table public.enquiries enable row level security;
alter table public.bookings  enable row level security;
