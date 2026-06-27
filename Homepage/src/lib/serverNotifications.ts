import type { NotificationEmailPayload, NotificationRequestBody } from './notifications.js';

function parseSender() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_FROM_EMAIL;
  const senderName = process.env.RESEND_FROM_NAME || 'Villa Kaseh Ain';

  if (!resendApiKey || !senderEmail) {
    return null;
  }

  return {
    resendApiKey,
    from: `${senderName} <${senderEmail}>`,
  };
}

async function sendEmail(
  resendApiKey: string,
  from: string,
  email: NotificationEmailPayload,
  idempotencyKey: string,
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `${idempotencyKey}-${email.subject}`,
    },
    body: JSON.stringify({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Resend send failed: ${response.status} ${message}`);
  }
}

export async function sendNotificationEmails(body: NotificationRequestBody) {
  const sender = parseSender();
  if (!sender) {
    return { skipped: true, reason: 'Resend environment variables are not configured.' };
  }

  await Promise.all(
    body.emails.map((email, index) =>
      sendEmail(sender.resendApiKey, sender.from, email, `${body.idempotencyKey}-${index}`),
    ),
  );

  return { ok: true, sent: body.emails.length };
}
