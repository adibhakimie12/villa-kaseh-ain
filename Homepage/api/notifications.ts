interface ApiRequestLike {
  method?: string;
  body?: unknown;
}

interface ApiResponseLike {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponseLike;
  json: (value: unknown) => void;
  end: (value?: string) => void;
}

interface NotificationEmailPayload {
  to: string[];
  subject: string;
  text: string;
}

interface NotificationRequestBody {
  event: string;
  bookingId: string;
  idempotencyKey: string;
  emails: NotificationEmailPayload[];
}

function parseBody(input: unknown): NotificationRequestBody | null {
  const parsed = typeof input === 'string' ? JSON.parse(input) : input;
  if (!parsed || typeof parsed !== 'object') return null;

  const candidate = parsed as Partial<NotificationRequestBody>;
  if (!candidate.event || !candidate.bookingId || !candidate.idempotencyKey || !Array.isArray(candidate.emails)) {
    return null;
  }

  return {
    event: candidate.event,
    bookingId: candidate.bookingId,
    idempotencyKey: candidate.idempotencyKey,
    emails: candidate.emails.filter(
      (email): email is NotificationEmailPayload =>
        Array.isArray(email?.to) &&
        email.to.every((value) => typeof value === 'string') &&
        typeof email.subject === 'string' &&
        typeof email.text === 'string',
    ),
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

export default async function handler(req: ApiRequestLike, res: ApiResponseLike) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_FROM_EMAIL;
  const senderName = process.env.RESEND_FROM_NAME || 'Villa Kaseh Ain';

  if (!resendApiKey || !senderEmail) {
    res.status(202).json({ skipped: true, reason: 'Resend environment variables are not configured.' });
    return;
  }

  const body = parseBody(req.body);
  if (!body || !body.emails.length) {
    res.status(400).json({ error: 'Invalid notification payload' });
    return;
  }

  const from = `${senderName} <${senderEmail}>`;

  try {
    await Promise.all(
      body.emails.map((email, index) => sendEmail(resendApiKey, from, email, `${body.idempotencyKey}-${index}`)),
    );
    res.status(200).json({ ok: true, sent: body.emails.length });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send emails',
    });
  }
}
