import cases from './cases.mjs';
import { noul, yes, decision } from '../../src/questions.mjs';

export default {
  id: '03-evidence-gaps', title: 'The release note that outran the evidence',
  hook: 'A passing unit test becomes “zero regressions on every supported platform.”',
  pattern: 'Batch independent claim checks; return exact claim IDs',
  why: 'Review each supplied claim against its cited artifact. This avoids asking a model to invent a critique or summarize away the unsupported part.',
  boundary: 'Checks support in the provided text, not the truth or authenticity of the underlying artifact. It does not execute tests or publish release notes.',
  failure: 'A fabricated artifact can still support a fabricated claim. Provenance must be verified outside this example.',
  questions: (s) => Object.fromEntries(s.claims.map((_, i) => [`claim_${i}`, noul(`Does the supplied text in \`artifact\` substantiate the entire claim at \`claims[${i}].text\`, including scope and qualifiers? Missing evidence is not support.`)])),
  decide: (s, a) => {
    const unsupported = s.claims.filter((_, i) => !yes(a[`claim_${i}`])).map(c => c.id);
    return decision(unsupported.length ? 'revise' : 'ready-for-review', 'Return claim IDs for an editor to inspect.', { unsupported });
  },
  baseline: (s) => decision(s.artifact.includes('PASS') ? 'ready-for-review' : 'revise', 'Any passing test is treated as enough evidence.'),
  cases,
};
