import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest, validateResponse } from '../src/contract.mjs';
import { fixtureResponse, choice, score } from '../src/fixtures.mjs';

const questions = {
  intent: { type: 'choice', instructions: 'Which intent is supported?', criteria: { read: 'Read only', write: 'Make a change' } },
  severity: { type: 'score', instructions: 'What consequence is described?', criteria: ['Cosmetic', 'Degraded', 'Unavailable'] },
  allowed: { type: 'noul', instructions: 'Is permission explicitly granted?' },
};
const valid = () => fixtureResponse(questions, { intent: choice({ read: 0.9, write: 0.1 }, 0.8), severity: score({ 0: 0, 1: 0.75, 2: 0.25 }, 0.6), allowed: 0.98 });

test('accepts fractional Score and Noul without a confidence property', () => {
  const response = validateResponse(valid(), questions);
  assert.equal(response.answers.severity.score, 1.25);
  assert.equal(Object.hasOwn(response.answers.allowed, 'confidence'), false);
});
for (const [label, mutate] of [
  ['missing answer', r => { delete r.answers.allowed; }],
  ['unexpected answer', r => { r.answers.extra = { type: 'noul', noul: 1 }; }],
  ['wrong answer type', r => { r.answers.allowed.type = 'score'; }],
  ['out-of-range Noul', r => { r.answers.allowed.noul = 1.01; }],
  ['string confidence', r => { r.answers.intent.confidence = '0.9'; }],
  ['probability sum', r => { r.answers.intent.probabilities.read = 0.7; }],
  ['unknown choice', r => { r.answers.intent.choice = 'delete'; }],
  ['choice is not the maximum', r => { r.answers.intent.choice = 'write'; }],
  ['missing level', r => { delete r.answers.severity.probabilities['2']; }],
  ['inconsistent weighted score', r => { r.answers.severity.score = 2; }],
  ['invalid usage', r => { r.usage.input_tokens = -1; }],
]) test(`rejects ${label}`, () => {
  const response = valid(); mutate(response);
  assert.throws(() => validateResponse(response, questions), /API contract:/);
});

test('validates locally supported request shapes and rubric limits', () => {
  const request = { model: 'jev-1.13.0', state: { task: 'inspect' }, questions };
  assert.equal(validateRequest(request), request);
  assert.throws(() => validateRequest({ ...request, state: null }), /state/);
  assert.throws(() => validateRequest({ ...request, questions: {} }), /questions/);
  assert.throws(() => validateRequest({ ...request, questions: { x: { type: 'score', instructions: 'How severe?', criteria: ['One'] } } }), /2–10/);
  assert.throws(() => validateRequest({ ...request, questions: { x: { type: 'choice', instructions: '', criteria: { a: 'A', b: 'B' } } } }), /instructions/);
});
