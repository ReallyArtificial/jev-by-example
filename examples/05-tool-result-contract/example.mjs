import cases from './cases.mjs';
import { noul, yes, decision } from '../../src/questions.mjs';

export default {
  id: '05-tool-result-contract', title: 'HTTP 200 is not task completion',
  hook: 'A tool says success while quietly returning a truncated or irrelevant result.',
  pattern: 'Deterministic transport checks plus semantic postconditions',
  why: 'Agents often treat the absence of an exception as success. Check whether the result satisfies the original request, not just the transport.',
  boundary: 'A possible pattern for tests around MCP tools. No MCP-Jest integration is installed, and the proposed result is not proof of task completion.',
  failure: 'A server can misreport completeness or fabricate content. An independent source or executable assertion is stronger where available.',
  preflight: (s) => {
    if (s.result.status !== 200 || s.result.truncated) return decision('incomplete', 'The response failed a deterministic completeness check.');
  },
  questions: () => ({
    satisfies: noul('Does `result.text` provide the specific deliverable in `request`, rather than an acknowledgement, plan, or unrelated summary?'),
    matches_scope: noul('Does the time period and subject in `result.text` match `request`?'),
  }),
  decide: (_s, a) => decision(yes(a.satisfies) && yes(a.matches_scope) ? 'accept-candidate' : 'incomplete', 'Both the deliverable and its scope must be supported.'),
  baseline: (s) => decision(s.result.status === 200 ? 'accept-candidate' : 'incomplete', 'Treat HTTP success as task success.'),
  cases,
};
