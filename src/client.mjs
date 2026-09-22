import { setTimeout as sleep } from 'node:timers/promises';
import { validateRequest, validateResponse } from './contract.mjs';

export const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
export const DEFAULT_MODEL = 'jev-1.13.0';
// Fixed official host. The only alternative is a loopback proxy (--via), so the API key never
// leaves this machine except toward api.typesafe.ai. Used with shadow tools such as stuntdouble.
export function viaEndpoint(via) {
  let url;
  try { url = new URL(via); } catch { throw new Error(`--via must be a URL such as http://127.0.0.1:8010, got: ${via}`); }
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname === '::1' ? '[::1]' : url.hostname)) throw new Error('--via only accepts a loopback http:// address, so your API key stays on this machine.');
  return `${url.origin}/v1/systemone`;
}
export async function evaluate(request, {
  apiKey = process.env.TYPESAFE_API_KEY,
  fetchImpl = globalThis.fetch,
  wait = sleep,
  timeoutMs = 30_000,
  retries = 2,
  endpoint = ENDPOINT,
} = {}) {
  validateRequest(request);
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('Set TYPESAFE_API_KEY in your environment or .env before using --live.');
  const start = performance.now();
  for (let attempt = 0; attempt <= retries; attempt++) {
    let response;
    try {
      response = await fetchImpl(endpoint, {
        method: 'POST', redirect: 'error',
        headers: { Authorization: `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(request), signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      // Do not echo transport errors or response bodies: they may contain inputs.
      throw new Error('Jev request failed or timed out. No automatic retry after an uncertain transport failure.');
    }
    if ([429, 529].includes(response.status) && attempt < retries) {
      const retryAfter = response.headers.get('retry-after');
      const seconds = retryAfter === null ? NaN : Number(retryAfter);
      const headerMs = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter ?? '') - Date.now();
      const delay = Math.max(500 * 2 ** attempt, Number.isFinite(headerMs) ? headerMs : 0);
      await response.body?.cancel();
      if (delay > 30_000) throw new Error(`Jev HTTP ${response.status}: requested backoff exceeds 30 seconds; retry later.`);
      await wait(delay);
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      const hint = ({ 401: 'Check your API key.', 422: 'Check the request against docs.typesafe.ai/api.', 429: 'Rate limit reached.', 529: 'Service overloaded.' })[response.status] ?? 'Request rejected.';
      throw new Error(`Jev HTTP ${response.status}. ${hint}`);
    }
    let body;
    try { body = await response.json(); } catch { throw new Error('Jev returned invalid JSON.'); }
    validateResponse(body, request.questions);
    return { response: body, elapsedMs: Math.round(performance.now() - start), attempts: attempt + 1 };
  }
}
