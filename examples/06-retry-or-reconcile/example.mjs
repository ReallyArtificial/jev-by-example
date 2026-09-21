import cases from './cases.mjs';
import { choice, confident, decision } from '../../src/questions.mjs';

export default {
  id: '06-retry-or-reconcile', title: 'The retry that creates a second invoice',
  hook: 'A timeout after a write means “unknown,” not necessarily “failed.”',
  pattern: 'Use transaction evidence before classifying recovery options',
  why: 'Retries are a workflow decision. Transport symptoms cannot tell you whether a remote side effect already happened.',
  boundary: 'Only proposes a recovery path. Never issues a retry, invoice, payment, or external write. Idempotency must be enforced by the actual service.',
  failure: 'Logs can omit the committed write. An unknown outcome stays a reconciliation task even if a model is certain it was transient.',
  preflight: (s) => {
    if (s.operation.sideEffect && s.outcome === 'unknown') return decision('reconcile', 'Check remote state before considering another write.');
    if (s.attempt >= s.maxAttempts) return decision('stop', 'The deterministic retry budget is exhausted.');
  },
  questions: () => ({
    cause: choice('What recovery category is supported by `error` and `operation`? Do not infer missing server state.', { transient: 'A temporary availability or rate-limit problem.', repair: 'Bad input or configuration needs correction.', credentials: 'Authentication or authorization needs attention.', unknown: 'Insufficient or conflicting evidence.' }),
  }),
  decide: (_s, a) => {
    if (!confident(a.cause)) return decision('inspect', 'Recovery category is uncertain.');
    return decision(({ transient: 'retry-with-backoff', repair: 'repair-input', credentials: 'check-access', unknown: 'inspect' })[a.cause.choice], 'Propose a path; the executor retains control.');
  },
  baseline: (s) => decision(/timeout|503|429/i.test(s.error) ? 'retry-with-backoff' : 'inspect', 'Retry common transient-looking strings after the same hard checks.'),
  cases,
};
