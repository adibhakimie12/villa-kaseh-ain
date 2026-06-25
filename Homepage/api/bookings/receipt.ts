import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bookingOrderFromRow, type BookingRow, parseReceiptUploadPayload } from '../../src/lib/bookingPersistence';
import { getSql } from '../../src/lib/db';
import { buildNotificationRequest } from '../../src/lib/notifications';
import { defaultSiteContent, normalizeSiteContent } from '../../src/lib/siteContent';
import { sendNotificationEmails } from '../../src/lib/serverNotifications';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'PATCH') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const payload = parseReceiptUploadPayload(req.body);
    const sql = getSql();
    const uploadedAt = new Date().toISOString();
    await sql`
      update bookings
      set receipt_image = ${payload.receiptImage},
          receipt_uploaded_at = ${uploadedAt},
          payment_rejected_reason = '',
          updated_at = ${uploadedAt}
      where id = ${payload.bookingId}
    `;

    const rows = await sql`select * from bookings where id = ${payload.bookingId} limit 1`;
    if (!rows[0]) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    const contentRows = await sql`select content from site_content where slug = 'main' limit 1`;
    const content = contentRows[0]?.content ? normalizeSiteContent(contentRows[0].content) : defaultSiteContent;
    const booking = bookingOrderFromRow(rows[0] as BookingRow);
    const notification = buildNotificationRequest('receipt-uploaded', booking, content);
    if (notification) {
      await sendNotificationEmails(notification);
    }
    res.status(200).json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    res.status(message.includes('required') || message.includes('data URL') ? 400 : 500).json({ error: message });
  }
}
