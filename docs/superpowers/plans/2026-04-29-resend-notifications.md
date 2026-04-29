# Resend Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add live transactional email notifications for new booking, receipt upload, and payment verification using Resend free tier.

**Architecture:** Keep notification triggers in the existing React flows, but send them to a server-side Vercel API route so the Resend API key stays private. Use small pure helpers for notification content and recipients so behavior stays testable without needing to hit the network.

**Tech Stack:** React 19, TypeScript, Vite, Vercel serverless API routes, Resend HTTP API, existing `tsx` tests.

---

## File Structure

- Modify `Homepage/src/lib/booking.ts`: add small pure helpers for notification subject/body content where useful.
- Modify `Homepage/src/lib/booking.test.ts`: cover the new notification copy helpers and recipient behavior.
- Create `Homepage/src/lib/notifications.ts`: client-side helper to POST notification events to the backend endpoint.
- Create `Homepage/api/notifications.ts`: Vercel API route that validates event payloads and sends emails with Resend.
- Modify `Homepage/src/pages/BookingPage.tsx`: trigger `new-booking` and `receipt-uploaded` notifications.
- Modify `Homepage/src/pages/AdminPage.tsx`: trigger `payment-verified` notification after admin verifies payment.
- Modify `Homepage/vercel.json`: preserve `/api/*` routes while keeping SPA fallback.
- Modify `Homepage/README.md`: document `RESEND_API_KEY`, sender env vars, and `/api` deployment notes.

## Task 1: Notification Helper Tests

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Run `npm --prefix Homepage run test` and confirm helper export failures**
- [ ] **Step 3: Add minimal pure helpers**
- [ ] **Step 4: Re-run tests and confirm pass**

## Task 2: Backend Route

- [ ] **Step 1: Add `api/notifications.ts` with event validation and Resend send logic**
- [ ] **Step 2: Update `vercel.json` so `/api/*` is not swallowed by SPA rewrite**
- [ ] **Step 3: Add README env docs**

## Task 3: Frontend Triggers

- [ ] **Step 1: Add `src/lib/notifications.ts` client POST helper**
- [ ] **Step 2: Trigger `new-booking` and `receipt-uploaded` from booking page**
- [ ] **Step 3: Trigger `payment-verified` from admin page**

## Task 4: Verification

- [ ] **Step 1: Run `npm --prefix Homepage run test`**
- [ ] **Step 2: Run `npm --prefix Homepage run lint`**
- [ ] **Step 3: Run `npm --prefix Homepage run build`**
- [ ] **Step 4: Commit with `feat: add resend booking notifications`**
