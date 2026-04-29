import { eachNightInStay, toIsoDate } from './date';
import type { BookingOrder, BookingStatus, ManualPaymentSettings, PaymentOptionSelected, PaymentRules, PaymentStatus } from './siteContent';

export type BookingFilter = 'Today' | 'Upcoming' | 'Paid' | 'Pending' | 'Cancelled';
export type AvailabilityState = 'available' | 'booked' | 'pending' | 'blocked';

export interface AvailabilityResult {
  state: AvailabilityState;
  booking?: BookingOrder;
}

export function getPublicGuestOptions() {
  return [20, 25, 30];
}

export function getExtraGuestCharge(guestCount: number, nights: number, ratePerPersonPerNight: number, includedGuests = 25) {
  return Math.max(guestCount - includedGuests, 0) * ratePerPersonPerNight * Math.max(nights, 0);
}

export function selectBookingCalendarDate(input: { checkIn: string; checkOut: string; selectedDate: string }) {
  if (!input.checkIn || input.checkOut || input.selectedDate <= input.checkIn) {
    return {
      checkIn: input.selectedDate,
      checkOut: '',
    };
  }

  return {
    checkIn: input.checkIn,
    checkOut: input.selectedDate,
  };
}

export function dayDiff(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function generateBookingId(existing: BookingOrder[]) {
  const max = existing.reduce((highest, order) => {
    const value = Number(order.id.replace(/\D/g, ''));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 1029);
  return `VKA-${max + 1}`;
}

export function getBookingBalance(totalAmount: number, rules: PaymentRules) {
  const fixedDeposit = Number(rules.depositAmount) || 0;
  const percentageDeposit = Math.round(totalAmount * ((Number(rules.depositPercentage) || 0) / 100));
  const depositAmount = Math.min(totalAmount, fixedDeposit > 0 ? fixedDeposit : percentageDeposit);
  return {
    depositAmount,
    remainingBalance: totalAmount,
  };
}

export function getAllowedPaymentOptions(rules: PaymentRules): PaymentOptionSelected[] {
  if (rules.bookingType === 'Deposit Only') return ['Deposit'];
  if (rules.bookingType === 'Full Payment Only') return ['Full Amount'];
  return ['Deposit', 'Full Amount'];
}

export function getPaymentDueNow(totalAmount: number, depositAmount: number, paymentOption: PaymentOptionSelected) {
  return paymentOption === 'Full Amount' ? totalAmount : depositAmount;
}

export function createBookingOrder(input: {
  existingOrders: BookingOrder[];
  guestName: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  pax: number;
  rateId: string;
  totalAmount: number;
  paymentRules: PaymentRules;
  paymentOptionSelected: PaymentOptionSelected;
  notes?: string;
  now?: Date;
}): BookingOrder {
  const now = input.now ?? new Date();
  const balance = getBookingBalance(input.totalAmount, input.paymentRules);
  return {
    id: generateBookingId(input.existingOrders),
    guestName: input.guestName,
    phone: input.phone,
    email: input.email,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    nights: dayDiff(input.checkIn, input.checkOut),
    pax: input.pax,
    rateId: input.rateId,
    totalAmount: input.totalAmount,
    depositAmount: balance.depositAmount,
    amountPaid: 0,
    remainingBalance: balance.remainingBalance,
    paymentOptionSelected: input.paymentOptionSelected,
    paymentStatus: 'Pending',
    bookingStatus: 'Awaiting Payment',
    paidDate: '',
    receiptImage: '',
    receiptUploadedAt: '',
    paymentRejectedReason: '',
    notes: input.notes ?? '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function getOrderNights(order: BookingOrder) {
  return eachNightInStay(order.checkIn, order.checkOut);
}

export function isActiveBooking(order: BookingOrder) {
  return order.bookingStatus !== 'Cancelled' && order.paymentStatus !== 'Failed' && order.paymentStatus !== 'Refunded' && order.paymentStatus !== 'Rejected';
}

export function getAvailabilityStateForDate(
  date: string,
  orders: BookingOrder[],
  blockedDates: string[],
): AvailabilityResult {
  if (blockedDates.includes(date)) {
    return { state: 'blocked' };
  }

  const booking = orders.find((order) => isActiveBooking(order) && getOrderNights(order).includes(date));
  if (!booking) {
    return { state: 'available' };
  }

  if (booking.paymentStatus === 'Pending' || booking.bookingStatus === 'Awaiting Payment') {
    return { state: 'pending', booking };
  }

  return { state: 'booked', booking };
}

export function buildBookingMetrics(orders: BookingOrder[], todayValue = toIsoDate(new Date())) {
  const today = new Date(`${todayValue}T00:00:00`);
  const month = today.getMonth();
  const year = today.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const activeOrders = orders.filter(isActiveBooking);
  const thisMonthRevenue = activeOrders
    .filter((order) => {
      if (!order.paidDate) return false;
      const paid = new Date(`${order.paidDate}T00:00:00`);
      return paid.getMonth() === month && paid.getFullYear() === year;
    })
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const upcomingOrders = activeOrders.filter((order) => order.checkIn >= todayValue);
  const occupiedNights = activeOrders
    .flatMap(getOrderNights)
    .filter((date) => {
      const value = new Date(`${date}T00:00:00`);
      return value.getMonth() === month && value.getFullYear() === year;
    }).length;

  return {
    thisMonthRevenue,
    upcomingBookings: upcomingOrders.length,
    pendingPayments: activeOrders.filter((order) => order.paymentStatus === 'Pending').length,
    occupancyRate: Math.round((occupiedNights / daysInMonth) * 100),
    averageStayNights: Number((activeOrders.reduce((sum, order) => sum + order.nights, 0) / Math.max(activeOrders.length, 1)).toFixed(2)),
  };
}

export function buildBookingTrend(orders: BookingOrder[], todayValue = toIsoDate(new Date())) {
  const today = new Date(`${todayValue}T00:00:00`);
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const isoDate = toIsoDate(date);
    return {
      date: isoDate,
      count: orders.filter((order) => order.createdAt.slice(0, 10) === isoDate).length,
    };
  });
}

export function filterBookings(orders: BookingOrder[], filter: BookingFilter, todayValue = toIsoDate(new Date())) {
  return orders.filter((order) => {
    if (filter === 'Today') return order.checkIn === todayValue || order.createdAt.slice(0, 10) === todayValue;
    if (filter === 'Upcoming') return order.checkIn >= todayValue && order.bookingStatus !== 'Cancelled';
    if (filter === 'Paid') return order.paymentStatus === 'Deposit Paid' || order.paymentStatus === 'Paid Full';
    if (filter === 'Pending') return order.paymentStatus === 'Pending' || order.bookingStatus === 'Awaiting Payment';
    return order.bookingStatus === 'Cancelled';
  });
}

export function updateBookingStatus(
  order: BookingOrder,
  paymentStatus: PaymentStatus,
  bookingStatus: BookingStatus,
  paidDate = order.paidDate,
) {
  return {
    ...order,
    paymentStatus,
    bookingStatus,
    paidDate,
    amountPaid: paymentStatus === 'Paid Full' ? order.totalAmount : paymentStatus === 'Deposit Paid' ? order.depositAmount : order.amountPaid,
    remainingBalance: paymentStatus === 'Paid Full' ? 0 : paymentStatus === 'Deposit Paid' ? Math.max(order.totalAmount - order.depositAmount, 0) : order.remainingBalance,
    updatedAt: new Date().toISOString(),
  };
}

export function getPaymentActionLabel(order: BookingOrder) {
  if (order.paymentStatus === 'Paid Full') return 'Paid Full';
  if (order.paymentStatus === 'Deposit Paid' && order.remainingBalance > 0) return 'Mark Full Paid';
  return order.paymentOptionSelected === 'Full Amount' ? 'Mark Full Paid' : 'Mark Deposit Paid';
}

export function verifyManualPayment(order: BookingOrder, paymentStatus: Extract<PaymentStatus, 'Deposit Paid' | 'Paid Full'>, paidDate: string) {
  return updateBookingStatus(order, paymentStatus, 'Confirmed', paidDate);
}

export function rejectManualPayment(order: BookingOrder, reason = 'Receipt rejected') {
  return {
    ...order,
    paymentStatus: 'Rejected' as PaymentStatus,
    bookingStatus: 'Cancelled' as BookingStatus,
    paymentRejectedReason: reason,
    updatedAt: new Date().toISOString(),
  };
}

export function buildCustomerPaymentWhatsappMessage(order: BookingOrder, manualPayment: ManualPaymentSettings) {
  const dueNow = getPaymentDueNow(order.totalAmount, order.depositAmount, order.paymentOptionSelected);
  return [
    'Hi Villa Kaseh Ain, saya dah buat booking dan nak confirm payment.',
    `Booking ID: ${order.id}`,
    `Nama: ${order.guestName}`,
    `Tarikh: ${order.checkIn} - ${order.checkOut}`,
    `Pax: ${order.pax}`,
    `Payment Option: ${order.paymentOptionSelected}`,
    `Jumlah Bayar Sekarang: RM ${dueNow.toLocaleString()}`,
    `Bank: ${manualPayment.bankName}`,
    `No Akaun: ${manualPayment.accountNumber}`,
  ].join('\n');
}

export function buildBookingEmailBody(order: BookingOrder, manualPayment: ManualPaymentSettings) {
  const dueNow = getPaymentDueNow(order.totalAmount, order.depositAmount, order.paymentOptionSelected);
  return [
    `Booking ID: ${order.id}`,
    `Guest: ${order.guestName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Check-in: ${order.checkIn}`,
    `Check-out: ${order.checkOut}`,
    `Pax: ${order.pax}`,
    `Payment Option: ${order.paymentOptionSelected}`,
    `Amount Due Now: RM ${dueNow.toLocaleString()}`,
    `Total Amount: RM ${order.totalAmount.toLocaleString()}`,
    `Remaining Balance: RM ${order.remainingBalance.toLocaleString()}`,
    `Bank: ${manualPayment.bankName}`,
    `Account Holder: ${manualPayment.accountHolderName}`,
    `Account Number: ${manualPayment.accountNumber}`,
  ].join('\n');
}

export function renderBookingTemplate(template: string, order: BookingOrder) {
  return template
    .replaceAll('{name}', order.guestName)
    .replaceAll('{checkin}', order.checkIn)
    .replaceAll('{checkout}', order.checkOut)
    .replaceAll('{amount}', order.totalAmount.toLocaleString());
}

export function buildPaymentLink(order: BookingOrder, gateway: string) {
  return `https://payment.example.com/${gateway.toLowerCase()}/${order.id}`;
}
