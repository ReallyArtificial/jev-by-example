import test from 'node:test';
import assert from 'node:assert/strict';
import { examples } from '../src/catalog.mjs';
import { prepare, runCase, summarize } from '../src/runner.mjs';
import { fixtureResponse } from '../src/fixtures.mjs';

test('the collection has ten examples and 34 contrasting cases', () => {
  assert.equal(examples.length, 10);
  assert.equal(examples.flatMap(e => e.cases).length, 34);
  assert.equal(new Set(examples.map(e => e.id)).size, examples.length);
});

for (const example of examples) test(`${example.id}: every authored case exercises its intended policy`, async () => {
  assert.equal(new Set(example.cases.map(c => c.id)).size, example.cases.length);
  for (const c of example.cases) {
    const result = await runCase(example, c, { client: () => assert.fail('fixture mode called the client') });
    assert.ok(result.matchesExpected, `${c.id}: ${JSON.stringify(result.outcome)}`);
    assert.equal(result.elapsedMs, null);
    assert.equal(result.estimatedSuccessfulResponseCostUsd, null);
    if (result.request) {
      assert.deepEqual(Object.keys(result.request).sort(), ['model', 'questions', 'state']);
      assert.deepEqual(result.request.state, c.state);
      assert.equal(result.response.model, 'authored-fixture-not-jev');
    }
  }
});

test('hard boundaries prevent live requests and apply equally to the baseline', async () => {
  let preflights = 0;
  for (const example of examples) for (const c of example.cases) {
    if (!prepare(example, c).preflight) continue;
    preflights++;
    const result = await runCase(example, c, { live: true, client: () => assert.fail('preflight case sent to API') });
    assert.equal(result.request, null);
    assert.equal(result.response, null);
    assert.deepEqual(result.outcome, result.baseline);
  }
  assert.equal(preflights, 6);
});

test('live path consumes observed answers rather than the scripted fixture', async () => {
  const e = examples.find(e => e.id.startsWith('01'));
  const result = await runCase(e, e.cases[0], { live: true, client: async request => {
    const response = fixtureResponse(request.questions, { within_request: 0.01, changes_external_state: 0.99 });
    response.model = 'jev-1.13.0'; response.usage.input_tokens = 100;
    return { response, elapsedMs: 12, attempts: 1 };
  } });
  assert.equal(result.outcome.action, 'review');
  assert.equal(result.matchesExpected, false);
  assert.equal(result.elapsedMs, 12);
  assert.equal(result.estimatedSuccessfulResponseCostUsd, 100 * 0.042 / 1_000_000);
});

test('selected context always fits the exact character budget and keeps mandatory text', async () => {
  const e = examples.find(e => e.id.startsWith('07'));
  for (let budget = 0; budget < 250; budget++) {
    const c = structuredClone(e.cases[0]); c.state.budgetCharacters = budget;
    const { outcome } = await runCase(e, c);
    if (outcome.action === 'pack') {
      assert.ok(outcome.context.length <= budget);
      assert.equal(outcome.characters, outcome.context.length);
      assert.ok(outcome.selected.includes('constraint'));
    } else assert.equal(outcome.action, 'increase-budget');
  }
});

test('a probability near the Noul middle never becomes a positive scope decision', async () => {
  const e = examples[0], c = structuredClone(e.cases[0]);
  c.fixture.within_request = 0.51;
  const result = await runCase(e, c);
  assert.equal(result.outcome.action, 'review');
});

test('metamorphic report detects differences and does not claim stability from one case', async () => {
  const e = examples.find(e => e.id.startsWith('10'));
  const results = await Promise.all(e.cases.map(c => runCase(e, c)));
  assert.equal(summarize(results).stability[0].sameAction, true);
  results[1].outcome.action = 'clarify';
  assert.equal(summarize(results).stability[0].sameAction, false);
  assert.equal(summarize(results.slice(0, 1)).stability[0].sameAction, null);
});
