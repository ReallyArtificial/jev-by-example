import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = (...args) => spawnSync(process.execPath, ['src/cli.mjs', ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, TYPESAFE_API_KEY: '', JEV_MODEL: '' } });

test('default catalog and help are usable without setup', () => {
  const result = cli('list');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /10-question-stress-test/);
  assert.match(cli('--help').stdout, /--live/);
});
test('request command prints only the selected case and no expected label', () => {
  const result = cli('request', '02', '--case', 'temporary-exception', '--model', 'jev-1.13.0');
  assert.equal(result.status, 0, result.stderr);
  const [item] = JSON.parse(result.stdout);
  assert.equal(item.case, 'temporary-exception');
  assert.equal(item.request.model, 'jev-1.13.0');
  assert.equal(Object.hasOwn(item.request, 'expected'), false);
  assert.equal(Object.hasOwn(item.request, 'fixture'), false);
});
test('JSON mode is clean, and saved reports refuse overwrites', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'jev-report-test-'));
  const file = join(directory, 'result.json');
  const result = cli('run', '02', '--model', 'jev-1.13.0', '--json', '--out', file, '--check');
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, 'fixture');
  assert.equal(report.summary.cases, 3);
  assert.equal(report.summary.liveRequests, 0);
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), report);
  const second = cli('run', '02', '--out', file);
  assert.equal(second.status, 1);
  assert.match(second.stderr, /already exists/);
});
for (const args of [
  ['run', '99'], ['run', '01', '--case', 'missing'], ['run', 'all', '--case', 'inspect'],
  ['run', '01', '--lve'], ['request', '01', '--live'], ['run', '01', '--model'], ['run', '01', '--json', '--json'],
]) test(`CLI rejects invalid invocation: ${args.join(' ')}`, () => {
  const result = cli(...args);
  assert.equal(result.status, 1);
  assert.ok(result.stderr.trim());
});

test('all relative Markdown links resolve to local files or directories', async () => {
  const walk = async dir => {
    const paths = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'reports' || entry.name === 'node_modules') continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) paths.push(...await walk(path));
      else if (entry.name.endsWith('.md')) paths.push(path);
    }
    return paths;
  };
  for (const path of await walk(root)) {
    const text = await readFile(path, 'utf8');
    for (const [, href] of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^(https?:|#)/.test(href)) continue;
      const target = resolve(dirname(path), href.split('#')[0]);
      await assert.doesNotReject(stat(target), `${path}: broken link ${href}`);
    }
  }
});
