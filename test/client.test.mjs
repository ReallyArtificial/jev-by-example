import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate, ENDPOINT } from '../src/client.mjs';

const request = { model: 'jev-1.13.0', state: { proposal: 'Read the log.' }, questions: { allowed: { type: 'noul', instructions: 'Is this a read?' } } };
const response = { model: 'jev-1.13.0', answers: { allowed: { type: 'noul', noul: 0.98 } }, usage: { input_tokens: 42, output_tokens: 5 } };
const json = body => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

test('sends the official method, URL, auth, model, state and questions', async () => {
  const result = await evaluate(request, { apiKey: 'test-key', fetchImpl: async (url, init) => {
    assert.equal(url, ENDPOINT);
    assert.equal(init.method, 'POST');
    assert.equal(init.redirect, 'error');
    assert.equal(init.headers.Authorization, 'Bearer test-key');
    assert.equal(init.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(init.body), request);
    assert.ok(init.signal instanceof AbortSignal);
    return json(response);
  } });
  assert.deepEqual(result.response, response);
  assert.equal(result.attempts, 1);
});
test('missing credentials fail before network access', async () => {
  await assert.rejects(evaluate(request, { apiKey: '', fetchImpl: () => assert.fail('network called') }), /TYPESAFE_API_KEY/);
});
test('429 and 529 back off, honor Retry-After, then return the valid response', async () => {
  const delays = [], responses = [new Response('', { status: 429, headers: { 'retry-after': '2' } }), new Response('', { status: 529 }), json(response)];
  const result = await evaluate(request, { apiKey: 'test', fetchImpl: async () => responses.shift(), wait: async ms => delays.push(ms) });
  assert.deepEqual(delays, [2000, 1000]);
  assert.equal(result.attempts, 3);
});
test('does not retry before a long requested Retry-After', async () => {
  await assert.rejects(evaluate(request, { apiKey: 'test', fetchImpl: async () => new Response('', { status: 429, headers: { 'retry-after': '120' } }), wait: () => assert.fail('wait called') }), /retry later/);
});
test('limits overload retries', async () => {
  let calls = 0;
  await assert.rejects(evaluate(request, { apiKey: 'test', fetchImpl: async () => { calls++; return new Response('', { status: 529 }); }, wait: async () => {} }), /529/);
  assert.equal(calls, 3);
});
test('401 fails once without echoing a response body', async () => {
  let calls = 0;
  await assert.rejects(evaluate(request, { apiKey: 'test', fetchImpl: async () => { calls++; return new Response('SECRET INPUT', { status: 401 }); } }), error => error.message.includes('401') && !error.message.includes('SECRET'));
  assert.equal(calls, 1);
});
test('transport errors are redacted and not retried', async () => {
  let calls = 0;
  await assert.rejects(evaluate(request, { apiKey: 'test', fetchImpl: async () => { calls++; throw new Error('SECRET KEY'); } }), error => !error.message.includes('SECRET') && error.message.includes('timed out'));
  assert.equal(calls, 1);
});
test('invalid JSON and malformed responses do not become decisions', async () => {
  await assert.rejects(evaluate(request, { apiKey: 'test', fetchImpl: async () => new Response('not json') }), /invalid JSON/);
  await assert.rejects(evaluate(request, { apiKey: 'test', fetchImpl: async () => json({ ...response, answers: {} }) }), /answer IDs/);
});

test('--via accepts only loopback http addresses and targets /v1/systemone', async () => {
  const { viaEndpoint } = await import('../src/client.mjs');
  assert.equal(viaEndpoint('http://127.0.0.1:8010'), 'http://127.0.0.1:8010/v1/systemone');
  assert.equal(viaEndpoint('http://localhost:8010/'), 'http://localhost:8010/v1/systemone');
  assert.throws(() => viaEndpoint('https://127.0.0.1:8010'), /loopback http/);
  assert.throws(() => viaEndpoint('http://example.com:8010'), /loopback http/);
  assert.throws(() => viaEndpoint('not a url'), /must be a URL/);
});

test('evaluate posts to the via endpoint when one is given', async () => {
  const request = { model: 'jev-1.13.0', state: 'x', questions: { q: { type: 'noul', instructions: 'Yes?' } } };
  let seen = null;
  const result = await evaluate(request, { apiKey: 'k', endpoint: 'http://127.0.0.1:8010/v1/systemone', fetchImpl: async (url) => { seen = url; return new Response(JSON.stringify({ model: 'jev-1.13.0', answers: { q: { type: 'noul', noul: 0.9 } }, usage: { input_tokens: 1, output_tokens: 0 } }), { status: 200 }); } });
  assert.equal(seen, 'http://127.0.0.1:8010/v1/systemone');
  assert.equal(result.response.answers.q.noul, 0.9);
});
