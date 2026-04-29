import assert from 'node:assert/strict';
import {
  buildNotificationSubject,
  buildNotificationText,
  buildCustomerPaymentWhatsappMessage,
  buildBookingMetrics,
  buildBookingTrend,
  getExtraGuestCharge,
  getPaymentActionLabel,
  getPublicGuestOptions,
  getAllowedPaymentOptions,
  getAvailabilityStateForDate,
  getAutomaticRateForStay,
  getBookingBalance,
  getPublicRoomRates,
  getRoomRateSubtotal,
  selectBookingCalendarDate,
  renderBookingTemplate,
  verifyManualPayment,
} from './booking';
import {
  defaultSiteContent,
  getEffectivePaymentGateway,
  isGatewayConfigured,
  normalizeSiteContent,
  type BookingOrder,
  type ManualPaymentSettings,
  type PaymentRules,
} from './siteContent';
import { buildNotificationRequest } from './notifications';
import { ADMIN_ROUTE, normalizePath } from './routes';

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

const trendTotal = buildBookingTrend(orders, '2026-04-29').reduce((sum, item) => sum + item.count, 0);
assert.equal(trendTotal, 2);
const cancelledTrendTotal = buildBookingTrend([{ ...orders[1], bookingStatus: 'Cancelled' }], '2026-04-29').reduce((sum, item) => sum + item.count, 0);
assert.equal(cancelledTrendTotal, 0);

assert.equal(getAvailabilityStateForDate('2026-05-10', orders, ['2026-05-20']).state, 'booked');
assert.equal(getAvailabilityStateForDate('2026-05-15', orders, ['2026-05-20']).state, 'pending');
assert.equal(getAvailabilityStateForDate('2026-05-20', orders, ['2026-05-20']).state, 'blocked');
assert.equal(getAvailabilityStateForDate('2026-05-21', orders, ['2026-05-20']).state, 'available');
assert.equal(getAvailabilityStateForDate('2026-05-15', [{ ...orders[1], bookingStatus: 'Cancelled' }], []).state, 'available');

assert.deepEqual(getPublicRoomRates(defaultSiteContent.roomTypes).map((rate) => rate.id), ['mon-thu', 'thu-fri', 'weekend-1n']);
assert.equal(getAutomaticRateForStay(defaultSiteContent.roomTypes, '2026-05-04', '2026-05-05').id, 'mon-thu');
assert.equal(getAutomaticRateForStay(defaultSiteContent.roomTypes, '2026-05-07', '2026-05-08').id, 'thu-fri');
assert.equal(getAutomaticRateForStay(defaultSiteContent.roomTypes, '2026-05-08', '2026-05-10').id, 'weekend-2n');
assert.equal(getAutomaticRateForStay(defaultSiteContent.roomTypes, '2026-05-08', '2026-05-11').id, 'weekend-3n');
assert.equal(getAutomaticRateForStay(defaultSiteContent.roomTypes, '2026-05-01', '2026-05-02', ['2026-05-01']).id, 'weekend-1n');
assert.equal(getRoomRateSubtotal(defaultSiteContent.roomTypes.find((rate) => rate.id === 'weekend-2n')!, 2), 3800);

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
assert.equal(isGatewayConfigured(defaultSiteContent, 'manual'), true);
assert.equal(isGatewayConfigured(defaultSiteContent, 'billplz'), false);
assert.equal(getEffectivePaymentGateway(defaultSiteContent), 'manual');
assert.equal(
  getEffectivePaymentGateway(
    normalizeSiteContent({
      paymentGateway: {
        ...defaultSiteContent.paymentGateway,
        activeGateway: 'billplz',
        billplz: {
          enabled: true,
          apiKey: 'api',
          xSignature: 'sig',
          collectionId: 'col',
          mode: 'Live',
        },
      },
    }),
  ),
  'billplz',
);
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
assert.ok(paymentMessage.includes('RM500'));
assert.ok(paymentMessage.includes('Saya juga akan upload receipt pembayaran.'));
assert.ok(paymentMessage.includes('Phone: 60199887766'));

