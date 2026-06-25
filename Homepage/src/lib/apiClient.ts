import type {
  BookingAdminAction,
  BookingResponse,
  BookingsResponse,
  CreateBookingPayload,
  ReceiptUploadPayload,
  SiteContentResponse,
} from './apiTypes';
import type { SiteContent } from './siteContent';

type TokenGetter = () => Promise<string | null>;

async function buildHeaders(getToken?: TokenGetter) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (getToken) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body.error === 'string' ? body.error : `Request failed with ${response.status}`;
    throw new Error(message);
  }
  return body as T;
}

export async function fetchSiteContentFromApi() {
  return apiRequest<SiteContentResponse>('/api/site-content');
}

export async function saveSiteContentToApi(content: SiteContent, getToken: TokenGetter) {
  return apiRequest<SiteContentResponse>('/api/site-content', {
    method: 'PUT',
    headers: await buildHeaders(getToken),
    body: JSON.stringify({ content }),
  });
}

export async function fetchBookingsFromApi(getToken: TokenGetter) {
  return apiRequest<BookingsResponse>('/api/bookings', {
    headers: await buildHeaders(getToken),
  });
}

export async function createBookingViaApi(payload: CreateBookingPayload) {
  return apiRequest<BookingResponse>('/api/bookings', {
    method: 'POST',
    headers: await buildHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function updateBookingViaApi(action: BookingAdminAction, getToken: TokenGetter) {
  return apiRequest<BookingResponse>('/api/bookings', {
    method: 'PATCH',
    headers: await buildHeaders(getToken),
    body: JSON.stringify(action),
  });
}

export async function uploadReceiptViaApi(payload: ReceiptUploadPayload) {
  return apiRequest<BookingResponse>('/api/bookings/receipt', {
    method: 'PATCH',
    headers: await buildHeaders(),
    body: JSON.stringify(payload),
  });
}
