# Neon Clerk Vercel Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase with Neon Postgres, Clerk admin auth, and Vercel API routes while making public bookings persist centrally.

**Architecture:** Browser code calls local API clients instead of direct database SDKs. Vercel API routes own all database access through `DATABASE_URL`; admin routes verify Clerk identity and an `ADMIN_EMAILS` allowlist. Existing booking/content helpers stay as the domain layer, with new mappers and API clients around them.

**Tech Stack:** React 19, Vite, Vercel Functions, Neon `@neondatabase/serverless`, Clerk `@clerk/clerk-react` and `@clerk/backend`, TypeScript, Node assert tests run through `tsx`.

Reference docs checked on 2026-06-25:

- Clerk React + Vite quickstart: https://clerk.com/docs/react/getting-started/quickstart
- Neon serverless driver: https://neon.com/docs/serverless/serverless-driver
- Vercel Functions: https://vercel.com/docs/functions

---

## File Structure

- Create `Homepage/neon/schema.sql`: Neon table schema for `site_content` and `bookings`.
- Create `Homepage/src/lib/apiTypes.ts`: shared request/response and admin action types.
- Create `Homepage/src/lib/apiClient.ts`: browser-safe fetch wrappers for content and bookings.
- Create `Homepage/src/lib/apiClient.test.ts`: tests for API client success/failure behavior.
- Create `Homepage/src/lib/bookingPersistence.ts`: pure validation and row mapping helpers shared by API routes.
- Create `Homepage/src/lib/bookingPersistence.test.ts`: tests for booking validation and DB row mapping.
- Create `Homepage/src/lib/adminAuth.ts`: pure admin email allowlist helper plus Clerk verification wrapper.
- Create `Homepage/src/lib/adminAuth.test.ts`: tests for allowlist behavior.
- Create `Homepage/src/lib/serverNotifications.ts`: server-side Resend email sender shared by Vercel API routes.
- Create `Homepage/api/site-content.ts`: public GET and admin PUT content API.
- Create `Homepage/api/bookings.ts`: public POST booking, admin GET bookings, admin PATCH booking actions.
- Create `Homepage/api/bookings/receipt.ts`: public receipt upload route.
- Modify `Homepage/api/notifications.ts`: use the shared server notification sender.
- Modify `Homepage/src/context/SiteContentContext.tsx`: replace Supabase sync with API persistence state.
- Modify `Homepage/src/pages/BookingPage.tsx`: create booking and upload receipt via API.
- Modify `Homepage/src/pages/AdminPage.tsx`: use Clerk admin state and API booking updates.
- Modify `Homepage/src/main.tsx`: wrap app with `ClerkProvider` when configured.
- Modify `Homepage/src/lib/siteContent.ts`: remove admin passcode exports if no longer used.
- Delete `Homepage/src/lib/supabase.ts`.
- Modify `Homepage/.env.example`: add Neon and Clerk env vars, remove Supabase vars.
- Modify `Homepage/package.json` and `Homepage/package-lock.json`: add Clerk/Neon deps, remove Supabase dep.
- Modify `Homepage/README.md`: update backend setup and Supabase deletion guidance.

## Task 1: Add Schema And Shared API Types

**Files:**
- Create: `Homepage/neon/schema.sql`
- Create: `Homepage/src/lib/apiTypes.ts`
- Test: none, schema/types are consumed by Task 2, Task 4, and Task 5 tests

- [ ] **Step 1: Add Neon schema**

Create `Homepage/neon/schema.sql`:

```sql
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
  payment_option_selected text not null,
  payment_status text not null,
  booking_status text not null,
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
```

- [ ] **Step 2: Add shared API types**

Create `Homepage/src/lib/apiTypes.ts`:

```ts
import type { BookingOrder, SiteContent } from './siteContent';

export interface ApiErrorBody {
  error: string;
}

export interface SiteContentResponse {
  content: SiteContent;
  source: 'database' | 'default';
}

export interface BookingsResponse {
  bookings: BookingOrder[];
}

export interface BookingResponse {
  booking: BookingOrder;
}

export interface CreateBookingPayload {
  guestName: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  pax: number;
  rateId: string;
  totalAmount: number;
  paymentOptionSelected: BookingOrder['paymentOptionSelected'];
  notes: string;
}

export interface ReceiptUploadPayload {
  bookingId: string;
  receiptImage: string;
}

export type BookingAdminAction =
  | { type: 'verify-payment'; bookingId: string; paymentStatus: BookingOrder['paymentStatus']; today: string }
  | { type: 'reject-payment'; bookingId: string; reason?: string }
  | { type: 'set-booking-status'; bookingId: string; bookingStatus: BookingOrder['bookingStatus'] }
  | { type: 'set-payment-status'; bookingId: string; paymentStatus: BookingOrder['paymentStatus']; bookingStatus: BookingOrder['bookingStatus'] }
  | { type: 'update-notes'; bookingId: string; notes: string };
```

- [ ] **Step 3: Commit**

Run:

```bash
git add Homepage/neon/schema.sql Homepage/src/lib/apiTypes.ts
git commit -m "feat: add neon schema and api types"
```

## Task 2: Add Booking Persistence Helpers With Tests

**Files:**
- Create: `Homepage/src/lib/bookingPersistence.test.ts`
- Create: `Homepage/src/lib/bookingPersistence.ts`
- Modify: `Homepage/package.json`

- [ ] **Step 1: Wire test command**

Modify `Homepage/package.json` scripts:

```json
"test": "tsx src/lib/booking.test.ts && tsx src/lib/bookingPersistence.test.ts && tsx src/lib/adminAuth.test.ts && tsx src/lib/apiClient.test.ts"
```

