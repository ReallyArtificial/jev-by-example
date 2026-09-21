export const noul = (instructions) => ({ type: 'noul', instructions });
export const choice = (instructions, criteria) => ({ type: 'choice', instructions, criteria });
export const score = (instructions, criteria) => ({ type: 'score', instructions, criteria });
// Thresholds are teaching policies, not measured guarantees of correctness.
export const yes = (answer, threshold = 0.9) => answer.noul >= threshold;
export const no = (answer, threshold = 0.1) => answer.noul <= threshold;
export const confident = (answer, threshold = 0.8) => answer.confidence >= threshold;
export const decision = (action, reason, details = {}) => ({ action, reason, ...details });
