// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "paraphrase",
    "note": "Same scope, wording changed.",
    "state": {
      "current": {
        "tenant": "studio",
        "policyVersion": 3,
        "question": "How long do staging logs stay available?"
      },
      "cached": {
        "tenant": "studio",
        "policyVersion": 3,
        "question": "What is the staging log retention period?",
        "answer": "Staging logs are retained for seven days."
      },
      "ageSeconds": 30,
      "ttlSeconds": 300,
      "similarity": 0.96
    },
    "fixture": {
      "interchangeable": 0.99
    },
    "expected": "reuse-candidate"
  },
  {
    "id": "time-shift",
    "note": "The numbers are from a different period.",
    "state": {
      "current": {
        "tenant": "studio",
        "policyVersion": 3,
        "question": "What is checkout latency right now?"
      },
      "cached": {
        "tenant": "studio",
        "policyVersion": 3,
        "question": "What was checkout latency last month?",
        "answer": "Last month p95 checkout latency was 400 ms."
      },
      "ageSeconds": 30,
      "ttlSeconds": 300,
      "similarity": 0.97
    },
    "fixture": {
      "interchangeable": 0.01
    },
    "expected": "bypass"
  },
  {
    "id": "wrong-tenant",
    "note": "Hard rejection without a model call.",
    "state": {
      "current": {
        "tenant": "alpha",
        "policyVersion": 3,
        "question": "What is our internal retention policy?"
      },
      "cached": {
        "tenant": "beta",
        "policyVersion": 3,
        "question": "What is our internal retention policy?",
        "answer": "Tenant beta internal policy: 90 days."
      },
      "ageSeconds": 30,
      "ttlSeconds": 300,
      "similarity": 1
    },
    "fixture": {},
    "expected": "bypass"
  },
  {
    "id": "expired",
    "note": "High similarity cannot extend a TTL.",
    "state": {
      "current": {
        "tenant": "studio",
        "policyVersion": 3,
        "question": "Is checkout healthy?"
      },
      "cached": {
        "tenant": "studio",
        "policyVersion": 3,
        "question": "Is checkout healthy?",
        "answer": "All checks passed at 09:00."
      },
      "ageSeconds": 600,
      "ttlSeconds": 60,
      "similarity": 1
    },
    "fixture": {},
    "expected": "bypass"
  }
];
