create table if not exists public.site_content (
  slug text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  guest_name text not null,
  phone text not null,
  email text not null,
  check_in date not null,
  check_out date not null,
  nights integer not null,
  pax integer not null,
  rate_id text not null,
  total_amount numeric not null,
  deposit_amount numeric not null,
  amount_paid numeric not null,
  remaining_balance numeric not null,
  payment_option_selected text not null check (payment_option_selected in ('Deposit', 'Full Amount')),
  payment_status text not null check (payment_status in ('Pending', 'Deposit Paid', 'Paid Full', 'Failed', 'Refunded', 'Rejected')),
  booking_status text not null check (booking_status in ('Confirmed', 'Awaiting Payment', 'Checked In', 'Completed', 'Cancelled')),
  paid_date text not null default '',
  receipt_image text not null default '',
  receipt_uploaded_at text not null default '',
  payment_rejected_reason text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_check_in_idx on public.bookings (check_in);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
