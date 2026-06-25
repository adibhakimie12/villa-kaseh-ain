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
import { buildNotificationRequest } from '../src/lib/notifications';
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

type Sql = ReturnType<typeof getSql>;

async function loadContent(sql: Sql) {
  const rows = await sql`select content from site_content where slug = 'main' limit 1`;
  return rows[0]?.content ? normalizeSiteContent(rows[0].content) : defaultSiteContent;
}

async function loadBookings(sql: Sql) {
  const rows = await sql`select * from bookings order by created_at desc`;
  return (rows as BookingRow[]).map(bookingOrderFromRow);
}

async function saveBooking(sql: Sql, order: BookingOrder) {
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

function parseAdminAction(input: unknown): BookingAdminAction {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid booking action');
  }

  const action = input as Partial<BookingAdminAction>;
  if (typeof action.type !== 'string' || typeof action.bookingId !== 'string' || !action.bookingId.trim()) {
    throw new Error('Invalid booking action');
  }

  return action as BookingAdminAction;
}

async function sendBuiltNotification(notification: ReturnType<typeof buildNotificationRequest>) {
  if (notification) {
    await sendNotificationEmails(notification);
  }
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
      await sendBuiltNotification(buildNotificationRequest('new-booking', booking, content));
      res.status(201).json({ booking });
      return;
    }

    if (req.method === 'PATCH') {
      const admin = await requireAdminFromRequest(req);
      if (!admin.ok) {
        res.status(admin.status).json({ error: admin.error });
        return;
      }
      const action = parseAdminAction(req.body);
      const rows = await sql`select * from bookings where id = ${action.bookingId} limit 1`;
      if (!rows[0]) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }
      const content = await loadContent(sql);
      const booking = applyAdminAction(bookingOrderFromRow(rows[0] as BookingRow), action);
      await saveBooking(sql, booking);
      if (action.type === 'verify-payment') {
        await sendBuiltNotification(buildNotificationRequest('payment-verified', booking, content));
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