Until Task 3 and Task 4 add their test files, run this task's specific test file directly.

- [ ] **Step 2: Write failing booking persistence tests**

Create `Homepage/src/lib/bookingPersistence.test.ts`:

```ts
import assert from 'node:assert/strict';
import {
  bookingOrderFromRow,
  bookingOrderToRow,
  buildCreateBookingOrder,
  parseReceiptUploadPayload,
} from './bookingPersistence';
import { defaultSiteContent, type BookingOrder } from './siteContent';

const order: BookingOrder = {
  id: 'VKA-2001',
  guestName: 'Aina',
  phone: '60123456789',
  email: 'aina@example.com',
  checkIn: '2026-07-01',
  checkOut: '2026-07-03',
  nights: 2,
  pax: 20,
  rateId: 'weekend-2n',
  totalAmount: 3800,
  depositAmount: 1800,
  amountPaid: 0,
  remainingBalance: 3800,
  paymentOptionSelected: 'Deposit',
  paymentStatus: 'Pending',
  bookingStatus: 'Awaiting Payment',
  paidDate: '',
  receiptImage: '',
  receiptUploadedAt: '',
  paymentRejectedReason: '',
  notes: 'Near pool',
  createdAt: '2026-06-25T10:00:00.000Z',
  updatedAt: '2026-06-25T10:00:00.000Z',
};

const row = bookingOrderToRow(order);
assert.equal(row.guest_name, 'Aina');
assert.equal(row.total_amount, 3800);
assert.deepEqual(bookingOrderFromRow(row), order);

const created = buildCreateBookingOrder({
  payload: {
    guestName: 'Farhan',
    phone: '60199887766',
    email: 'farhan@example.com',
    checkIn: '2026-08-07',
    checkOut: '2026-08-09',
    pax: 20,
    rateId: 'weekend-2n',
    totalAmount: 3800,
    paymentOptionSelected: 'Deposit',
    notes: '',
  },
  existingOrders: [],
  content: defaultSiteContent,
  now: new Date('2026-06-25T12:00:00.000Z'),
});

assert.equal(created.checkIn, '2026-08-07');
assert.equal(created.nights, 2);
assert.equal(created.depositAmount, 1800);
assert.equal(created.bookingStatus, 'Awaiting Payment');

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, guestName: '', pax: 20 },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /guestName is required/,
);

assert.throws(
  () => parseReceiptUploadPayload({ bookingId: 'VKA-1', receiptImage: 'not-data-url' }),
  /receiptImage must be a data URL/,
);

assert.deepEqual(parseReceiptUploadPayload({
  bookingId: 'VKA-1',
  receiptImage: 'data:image/png;base64,abc',
}), {
  bookingId: 'VKA-1',
  receiptImage: 'data:image/png;base64,abc',
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
cd Homepage
npx tsx src/lib/bookingPersistence.test.ts
```

Expected: FAIL with module/function not found for `bookingPersistence`.

- [ ] **Step 4: Implement persistence helpers**

Create `Homepage/src/lib/bookingPersistence.ts`:

```ts
import {
  createBookingOrder,
  dayDiff,
  getAvailabilityStateForDate,
  getAutomaticRateForStay,
} from './booking';
import type { CreateBookingPayload, ReceiptUploadPayload } from './apiTypes';
import { eachNightInStay } from './date';
import type { BookingOrder, SiteContent } from './siteContent';

export interface BookingRow {
  id: string;
  guest_name: string;
  phone: string;
  email: string;
  check_in: string;
  check_out: string;
  nights: number;
  pax: number;
  rate_id: string;
  total_amount: number | string;
  deposit_amount: number | string;
  amount_paid: number | string;
  remaining_balance: number | string;
  payment_option_selected: BookingOrder['paymentOptionSelected'];
  payment_status: BookingOrder['paymentStatus'];
  booking_status: BookingOrder['bookingStatus'];
  paid_date: string;
  receipt_image: string;
  receipt_uploaded_at: string;
  payment_rejected_reason: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

function requiredString(value: unknown, name: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${name} is required`);
  }
  return value.trim();
}

function requiredNumber(value: unknown, name: string) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return numberValue;
}

