import type { BookingOrder, SiteContent } from './siteContent';

export interface ApiErrorBody {
  error: string;
}

export interface SiteContentResponse {
  content: SiteContent;
  source: 'database' | 'default';
}

export interface BookingsResponse {
  bookings: BookingOrder[];
}

export interface BookingResponse {
  booking: BookingOrder;
}

export interface CreateBookingPayload {
  guestName: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  pax: number;
  rateId: string;
  totalAmount: number;
  paymentOptionSelected: BookingOrder['paymentOptionSelected'];
  notes: string;
}

export interface ReceiptUploadPayload {
  bookingId: string;
  receiptImage: string;
}

export type VerifiedPaymentStatus = Extract<BookingOrder['paymentStatus'], 'Deposit Paid' | 'Paid Full'>;

export type BookingAdminAction =
  | { type: 'verify-payment'; bookingId: string; paymentStatus: VerifiedPaymentStatus; today: string }
  | { type: 'reject-payment'; bookingId: string; reason?: string }
  | { type: 'set-booking-status'; bookingId: string; bookingStatus: BookingOrder['bookingStatus'] }
  | { type: 'set-payment-status'; bookingId: string; paymentStatus: BookingOrder['paymentStatus']; bookingStatus: BookingOrder['bookingStatus'] }
  | { type: 'update-notes'; bookingId: string; notes: string };
