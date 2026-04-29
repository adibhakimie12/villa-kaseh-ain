# Villa Kaseh Ain Admin Booking Management Design

## Scope

Upgrade the existing `Homepage` admin panel into a full booking operations console while preserving the current luxury resort style. This phase extends the current React/SiteContent system with production-shaped UI, local/Supabase-ready data, manual bank transfer payment handling, owner QR payment instructions, receipt verification, and Resend-ready email notifications. Billplz and other live gateways are deferred because the owner may not have SSM or a corporate bank account.

## Existing Context

The admin page lives in `Homepage/src/pages/AdminPage.tsx`. It already supports local passcode login, optional Supabase Auth login, content editing, blocked dates, rates, refresh sync, and reset demo data. Shared editable data is stored in `SiteContent`, persisted to localStorage, and synced as JSON to the Supabase `site_content` table when configured.

The booking page already calculates nights, pax, selected rate, total estimate, and checks overlap against `bookingSettings.blockedDates`. The upgrade should keep this flow and add order creation rather than replacing the booking page.

## Recommended Approach

Use a balanced local-first implementation:

- Extend `SiteContent` with booking orders, manual payment settings, payment rules, automation settings, WhatsApp templates, and future feature placeholders.
- Keep the existing admin page and visual language, but split its internal UI into small helper components if the file becomes too large.
- Add demo/default booking orders so the new admin screens are usable immediately.
- Let the website booking form create a pending booking order in shared content and mark selected dates as temporarily held.
- Treat payment actions as manual transfer verification: customers receive bank/QR instructions, upload payment proof, and admins verify deposit or full payment from the admin panel.

This path gives an owner without SSM a usable booking management system now and leaves a clean shape for real Billplz, senangPay, Stripe, OTA sync, and calendar sync later.

## Admin Information Architecture

The authenticated admin screen keeps the current “Website Control Room” header with sync, reset, and logout actions. Under it, add dashboard metric cards:

- This Month Revenue
- Upcoming Bookings
- Pending Payments
- Occupancy Rate
- Average Stay Nights

Add a small 30-day booking trend chart using simple div/SVG bars so no new chart dependency is needed.

The main admin content should be organized as premium cards:

- Booking Orders
- Booking Detail Panel
- Calendar Availability
- Manual Payment Settings
- Payment Rules
- Auto Notifications
- WhatsApp Template Settings
- Existing Basic Content
- Existing Rates
- Existing Blocked Dates / Unavailable List

The current content/rates/date controls should remain available, but they can move below the higher-priority booking operations modules.

## Booking Orders

Create a `Booking Orders` card with filters:

- Today
- Upcoming
- Paid
- Pending
- Cancelled

The table columns are:

- Booking ID
- Guest Name
- Phone Number
- Check In
- Check Out
- Pax
- Total Amount
- Payment Status
- Booking Status
- Actions

Payment statuses:

- Pending
- Deposit Paid
- Paid Full
- Failed
- Refunded

Booking statuses:

- Confirmed
- Awaiting Payment
- Checked In
- Completed
- Cancelled

Actions:

- View
- Edit
- Send WhatsApp
- Send Email
- Mark Deposit Paid
- Mark Full Paid
- Reject Payment
- Cancel Booking

On mobile, the table becomes stacked booking cards with the same actions exposed as wrapped buttons.

The primary paid action should be contextual:

- If `Payment Option Selected = Deposit`, show `Mark Deposit Paid`.
- If `Payment Option Selected = Full Amount`, show `Mark Full Paid`.
- If the booking is already deposit paid and still has a remaining balance, show `Mark Full Paid` for the balance collection.

## Booking Detail Panel

Clicking View or a booking row opens a luxury side panel/modal. It shows:

Guest Information:

- Name
- Phone
- Email

Stay Details:

- Check-in
- Check-out
- Nights
- Pax

Payment:

- Amount
- Deposit
- Amount Paid
- Remaining Balance
- Payment Option Selected
- Paid Date
- Payment Proof / Receipt Preview

Notes:

- Internal Admin Notes

Panel buttons:

- Confirm Booking
- Send Reminder
- Request Balance
- Mark Deposit Paid
- Mark Full Paid
- Reject Payment
- Refund
- Close

The panel updates the selected booking in shared content. `Mark Deposit Paid` sets `Payment Status = Deposit Paid`, keeps the booking confirmed, stores paid amount, and leaves the remaining balance visible. `Mark Full Paid` sets `Payment Status = Paid Full`, sets remaining balance to RM0, stores paid date, and confirms the booking. Refund is a status action in this phase; it does not call a live gateway.

## Manual Payment Settings

Create a `Manual Payment` section as the default active payment method. It contains:

- Bank Name
- Account Holder Name
- Account Number
- DuitNow / Bank QR Image
- Payment Instructions
- Owner Email
- Owner WhatsApp Number

The checkout page uses these values to show clear manual transfer instructions after a booking is submitted.

Keep future gateway cards hidden or marked as not active:

Billplz:

- Enable toggle
- API Key
- X Signature
- Collection ID
- Sandbox / Live toggle

senangPay:

- Merchant ID
- Secret Key
- Enable toggle

Stripe:

- Publishable Key
- Secret Key
- Enable toggle

Add a default active gateway selector. Sensitive fields are UI placeholders in this frontend-only phase. In the backend phase, secret keys must move to server-side environment variables and should not be stored in browser localStorage.

## Payment Rules

Create `Payment Rules` fields:

- Booking Type: Deposit Only, Full Payment, Both Options
- Deposit Amount in RM
- Deposit Percentage
- Auto Cancel Unpaid Booking After in hours
- Refundable toggle

