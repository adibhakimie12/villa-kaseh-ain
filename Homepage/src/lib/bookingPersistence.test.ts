import assert from 'node:assert/strict';
import {
  bookingOrderFromRow,
  bookingOrderToRow,
  buildCreateBookingOrder,
  parseReceiptUploadPayload,
} from './bookingPersistence';
import { defaultSiteContent, normalizeSiteContent, type BookingOrder } from './siteContent';

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

assert.deepEqual(bookingOrderFromRow({
  ...row,
  nights: '2',
  pax: '20',
  total_amount: '3800',
  deposit_amount: '1800',
  amount_paid: '0',
  remaining_balance: '3800',
}), order);

assert.deepEqual(bookingOrderFromRow({
  ...row,
  created_at: new Date('2026-06-25T10:00:00.000Z'),
  updated_at: new Date('2026-06-25T10:00:00.000Z'),
}), order);

const created = buildCreateBookingOrder({
  payload: {
    guestName: 'Farhan',
    phone: '60199887766',
    email: 'farhan@example.com',
    checkIn: '2026-08-07',
    checkOut: '2026-08-09',
    pax: 20,
    rateId: 'weekend-2n',
    totalAmount: 4220,
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
    payload: { ...created, totalAmount: 3800 },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /totalAmount does not match selected stay/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, paymentOptionSelected: 'Deposit' },
    existingOrders: [],
    content: normalizeSiteContent({
      paymentRules: {
        ...defaultSiteContent.paymentRules,
        bookingType: 'Full Payment Only',
      },
    }),
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /paymentOptionSelected is not allowed/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, checkIn: '2026-99-99' },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /checkIn must be a valid date/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: {
      ...created,
      checkIn: '2026-06-24',
      checkOut: '2026-06-26',
      rateId: 'thu-fri',
      totalAmount: 4220,
    },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /checkIn cannot be in the past/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created },
    existingOrders: [],
    content: normalizeSiteContent({
      bookingSettings: {
        ...defaultSiteContent.bookingSettings,
        blockedDates: ['2026-08-08'],
      },
    }),
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /Selected dates are unavailable/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, rateId: 'weekend-1n' },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /rateId does not match selected stay/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: null as unknown as Parameters<typeof buildCreateBookingOrder>[0]['payload'],
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /Invalid create booking payload/,
);

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
  () => buildCreateBookingOrder({
    payload: { ...created, pax: 0 },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /pax must be a positive number/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, pax: 1, totalAmount: 4220 },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /pax is not allowed/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, pax: 20.5, totalAmount: 4220 },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /pax is not allowed/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, pax: 999, totalAmount: 101620 },
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /pax is not allowed/,
);

assert.throws(
  () => buildCreateBookingOrder({
    payload: { ...created, totalAmount: '' } as unknown as Parameters<typeof buildCreateBookingOrder>[0]['payload'],
    existingOrders: [],
    content: defaultSiteContent,
    now: new Date('2026-06-25T12:00:00.000Z'),
  }),
  /totalAmount must be a positive number/,
);

assert.throws(
  () => parseReceiptUploadPayload({ bookingId: 'VKA-1', receiptImage: 'not-data-url' }),
  /receiptImage must be a data URL/,
);

assert.throws(
  () => parseReceiptUploadPayload(null),
  /Invalid receipt payload/,
);

assert.throws(
  () => parseReceiptUploadPayload({
    bookingId: 'VKA-1',
    receiptImage: 'data:text/plain;base64,abc',
  }),
  /receiptImage must be an image or PDF data URL/,
);

assert.throws(
  () => parseReceiptUploadPayload({
    bookingId: 'VKA-1',
    receiptImage: `data:image/png;base64,${'a'.repeat(7_000_000)}`,
  }),
  /receiptImage must be smaller than 7MB/,
);

assert.deepEqual(parseReceiptUploadPayload({
  bookingId: 'VKA-1',
  receiptImage: 'data:image/png;base64,abc',
}), {
  bookingId: 'VKA-1',
  receiptImage: 'data:image/png;base64,abc',
});

assert.deepEqual(parseReceiptUploadPayload({
  bookingId: 'VKA-1',
  receiptImage: 'data:application/pdf;base64,abc',
}), {
  bookingId: 'VKA-1',
  receiptImage: 'data:application/pdf;base64,abc',
});
