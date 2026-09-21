// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "same-title-different-cause",
    "note": "An exhausted pool and a blocked script are different investigations.",
    "state": {
      "first": {
        "title": "Checkout hangs",
        "detail": "Server trace waits for DB pool; all browsers affected; restarting the pool helps."
      },
      "second": {
        "title": "Checkout hangs",
        "detail": "Browser extension blocks payment.js; server never receives checkout; disabling the extension fixes it."
      }
    },
    "fixture": {
      "relationship": {
        "type": "choice",
        "choice": "shared_symptom",
        "probabilities": {
          "shared_cause": 0,
          "shared_symptom": 1,
          "unrelated": 0,
          "insufficient": 0
        },
        "confidence": 1
      }
    },
    "expected": "keep-separate"
  },
  {
    "id": "different-title-matching-trace",
    "note": "Useful linkage despite different wording.",
    "state": {
      "first": {
        "title": "Checkout hangs",
        "detail": "After rollback, releaseConnection is skipped at pool.ts:82. Restarting the pool recovers."
      },
      "second": {
        "title": "Orders stop after an error",
        "detail": "After rollback, releaseConnection is skipped at pool.ts:82. Restarting the pool recovers."
      }
    },
    "fixture": {
      "relationship": {
        "type": "choice",
        "choice": "shared_cause",
        "probabilities": {
          "shared_cause": 1,
          "shared_symptom": 0,
          "unrelated": 0,
          "insufficient": 0
        },
        "confidence": 1
      }
    },
    "expected": "link-for-investigation"
  },
  {
    "id": "no-reproduction",
    "note": "Two vague reports do not establish a cause.",
    "state": {
      "first": {
        "title": "Checkout hangs",
        "detail": "It broke yesterday."
      },
      "second": {
        "title": "Checkout hangs",
        "detail": "Same here."
      }
    },
    "fixture": {
      "relationship": {
        "type": "choice",
        "choice": "insufficient",
        "probabilities": {
          "shared_cause": 0,
          "shared_symptom": 0,
          "unrelated": 0,
          "insufficient": 1
        },
        "confidence": 1
      }
    },
    "expected": "ask-for-evidence"
  }
];
