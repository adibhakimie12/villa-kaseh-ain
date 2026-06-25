import { createClerkClient, verifyToken } from '@clerk/backend';

interface HeaderRequestLike {
  headers?: Record<string, string | string[] | undefined>;
}

export function parseAdminEmails(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | undefined, allowlist: string | undefined) {
  if (!email) return false;
  return parseAdminEmails(allowlist).includes(email.trim().toLowerCase());
}

function getBearerToken(req: HeaderRequestLike) {
  const authorization = req.headers?.authorization;
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  return value?.startsWith('Bearer ') ? value.slice('Bearer '.length) : '';
}

export async function requireAdminFromRequest(req: HeaderRequestLike) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    return { ok: false as const, status: 500, error: 'CLERK_SECRET_KEY is not configured.' };
  }

  const token = getBearerToken(req);
  if (!token) {
    return { ok: false as const, status: 401, error: 'Missing Clerk token.' };
  }

  const clerk = createClerkClient({ secretKey });
  const claims = await verifyToken(token, { secretKey });
  const userId = claims.sub;
  const user = await clerk.users.getUser(userId);
  const email =
    user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)?.emailAddress
    ?? user.emailAddresses[0]?.emailAddress
    ?? '';

  if (!isAllowedAdminEmail(email, process.env.ADMIN_EMAILS)) {
    return { ok: false as const, status: 403, error: 'This Clerk user is not an admin.' };
  }

  return { ok: true as const, email, userId };
}