These rules drive the booking summary and admin labels. If both deposit amount and percentage are set, use fixed deposit amount first because it is easier for the owner to understand.

## Automation Center

Create `Auto Notifications` with toggles:

Email:

- Booking Confirmation
- Payment Success
- Reminder Before Check-in
- Balance Payment Reminder

WhatsApp:

- Send After Booking
- Send After Payment
- Send Check-in Reminder

Admin Alerts:

- Notify Owner New Booking
- Notify Owner Payment Received

In this phase, toggles configure which messages are sent. Resend should be used for live email notifications when `RESEND_API_KEY` and verified sender/domain settings are configured on the backend or deployment environment. New booking emails can send automatically after booking submit. Payment verified emails send when admin manually presses `Mark Deposit Paid` or `Mark Full Paid`. Scheduled reminders still require backend automation in a later phase.

All booking and payment emails must include:

- Booking ID
- Guest name
- Check-in and check-out
- Pax
- Payment option selected
- Amount due or amount verified
- Remaining balance when deposit is verified

## WhatsApp Template Settings

Create a card with the default confirmation message:

```text
Hi {name},
Terima kasih kerana booking Villa Kaseh Ain.

Tarikh:
{checkin} - {checkout}

Jumlah:
RM {amount}

Kami akan hubungi anda segera.
```

Buttons:

- Save Template
- Test Send

Test Send opens a WhatsApp URL using the configured admin/owner number and sample-filled template.

Customer-facing WhatsApp buttons should also be available after booking submission and after payment instructions. The link opens WhatsApp to the configured owner/admin number with a prefilled message containing Booking ID, guest name, dates, payment option, and amount due. This lets customers continue manually if they prefer WhatsApp.

## Calendar Availability Upgrade

Enhance the current blocked-date area with a monthly visual calendar:

- Green = Available
- Red = Booked
- Yellow = Pending Payment
- Grey = Manual Blocked

Clicking a date opens related booking info if booked or pending. Manual blocked dates continue to use the existing `blockedDates` list. Booked and pending dates derive from booking orders and their statuses.

Availability rules:

- Manual blocked ranges always make dates unavailable.
- Booking orders with `Awaiting Payment`, `Confirmed`, `Checked In`, or `Completed` make the selected stay dates unavailable.
- Cancelled, failed, refunded, rejected, or expired bookings release the dates.
- Pending payment dates appear yellow in the admin calendar and should be treated as unavailable on the public booking form while the expiry timer is active.
- Confirmed/deposit-paid/full-paid bookings appear red.
- Manual blocked dates appear grey.

## Website Booking Form Connection

Change the frontend booking action from only WhatsApp inquiry to order creation:

1. Customer selects date, pax, and rate.
2. Customer enters name, phone, and email.
3. Submit creates a booking order with `Payment Status = Pending` and `Booking Status = Awaiting Payment`.
4. Selected nights become held dates through the booking order status.
5. The UI shows a manual payment step with owner bank details, owner QR image, amount due, upload receipt control, and WhatsApp fallback.
6. Admin can verify deposit, verify full payment, reject receipt, confirm, cancel, or release dates.

If payment proof is not submitted or remains unverified beyond the configured timer, the UI can show the order as expired/cancelled when viewed. Automatic release needs backend scheduling in a later phase; frontend can calculate and label overdue orders.

Receipt upload can be stored as a data URL for local/demo mode. In production, receipt files should move to Supabase Storage or another server-side upload endpoint so images are not stored in browser localStorage.

## Future-Ready Placeholders

Keep these hidden or marked as “coming soon” in data shape, not visible primary UI:

- Promo Codes
- Affiliate Booking Agent
- OTA Sync Airbnb / Agoda
- Google Calendar Sync

The data model should include a `futureModules` object so these can be activated later without changing the broader content structure.

## Data Model Additions

Add TypeScript interfaces in `siteContent.ts`:

- `BookingOrder`
- `PaymentStatus`
- `BookingStatus`
- `ManualPaymentSettings`
- `PaymentGatewaySettings`
- `PaymentRules`
- `AutomationSettings`
- `WhatsappTemplateSettings`
- `FutureModuleSettings`

Add default demo values and update `normalizeSiteContent` so old saved content still works.

## Error Handling And UX

The admin remains beginner friendly:

- Clear labels and visible field names.
- Buttons use direct action text like Save Changes, Test Payment, Generate Link, Send WhatsApp.
- Destructive actions such as Cancel Booking ask for confirmation.
- Status colors include text labels, not color alone.
- Mobile layout avoids horizontal overflow by turning tables into cards.

## Testing And Verification

Minimum verification:

- `npm --prefix Homepage run lint`
- `npm --prefix Homepage run build`
- Manual browser check at desktop and mobile widths.
- Confirm existing Basic Content, Rates, and Blocked Dates still work.
- Confirm new booking order creation updates admin list and calendar state.
- Confirm status actions update metrics and booking detail panel.
- Confirm manual blocked dates and customer booking dates both prevent overlapping checkout submissions.
- Confirm customer payment instructions show owner bank/QR values and WhatsApp fallback.
- Confirm admin payment buttons differ between deposit and full payment bookings.

## Out Of Scope For This Phase

- Real Billplz/senangPay/Stripe payment charging.
- Payment webhooks.
- Secure storage of gateway secret keys.
- Server-side scheduled auto-cancel jobs.
- Automated WhatsApp API sending.
- OTA/Airbnb/Agoda sync.
- Google Calendar API sync.
