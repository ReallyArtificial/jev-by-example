// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "permanent-correction",
    "note": "An explicit standing-preference update.",
    "state": {
      "stored": {
        "text": "I prefer TypeScript for personal projects."
      },
      "incoming": {
        "text": "Update my default: I now prefer Python for personal projects instead of TypeScript."
      }
    },
    "fixture": {
      "relationship": {
        "type": "choice",
        "choice": "correction",
        "probabilities": {
          "correction": 1,
          "exception": 0,
          "duplicate": 0,
          "unrelated": 0
        },
        "confidence": 1
      },
      "secret": 0.01
    },
    "expected": "propose-replacement"
  },
  {
    "id": "temporary-exception",
    "note": "Preserve the durable preference.",
    "state": {
      "stored": {
        "text": "I prefer TypeScript for personal projects."
      },
      "incoming": {
        "text": "For this weekend prototype only, use Python because its SDK already works."
      }
    },
    "fixture": {
      "relationship": {
        "type": "choice",
        "choice": "exception",
        "probabilities": {
          "correction": 0,
          "exception": 1,
          "duplicate": 0,
          "unrelated": 0
        },
        "confidence": 1
      },
      "secret": 0.01
    },
    "expected": "keep-scoped"
  },
  {
    "id": "unclear-referent",
    "note": "The collection deliberately includes an abstention.",
    "state": {
      "stored": {
        "text": "I prefer TypeScript for personal projects."
      },
      "incoming": {
        "text": "Actually, use that other one from now on."
      }
    },
    "fixture": {
      "relationship": {
        "type": "choice",
        "choice": "correction",
        "probabilities": {
          "correction": 0.45,
          "exception": 0.1,
          "duplicate": 0,
          "unrelated": 0.45
        },
        "confidence": 0.05
      },
      "secret": 0.01
    },
    "expected": "review"
  }
];