assert.equal(buildNotificationSubject('new-booking', orders[1]), '[Booking VKA-1002] New booking received');
assert.equal(buildNotificationSubject('receipt-uploaded', orders[1]), 'New Booking Receipt Submitted - VKA-1002');
assert.equal(buildNotificationSubject('payment-verified', verifiedDeposit), '[Booking VKA-1002] Deposit payment verified');
assert.equal(buildNotificationSubject('payment-verified', verifiedFull), '[Booking VKA-1002] Full payment verified');
assert.ok(buildNotificationText('new-booking', orders[1], manualPayment).includes('Booking ID: VKA-1002'));
assert.ok(buildNotificationText('new-booking', orders[1], manualPayment).includes('Amount Due Now: RM 500'));
assert.ok(buildNotificationText('receipt-uploaded', orders[1], manualPayment).includes('Receipt uploaded'));
assert.ok(buildNotificationText('payment-verified', verifiedDeposit, manualPayment).includes('Payment Status: Deposit Paid'));
assert.ok(buildNotificationText('payment-verified', verifiedDeposit, manualPayment).includes('Deposit payment has been verified by admin.'));
assert.ok(buildNotificationText('payment-verified', verifiedFull, manualPayment).includes('Full payment has been verified by admin.'));

const notificationContent = normalizeSiteContent({
  manualPayment,
});
const newBookingNotification = buildNotificationRequest('new-booking', orders[1], notificationContent);
assert.ok(newBookingNotification);
assert.equal(newBookingNotification?.emails.length, 2);
assert.deepEqual(newBookingNotification?.emails[0]?.to, ['owner@villakasehain.com']);

const receiptNotification = buildNotificationRequest('receipt-uploaded', { ...orders[1], receiptUploadedAt: '2026-04-29T10:00:00.000Z' }, notificationContent);
assert.ok(receiptNotification);
assert.equal(receiptNotification?.emails.length, 1);
assert.deepEqual(receiptNotification?.emails[0]?.to, ['owner@villakasehain.com']);
assert.equal(receiptNotification?.emails[0]?.subject, 'New Booking Receipt Submitted - VKA-1002');
assert.ok(receiptNotification?.emails[0]?.text.includes('Guest: Farhan'));

const verifiedDepositNotification = buildNotificationRequest('payment-verified', verifiedDeposit, notificationContent);
assert.ok(verifiedDepositNotification);
assert.equal(verifiedDepositNotification?.emails.length, 2);
assert.equal(verifiedDepositNotification?.emails[0]?.subject, '[Booking VKA-1002] Deposit payment verified');
assert.equal(verifiedDepositNotification?.emails[1]?.subject, 'Booking Confirmed – Villa Kaseh Ain');
assert.ok(verifiedDepositNotification?.emails[1]?.text.includes('Guest Name: Farhan'));
assert.ok(verifiedDepositNotification?.emails[1]?.text.includes('Remaining Balance: RM 1,300'));
assert.ok(verifiedDepositNotification?.emails[1]?.text.includes('Booking anda kini confirmed.'));

const verifiedFullNotification = buildNotificationRequest('payment-verified', verifiedFull, notificationContent);
assert.ok(verifiedFullNotification);
assert.equal(verifiedFullNotification?.emails.length, 2);
assert.equal(verifiedFullNotification?.emails[0]?.subject, '[Booking VKA-1002] Full payment verified');
assert.equal(verifiedFullNotification?.emails[1]?.subject, 'Booking Confirmed – Villa Kaseh Ain');
assert.ok(verifiedFullNotification?.emails[1]?.text.includes('Amount Paid: RM 1,800'));
assert.ok(verifiedFullNotification?.emails[1]?.text.includes('Booking anda kini fully paid.'));

assert.equal(ADMIN_ROUTE, '/adminvka');
assert.equal(normalizePath('/adminvka'), '/adminvka');
assert.equal(normalizePath('/admin'), '/');

assert.deepEqual(getPublicGuestOptions(), [20, 25, 30]);
assert.equal(getExtraGuestCharge(25, 2, 50), 0);
assert.equal(getExtraGuestCharge(30, 2, 50), 500);
assert.deepEqual(selectBookingCalendarDate({ checkIn: '', checkOut: '', selectedDate: '2026-05-10' }), {
  checkIn: '2026-05-10',
  checkOut: '',
});
assert.deepEqual(selectBookingCalendarDate({ checkIn: '2026-05-10', checkOut: '', selectedDate: '2026-05-12' }), {
  checkIn: '2026-05-10',
  checkOut: '2026-05-12',
});
assert.deepEqual(selectBookingCalendarDate({ checkIn: '2026-05-10', checkOut: '2026-05-12', selectedDate: '2026-05-15' }), {
  checkIn: '2026-05-15',
  checkOut: '',
});
assert.deepEqual(selectBookingCalendarDate({ checkIn: '2026-05-10', checkOut: '', selectedDate: '2026-05-09' }), {
  checkIn: '2026-05-09',
  checkOut: '',
});

console.log('booking helper tests passed');
