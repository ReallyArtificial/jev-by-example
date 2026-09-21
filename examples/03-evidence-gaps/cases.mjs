// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "overclaim",
    "note": "One narrow result cannot support a universal claim.",
    "state": {
      "artifact": "PASS: 18 unit tests on Linux, Node 22. Browser tests and load tests were not run.",
      "claims": [
        {
          "id": "unit",
          "text": "18 unit tests passed on Linux with Node 22."
        },
        {
          "id": "universal",
          "text": "Zero regressions across every supported platform."
        },
        {
          "id": "latency",
          "text": "Checkout is 40% faster under production load."
        }
      ]
    },
    "fixture": {
      "claim_0": 0.99,
      "claim_1": 0.01,
      "claim_2": 0.01
    },
    "expected": "revise",
    "expectedDetails": {
      "unsupported": [
        "universal",
        "latency"
      ]
    }
  },
  {
    "id": "bounded-claim",
    "note": "Qualifiers preserve what the artifact actually establishes.",
    "state": {
      "artifact": "PASS: 18 unit tests on Linux, Node 22. No other environments tested.",
      "claims": [
        {
          "id": "unit",
          "text": "Our 18 unit tests passed on Linux with Node 22; other environments were not tested."
        }
      ]
    },
    "fixture": {
      "claim_0": 0.99
    },
    "expected": "ready-for-review",
    "expectedDetails": {
      "unsupported": []
    }
  },
  {
    "id": "missing-artifact",
    "note": "The author saying it works is not the requested test evidence.",
    "state": {
      "artifact": "The author wrote: looks good to me. No test output attached.",
      "claims": [
        {
          "id": "tests",
          "text": "The integration suite passed."
        }
      ]
    },
    "fixture": {
      "claim_0": 0.04
    },
    "expected": "revise",
    "expectedDetails": {
      "unsupported": [
        "tests"
      ]
    }
  }
];
