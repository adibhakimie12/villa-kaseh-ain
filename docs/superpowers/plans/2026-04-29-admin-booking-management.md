# Admin Booking Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing Villa Kaseh Ain admin panel with booking management, payment settings, automation controls, upgraded availability calendar, and booking-form order creation.

**Architecture:** Extend the current `SiteContent` JSON model so localStorage and Supabase sync continue to work. Put reusable booking calculations and mutations in focused library files, then let `AdminPage` and `BookingPage` render and update that shared state.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, lucide-react, localStorage, optional Supabase JSON sync.

---

## File Structure

- Modify `Homepage/src/lib/siteContent.ts`: add booking/payment/automation/future module types, defaults, and normalization.
- Create `Homepage/src/lib/booking.ts`: pure helpers for nights, totals, booking IDs, availability states, metrics, payment balance, filters, and template rendering.
- Create `Homepage/src/lib/booking.test.ts`: executable Node test file using `node:assert` and `tsx`.
- Modify `Homepage/package.json`: add `test` script using `tsx`.
- Modify `Homepage/src/pages/BookingPage.tsx`: collect guest info, create pending booking orders, show payment link placeholder, and keep WhatsApp fallback.
- Modify `Homepage/src/pages/AdminPage.tsx`: add metrics, booking table/cards, detail panel, payment gateway settings, payment rules, automation toggles, WhatsApp template, upgraded calendar, and preserve existing content/rate/blocked-date controls.

## Task 1: Booking Data Model And Pure Helpers

**Files:**
- Modify: `Homepage/src/lib/siteContent.ts`
- Create: `Homepage/src/lib/booking.ts`
- Create: `Homepage/src/lib/booking.test.ts`
- Modify: `Homepage/package.json`

- [ ] **Step 1: Add failing helper tests**

Create `Homepage/src/lib/booking.test.ts` with tests for metrics, date state, and WhatsApp template rendering before `booking.ts` exists.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Homepage run test`

Expected: FAIL because `./booking` cannot be found.

- [ ] **Step 3: Add booking types/defaults and helper implementation**

Add the data model to `siteContent.ts` and helper functions to `booking.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Homepage run test`

Expected: PASS with all booking helper tests green.

## Task 2: Booking Form Order Creation

**Files:**
- Modify: `Homepage/src/pages/BookingPage.tsx`

- [ ] **Step 1: Add customer fields and submit flow**

Add guest name, phone, email, and note fields. Submit creates a pending booking order through `updateContent`.

- [ ] **Step 2: Add payment step UI**

After submit, show generated booking ID, total, deposit, placeholder payment link, and WhatsApp fallback.

- [ ] **Step 3: Run test and typecheck**

Run: `npm --prefix Homepage run test` and `npm --prefix Homepage run lint`.

Expected: Both commands exit 0.

## Task 3: Admin Booking Operations UI

**Files:**
- Modify: `Homepage/src/pages/AdminPage.tsx`

- [ ] **Step 1: Add dashboard metrics and trend chart**

Use helpers from `booking.ts` to render revenue, upcoming bookings, pending payments, occupancy, average stay, and last-30-day bar chart.

- [ ] **Step 2: Add Booking Orders section**

Add filters, responsive booking cards/table, status chips, and action buttons: View, Edit, Send WhatsApp, Send Email, Mark Paid, Cancel Booking.

- [ ] **Step 3: Add booking detail side panel**

Show guest, stay, payment, notes, and action buttons: Confirm Booking, Send Reminder, Request Balance, Refund, Close.

- [ ] **Step 4: Run test and typecheck**

Run: `npm --prefix Homepage run test` and `npm --prefix Homepage run lint`.

Expected: Both commands exit 0.

## Task 4: Payment, Automation, Template, Calendar

**Files:**
- Modify: `Homepage/src/pages/AdminPage.tsx`

- [ ] **Step 1: Add Payment Gateway cards**

Add Billplz, senangPay, Stripe controls and default active gateway selector.

- [ ] **Step 2: Add Payment Rules card**

Add booking type checkboxes, deposit amount, deposit percentage, auto-cancel hours, and refundable toggle.

- [ ] **Step 3: Add Auto Notifications and WhatsApp Template cards**

Add email, WhatsApp, admin alert toggles, editable confirmation template, Save Template, and Test Send.

- [ ] **Step 4: Upgrade calendar availability**

Add monthly calendar states: available, booked, pending payment, manual blocked. Clicking a booked/pending date opens the related booking panel.

- [ ] **Step 5: Run test, typecheck, and build**

Run: `npm --prefix Homepage run test`, `npm --prefix Homepage run lint`, and `npm --prefix Homepage run build`.

Expected: All commands exit 0.

## Task 5: Final Polish

**Files:**
- Modify only if verification reveals issues.

- [ ] **Step 1: Check mobile responsiveness**

Run the Vite app and inspect admin and booking pages around 375px and desktop width.

- [ ] **Step 2: Fix visual overflow or inaccessible buttons**

Keep touch targets at least 44px high, avoid horizontal scroll, and keep all status colors paired with text.

- [ ] **Step 3: Final verification**

Run: `npm --prefix Homepage run test`, `npm --prefix Homepage run lint`, and `npm --prefix Homepage run build`.

Expected: All commands exit 0.
