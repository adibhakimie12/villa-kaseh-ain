import assert from 'node:assert/strict';
import { apiRequest, fetchSiteContentFromApi, saveSiteContentToApi } from './apiClient';
import { defaultSiteContent } from './siteContent';

let lastRequest: { url: string; init?: RequestInit } | null = null;

globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  lastRequest = { url: String(url), init };
  if (String(url) === '/api/site-content' && init?.method === 'PUT') {
    return new Response(JSON.stringify({ content: defaultSiteContent, source: 'database' }), { status: 200 });
  }
  if (String(url) === '/api/site-content') {
    return new Response(JSON.stringify({ content: defaultSiteContent, source: 'database' }), { status: 200 });
  }
  return new Response(JSON.stringify({ error: 'Nope' }), { status: 500 });
}) as typeof fetch;

const content = await fetchSiteContentFromApi();
assert.equal(content.content.siteConfig.name, 'Villa Kaseh Ain');

await saveSiteContentToApi(defaultSiteContent, async () => 'token-123');
assert.equal(lastRequest?.url, '/api/site-content');
assert.equal(lastRequest?.init?.method, 'PUT');
assert.equal((lastRequest?.init?.headers as Record<string, string>).Authorization, 'Bearer token-123');

await assert.rejects(() => apiRequest('/api/missing'), /Nope/);
