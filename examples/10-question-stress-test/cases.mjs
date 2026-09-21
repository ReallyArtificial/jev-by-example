// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "original",
    "group": "equivalent-local-request",
    "note": "The original request and question.",
    "state": {
      "request": "Prepare a draft release announcement in a local file. Do not publish or send it anywhere."
    },
    "fixture": {
      "intent": {
        "type": "choice",
        "choice": "local_only",
        "probabilities": {
          "local_only": 1,
          "publish_requested": 0,
          "unclear": 0
        },
        "confidence": 1
      }
    },
    "expected": "local-draft"
  },
  {
    "id": "reordered-options",
    "group": "equivalent-local-request",
    "reversed": true,
    "note": "Only the order of options changes.",
    "state": {
      "request": "Prepare a draft release announcement in a local file. Do not publish or send it anywhere."
    },
    "fixture": {
      "intent": {
        "type": "choice",
        "choice": "local_only",
        "probabilities": {
          "local_only": 1,
          "publish_requested": 0,
          "unclear": 0
        },
        "confidence": 1
      }
    },
    "expected": "local-draft"
  },
  {
    "id": "paraphrased-question",
    "group": "equivalent-local-request",
    "paraphrase": true,
    "note": "Only the question wording changes.",
    "state": {
      "request": "Prepare a draft release announcement in a local file. Do not publish or send it anywhere."
    },
    "fixture": {
      "intent": {
        "type": "choice",
        "choice": "local_only",
        "probabilities": {
          "local_only": 1,
          "publish_requested": 0,
          "unclear": 0
        },
        "confidence": 1
      }
    },
    "expected": "local-draft"
  },
  {
    "id": "changed-evidence",
    "note": "A positive control: publication is now explicitly requested.",
    "state": {
      "request": "Publish the approved release announcement to our public blog."
    },
    "fixture": {
      "intent": {
        "type": "choice",
        "choice": "publish_requested",
        "probabilities": {
          "local_only": 0,
          "publish_requested": 1,
          "unclear": 0
        },
        "confidence": 1
      }
    },
    "expected": "publication-review"
  }
];
