import { sendNotificationEmails } from '../src/lib/serverNotifications';
import type { NotificationEmailPayload, NotificationRequestBody } from '../src/lib/notifications';

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

function parseBody(input: unknown): NotificationRequestBody | null {
  const parsed = typeof input === 'string' ? JSON.parse(input) : input;
  if (!parsed || typeof parsed !== 'object') return null;

  const candidate = parsed as Partial<NotificationRequestBody>;
  if (!candidate.event || !candidate.bookingId || !candidate.idempotencyKey || !Array.isArray(candidate.emails)) {
    return null;
  }

  return {
    event: candidate.event as NotificationRequestBody['event'],
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

  const body = parseBody(req.body);
  if (!body || !body.emails.length) {
    res.status(400).json({ error: 'Invalid notification payload' });
    return;
  }

  try {
    const result = await sendNotificationEmails(body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to send emails',
    });
  }
}
