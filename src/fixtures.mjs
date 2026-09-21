// Authored illustrations, never recordings or predictions of Jev's behavior.
export const choice = (probabilities, confidence = 1) => ({
  type: 'choice',
  choice: Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0][0],
  probabilities, confidence,
});
export const score = (probabilities, confidence = 1) => ({
  type: 'score',
  score: Object.entries(probabilities).reduce((sum, [level, p]) => sum + Number(level) * p, 0),
  probabilities, confidence,
});
export function fixtureResponse(questions, values) {
  const answers = Object.fromEntries(Object.entries(questions).map(([id, question]) => {
    const value = values[id];
    if (value === undefined) throw new Error(`Missing authored fixture: ${id}`);
    const answer = question.type === 'noul' ? { type: 'noul', noul: value } : structuredClone(value);
    if (question.type === 'score') answer.legend = Object.fromEntries(question.criteria.map((level, i) => [String(i), level]));
    return [id, answer];
  }));
  return { model: 'authored-fixture-not-jev', answers, usage: { input_tokens: 0, output_tokens: 0 } };
}
