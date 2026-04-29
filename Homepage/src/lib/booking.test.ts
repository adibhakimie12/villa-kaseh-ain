import assert from 'node:assert/strict';
import {
  buildCustomerPaymentWhatsappMessage,
  buildBookingMetrics,
  getPaymentActionLabel,
  getAllowedPaymentOptions,
  getAvailabilityStateForDate,
  getBookingBalance,
  renderBookingTemplate,
  verifyManualPayment,
} from './booking';
import { defaultSiteContent, normalizeSiteContent, type BookingOrder, type ManualPaymentSettings, type PaymentRules } from './siteContent';

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
    receiptImage: '',
    receiptUploadedAt: '',
    paymentRejectedReason: '',
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
    receiptImage: '',
    receiptUploadedAt: '',
    paymentRejectedReason: '',
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
    receiptImage: '',
    receiptUploadedAt: '',
    paymentRejectedReason: '',
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
assert.equal(getAvailabilityStateForDate('2026-05-15', [{ ...orders[1], bookingStatus: 'Cancelled' }], []).state, 'available');

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
assert.equal(defaultSiteContent.manualPayment.bankName, 'Maybank');
assert.equal(defaultSiteContent.paymentGateway.activeGateway, 'manual');
assert.equal(
  normalizeSiteContent({
    manualPayment: {
      ...defaultSiteContent.manualPayment,
      accountNumber: '1234567890',
    },
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
assert.equal(normalizeSiteContent({}).manualPayment.accountNumber, defaultSiteContent.manualPayment.accountNumber);

assert.equal(getPaymentActionLabel(orders[1]), 'Mark Deposit Paid');
assert.equal(getPaymentActionLabel({ ...orders[1], paymentOptionSelected: 'Full Amount' }), 'Mark Full Paid');
assert.equal(getPaymentActionLabel(orders[2]), 'Paid Full');
assert.equal(getPaymentActionLabel(orders[0]), 'Mark Full Paid');

const verifiedDeposit = verifyManualPayment(orders[1], 'Deposit Paid', '2026-04-29');
assert.equal(verifiedDeposit.amountPaid, 500);
assert.equal(verifiedDeposit.remainingBalance, 1300);
assert.equal(verifiedDeposit.paymentStatus, 'Deposit Paid');
assert.equal(verifiedDeposit.bookingStatus, 'Confirmed');

const verifiedFull = verifyManualPayment(orders[1], 'Paid Full', '2026-04-29');
assert.equal(verifiedFull.amountPaid, 1800);
assert.equal(verifiedFull.remainingBalance, 0);
assert.equal(verifiedFull.paymentStatus, 'Paid Full');

const manualPayment: ManualPaymentSettings = {
  enabled: true,
  bankName: 'Maybank',
  accountHolderName: 'Villa Owner',
  accountNumber: '1234567890',
  qrImage: 'data:image/png;base64,abc',
  instructions: 'Transfer and send receipt.',
};

const paymentMessage = buildCustomerPaymentWhatsappMessage(orders[1], manualPayment);
assert.ok(paymentMessage.includes('VKA-1002'));
assert.ok(paymentMessage.includes('RM 500'));
assert.ok(paymentMessage.includes('Maybank'));

console.log('booking helper tests passed');
