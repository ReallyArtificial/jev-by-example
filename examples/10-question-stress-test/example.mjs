import cases from './cases.mjs';
import { choice, confident, decision } from '../../src/questions.mjs';

const options = {
  local_only: 'The request explicitly allows a local draft only and excludes publication.',
  publish_requested: 'The request explicitly asks to publish the result.',
  unclear: 'Publication intent is missing or contradictory.',
};
export default {
  id: '10-question-stress-test', title: 'Does the decision survive a harmless rewrite?',
  hook: 'Swap option order. Rephrase the question. Keep the evidence fixed.',
  pattern: 'Metamorphic checks for question sensitivity',
  why: 'A single successful call says little about stability. Compare equivalent requests and include a genuine evidence change as a control.',
  boundary: 'Four small authored cases are not a robustness benchmark. Repeated calls and a larger independent dataset are needed to measure reliability.',
  failure: 'Stable answers can be consistently wrong. Agreement across variants must be read alongside the human-authored intended outcomes.',
  questions: (_s, c) => ({ intent: choice(c.paraphrase ? 'Based only on `request`, which publication intent is explicitly expressed?' : 'Which publication intent does `request` explicitly express?', c.reversed ? Object.fromEntries(Object.entries(options).reverse()) : options) }),
  decide: (_s, a) => confident(a.intent)
    ? decision(({ local_only: 'local-draft', publish_requested: 'publication-review', unclear: 'clarify' })[a.intent.choice], 'Classify intent only; no publication is performed.')
    : decision('clarify', 'Do not turn uncertain intent into an action.'),
  baseline: (s) => decision(s.request.toLowerCase().includes('publish') ? 'publication-review' : 'clarify', 'A deliberately limited keyword baseline that misses negation.'),
  cases,
};
