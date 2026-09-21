import { readdir } from 'node:fs/promises';

const root = new URL('../examples/', import.meta.url);
const directories = (await readdir(root, { withFileTypes: true })).filter(x => x.isDirectory()).map(x => x.name).sort();
export const examples = await Promise.all(directories.map(async directory => {
  const source = new URL(`${directory}/example.mjs`, root);
  const { default: example } = await import(source.href);
  return { ...example, source, casesSource: new URL('cases.mjs', source) };
}));
export function selectExamples(selector) {
  if (selector === 'all') return examples;
  const matches = examples.filter(e => e.id === selector || e.id.split('-')[0] === selector.padStart(2, '0'));
  if (matches.length !== 1) throw new Error(`Unknown example: ${selector}. Run npm start -- list.`);
  return matches;
}