export function bookingOrderFromRow(row: BookingRow): BookingOrder {
  return {
    id: row.id,
    guestName: row.guest_name,
    phone: row.phone,
    email: row.email,
    checkIn: String(row.check_in).slice(0, 10),
    checkOut: String(row.check_out).slice(0, 10),
    nights: Number(row.nights),
    pax: Number(row.pax),
    rateId: row.rate_id,
    totalAmount: Number(row.total_amount),
    depositAmount: Number(row.deposit_amount),
    amountPaid: Number(row.amount_paid),
    remainingBalance: Number(row.remaining_balance),
    paymentOptionSelected: row.payment_option_selected,
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    paidDate: row.paid_date || '',
    receiptImage: row.receipt_image || '',
    receiptUploadedAt: row.receipt_uploaded_at || '',
    paymentRejectedReason: row.payment_rejected_reason || '',
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function bookingOrderToRow(order: BookingOrder): BookingRow {
  return {
    id: order.id,
    guest_name: order.guestName,
    phone: order.phone,
    email: order.email,
    check_in: order.checkIn,
    check_out: order.checkOut,
    nights: order.nights,
    pax: order.pax,
    rate_id: order.rateId,
    total_amount: order.totalAmount,
    deposit_amount: order.depositAmount,
    amount_paid: order.amountPaid,
    remaining_balance: order.remainingBalance,
    payment_option_selected: order.paymentOptionSelected,
    payment_status: order.paymentStatus,
    booking_status: order.bookingStatus,
    paid_date: order.paidDate,
    receipt_image: order.receiptImage,
    receipt_uploaded_at: order.receiptUploadedAt,
    payment_rejected_reason: order.paymentRejectedReason,
    notes: order.notes,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
  };
}

export function buildCreateBookingOrder({
  payload,
  existingOrders,
  content,
  now,
}: {
  payload: CreateBookingPayload;
  existingOrders: BookingOrder[];
  content: SiteContent;
  now: Date;
}) {
  const checkIn = requiredString(payload.checkIn, 'checkIn');
  const checkOut = requiredString(payload.checkOut, 'checkOut');
  const nights = dayDiff(checkIn, checkOut);
  if (nights <= 0) {
    throw new Error('checkOut must be after checkIn');
  }

  const blocked = eachNightInStay(checkIn, checkOut).some((date) => {
    const availability = getAvailabilityStateForDate(date, existingOrders, content.bookingSettings.blockedDates);
    return availability.state !== 'available' && date >= checkIn && date < checkOut;
  });
  if (blocked) {
    throw new Error('Selected dates are unavailable');
  }

  const selectedRate = getAutomaticRateForStay(
    content.roomTypes,
    checkIn,
    checkOut,
    content.bookingSettings.publicHolidayDates,
  );
  if (selectedRate.id !== payload.rateId) {
    throw new Error('rateId does not match selected dates');
  }

  return createBookingOrder({
    existingOrders,
    guestName: requiredString(payload.guestName, 'guestName'),
    phone: requiredString(payload.phone, 'phone'),
    email: requiredString(payload.email, 'email'),
    checkIn,
    checkOut,
    pax: requiredNumber(payload.pax, 'pax'),
    rateId: selectedRate.id,
    totalAmount: requiredNumber(payload.totalAmount, 'totalAmount'),
    paymentRules: content.paymentRules,
    paymentOptionSelected: payload.paymentOptionSelected,
    notes: typeof payload.notes === 'string' ? payload.notes.trim() : '',
    now,
  });
}

export function parseReceiptUploadPayload(input: unknown): ReceiptUploadPayload {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid receipt payload');
  }
  const payload = input as Partial<ReceiptUploadPayload>;
  const bookingId = requiredString(payload.bookingId, 'bookingId');
  const receiptImage = requiredString(payload.receiptImage, 'receiptImage');
  if (!receiptImage.startsWith('data:image/') && !receiptImage.startsWith('data:application/pdf')) {
    throw new Error('receiptImage must be a data URL');
  }
  if (receiptImage.length > 7_000_000) {
    throw new Error('receiptImage is too large');
  }
  return { bookingId, receiptImage };
}
```

- [ ] **Step 5: Update `createBookingOrder` to accept deterministic time**

Modify `Homepage/src/lib/booking.ts` `createBookingOrder` parameter type to include:

```ts
now?: Date;
```

Inside `createBookingOrder`, replace direct `new Date()` creation with:

```ts
const now = input.now ?? new Date();
const stamp = now.toISOString();
```

- [ ] **Step 6: Run test to verify it passes**

Run:

```bash
cd Homepage
npx tsx src/lib/bookingPersistence.test.ts
```

Expected: PASS with exit code 0.

- [ ] **Step 7: Commit**

Run:

```bash
git add Homepage/package.json Homepage/src/lib/booking.ts Homepage/src/lib/bookingPersistence.ts Homepage/src/lib/bookingPersistence.test.ts
git commit -m "feat: add booking persistence helpers"
```

## Task 3: Add Admin Authorization Helper With Tests

**Files:**
- Create: `Homepage/src/lib/adminAuth.test.ts`
- Create: `Homepage/src/lib/adminAuth.ts`

- [ ] **Step 1: Write failing admin auth tests**

Create `Homepage/src/lib/adminAuth.test.ts`:

```ts
import assert from 'node:assert/strict';
import { isAllowedAdminEmail, parseAdminEmails } from './adminAuth';

assert.deepEqual(parseAdminEmails('owner@example.com, admin@example.com'), [
  'owner@example.com',
  'admin@example.com',
]);

assert.equal(isAllowedAdminEmail('OWNER@example.com', 'owner@example.com'), true);
assert.equal(isAllowedAdminEmail('guest@example.com', 'owner@example.com'), false);
assert.equal(isAllowedAdminEmail('', 'owner@example.com'), false);
assert.equal(isAllowedAdminEmail('owner@example.com', ''), false);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd Homepage
npx tsx src/lib/adminAuth.test.ts
```

Expected: FAIL with module/function not found.

- [ ] **Step 3: Implement pure helper and server wrapper**

Create `Homepage/src/lib/adminAuth.ts`:

```ts
import { createClerkClient } from '@clerk/backend';

export function parseAdminEmails(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | undefined, allowlist: string | undefined) {
  if (!email) return false;
  return parseAdminEmails(allowlist).includes(email.trim().toLowerCase());
}

export async function requireAdminFromRequest(req: { headers?: Record<string, string | string[] | undefined> }) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return { ok: false as const, status: 500, error: 'CLERK_SECRET_KEY is not configured.' };
  }

  const authorization = req.headers?.authorization;
  const bearer = Array.isArray(authorization) ? authorization[0] : authorization;
  const token = bearer?.startsWith('Bearer ') ? bearer.slice('Bearer '.length) : '';
  if (!token) {
    return { ok: false as const, status: 401, error: 'Missing Clerk token.' };
  }

  const clerk = createClerkClient({ secretKey });
  const claims = await clerk.verifyToken(token);
  const userId = claims.sub;
  const user = await clerk.users.getUser(userId);
  const email = user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
    ?? '';

  if (!isAllowedAdminEmail(email, process.env.ADMIN_EMAILS)) {
    return { ok: false as const, status: 403, error: 'This Clerk user is not an admin.' };
  }

  return { ok: true as const, email, userId };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd Homepage
