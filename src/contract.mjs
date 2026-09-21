const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const assert = (condition, message) => { if (!condition) throw new Error(`API contract: ${message}`); };
const unit = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
const sameKeys = (a, b) => a.length === b.length && a.every(key => b.includes(key));
export function validateRequest(request) {
  assert(object(request), 'request must be an object');
  assert(typeof request.model === 'string' && request.model.trim(), 'model required');
  assert(typeof request.state === 'string' || object(request.state) || Array.isArray(request.state), 'state must be text, object, or array');
  assert(object(request.questions) && Object.keys(request.questions).length > 0, 'questions required');
  for (const [id, q] of Object.entries(request.questions)) {
    assert(object(q) && ['noul', 'choice', 'score'].includes(q.type), `${id}: unsupported question type`);
    assert(typeof q.instructions === 'string' && q.instructions.trim(), `${id}: this collection uses nonempty string instructions`);
    if (q.type === 'choice') assert(object(q.criteria) && Object.keys(q.criteria).length >= 2 && Object.keys(q.criteria).length <= 255, `${id}: use 2–255 choices`);
    if (q.type === 'score') assert(Array.isArray(q.criteria) && q.criteria.length >= 2 && q.criteria.length <= 10, `${id}: use 2–10 score levels`);
  }
  return request;
}
export function validateResponse(response, questions) {
  assert(object(response) && typeof response.model === 'string' && response.model.length > 0, 'response model required');
  assert(object(response.answers), 'answers required');
  assert(sameKeys(Object.keys(response.answers), Object.keys(questions)), 'answer IDs must match question IDs');
  assert(object(response.usage), 'usage required');
  for (const key of ['input_tokens', 'output_tokens']) assert(Number.isSafeInteger(response.usage[key]) && response.usage[key] >= 0, `invalid usage.${key}`);
  for (const [id, q] of Object.entries(questions)) {
    const a = response.answers[id];
    assert(object(a) && a.type === q.type, `${id}: answer type mismatch`);
    if (q.type === 'noul') { assert(unit(a.noul), `${id}: noul outside [0,1]`); continue; }
    assert(unit(a.confidence), `${id}: invalid confidence`);
    const keys = q.type === 'choice' ? Object.keys(q.criteria) : q.criteria.map((_, i) => String(i));
    assert(object(a.probabilities) && sameKeys(Object.keys(a.probabilities), keys), `${id}: probability keys mismatch`);
    assert(Object.values(a.probabilities).every(unit), `${id}: invalid probability`);
    const sum = Object.values(a.probabilities).reduce((x, y) => x + y, 0);
    assert(Math.abs(sum - 1) <= 0.001, `${id}: probabilities must sum to one`);
    if (q.type === 'choice') {
      assert(keys.includes(a.choice), `${id}: unknown choice`);
      assert(a.probabilities[a.choice] >= Math.max(...Object.values(a.probabilities)) - 0.001, `${id}: choice is not a maximum`);
    } else {
      assert(typeof a.score === 'number' && Number.isFinite(a.score) && a.score >= 0 && a.score <= keys.length - 1, `${id}: invalid score`);
      const mean = keys.reduce((total, key) => total + Number(key) * a.probabilities[key], 0);
      assert(Math.abs(a.score - mean) <= 0.01, `${id}: score inconsistent with distribution`);
      assert(object(a.legend) && sameKeys(Object.keys(a.legend), keys), `${id}: legend keys mismatch`);
    }
  }
  return response;
}
