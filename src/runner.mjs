import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { evaluate, DEFAULT_MODEL } from './client.mjs';
import { fixtureResponse } from './fixtures.mjs';
import { validateRequest, validateResponse } from './contract.mjs';

export const digest = (value) => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export function prepare(example, c, model = DEFAULT_MODEL) {
  const preflight = example.preflight?.(c.state);
  if (preflight) return { preflight, request: null };
  return { preflight: null, request: validateRequest({ model, state: c.state, questions: example.questions(c.state, c) }) };
}
export function matchesExpected(result, c) {
  return result.action === c.expected && Object.entries(c.expectedDetails ?? {}).every(([key, value]) => isDeepStrictEqual(result[key], value));
}
export async function runCase(example, c, { live = false, model = DEFAULT_MODEL, client = evaluate } = {}) {
  const { preflight, request } = prepare(example, c, model);
  let response = null, elapsedMs = null, attempts = 0;
  if (request) {
    if (live) ({ response, elapsedMs, attempts } = await client(request));
    else response = fixtureResponse(request.questions, c.fixture);
    validateResponse(response, request.questions);
  }
  const outcome = preflight ?? example.decide(c.state, response.answers);
  const baseline = preflight ?? example.baseline(c.state);
  const mode = live ? 'live' : 'fixture';
  return {
    example: example.id, case: c.id, note: c.note, group: c.group ?? null,
    mode, provenance: preflight ? 'deterministic-preflight-no-model-call' : live ? 'live-typesafe-api' : 'hand-authored-illustration-not-model-output',
    request, requestSha256: request ? digest(request) : null, response,
    outcome, baseline, expected: { action: c.expected, ...c.expectedDetails },
    matchesExpected: matchesExpected(outcome, c), baselineMatchesExpected: matchesExpected(baseline, c),
    elapsedMs, attempts,
    // Pricing snapshot: official /models, verified 2026-09-22. Only this exact model.
    estimatedSuccessfulResponseCostUsd: live && response?.model === 'jev-1.13.0'
      ? response.usage.input_tokens * 0.042 / 1_000_000 : null,
  };
}
export function summarize(results) {
  const groups = new Map();
  for (const r of results.filter(r => r.group)) {
    const key = `${r.example}/${r.group}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return {
    cases: results.length,
    matchesExpected: results.filter(r => r.matchesExpected).length,
    baselineMatchesExpected: results.filter(r => r.baselineMatchesExpected).length,
    liveRequests: results.filter(r => r.provenance === 'live-typesafe-api').length,
    preflightDecisions: results.filter(r => r.request === null).length,
    stability: [...groups.entries()].map(([group, rows]) => ({ group, cases: rows.length, sufficientForComparison: rows.length > 1, sameAction: rows.length > 1 ? new Set(rows.map(r => r.outcome.action)).size === 1 : null })),
    interpretation: 'Agreement with a small authored teaching set, not measured general accuracy. Fixtures exercise application policy only.',
  };
}
