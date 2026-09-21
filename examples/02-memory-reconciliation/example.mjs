import cases from './cases.mjs';
import { choice, noul, confident, no, decision } from '../../src/questions.mjs';

export default {
  id: '02-memory-reconciliation', title: 'When a new memory should not erase an old one',
  hook: '“Use Python for this prototype” is not the same as “I now prefer Python.”',
  pattern: 'Scoped correction, temporary exceptions, and deliberate abstention',
  why: 'Blindly overwriting a preference turns a one-off request into a permanent personality change. The relationship between facts matters more than recency alone.',
  boundary: 'Returns a proposed memory operation; no Engram database is connected or mutated. Authorization and retention rules belong to the memory host.',
  failure: 'Pronouns, sarcasm, and missing dates can hide whether a correction is permanent. Keep both records when the relationship is uncertain.',
  questions: () => ({
    relationship: choice('How does `incoming.text` relate to `stored.text` for the same user? Respect time and project qualifiers.', { correction: 'Explicitly replaces the standing preference.', exception: 'Applies only to a particular task or time.', duplicate: 'Repeats the existing preference.', unrelated: 'Does not establish a relationship, or evidence is insufficient.' }),
    secret: noul('Does `incoming.text` contain an actual credential, access token, password, or private key rather than merely mention one?'),
  }),
  decide: (_s, a) => {
    if (!no(a.secret)) return decision('review', 'Do not propose storing possible credentials.');
    if (!confident(a.relationship)) return decision('review', 'The memory relationship is uncertain.');
    const actions = { correction: 'propose-replacement', exception: 'keep-scoped', duplicate: 'skip-duplicate', unrelated: 'review' };
    return decision(actions[a.relationship.choice], 'Keep the original evidence and scope with any proposed memory change.');
  },
  baseline: () => decision('propose-replacement', 'A naive last-write-wins memory policy.'),
  cases,
};
