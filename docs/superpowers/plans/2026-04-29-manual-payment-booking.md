# Manual Payment Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the booking/payment flow from gateway placeholders to a live-testable manual bank transfer, QR, receipt verification, and WhatsApp/email notification-ready workflow.

**Architecture:** Keep the existing local/Supabase `SiteContent` shape as the app source of truth, adding manual payment settings and receipt metadata. Pure booking helpers handle availability, due amounts, paid status transitions, receipt state, and message bodies; React pages only render and call helpers.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS, lucide-react, existing localStorage/Supabase JSON sync, existing `tsx` helper tests.

---

## File Structure

- Modify `Homepage/src/lib/siteContent.ts`: add manual payment settings, receipt fields on `BookingOrder`, default bank/QR placeholders, and normalization for old saved content.
- Modify `Homepage/src/lib/booking.ts`: add helper functions for manual payment due amount, contextual paid button labels, verification transitions, WhatsApp messages, mailto body, and overlap detection across manual blocked dates plus booking orders.
- Modify `Homepage/src/lib/booking.test.ts`: add regression tests for auto-blocked booking dates, released cancelled dates, contextual payment verification, manual payment settings normalization, and customer WhatsApp messages containing Booking ID.
- Modify `Homepage/src/pages/BookingPage.tsx`: block selected dates using both manual blocked dates and existing booking orders, show manual bank/QR payment step, add receipt upload, and add WhatsApp owner fallback after booking.
- Modify `Homepage/src/pages/AdminPage.tsx`: replace gateway-first card with manual payment settings, show receipt preview and verification state, replace `Mark Paid` with contextual `Mark Deposit Paid` / `Mark Full Paid`, add `Reject Payment`, and update email/WhatsApp content.

## Task 1: Data Model And Helpers

- [ ] **Step 1: Write failing helper tests**

Add tests in `Homepage/src/lib/booking.test.ts` for:

```ts
assert.equal(getAvailabilityStateForDate('2026-05-18', orders, []).state, 'pending');
assert.equal(getAvailabilityStateForDate('2026-05-18', [cancelledOrder], []).state, 'available');
assert.equal(getPaymentActionLabel(depositOrder), 'Mark Deposit Paid');
assert.equal(getPaymentActionLabel(fullOrder), 'Mark Full Paid');
assert.equal(verifyManualPayment(depositOrder, 'Deposit Paid', '2026-04-29').amountPaid, 500);
assert.ok(buildCustomerPaymentWhatsappMessage(depositOrder, manualPayment).includes('VKA-1028'));
```

- [ ] **Step 2: Run failing tests**

Run `npm --prefix Homepage run test`. Expected: FAIL because helper functions and manual payment fields do not exist yet.

- [ ] **Step 3: Implement data model and helpers**

Update `siteContent.ts` with `ManualPaymentSettings`, receipt fields, default manual payment values, and normalizer fallbacks. Update `booking.ts` with the tested helper functions.

- [ ] **Step 4: Run helper tests**

Run `npm --prefix Homepage run test`. Expected: PASS.

## Task 2: Checkout Manual Payment UI

- [ ] **Step 1: Extend tests for overlap and message behavior**

Add/keep tests proving pending bookings block public checkout dates and cancelled bookings release them.

- [ ] **Step 2: Run tests before UI changes**

Run `npm --prefix Homepage run test`. Expected: PASS for helpers.

- [ ] **Step 3: Update `BookingPage.tsx`**

Use booking availability helper for overlap detection, show manual payment bank/account/QR instructions after submit, allow receipt upload as data URL, persist receipt to the created order, and show customer WhatsApp owner button with the booking ID.

- [ ] **Step 4: Run lint**

Run `npm --prefix Homepage run lint`. Expected: PASS.

## Task 3: Admin Verification UI

- [ ] **Step 1: Add helper coverage for payment verification**

Ensure tests cover deposit verification, full payment verification, and rejected receipt state.

- [ ] **Step 2: Update `AdminPage.tsx`**

Replace visible gateway-first controls with manual payment settings. Keep gateway cards future-ready but secondary. Replace table action with contextual payment action. Add receipt preview, `Mark Deposit Paid`, `Mark Full Paid`, `Reject Payment`, and mail/WhatsApp bodies with Booking ID.

- [ ] **Step 3: Run tests and lint**

Run `npm --prefix Homepage run test` and `npm --prefix Homepage run lint`. Expected: PASS.

## Task 4: Verification

- [ ] **Step 1: Build production bundle**

Run `npm --prefix Homepage run build`. Expected: exit code 0.

- [ ] **Step 2: Final diff review**

Run `git diff --stat` and `git diff --check`. Expected: no whitespace errors and only intended files changed.

- [ ] **Step 3: Commit implementation**

Commit with `feat: add manual payment booking flow`.
