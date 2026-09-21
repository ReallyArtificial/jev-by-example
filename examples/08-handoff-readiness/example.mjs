import cases from './cases.mjs';
import { noul, yes, decision } from '../../src/questions.mjs';

const obligations = [
  { id: 'compatibility', text: 'Preserve the existing public API.' },
  { id: 'unverified', text: 'The proposed fix has not been verified on Windows.' },
  { id: 'no-deploy', text: 'Prepare a patch; do not deploy it.' },
];
export default {
  id: '08-handoff-readiness', title: 'The handoff that forgot “do not deploy”',
  hook: 'A fluent summary can preserve the story while losing the obligations.',
  pattern: 'Check a compressed handoff against an explicit obligation ledger',
  why: 'A receiving agent needs constraints and uncertainty, not just progress. Check each required fact independently before accepting compression.',
  boundary: 'Does not generate a summary or execute a handoff. The obligation ledger is supplied by the caller and may itself be incomplete.',
  failure: 'If a constraint was never added to the ledger, this checker cannot notice its disappearance.',
  questions: (s) => Object.fromEntries(s.obligations.map((_, i) => [`kept_${i}`, noul(`Does \`handoff\` preserve the meaning of \`obligations[${i}].text\`, including prohibitions and uncertainty, without contradicting it?`)])),
  decide: (s, a) => {
    const missing = s.obligations.filter((_, i) => !yes(a[`kept_${i}`])).map(x => x.id);
    return decision(missing.length ? 'repair-handoff' : 'handoff-candidate', 'Carry explicit constraints and unresolved checks into the next context.', { missing });
  },
  baseline: (s) => {
    const missing = s.obligations.filter(x => !s.handoff.includes(x.text)).map(x => x.id);
    return decision(missing.length ? 'repair-handoff' : 'handoff-candidate', 'Require exact obligation text.', { missing });
  },
  cases,
};
