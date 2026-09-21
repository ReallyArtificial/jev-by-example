import cases from './cases.mjs';
import { noul, yes, decision } from '../../src/questions.mjs';

export default {
  id: '04-semantic-cache-boundary', title: 'Almost the same question. Dangerously different answer.',
  hook: 'A semantic cache must distinguish “last month” from “right now.”',
  pattern: 'Hard partition checks followed by answer interchangeability',
  why: 'Embedding similarity is useful for finding cache candidates. It is insufficient to establish whether an answer can be reused.',
  boundary: 'A teaching cache gate, not a Freeport integration. Tenant, policy version, and expiry checks run before any candidate is sent to Jev.',
  failure: 'A compatible question can still have an incorrect cached answer. This example checks reuse conditions, not the answer’s truth.',
  preflight: (s) => {
    if (s.current.tenant !== s.cached.tenant) return decision('bypass', 'Tenant mismatch; do not send cross-tenant content to the model.');
    if (s.current.policyVersion !== s.cached.policyVersion) return decision('bypass', 'Policy version changed.');
    if (s.ageSeconds > s.ttlSeconds) return decision('bypass', 'The cache entry has expired.');
  },
  questions: () => ({
    interchangeable: noul('Could `cached.answer` answer `current.question` without changing its time scope, subject, requested detail, or language? Compare with `cached.question`.'),
  }),
  decide: (_s, a) => decision(yes(a.interchangeable, 0.95) ? 'reuse-candidate' : 'bypass', 'A candidate must satisfy the teaching threshold for answer interchangeability.'),
  baseline: (s) => decision(s.similarity >= 0.9 ? 'reuse-candidate' : 'bypass', 'Similarity-only candidate reuse, after the same hard checks.'),
  cases,
};
