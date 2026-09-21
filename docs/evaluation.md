# Reading the evidence

## Three separate questions

1. Does our application implement the intended policy? Use fixtures and unit tests.
2. Does Jev produce useful judgments on these inputs? Use live runs and inspect every mismatch.
3. Does the policy generalize to real traffic? Collect independent, representative cases and evaluate separately.

This initial collection answers the first question locally and provides a harness for the second. It does not claim to answer the third.

## What is authored

All 34 case inputs are fictional. Their intended outcomes, explanation notes, fixture probabilities, and confidence values were manually selected. Fixture confidence is illustrative; it is not a reimplementation of TypeSafe's confidence calculation. Score fixture means are computed from their authored distributions.

The report compares both the application decision and its listed details with the intended outcome. For example, context selection must choose the intended snippet IDs, not merely return `pack`. Intended outcomes stay outside the model request.

Baselines are intentionally small: exact text checks, last-write-wins, HTTP status checks, and similar heuristics. Both paths share the same deterministic preflight rules. These baselines explain a failure mode; beating them on an authored set does not establish superiority over a well-engineered alternative.

## Running a useful live comparison

```sh
npm start -- run all --live --out reports/first-live.json --check
```

This runs at most one API request per case that passes preflight. The runner is sequential. Retryable rate-limit or overload responses can cause additional attempts. It stops at the first API or schema failure and saves completed results and the error if an output path was requested.

Reports include:

- The request, validated response, intended outcome, and chosen policy action.
- The exact returned model, time of run, and hashes of source files.
- Per-call elapsed milliseconds, including retries and waiting.
- Reported token usage and a clearly scoped price estimate when known.
- Agreement with authored outcomes and equivalent-question action consistency.

Requests and responses in reports can contain your edited case data. Reports are ignored by Git; review their contents before sharing.

## How to make stronger claims

Write expected outcomes before collecting live responses. Keep a separate holdout set when tuning prompts or thresholds. Repeat stochastic calls, report failures and exclusions, compare against a meaningful baseline, and distinguish per-request observations from aggregate latency measurements. Include the model version and all input lengths.

Do not select only successful calls for publication. A model that abstains frequently may be safer at the cost of less automation; count that tradeoff explicitly. A concentrated probability distribution and empirical correctness are different measurements.

For example 10, matching actions across equivalent questions is a small metamorphic check. It does not establish calibrated confidence or general invariance. The changed-evidence case checks that the workflow can respond when intent actually changes.

## Recording a finding

Use [the finding template](finding-template.md) to publish a bounded observation with its inputs and failure cases. An honest negative result is useful material for this repository.
