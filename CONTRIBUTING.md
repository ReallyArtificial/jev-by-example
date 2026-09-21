# Contributing

Bring a small decision with an interesting boundary. Good examples include negation, scope changes, missing evidence, temporary exceptions, and failure recovery.

## Example format

Create `examples/NN-short-name/example.mjs` exporting the same shape as an existing example:

- `id`, `title`, `hook`, `pattern`, `why`, `boundary`, and `failure` describe the lesson.
- `questions(state, case)` returns independent Jev questions with complete instructions.
- Optional `preflight(state)` returns a decision when deterministic rules settle the case before inference.
- `decide(state, answers)` returns `{ action, reason, ...details }`.
- `baseline(state)` supplies an understandable comparison. The runner applies the same preflight to both paths.
- Import `cases` from a sibling `cases.mjs`, with at least a positive case, a contrasting case, and an ambiguous or failure case.
- Each case has `id`, `note`, `state`, `fixture`, and `expected`. Use `expectedDetails` for important output fields, such as selected IDs.

Use Choice for categories, Score for a described spectrum, and Noul for a proposition. Do not make one question depend on another answer in the same request. Keep external side effects out of examples.

## Verification

```sh
npm run docs
npm run check
```

Add focused tests for new behavior, especially deterministic boundaries and response validation. Keep fixture tests free of network access. If you include live evidence, use the finding template and distinguish real recordings from illustrations. Do not invent performance numbers or silently convert a live failure into a fixture success.

Official API sources and their verification date live in `docs/api-contract.md`. When changing the client, verify against those primary sources again.

For a contribution, open one focused pull request explaining the decision boundary and what you verified. Disclose substantial AI assistance and distinguish fixture checks from live model observations.
