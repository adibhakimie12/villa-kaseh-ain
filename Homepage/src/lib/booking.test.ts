import assert from 'node:assert/strict';
import {
  buildBookingMetrics,
  getAllowedPaymentOptions,
  getAvailabilityStateForDate,
  getBookingBalance,
  renderBookingTemplate,
} from './booking';
import { defaultSiteContent, normalizeSiteContent, type BookingOrder, type PaymentRules } from './siteContent';

const orders: BookingOrder[] = [
  {
    id: 'VKA-1001',
    guestName: 'Nur Aina',
    phone: '60123456789',
    email: 'aina@example.com',
    checkIn: '2026-05-10',
    checkOut: '2026-05-12',
    nights: 2,
    pax: 12,
    rateId: 'weekend',
    totalAmount: 4400,
    depositAmount: 800,
    amountPaid: 800,
    remainingBalance: 3600,
    paymentOptionSelected: 'Deposit',
    paymentStatus: 'Deposit Paid',
    bookingStatus: 'Confirmed',
    paidDate: '2026-04-28',
    notes: 'Family stay',
    createdAt: '2026-04-20T10:00:00.000Z',
    updatedAt: '2026-04-28T10:00:00.000Z',
  },
  {
    id: 'VKA-1002',
    guestName: 'Farhan',
    phone: '60199887766',
    email: 'farhan@example.com',
    checkIn: '2026-05-15',
    checkOut: '2026-05-16',
    nights: 1,
    pax: 8,
    rateId: 'weekday',
    totalAmount: 1800,
    depositAmount: 500,
    amountPaid: 0,
    remainingBalance: 1800,
    paymentOptionSelected: 'Deposit',
    paymentStatus: 'Pending',
    bookingStatus: 'Awaiting Payment',
    paidDate: '',
    notes: '',
    createdAt: '2026-04-22T10:00:00.000Z',
    updatedAt: '2026-04-22T10:00:00.000Z',
  },
  {
    id: 'VKA-1003',
    guestName: 'Sofia',
    phone: '60111112222',
    email: 'sofia@example.com',
    checkIn: '2026-04-05',
    checkOut: '2026-04-07',
    nights: 2,
    pax: 10,
    rateId: 'event',
    totalAmount: 5600,
    depositAmount: 1000,
    amountPaid: 5600,
    remainingBalance: 0,
    paymentOptionSelected: 'Full Amount',
    paymentStatus: 'Paid Full',
    bookingStatus: 'Completed',
    paidDate: '2026-04-01',
    notes: '',
    createdAt: '2026-03-20T10:00:00.000Z',
    updatedAt: '2026-04-07T10:00:00.000Z',
  },
];

const rules: PaymentRules = {
  bookingType: 'Deposit + Full Payment Choice',
  depositAmount: 500,
  depositPercentage: 30,
  autoCancelAfterHours: 1,
  refundable: true,
};

assert.deepEqual(buildBookingMetrics(orders, '2026-04-29'), {
  thisMonthRevenue: 10000,
  upcomingBookings: 2,
  pendingPayments: 1,
  occupancyRate: 7,
  averageStayNights: 1.67,
});

assert.equal(getAvailabilityStateForDate('2026-05-10', orders, ['2026-05-20']).state, 'booked');
assert.equal(getAvailabilityStateForDate('2026-05-15', orders, ['2026-05-20']).state, 'pending');
assert.equal(getAvailabilityStateForDate('2026-05-20', orders, ['2026-05-20']).state, 'blocked');
assert.equal(getAvailabilityStateForDate('2026-05-21', orders, ['2026-05-20']).state, 'available');

assert.deepEqual(getBookingBalance(1800, rules), {
  depositAmount: 500,
  remainingBalance: 1800,
});

assert.deepEqual(getAllowedPaymentOptions(rules), ['Deposit', 'Full Amount']);
assert.deepEqual(getAllowedPaymentOptions({ ...rules, bookingType: 'Deposit Only' }), ['Deposit']);
assert.deepEqual(getAllowedPaymentOptions({ ...rules, bookingType: 'Full Payment Only' }), ['Full Amount']);

assert.equal(
  renderBookingTemplate('Hi {name},\n{checkin} - {checkout}\nRM {amount}', orders[0]),
  'Hi Nur Aina,\n2026-05-10 - 2026-05-12\nRM 4,400',
);

assert.equal(defaultSiteContent.automationSettings.adminAlerts.ownerEmail, 'owner@villakasehain.com');
assert.equal(defaultSiteContent.automationSettings.adminAlerts.ownerWhatsappNumber, '60166341564');
assert.equal(
  normalizeSiteContent({
    automationSettings: {
      ...defaultSiteContent.automationSettings,
      adminAlerts: {
        ...defaultSiteContent.automationSettings.adminAlerts,
        ownerEmail: 'boss@example.com',
      },
    },
  }).automationSettings.adminAlerts.ownerEmail,
  'boss@example.com',
);

console.log('booking helper tests passed');
