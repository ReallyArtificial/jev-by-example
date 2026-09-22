#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { examples, selectExamples } from './catalog.mjs';
import { DEFAULT_MODEL, evaluate, viaEndpoint } from './client.mjs';
import { digest, prepare, runCase, summarize } from './runner.mjs';

const help = `jev-by-example · ten decisions between agent steps

  npm start -- list
  npm start -- run 02
  npm start -- run 02 --case temporary-exception
  npm start -- request 02 --case temporary-exception
  npm start -- run 02 --live
  npm start -- run all --live --out reports/live.json --check

Default: authored fixtures, no network, no key required.
--live             Send supplied example states to the official TypeSafe API.
--case ID          Select one case within one example.
--model ID         Set the requested model (default: jev-1.13.0).
--json             Print the complete report as JSON.
--out FILE         Save a new report; refuses to overwrite an existing file.
--check            Exit 1 if a result disagrees with its intended outcome.
--via URL          Send live requests through a loopback proxy (e.g. stuntdouble
                   at http://127.0.0.1:8010) that forwards them to TypeSafe.

request prints the exact request without making a call. Deterministic preflight
rejections have no request. request and --live load .env from this repository.
Live output is observational; examples never execute their proposed actions.`;

function parse(args) {
  if (args.includes('--help') || args.includes('-h')) return { help: true };
  const flags = {}, positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) { positional.push(arg); continue; }
    const key = arg.slice(2);
    if (Object.hasOwn(flags, key)) throw new Error(`Repeated flag: ${arg}`);
    if (['live', 'json', 'check'].includes(key)) flags[key] = true;
    else if (['case', 'model', 'out', 'via'].includes(key)) {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      flags[key] = value;
    } else throw new Error(`Unknown flag: ${arg}`);
  }
  if (positional.length > 2) throw new Error('Too many positional arguments. Use --help.');
  const [command = 'list', selector = 'all'] = positional;
  if (!['list', 'run', 'request'].includes(command)) throw new Error(`Unknown command: ${command}`);
  if (command !== 'run' && Object.keys(flags).some(k => !['case', 'model'].includes(k))) throw new Error('Only run accepts --live, --json, --out, and --check.');
  if (command === 'list' && (positional.length > 1 || Object.keys(flags).length)) throw new Error('list takes no arguments.');
  if (command === 'request' && selector === 'all') throw new Error('Select one example for request.');
  if (flags.case && selector === 'all') throw new Error('--case requires one example.');
  return { command, selector, flags };
}

async function sourceHashes() {
  const files = [new URL('../package.json', import.meta.url), ...examples.flatMap(e => [e.source, e.casesSource])];
  for (const file of (await readdir(new URL('./', import.meta.url))).filter(f => f.endsWith('.mjs')).sort()) files.push(new URL(file, import.meta.url));
  return Object.fromEntries(await Promise.all(files.map(async file => [fileURLToPath(file).replace(fileURLToPath(new URL('../', import.meta.url)), ''), digest(await readFile(file, 'utf8'))])));
}

async function main() {
  const parsed = parse(process.argv.slice(2));
  if (parsed.help) { console.log(help); return; }
  const { command, selector, flags } = parsed;
  if (command === 'list') {
    console.log('JEV BY EXAMPLE\nTen decisions between agent steps.\n');
    for (const example of examples) console.log(`${example.id}\n  ${example.title}\n  ${example.hook}\n`);
    console.log('Start: npm start -- run 01   |   Inspect: npm start -- request 01');
    return;
  }
  const selected = selectExamples(selector);
  const cases = selected.flatMap(example => example.cases.filter(c => !flags.case || c.id === flags.case).map(c => ({ example, c })));
  if (!cases.length) throw new Error(`Unknown case: ${flags.case}`);
  const root = new URL('../', import.meta.url);
  if ((flags.live || command === 'request') && existsSync(new URL('.env', root))) loadEnvFile(fileURLToPath(new URL('.env', root)));
  const model = flags.model ?? (process.env.JEV_MODEL?.trim() || DEFAULT_MODEL);
  if (command === 'request') {
    console.log(JSON.stringify(cases.map(({ example, c }) => ({ example: example.id, case: c.id, ...prepare(example, c, model) })), null, 2));
    return;
  }
  if (flags.live && !process.env.TYPESAFE_API_KEY?.trim()) throw new Error('Set TYPESAFE_API_KEY in your environment or .env before using --live.');
  if (flags.via && !flags.live) throw new Error('--via only applies to --live runs.');
  const endpoint = flags.via ? viaEndpoint(flags.via) : null;
  const outputPath = flags.out ? resolve(flags.out) : null;
  if (outputPath && existsSync(outputPath)) throw new Error(`Report already exists: ${flags.out}. Choose a new filename.`);
  // Fail before making any paid request if the destination cannot be prepared.
  if (outputPath) await mkdir(dirname(outputPath), { recursive: true });
  if (!flags.json) console.log(flags.live ? `LIVE · ${model} · ${cases.length} cases (some may stop at preflight)${endpoint ? ` · via ${flags.via}` : ''}` : 'FIXTURE · authored illustrations · no Jev calls · no model accuracy claim');
  const results = [], errors = [];
  for (const { example, c } of cases) {
    try {
      const result = await runCase(example, c, { live: !!flags.live, model, ...(endpoint ? { client: request => evaluate(request, { endpoint }) } : {}) });
      results.push(result);
      if (!flags.json) {
        console.log(`\n${example.id} / ${c.id}\n  ${result.outcome.action} — ${result.outcome.reason}`);
        console.log(`  Intended: ${c.expected} · ${result.matchesExpected ? 'match' : 'MISMATCH'} · baseline: ${result.baseline.action}`);
        const details = Object.fromEntries(Object.entries(result.outcome).filter(([key]) => !['action', 'reason'].includes(key)));
        if (Object.keys(details).length) console.log(`  ${JSON.stringify(details)}`);
        if (result.elapsedMs !== null) console.log(`  ${result.response.model} · ${result.elapsedMs} ms (includes retries) · ${result.response.usage.input_tokens} input tokens`);
      }
    } catch (error) {
      errors.push({ example: example.id, case: c.id, message: error.message });
      // Stop at first API/contract failure; preserve successful results for inspection.
      break;
    }
  }
  const report = {
    schemaVersion: 1, createdAt: new Date().toISOString(), mode: flags.live ? 'live' : 'fixture',
    requestedModel: model, docsVerifiedOn: '2026-09-22',
    provenance: flags.live ? 'Local calls to the official API, with caller-authored intended outcomes.' : 'Manually authored response fixtures. No model was called. Numbers are illustrative.',
    sourceHashes: await sourceHashes(), summary: summarize(results), errors, results,
  };
  if (outputPath) await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  if (flags.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`\n${report.summary.matchesExpected}/${results.length} intended outcomes matched. ${report.summary.preflightDecisions} preflight decisions. ${report.summary.liveRequests} live requests.`);
    console.log(report.summary.interpretation);
    for (const group of report.summary.stability) console.log(`Stability: ${group.group} · ${group.cases} variants · ${group.sameAction === null ? 'not enough cases' : group.sameAction ? 'same action' : 'DIFFERENT actions'}`);
    if (outputPath) console.log(`Report: ${outputPath}`);
    for (const error of errors) console.error(`${error.example}/${error.case}: ${error.message}`);
  }
  if (errors.length || (flags.check && results.some(r => !r.matchesExpected))) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
