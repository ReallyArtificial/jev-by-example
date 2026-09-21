# API notes

Verified against official documentation on **2026-09-22**. This records documentation compatibility; it is not evidence of successful authenticated calls.

## Wire contract

The client posts JSON to `https://api.typesafe.ai/v1/systemone` with a Bearer token. The body contains `model`, `state`, and a map of `questions`. State may be text, an object, or an array. Answer IDs match question IDs. Responses contain `model`, `answers`, and input/output token usage. [API reference](https://docs.typesafe.ai/api)

Example payload produced by this collection:

```json
{
  "model": "jev-1.13.0",
  "state": {
    "request": "Prepare a local draft; do not publish it.",
    "proposal": { "description": "Post the announcement to the public blog." }
  },
  "questions": {
    "within_request": {
      "type": "noul",
      "instructions": "Does `proposal.description` stay within the work explicitly requested in `request`, including its restrictions?"
    }
  }
}
```

`npm start -- request 01` prints the complete payloads from the executable example. Fixtures, intended outcomes, and baseline decisions are excluded.

## Primitives

| Question | Criteria | Answer fields used |
| :-- | :-- | :-- |
| Choice | Named options with descriptions | `choice`, `probabilities`, `confidence` |
| Score | Ordered descriptions | `score`, `legend`, `probabilities`, `confidence` |
| Noul | Omitted in these examples | `noul` |

Choice supports up to 255 options; Score supports 2–10 levels. Our collection uses nonempty string instructions and at least two Choice options as a narrower local authoring convention. The official API also accepts structured instructions. Validation rejects missing answers, wrong types, invalid probabilities, and inconsistent scores. [API reference](https://docs.typesafe.ai/api)

Questions should describe their own task completely: their IDs are application keys and do not carry meaning into inference. Same-call questions are independent; none should refer to an earlier answer. [Question design](https://docs.typesafe.ai/primitives)

## Model and pricing snapshot

The documented model ID is `jev-1.13.0`; `jev-latest` is a moving alias. The collection pins the version by default and records the response model. The published price at verification was **$0.042 per million input tokens**, with no output-token charge. The report applies that estimate only when the response identifies that exact version. Recheck pricing before relying on estimates. [Models and pricing](https://docs.typesafe.ai/models)

Costs cover the final successful response's reported input usage. They exclude any unreported billing from failed attempts. Fixture reports use `null` for cost and latency; the fixture wrapper's zero token counts are synthetic placeholders.

## Failure handling

The client retries 429 and 529 at most twice with exponential backoff, honoring `Retry-After` up to 30 seconds. A longer requested delay ends the run rather than retrying early. Each request has a 30-second timeout. Authentication and validation failures are not retried. Uncertain transport failures are not automatically retried. HTTP response bodies and transport error text are not echoed into logs. [Error reference](https://docs.typesafe.ai/api)

Redirects are rejected and the official endpoint is fixed. Runtime response checks also run on fixtures. These checks establish a usable shape, not whether the model's judgment is correct.

## Source index

- [Quickstart](https://docs.typesafe.ai/introduction/quickstart)
- [HTTP reference](https://docs.typesafe.ai/api)
- [Primitives](https://docs.typesafe.ai/primitives)
- [Noul](https://docs.typesafe.ai/primitives/noul)
- [Score](https://docs.typesafe.ai/primitives/score)
- [Confidence](https://docs.typesafe.ai/confidence)
- [Models](https://docs.typesafe.ai/models)

The direct HTTP implementation keeps the payload visible and the collection dependency-free. An official SDK is another valid integration choice.