npx tsx src/lib/adminAuth.test.ts
```

Expected: PASS with exit code 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add Homepage/src/lib/adminAuth.ts Homepage/src/lib/adminAuth.test.ts
git commit -m "feat: add clerk admin authorization helper"
```

## Task 4: Add Browser API Client With Tests

**Files:**
- Create: `Homepage/src/lib/apiClient.test.ts`
- Create: `Homepage/src/lib/apiClient.ts`

- [ ] **Step 1: Write failing API client tests**

Create `Homepage/src/lib/apiClient.test.ts`:

```ts
import assert from 'node:assert/strict';
import { apiRequest, fetchSiteContentFromApi, saveSiteContentToApi } from './apiClient';
import { defaultSiteContent } from './siteContent';

let lastRequest: { url: string; init?: RequestInit } | null = null;

globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  lastRequest = { url: String(url), init };
  if (String(url) === '/api/site-content' && init?.method === 'PUT') {
    return new Response(JSON.stringify({ content: defaultSiteContent, source: 'database' }), { status: 200 });
  }
  if (String(url) === '/api/site-content') {
    return new Response(JSON.stringify({ content: defaultSiteContent, source: 'database' }), { status: 200 });
  }
  return new Response(JSON.stringify({ error: 'Nope' }), { status: 500 });
}) as typeof fetch;

const content = await fetchSiteContentFromApi();
assert.equal(content.content.siteConfig.name, 'Villa Kaseh Ain');

await saveSiteContentToApi(defaultSiteContent, async () => 'token-123');
assert.equal(lastRequest?.url, '/api/site-content');
assert.equal(lastRequest?.init?.method, 'PUT');
assert.equal((lastRequest?.init?.headers as Record<string, string>).Authorization, 'Bearer token-123');

await assert.rejects(() => apiRequest('/api/missing'), /Nope/);
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd Homepage
npx tsx src/lib/apiClient.test.ts
```

Expected: FAIL with module/function not found.

- [ ] **Step 3: Implement API client**

Create `Homepage/src/lib/apiClient.ts`:

```ts
import type {
  BookingAdminAction,
  BookingResponse,
  BookingsResponse,
  CreateBookingPayload,
  ReceiptUploadPayload,
  SiteContentResponse,
} from './apiTypes';
import type { SiteContent } from './siteContent';

type TokenGetter = () => Promise<string | null>;

async function buildHeaders(getToken?: TokenGetter) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (getToken) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body.error === 'string' ? body.error : `Request failed with ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export async function fetchSiteContentFromApi() {
  return apiRequest<SiteContentResponse>('/api/site-content');
}

export async function saveSiteContentToApi(content: SiteContent, getToken: TokenGetter) {
  return apiRequest<SiteContentResponse>('/api/site-content', {
    method: 'PUT',
    headers: await buildHeaders(getToken),
    body: JSON.stringify({ content }),
  });
}

export async function fetchBookingsFromApi(getToken: TokenGetter) {
  return apiRequest<BookingsResponse>('/api/bookings', {
    headers: await buildHeaders(getToken),
  });
}

