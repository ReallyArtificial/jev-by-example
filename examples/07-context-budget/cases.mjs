// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "useful-over-short",
    "note": "Choose a trace over shorter launch chatter.",
    "state": {
      "task": "Investigate the hanging database request.",
      "alreadyKnown": "The request hangs; API compatibility is required.",
      "budgetCharacters": 150,
      "snippets": [
        {
          "id": "constraint",
          "mandatory": true,
          "text": "The fix must preserve the public API."
        },
        {
          "id": "trace",
          "mandatory": false,
          "text": "Trace: the request hangs while waiting for an unreleased connection."
        },
        {
          "id": "launch",
          "mandatory": false,
          "text": "Marketing wants a launch announcement by Friday."
        },
        {
          "id": "repeat",
          "mandatory": false,
          "text": "Another copy of the already supplied incident summary."
        }
      ]
    },
    "fixture": {
      "relevance_1": {
        "type": "score",
        "score": 2,
        "probabilities": {
          "0": 0,
          "1": 0,
          "2": 1
        },
        "confidence": 1
      },
      "novelty_1": {
        "type": "score",
        "score": 2,
        "probabilities": {
          "0": 0,
          "1": 0,
          "2": 1
        },
        "confidence": 1
      },
      "relevance_2": {
        "type": "score",
        "score": 0,
        "probabilities": {
          "0": 1,
          "1": 0,
          "2": 0
        },
        "confidence": 1
      },
      "novelty_2": {
        "type": "score",
        "score": 2,
        "probabilities": {
          "0": 0,
          "1": 0,
          "2": 1
        },
        "confidence": 1
      },
      "relevance_3": {
        "type": "score",
        "score": 2,
        "probabilities": {
          "0": 0,
          "1": 0,
          "2": 1
        },
        "confidence": 1
      },
      "novelty_3": {
        "type": "score",
        "score": 0,
        "probabilities": {
          "0": 1,
          "1": 0,
          "2": 0
        },
        "confidence": 1
      }
    },
    "expected": "pack",
    "expectedDetails": {
      "selected": [
        "constraint",
        "trace"
      ]
    }
  },
  {
    "id": "uncertain-evidence",
    "note": "Keep the constraint when the trace scores are uncertain.",
    "state": {
      "task": "Investigate the hanging database request.",
      "alreadyKnown": "The request hangs; API compatibility is required.",
      "budgetCharacters": 150,
      "snippets": [
        {
          "id": "constraint",
          "mandatory": true,
          "text": "The fix must preserve the public API."
        },
        {
          "id": "trace",
          "mandatory": false,
          "text": "Trace: the request hangs while waiting for an unreleased connection."
        },
        {
          "id": "launch",
          "mandatory": false,
          "text": "Marketing wants a launch announcement by Friday."
        },
        {
          "id": "repeat",
          "mandatory": false,
          "text": "Another copy of the already supplied incident summary."
        }
      ]
    },
    "fixture": {
      "relevance_1": {
        "type": "score",
        "score": 1,
        "probabilities": {
          "0": 0.5,
          "1": 0,
          "2": 0.5
        },
        "confidence": 0.1
      },
      "novelty_1": {
        "type": "score",
        "score": 2,
        "probabilities": {
          "0": 0,
          "1": 0,
          "2": 1
        },
        "confidence": 1
      },
      "relevance_2": {
        "type": "score",
        "score": 0,
        "probabilities": {
          "0": 1,
          "1": 0,
          "2": 0
        },
        "confidence": 1
      },
      "novelty_2": {
        "type": "score",
        "score": 2,
        "probabilities": {
          "0": 0,
          "1": 0,
          "2": 1
        },
        "confidence": 1
      },
      "relevance_3": {
        "type": "score",
        "score": 2,
        "probabilities": {
          "0": 0,
          "1": 0,
          "2": 1
        },
        "confidence": 1
      },
      "novelty_3": {
        "type": "score",
        "score": 0,
        "probabilities": {
          "0": 1,
          "1": 0,
          "2": 0
        },
        "confidence": 1
      }
    },
    "expected": "pack",
    "expectedDetails": {
      "selected": [
        "constraint"
      ]
    }
  },
  {
    "id": "impossible-budget",
    "note": "Fail explicitly instead of losing a required constraint.",
    "state": {
      "task": "Investigate the hanging database request.",
      "alreadyKnown": "The request hangs; API compatibility is required.",
      "budgetCharacters": 10,
      "snippets": [
        {
          "id": "constraint",
          "mandatory": true,
          "text": "The fix must preserve the public API."
        },
        {
          "id": "trace",
          "mandatory": false,
          "text": "Trace: the request hangs while waiting for an unreleased connection."
        },
        {
          "id": "launch",
          "mandatory": false,
          "text": "Marketing wants a launch announcement by Friday."
        },
        {
          "id": "repeat",
          "mandatory": false,
          "text": "Another copy of the already supplied incident summary."
        }
      ]
    },
    "fixture": {},
    "expected": "increase-budget"
  }
];
