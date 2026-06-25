# Neon Clerk Vercel Migration Design

## Goal

Move Villa Kaseh Ain away from Supabase to a production-safe backend built on Neon Postgres, Clerk admin authentication, and Vercel API routes.

## Current State

The `Homepage` app currently uses Supabase in two places:

- `Homepage/src/lib/supabase.ts` reads and writes one `site_content` JSON row through the Supabase browser client.
- Supabase Auth signs in admins with email and password.

The rest of the app uses `SiteContentContext` as the main data interface. It stores content in localStorage as a fallback. Customer booking creation currently updates `bookingOrders` through the same context, which means customer-created bookings are not reliably persisted to a central database unless the current browser session is also admin-authenticated.

## Chosen Architecture

Use Neon as the central Postgres database, Clerk for admin identity, and Vercel API routes as the only server-side access point to the database.

The browser must not connect directly to Neon. All reads and writes that need persistence go through Vercel API routes. Public routes can read site content and create bookings. Admin routes verify the Clerk session before allowing content edits, booking status changes, or booking management reads.

## Database Model

`site_content` stores editable website settings as JSONB:

- `slug text primary key`
- `content jsonb not null`
- `updated_at timestamptz not null default now()`

`bookings` stores booking orders separately from site content:

- `id text primary key`
- `guest_name text not null`
- `phone text not null`
- `email text not null`
- `check_in date not null`
- `check_out date not null`
- `nights integer not null`
- `pax integer not null`
- `rate_id text not null`
- `total_amount numeric not null`
- `deposit_amount numeric not null`
- `amount_paid numeric not null`
- `remaining_balance numeric not null`
- `payment_option_selected text not null`
- `payment_status text not null`
- `booking_status text not null`
- `paid_date text not null default ''`
- `receipt_image text not null default ''`
- `receipt_uploaded_at text not null default ''`
- `payment_rejected_reason text not null default ''`
- `notes text not null default ''`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Receipt images stay as the existing data URL string for this migration. Vercel Blob, S3, or Cloudflare R2 are out of scope for this migration.

## API Routes

`GET /api/site-content`

- Public.
- Returns normalized site content from Neon.
- If the row does not exist, returns default content without writing a seed row.

`PUT /api/site-content`

- Admin only.
- Requires a valid Clerk-authenticated admin.
- Replaces the JSONB content for slug `main`.

`GET /api/bookings`

- Admin only.
- Returns all booking orders ordered by newest first.

`POST /api/bookings`

- Public.
- Validates customer booking input.
- Creates a booking row in Neon.
- Returns the created booking order.
- Sends the same notification request currently used by the app.

`PATCH /api/bookings`

- Admin only.
- Updates a booking action such as verifying payment, rejecting payment, cancelling, refunding, confirming, or saving notes.
- Returns the updated booking.

`PATCH /api/bookings/receipt`

- Public but constrained.
- Accepts booking id plus receipt image.
- Updates receipt fields only for that booking.
- Preserves the current customer flow without requiring customer accounts.

## Authentication

Clerk is the source of admin identity.

The frontend uses Clerk for admin sign-in and sign-out. The server verifies Clerk auth for admin-only API routes. Admin authorization should be explicit, not merely "any Clerk user". The first implementation can use an environment variable allowlist:

- `ADMIN_EMAILS="owner@example.com,admin@example.com"`

If the Clerk user email is not in the allowlist, admin API routes return `403`.

## Frontend Data Flow

On app start:

- Fetch site content from `/api/site-content`.
- Fetch bookings only for authenticated admins.
- Keep local default content as a fallback when the API is unavailable.

Customer booking:

- Calculate rates in the browser using existing booking helpers.
- Submit to `POST /api/bookings`.
- Update the UI with the server-created order.
- Upload receipt through `PATCH /api/bookings/receipt`.

Admin:

- Clerk sign-in replaces Supabase sign-in.
- Content edits call `PUT /api/site-content`.
- Booking management calls `GET /api/bookings` and `PATCH /api/bookings`.
- The dashboard can still keep temporary optimistic state, but Neon is the source of truth.

## Migration Strategy

1. Add Neon schema SQL alongside the old Supabase setup.
2. Add server-side database helpers using `DATABASE_URL`.
3. Add API routes and tests for content and booking persistence.
4. Replace Supabase context calls with API client functions.
5. Replace Supabase admin login with Clerk.
6. Remove `@supabase/supabase-js` and Supabase environment variables.
7. Run production build and booking tests.
8. Deploy to Vercel with Neon and Clerk environment variables.
9. Verify production data flow: public content load, public booking creation, receipt upload, admin login, admin content edit, admin booking update.
10. Only after verification, delete or archive the old Supabase project.

## Environment Variables

Required server-side:

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `ADMIN_EMAILS`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`

Required browser-side:

- `VITE_CLERK_PUBLISHABLE_KEY`

Remove after migration:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SITE_CONTENT_TABLE`
- `VITE_SUPABASE_SITE_CONTENT_SLUG`

## Error Handling

Public content fetch falls back to default content if the API fails. Booking creation does not silently fall back to localStorage; if the API fails, the customer sees an error and can use WhatsApp as backup.

Admin saves show an error if the API rejects the change. Unauthorized Clerk users receive `403`, expired sessions receive `401`, and malformed booking data receives `400`.

## Testing

Tests should cover:

- Mapping database rows to `SiteContent` and `BookingOrder`.
- Booking creation payload validation.
- Admin authorization decisions from Clerk user email and `ADMIN_EMAILS`.
- API client behavior for success and failure responses.
- Existing booking calculation tests must still pass.

## Supabase Deletion Rule

Do not delete the Supabase project before production verification. It can be deleted after all of these are true:

- Neon has the current `site_content` and booking data.
- Vercel production environment uses Neon and Clerk variables.
- No code imports `@supabase/supabase-js`.
- No Vercel environment variable starts with `VITE_SUPABASE_`.
- Public booking creation and admin updates have been tested on the deployed site.
