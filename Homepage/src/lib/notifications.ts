import {
  buildNotificationSubject,
  buildNotificationText,
  type BookingNotificationEvent,
} from './booking';
import type { BookingOrder, SiteContent } from './siteContent';

export interface NotificationEmailPayload {
  to: string[];
  subject: string;
  text: string;
}

export interface NotificationRequestBody {
  event: BookingNotificationEvent;
  bookingId: string;
  idempotencyKey: string;
  emails: NotificationEmailPayload[];
}

function uniqueEmails(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function buildNotificationRequest(
  event: BookingNotificationEvent,
  order: BookingOrder,
  content: SiteContent,
): NotificationRequestBody | null {
  const ownerEmail = content.automationSettings.adminAlerts.ownerEmail.trim();
  const emails: NotificationEmailPayload[] = [];
  const baseSubject = buildNotificationSubject(event, order);
  const baseText = buildNotificationText(event, order, content.manualPayment);

  if (event === 'new-booking') {
    const ownerRecipients = content.automationSettings.adminAlerts.newBooking ? uniqueEmails([ownerEmail]) : [];
    const guestRecipients = content.automationSettings.email.bookingConfirmation ? uniqueEmails([order.email]) : [];

    if (ownerRecipients.length) {
      emails.push({
        to: ownerRecipients,
        subject: baseSubject,
        text: `${baseText}\n\nOwner alert: new booking requires review.`,
      });
    }

    if (guestRecipients.length) {
      emails.push({
        to: guestRecipients,
        subject: `Villa Kaseh Ain booking received - ${order.id}`,
        text: `${baseText}\n\nKami sudah terima booking anda dan sedang menunggu pembayaran / semakan receipt.`,
      });
    }
  }

  if (event === 'receipt-uploaded') {
    const ownerRecipients = content.automationSettings.adminAlerts.paymentReceived ? uniqueEmails([ownerEmail]) : [];
    if (ownerRecipients.length) {
      emails.push({
        to: ownerRecipients,
        subject: baseSubject,
        text: `${baseText}\n\nCustomer uploaded receipt and booking is awaiting verification.`,
      });
    }
  }

  if (event === 'payment-verified') {
    const ownerRecipients = content.automationSettings.adminAlerts.paymentReceived ? uniqueEmails([ownerEmail]) : [];
    const guestRecipients = content.automationSettings.email.paymentSuccess ? uniqueEmails([order.email]) : [];

    if (ownerRecipients.length) {
      emails.push({
        to: ownerRecipients,
        subject: baseSubject,
        text: `${baseText}\n\nPayment verified successfully in admin panel.`,
      });
    }

    if (guestRecipients.length) {
      const guestPaymentMessage =
        order.paymentStatus === 'Paid Full'
          ? 'Bayaran penuh anda telah disahkan.\n\nBooking anda kini fully paid.'
          : order.paymentStatus === 'Deposit Paid'
            ? `Deposit payment anda telah disahkan.\n\nBaki semasa: RM ${order.remainingBalance.toLocaleString()}.`
            : 'Bayaran anda telah disahkan. Terima kasih.';

      emails.push({
        to: guestRecipients,
        subject:
          order.paymentStatus === 'Paid Full'
            ? `Villa Kaseh Ain full payment verified - ${order.id}`
            : order.paymentStatus === 'Deposit Paid'
              ? `Villa Kaseh Ain deposit payment verified - ${order.id}`
              : `Villa Kaseh Ain payment verified - ${order.id}`,
        text: `${baseText}\n\n${guestPaymentMessage}`,
      });
    }
  }

  if (!emails.length) {
    return null;
  }

  const stamp =
    event === 'new-booking'
      ? order.createdAt
      : event === 'receipt-uploaded'
        ? order.receiptUploadedAt || order.updatedAt
        : order.paidDate || order.updatedAt;

  return {
    event,
    bookingId: order.id,
    idempotencyKey: `${event}-${order.id}-${stamp}`,
    emails,
  };
}

export async function sendNotificationRequest(body: NotificationRequestBody | null) {
  if (!body) {
    return;
  }

  try {
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await response.text();
      console.error('Notification request returned error', response.status, message);
    }
  } catch (error) {
    console.error('Notification request failed', error);
  }
}
