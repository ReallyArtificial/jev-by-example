// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "ambiguous-write",
    "note": "Never let classification override an unknown write outcome.",
    "state": {
      "operation": {
        "name": "create_invoice",
        "sideEffect": true
      },
      "outcome": "unknown",
      "attempt": 1,
      "maxAttempts": 3,
      "error": "Timeout waiting for response after request body was sent."
    },
    "fixture": {},
    "expected": "reconcile"
  },
  {
    "id": "read-unavailable",
    "note": "A bounded retry for a read.",
    "state": {
      "operation": {
        "name": "read_catalog",
        "sideEffect": false
      },
      "outcome": "failed",
      "attempt": 1,
      "maxAttempts": 3,
      "error": "503: catalog shard temporarily unavailable; try again later."
    },
    "fixture": {
      "cause": {
        "type": "choice",
        "choice": "transient",
        "probabilities": {
          "transient": 1,
          "repair": 0,
          "credentials": 0,
          "unknown": 0
        },
        "confidence": 1
      }
    },
    "expected": "retry-with-backoff"
  },
  {
    "id": "timeout-configuration",
    "note": "The word timeout is part of a validation error.",
    "state": {
      "operation": {
        "name": "read_catalog",
        "sideEffect": false
      },
      "outcome": "failed",
      "attempt": 1,
      "maxAttempts": 3,
      "error": "422: timeout_ms must be positive; received -1."
    },
    "fixture": {
      "cause": {
        "type": "choice",
        "choice": "repair",
        "probabilities": {
          "transient": 0,
          "repair": 1,
          "credentials": 0,
          "unknown": 0
        },
        "confidence": 1
      }
    },
    "expected": "repair-input"
  },
  {
    "id": "budget-exhausted",
    "note": "Repeated transients still have a finite budget.",
    "state": {
      "operation": {
        "name": "read_catalog",
        "sideEffect": false
      },
      "outcome": "failed",
      "attempt": 3,
      "maxAttempts": 3,
      "error": "503 temporary outage."
    },
    "fixture": {},
    "expected": "stop"
  }
];
