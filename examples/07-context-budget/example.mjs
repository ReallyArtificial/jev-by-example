import cases from './cases.mjs';
import { score, confident, decision } from '../../src/questions.mjs';


export default {
  id: '07-context-budget', title: 'Spend context on evidence, not repetition',
  hook: 'A relevant paragraph can still be redundant. A short constraint can still be mandatory.',
  pattern: 'Two independent scores followed by deterministic budget packing',
  why: 'Separating usefulness from novelty avoids repeatedly selecting the same evidence. Mandatory constraints bypass ranking entirely.',
  boundary: 'Uses a character budget for the joined snippet text, not a model token budget. Greedy packing is a transparent heuristic, not an optimal solver.',
  failure: 'Two individually useful snippets can duplicate each other. This small example scores novelty against alreadyKnown, not pairwise redundancy.',
  preflight: (s) => {
    if (s.snippets.filter(x => x.mandatory).map(x => x.text).join('\n\n').length > s.budgetCharacters) return decision('increase-budget', 'Mandatory constraints cannot fit; do not silently discard them.');
  },
  questions: (s) => Object.fromEntries(s.snippets.flatMap((item, i) => item.mandatory ? [] : [
    [`relevance_${i}`, score(`How useful is \`snippets[${i}].text\` for answering \`task\`?`, ['Unrelated to the task.', 'Useful background but no direct evidence.', 'Direct evidence for the task.'])],
    [`novelty_${i}`, score(`How much new task information does \`snippets[${i}].text\` add beyond \`alreadyKnown\`?`, ['Repeats what is already known.', 'Adds a minor detail.', 'Adds a distinct finding or constraint.'])],
  ])),
  decide: (s, a) => {
    const selected = s.snippets.filter(x => x.mandatory);
    const candidates = s.snippets.flatMap((item, i) => {
      if (item.mandatory || !confident(a[`relevance_${i}`]) || !confident(a[`novelty_${i}`])) return [];
      const r = a[`relevance_${i}`].score, n = a[`novelty_${i}`].score;
      return r >= 1 && n >= 1 ? [{ item, value: r * n / (item.text.length + 2) }] : [];
    }).sort((x, y) => y.value - x.value || x.item.id.localeCompare(y.item.id));
    for (const { item } of candidates) if ([...selected, item].map(x => x.text).join('\n\n').length <= s.budgetCharacters) selected.push(item);
    const context = selected.map(x => x.text).join('\n\n');
    return decision('pack', 'Pinned constraints first; confident, useful, novel evidence next.', { selected: selected.map(x => x.id), characters: context.length, context });
  },
  baseline: (s) => {
    const selected = s.snippets.filter(x => x.mandatory);
    for (const item of s.snippets.filter(x => !x.mandatory).sort((a, b) => a.text.length - b.text.length)) if ([...selected, item].map(x => x.text).join('\n\n').length <= s.budgetCharacters) selected.push(item);
    return decision('pack', 'Pack shortest snippets after mandatory constraints.', { selected: selected.map(x => x.id) });
  },
  cases,
};
