import cases from './cases.mjs';
import { choice, confident, decision } from '../../src/questions.mjs';

export default {
  id: '09-issue-twins', title: 'Same symptom, different bug',
  hook: 'Two “checkout hangs” issues need not share a cause.',
  pattern: 'Distinguish investigation links from duplicate closure',
  why: 'Deduplication by title can erase evidence. Compare causal signatures, environments, and workarounds while keeping uncertainty explicit.',
  boundary: 'Suggests an investigation relationship only. Never closes, edits, or comments on a GitHub issue.',
  failure: 'Matching logs can result from a shared downstream symptom. An apparent duplicate still needs a maintainer to confirm.',
  questions: () => ({
    relationship: choice('What relationship is supported between `first` and `second`, considering their traces, trigger, and workaround rather than title alone?', { shared_cause: 'Both reports provide specific matching evidence of the same cause.', shared_symptom: 'The symptom overlaps but causes differ or no shared cause is established.', unrelated: 'The reports concern different failures.', insufficient: 'There is too little evidence to determine a relationship.' }),
  }),
  decide: (_s, a) => {
    if (!confident(a.relationship)) return decision('ask-for-evidence', 'Relationship is uncertain.');
    return decision(({ shared_cause: 'link-for-investigation', shared_symptom: 'keep-separate', unrelated: 'keep-separate', insufficient: 'ask-for-evidence' })[a.relationship.choice], 'A proposed relationship is not authority to close an issue.');
  },
  baseline: (s) => decision(s.first.title === s.second.title ? 'link-for-investigation' : 'keep-separate', 'Match exact issue titles.'),
  cases,
};