export async function createBookingViaApi(payload: CreateBookingPayload) {
  return apiRequest<BookingResponse>('/api/bookings', {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateBookingViaApi(action: BookingAdminAction, getToken: TokenGetter) {
  return apiRequest<BookingResponse>('/api/bookings', {
    method: 'PATCH',
    headers: await buildHeaders(getToken),
    body: JSON.stringify(action),
  });
}

export async function uploadReceiptViaApi(payload: ReceiptUploadPayload) {
  return apiRequest<BookingResponse>('/api/bookings/receipt', {
    method: 'PATCH',
    headers: await buildHeaders(),
    body: JSON.stringify(payload),
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
cd Homepage
npx tsx src/lib/apiClient.test.ts
```

Expected: PASS with exit code 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add Homepage/src/lib/apiClient.ts Homepage/src/lib/apiClient.test.ts
git commit -m "feat: add frontend api client"
```

## Task 5: Add Vercel API Database Routes

**Files:**
- Create: `Homepage/src/lib/db.ts`
- Create: `Homepage/src/lib/serverNotifications.ts`
- Create: `Homepage/api/site-content.ts`
- Create: `Homepage/api/bookings.ts`
- Create: `Homepage/api/bookings/receipt.ts`
- Modify: `Homepage/api/notifications.ts`

- [ ] **Step 1: Create database helper**

Create `Homepage/src/lib/db.ts`:

```ts
import { neon } from '@neondatabase/serverless';

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }
  return neon(databaseUrl);
}
```

- [ ] **Step 2: Add server notification helper**

Create `Homepage/src/lib/serverNotifications.ts`:

```ts
import type { NotificationEmailPayload, NotificationRequestBody } from './notifications';

function parseSender() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_FROM_EMAIL;
  const senderName = process.env.RESEND_FROM_NAME || 'Villa Kaseh Ain';

  if (!resendApiKey || !senderEmail) {
    return null;
  }

  return {
    resendApiKey,
    from: `${senderName} <${senderEmail}>`,
  };
}

async function sendEmail(
  resendApiKey: string,
  from: string,
  email: NotificationEmailPayload,
  idempotencyKey: string,
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${idempotencyKey}-${email.subject}`,
    },
    body: JSON.stringify({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Resend send failed: ${response.status} ${message}`);
  }
}

export async function sendNotificationEmails(body: NotificationRequestBody) {
  const sender = parseSender();
  if (!sender) {
    return { skipped: true, reason: 'Resend environment variables are not configured.' };
  }

  await Promise.all(
    body.emails.map((email, index) => sendEmail(
      sender.resendApiKey,
      sender.from,
      email,
      `${body.idempotencyKey}-${index}`,
    )),
  );

  return { ok: true, sent: body.emails.length };
}
```

- [ ] **Step 3: Refactor notifications API to shared helper**

In `Homepage/api/notifications.ts`, keep `parseBody`, remove local `sendEmail`, and replace the final try block with:

```ts
import { sendNotificationEmails } from '../src/lib/serverNotifications';
```

```ts
try {
  const result = await sendNotificationEmails(body);
  res.status(200).json(result);
} catch (error) {
  res.status(500).json({
    error: error instanceof Error ? error.message : 'Failed to send emails',
  });
}
```

Remove the local `resendApiKey`, `senderEmail`, `senderName`, and `from` handling from the API route because `sendNotificationEmails` now owns it.

- [ ] **Step 4: Add site content API**

Create `Homepage/api/site-content.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminFromRequest } from '../src/lib/adminAuth';
import { getSql } from '../src/lib/db';
import { defaultSiteContent, normalizeSiteContent } from '../src/lib/siteContent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const sql = getSql();
      const rows = await sql`select content from site_content where slug = 'main' limit 1`;
      const content = rows[0]?.content ? normalizeSiteContent(rows[0].content) : defaultSiteContent;
      res.status(200).json({ content, source: rows[0]?.content ? 'database' : 'default' });
      return;
    }

    if (req.method === 'PUT') {
      const admin = await requireAdminFromRequest(req);
      if (!admin.ok) {
        res.status(admin.status).json({ error: admin.error });
        return;
      }

      const content = normalizeSiteContent(req.body?.content);
      const sql = getSql();
      await sql`
        insert into site_content (slug, content, updated_at)
        values ('main', ${JSON.stringify(content)}::jsonb, now())
        on conflict (slug)
        do update set content = excluded.content, updated_at = now()
      `;
      res.status(200).json({ content, source: 'database' });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected server error' });
  }
}
```

- [ ] **Step 5: Add bookings API**

Create `Homepage/api/bookings.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminFromRequest } from '../src/lib/adminAuth';
import type { BookingAdminAction, CreateBookingPayload } from '../src/lib/apiTypes';
import {
  bookingOrderFromRow,
  bookingOrderToRow,
  buildCreateBookingOrder,
  type BookingRow,
} from '../src/lib/bookingPersistence';
import { getSql } from '../src/lib/db';
import {
  buildNotificationRequest,
} from '../src/lib/notifications';
import { sendNotificationEmails } from '../src/lib/serverNotifications';
import {
  defaultSiteContent,
  normalizeSiteContent,
  type BookingOrder,
} from '../src/lib/siteContent';
import {
  rejectManualPayment,
  updateBookingStatus,
  verifyManualPayment,
} from '../src/lib/booking';

async function loadContent(sql: ReturnType<typeof getSql>) {
  const rows = await sql`select content from site_content where slug = 'main' limit 1`;
  return rows[0]?.content ? normalizeSiteContent(rows[0].content) : defaultSiteContent;
}

async function loadBookings(sql: ReturnType<typeof getSql>) {
  const rows = await sql`select * from bookings order by created_at desc`;
  return (rows as BookingRow[]).map(bookingOrderFromRow);
}

async function saveBooking(sql: ReturnType<typeof getSql>, order: BookingOrder) {
  const row = bookingOrderToRow(order);
  await sql`
    insert into bookings (
      id, guest_name, phone, email, check_in, check_out, nights, pax, rate_id,
      total_amount, deposit_amount, amount_paid, remaining_balance,
      payment_option_selected, payment_status, booking_status,
      paid_date, receipt_image, receipt_uploaded_at, payment_rejected_reason,
      notes, created_at, updated_at
    )
    values (
      ${row.id}, ${row.guest_name}, ${row.phone}, ${row.email}, ${row.check_in}, ${row.check_out},
      ${row.nights}, ${row.pax}, ${row.rate_id}, ${row.total_amount}, ${row.deposit_amount},
      ${row.amount_paid}, ${row.remaining_balance}, ${row.payment_option_selected},
      ${row.payment_status}, ${row.booking_status}, ${row.paid_date}, ${row.receipt_image},
      ${row.receipt_uploaded_at}, ${row.payment_rejected_reason}, ${row.notes},
      ${row.created_at}, ${row.updated_at}
    )
    on conflict (id) do update set
      guest_name = excluded.guest_name,
      phone = excluded.phone,
      email = excluded.email,
      check_in = excluded.check_in,
      check_out = excluded.check_out,
      nights = excluded.nights,
      pax = excluded.pax,
      rate_id = excluded.rate_id,
      total_amount = excluded.total_amount,
      deposit_amount = excluded.deposit_amount,
      amount_paid = excluded.amount_paid,
      remaining_balance = excluded.remaining_balance,
      payment_option_selected = excluded.payment_option_selected,
      payment_status = excluded.payment_status,
      booking_status = excluded.booking_status,
      paid_date = excluded.paid_date,
      receipt_image = excluded.receipt_image,
      receipt_uploaded_at = excluded.receipt_uploaded_at,
      payment_rejected_reason = excluded.payment_rejected_reason,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `;
}

function applyAdminAction(order: BookingOrder, action: BookingAdminAction) {
  if (action.type === 'verify-payment') {
    return verifyManualPayment(order, action.paymentStatus, action.today);
  }
  if (action.type === 'reject-payment') {
    return {
      ...rejectManualPayment(order),
      paymentRejectedReason: action.reason || 'Receipt rejected by admin.',
    };
  }
  if (action.type === 'set-booking-status') {
    return updateBookingStatus(order, order.paymentStatus, action.bookingStatus);
  }
  if (action.type === 'set-payment-status') {
    return updateBookingStatus(order, action.paymentStatus, action.bookingStatus);
  }
  if (action.type === 'update-notes') {
    return { ...order, notes: action.notes, updatedAt: new Date().toISOString() };
  }
  throw new Error('Unsupported booking action');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const sql = getSql();

    if (req.method === 'GET') {
      const admin = await requireAdminFromRequest(req);
      if (!admin.ok) {
        res.status(admin.status).json({ error: admin.error });
        return;
      }
      res.status(200).json({ bookings: await loadBookings(sql) });
      return;
    }

    if (req.method === 'POST') {
      const content = await loadContent(sql);
      const existingOrders = await loadBookings(sql);
      const booking = buildCreateBookingOrder({
        payload: req.body as CreateBookingPayload,
        existingOrders,
        content,
        now: new Date(),
      });
      await saveBooking(sql, booking);
      const notification = buildNotificationRequest('new-booking', booking, content);
      if (notification) {
        await sendNotificationEmails(notification);
      }
      res.status(201).json({ booking });
      return;
    }

    if (req.method === 'PATCH') {
      const admin = await requireAdminFromRequest(req);
      if (!admin.ok) {
        res.status(admin.status).json({ error: admin.error });
        return;
      }
      const action = req.body as BookingAdminAction;
      const rows = await sql`select * from bookings where id = ${action.bookingId} limit 1`;
      if (!rows[0]) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
      const content = await loadContent(sql);
      const booking = applyAdminAction(bookingOrderFromRow(rows[0] as BookingRow), action);
      await saveBooking(sql, booking);
      if (action.type === 'verify-payment') {
        const notification = buildNotificationRequest('payment-verified', booking, content);
        if (notification) {
          await sendNotificationEmails(notification);
        }
      }
      res.status(200).json({ booking });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    res.status(message.includes('required') || message.includes('must') ? 400 : 500).json({ error: message });
  }
}
```

- [ ] **Step 6: Add receipt API**

Create `Homepage/api/bookings/receipt.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bookingOrderFromRow, type BookingRow, parseReceiptUploadPayload } from '../../src/lib/bookingPersistence';
import { getSql } from '../../src/lib/db';
import { buildNotificationRequest } from '../../src/lib/notifications';
import { defaultSiteContent, normalizeSiteContent } from '../../src/lib/siteContent';
import { sendNotificationEmails } from '../../src/lib/serverNotifications';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'PATCH') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const payload = parseReceiptUploadPayload(req.body);
    const sql = getSql();
    const uploadedAt = new Date().toISOString();
    await sql`
      update bookings
      set receipt_image = ${payload.receiptImage},
          receipt_uploaded_at = ${uploadedAt},
          payment_rejected_reason = '',
          updated_at = ${uploadedAt}
      where id = ${payload.bookingId}
    `;

    const rows = await sql`select * from bookings where id = ${payload.bookingId} limit 1`;
    if (!rows[0]) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const contentRows = await sql`select content from site_content where slug = 'main' limit 1`;
    const content = contentRows[0]?.content ? normalizeSiteContent(contentRows[0].content) : defaultSiteContent;
    const booking = bookingOrderFromRow(rows[0] as BookingRow);
    const notification = buildNotificationRequest('receipt-uploaded', booking, content);
    if (notification) {
      await sendNotificationEmails(notification);
    }
    res.status(200).json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    res.status(message.includes('required') || message.includes('data URL') ? 400 : 500).json({ error: message });
  }
}
```

- [ ] **Step 7: Commit**

Run:

```bash
git add Homepage/src/lib/db.ts Homepage/src/lib/serverNotifications.ts Homepage/api/notifications.ts Homepage/api/site-content.ts Homepage/api/bookings.ts Homepage/api/bookings/receipt.ts
git commit -m "feat: add neon vercel api routes"
```

## Task 6: Replace Supabase Context With API Sync

**Files:**
- Modify: `Homepage/src/context/SiteContentContext.tsx`
- Delete: `Homepage/src/lib/supabase.ts`

- [ ] **Step 1: Refactor context imports**

Replace Supabase imports with:

```ts
import {
  fetchBookingsFromApi,
  fetchSiteContentFromApi,
  saveSiteContentToApi,
} from '../lib/apiClient';
```

The Clerk token getter is passed into the provider in Task 7. For this task, add optional props:

```ts
export function SiteContentProvider({
  children,
  getAdminToken,
  isAdminSignedIn = false,
}: {
  children: ReactNode;
  getAdminToken?: () => Promise<string | null>;
  isAdminSignedIn?: boolean;
}) {
```

- [ ] **Step 2: Replace sync mode state**

Change:

```ts
type SyncMode = 'local' | 'supabase';
```

to:

```ts
type SyncMode = 'local' | 'api';
```

Set initial sync mode:

```ts
const [syncMode, setSyncMode] = useState<SyncMode>('local');
```

- [ ] **Step 3: Add API auth fields to context interface**

In `SiteContentContextValue`, replace `canUseSupabase`, `login`, `loginWithSupabase`, and `logout` with:

```ts
canUseApi: boolean;
getAdminToken?: () => Promise<string | null>;
```

- [ ] **Step 4: Replace remote refresh**

Implement:

```ts
const refreshFromRemote = async () => {
  setSyncStatus('loading');
  setSyncError('');

  try {
    const remoteContent = await fetchSiteContentFromApi();
    const nextContent = normalizeSiteContent(remoteContent.content);

    if (isAdminSignedIn && getAdminToken) {
      const remoteBookings = await fetchBookingsFromApi(getAdminToken);
      nextContent.bookingOrders = remoteBookings.bookings;
    }

    setContent(nextContent);
    saveSiteContent(nextContent);
    setSyncMode('api');
    setSyncStatus('saved');
  } catch (error) {
    setSyncMode('local');
    setSyncStatus('error');
    setSyncError(error instanceof Error ? error.message : 'Tak dapat sync data dari API.');
  }
};
```

- [ ] **Step 5: Replace save behavior**

Inside `updateContent`, replace Supabase save block with:

```ts
if (isAdminSignedIn && getAdminToken) {
  setSyncStatus('saving');
  setSyncError('');
  void saveSiteContentToApi(next, getAdminToken)
    .then(() => {
      setSyncMode('api');
      setSyncStatus('saved');
    })
    .catch((error) => {
      setSyncMode('local');
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Tak dapat simpan data ke API.');
    });
}
```

- [ ] **Step 6: Remove local passcode and Supabase login methods**

Remove `login`, `loginWithSupabase`, `signOutAdmin`, and `canUseSupabase` from the context interface and value. Replace with:

```ts
isAdminAuthenticated: isAdminSignedIn,
canUseApi: Boolean(getAdminToken),
getAdminToken,
```

Update all callers in the next task.

- [ ] **Step 7: Delete Supabase client**

Delete `Homepage/src/lib/supabase.ts`.

- [ ] **Step 8: Commit**

Run:

```bash
git add Homepage/src/context/SiteContentContext.tsx
git rm Homepage/src/lib/supabase.ts
git commit -m "refactor: replace supabase context with api sync"
```

## Task 7: Add Clerk Provider And Admin Login UI

**Files:**
- Modify: `Homepage/src/main.tsx`
- Modify: `Homepage/src/App.tsx`
- Modify: `Homepage/src/pages/AdminPage.tsx`

- [ ] **Step 1: Wrap app with Clerk provider when configured**

Modify `Homepage/src/main.tsx`:

```tsx
import { ClerkProvider } from '@clerk/clerk-react';
import { useAuth } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function ClerkApp() {
  const { getToken, isSignedIn } = useAuth();
  return <App getAdminToken={getToken} isAdminSignedIn={Boolean(isSignedIn)} />;
}

const app = clerkPublishableKey ? (
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <ClerkApp />
  </ClerkProvider>
) : (
  <App />
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {app}
  </StrictMode>,
);
```

- [ ] **Step 2: Pass auth props to content provider**

Modify `Homepage/src/App.tsx` signature:

```tsx
interface AppProps {
  getAdminToken?: () => Promise<string | null>;
  isAdminSignedIn?: boolean;
}

export default function App({ getAdminToken, isAdminSignedIn = false }: AppProps) {
```

Pass to provider:

```tsx
<SiteContentProvider getAdminToken={getAdminToken} isAdminSignedIn={isAdminSignedIn}>
```

- [ ] **Step 3: Replace login card**

In `Homepage/src/pages/AdminPage.tsx`, import:

```ts
import { SignInButton, SignOutButton, UserButton } from '@clerk/clerk-react';
```

Replace `AdminLoginCard` body with a single Clerk sign-in panel:

```tsx
function AdminLoginCard() {
  return (
    <main className="bg-[#eef2f5] px-4 pb-20 pt-28 md:px-8">
      <div className="mx-auto max-w-xl">
        <section className="lux-surface rounded-[2rem] p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Admin Panel</p>
          <h1 className="mt-3 font-headline text-3xl md:text-5xl">Secure Access</h1>
          <p className="mt-4 text-sm text-on-surface-variant md:text-base">
            Login admin menggunakan akaun Clerk yang dibenarkan.
          </p>
          <SignInButton mode="modal">
            <button type="button" className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Login Admin
            </button>
          </SignInButton>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Replace dashboard logout**

Use Clerk's `SignOutButton` in the admin header logout button:

```tsx
<SignOutButton>
  <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em]">
    <LogOut size={14} />
    Logout
  </button>
</SignOutButton>
```

Remove the old `logout` handler from context destructuring.

- [ ] **Step 5: Commit**

Run:

```bash
git add Homepage/src/main.tsx Homepage/src/App.tsx Homepage/src/pages/AdminPage.tsx
git commit -m "feat: add clerk admin login"
```

## Task 8: Persist Customer Booking And Receipt Through API

**Files:**
- Modify: `Homepage/src/pages/BookingPage.tsx`

- [ ] **Step 1: Replace booking create call**

Import:

```ts
import { createBookingViaApi, uploadReceiptViaApi } from '../lib/apiClient';
```

Make `handleCreateBooking` async. Replace local `createBookingOrder` usage with:

```ts
const response = await createBookingViaApi({
  guestName: guestName.trim(),
  phone: phone.trim(),
  email: email.trim(),
  checkIn,
  checkOut,
  pax: guestCount,
  rateId: selectedRate.id,
  totalAmount: summary.total,
  paymentOptionSelected,
  notes: notes.trim(),
});

const order = response.booking;
updateContent((current) => ({
  ...current,
  bookingOrders: [order, ...current.bookingOrders.filter((item) => item.id !== order.id)],
}));
setSubmittedOrder(order);
```

Keep `sendNotificationRequest` removed from the browser create flow, because the API route sends it after database insert.

- [ ] **Step 2: Replace receipt upload persistence**

Inside `handleReceiptUpload`, after `reader.onload`, call:

```ts
const response = await uploadReceiptViaApi({
  bookingId: activeSubmittedOrder.id,
  receiptImage: String(reader.result || ''),
});
const nextOrder = response.booking;
setSubmittedOrder(nextOrder);
updateContent((current) => ({
  ...current,
  bookingOrders: current.bookingOrders.map((order) => (order.id === nextOrder.id ? nextOrder : order)),
}));
```

Remove browser-side `sendNotificationRequest` for receipt upload.

- [ ] **Step 3: Add error state**

Add:

```ts
const [bookingError, setBookingError] = useState('');
const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
```

Set loading and error around API calls. Render `bookingError` near the submit area:

```tsx
{bookingError ? <p className="mt-4 text-sm text-[#b34343]">{bookingError}</p> : null}
```

- [ ] **Step 4: Commit**

Run:

```bash
git add Homepage/src/pages/BookingPage.tsx
git commit -m "feat: persist public bookings through api"
```

## Task 9: Persist Admin Booking Actions Through API

**Files:**
- Modify: `Homepage/src/pages/AdminPage.tsx`

- [ ] **Step 1: Import API update client and context token getter**

Add:

```ts
import { updateBookingViaApi } from '../lib/apiClient';
```

Destructure `getAdminToken` from `useSiteContent()`.

- [ ] **Step 2: Replace `updateBooking` with async API-backed helper**

Add:

```ts
const applyBookingAction = async (action: BookingAdminAction) => {
  if (!getAdminToken) {
    window.alert('Admin token belum tersedia. Sila login semula.');
    return;
  }

  try {
    const response = await updateBookingViaApi(action, getAdminToken);
    updateContent((current) => ({
      ...current,
      bookingOrders: current.bookingOrders.map((order) => (
        order.id === response.booking.id ? response.booking : order
      )),
    }));
  } catch (error) {
    window.alert(error instanceof Error ? error.message : 'Tak dapat update booking.');
  }
};
```

Import `BookingAdminAction` type.

- [ ] **Step 3: Change admin handlers**

Replace manual payment verification:

```ts
void applyBookingAction({
  type: 'verify-payment',
  bookingId: order.id,
  paymentStatus: nextStatus,
  today,
});
```

Replace reject:

```ts
void applyBookingAction({
  type: 'reject-payment',
  bookingId: order.id,
  reason: 'Receipt rejected by admin.',
});
```

Replace cancel:

```ts
void applyBookingAction({
  type: 'set-booking-status',
  bookingId: order.id,
  bookingStatus: 'Cancelled',
});
```

Replace notes update with a debounced or blur-based API action:

```tsx
onBlur={(event) => void applyBookingAction({
  type: 'update-notes',
  bookingId: selectedBooking.id,
  notes: event.target.value,
})}
```

Keep local textarea `onChange` for immediate UI if needed, but ensure final persistence calls API.

- [ ] **Step 4: Commit**

Run:

```bash
git add Homepage/src/pages/AdminPage.tsx
git commit -m "feat: persist admin booking actions through api"
```

## Task 10: Remove Supabase Dependency And Update Environment Docs

**Files:**
- Modify: `Homepage/package.json`
- Modify: `Homepage/package-lock.json`
- Modify: `Homepage/.env.example`
- Modify: `Homepage/README.md`

- [ ] **Step 1: Install and remove dependencies**

Run:

```bash
cd Homepage
npm uninstall @supabase/supabase-js
npm install @neondatabase/serverless @clerk/clerk-react @clerk/backend @vercel/node
```

- [ ] **Step 2: Update `.env.example`**

Replace Supabase section with:

```env
# Neon Postgres connection string. Keep server-side only in Vercel.
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Clerk admin auth
VITE_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxx"
ADMIN_EMAILS="owner@example.com,admin@example.com"
```

- [ ] **Step 3: Update README backend setup**

Add a section:

```md
## Neon + Clerk Backend

1. Create a Neon project and copy `DATABASE_URL`.
2. Run `neon/schema.sql` in the Neon SQL editor.
3. Create a Clerk application.
4. Add `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ADMIN_EMAILS`, and `DATABASE_URL` in Vercel.
5. Deploy.
6. Test public booking creation and admin updates before deleting the old Supabase project.
```

Remove instructions that tell the user to configure Supabase.

- [ ] **Step 4: Confirm no Supabase references remain**

Run:

```bash
rg -n "supabase|SUPABASE|@supabase|VITE_SUPABASE" Homepage
```

Expected: only historical docs are acceptable. No runtime code, env example, or package files should match.

- [ ] **Step 5: Commit**

Run:

```bash
git add Homepage/package.json Homepage/package-lock.json Homepage/.env.example Homepage/README.md
git commit -m "chore: replace supabase setup with neon clerk docs"
```

## Task 11: Run Verification

**Files:**
- No code files unless failures reveal necessary fixes

- [ ] **Step 1: Run focused tests**

Run:

```bash
cd Homepage
npm test
```

Expected: all `tsx` tests exit 0.

- [ ] **Step 2: Run typecheck**

Run:

```bash
cd Homepage
npm run lint
```

Expected: TypeScript exits 0.

- [ ] **Step 3: Run production build**

Run:

```bash
cd Homepage
npm run build
```

Expected: Vite build exits 0 and writes `dist/`.

- [ ] **Step 4: Run local dev server**

Run:

```bash
cd Homepage
npm run dev
```

Expected: app starts on port 3000. Manually check `/`, `/booking`, and admin route. Stop the server after checking.

- [ ] **Step 5: Final Supabase deletion checklist**

Before telling the user to delete Supabase, verify:

```bash
rg -n "supabase|SUPABASE|@supabase|VITE_SUPABASE" Homepage
```

Expected: no runtime/config references.

Also confirm with the user that production Vercel has:

- `DATABASE_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `ADMIN_EMAILS`
- Resend env vars if email notifications are required
