import {
  createBookingOrder,
  dayDiff,
  getAllowedPaymentOptions,
  getAvailabilityStateForDate,
  getAutomaticRateForStay,
  getExtraGuestCharge,
  getPublicGuestOptions,
  getRoomRateSubtotal,
} from './booking.js';
import type { CreateBookingPayload, ReceiptUploadPayload } from './apiTypes.js';
import { eachNightInStay, toIsoDate } from './date.js';
import type { BookingOrder, SiteContent } from './siteContent.js';

export interface BookingRow {
  id: string;
  guest_name: string;
  phone: string;
  email: string;
  check_in: string;
  check_out: string;
  nights: number | string;
  pax: number | string;
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
  created_at: string | Date;
  updated_at: string | Date;
}

function objectPayload(value: unknown, message: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(message);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

function requiredNumber(value: unknown, field: string) {
  if (typeof value === 'string' && !value.trim()) {
    throw new Error(`${field} must be a positive number`);
  }

  if (typeof value !== 'number' && typeof value !== 'string') {
    throw new Error(`${field} must be a positive number`);
  }

  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${field} must be a positive number`);
  }
  return number;
}

function rowNumber(value: number | string, field: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${field} must be a number`);
  }
  return number;
}

function timestampString(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function requiredIsoDate(value: unknown, field: string) {
  const dateValue = requiredString(value, field);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) {
    throw new Error(`${field} must be a valid date`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (
    !Number.isFinite(parsed.getTime())
    || parsed.getFullYear() !== year
    || parsed.getMonth() + 1 !== month
    || parsed.getDate() !== day
  ) {
    throw new Error(`${field} must be a valid date`);
  }

  return dateValue;
}

export function bookingOrderFromRow(row: BookingRow): BookingOrder {
  return {
    id: row.id,
    guestName: row.guest_name,
    phone: row.phone,
    email: row.email,
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: rowNumber(row.nights, 'nights'),
    pax: rowNumber(row.pax, 'pax'),
    rateId: row.rate_id,
    totalAmount: rowNumber(row.total_amount, 'totalAmount'),
    depositAmount: rowNumber(row.deposit_amount, 'depositAmount'),
    amountPaid: rowNumber(row.amount_paid, 'amountPaid'),
    remainingBalance: rowNumber(row.remaining_balance, 'remainingBalance'),
    paymentOptionSelected: row.payment_option_selected,
    paymentStatus: row.payment_status,
    bookingStatus: row.booking_status,
    paidDate: row.paid_date,
    receiptImage: row.receipt_image,
    receiptUploadedAt: row.receipt_uploaded_at,
    paymentRejectedReason: row.payment_rejected_reason,
    notes: row.notes,
    createdAt: timestampString(row.created_at),
    updatedAt: timestampString(row.updated_at),
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

export function buildCreateBookingOrder(input: {
  payload: unknown;
  existingOrders: BookingOrder[];
  content: SiteContent;
  now?: Date;
}) {
  const payload = objectPayload(input.payload, 'Invalid create booking payload');
  const guestName = requiredString(payload.guestName, 'guestName');
  const phone = requiredString(payload.phone, 'phone');
  const email = requiredString(payload.email, 'email');
  const checkIn = requiredIsoDate(payload.checkIn, 'checkIn');
  const checkOut = requiredIsoDate(payload.checkOut, 'checkOut');
  const rateId = requiredString(payload.rateId, 'rateId');
  const pax = requiredNumber(payload.pax, 'pax');
  const totalAmount = requiredNumber(payload.totalAmount, 'totalAmount');
  const paymentOptionSelected = requiredString(payload.paymentOptionSelected, 'paymentOptionSelected');
  const notes = typeof payload.notes === 'string' ? payload.notes.trim() : '';
  const nights = dayDiff(checkIn, checkOut);

  if (!Number.isFinite(nights) || nights <= 0) {
    throw new Error('checkOut must be after checkIn');
  }

  const today = toIsoDate(input.now ?? new Date());
  if (checkIn < today) {
    throw new Error('checkIn cannot be in the past');
  }

  if (!Number.isInteger(pax) || !getPublicGuestOptions().includes(pax)) {
    throw new Error('pax is not allowed');
  }

  const unavailableDate = eachNightInStay(checkIn, checkOut).some(
    (date) => getAvailabilityStateForDate(
      date,
      input.existingOrders,
      input.content.bookingSettings.blockedDates,
    ).state !== 'available',
  );
  if (unavailableDate) {
    throw new Error('Selected dates are unavailable');
  }

  const automaticRate = getAutomaticRateForStay(
    input.content.roomTypes,
    checkIn,
    checkOut,
    input.content.bookingSettings.publicHolidayDates,
  );
  if (automaticRate.id !== rateId) {
    throw new Error('rateId does not match selected stay');
  }

  const subtotal = getRoomRateSubtotal(automaticRate, nights);
  const service = subtotal * 0.1;
  const extraGuestCharge = getExtraGuestCharge(pax, nights, 50, 25);
  const tax = nights > 0 ? 40 : 0;
  const expectedTotal = subtotal + service + extraGuestCharge + tax;
  if (totalAmount !== expectedTotal) {
    throw new Error('totalAmount does not match selected stay');
  }

  const allowedPaymentOptions = getAllowedPaymentOptions(input.content.paymentRules);
  if (!allowedPaymentOptions.includes(paymentOptionSelected as CreateBookingPayload['paymentOptionSelected'])) {
    throw new Error('paymentOptionSelected is not allowed');
  }

  return createBookingOrder({
    existingOrders: input.existingOrders,
    guestName,
    phone,
    email,
    checkIn,
    checkOut,
    pax,
    rateId,
    totalAmount,
    paymentRules: input.content.paymentRules,
    paymentOptionSelected: paymentOptionSelected as CreateBookingPayload['paymentOptionSelected'],
    notes,
    now: input.now,
  });
}

export function parseReceiptUploadPayload(input: unknown): ReceiptUploadPayload {
  const payload = objectPayload(input, 'Invalid receipt payload');
  const bookingId = requiredString(payload.bookingId, 'bookingId');
  const receiptImage = requiredString(payload.receiptImage, 'receiptImage');

  if (receiptImage.length > 7_000_000) {
    throw new Error('receiptImage must be smaller than 7MB');
  }

  if (!receiptImage.startsWith('data:')) {
    throw new Error('receiptImage must be a data URL');
  }

  if (!/^data:(image\/[^;,]+|application\/pdf)[;,]/.test(receiptImage)) {
    throw new Error('receiptImage must be an image or PDF data URL');
  }

  return {
    bookingId,
    receiptImage,
  };
}
