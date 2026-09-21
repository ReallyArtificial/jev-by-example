// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "lost-negation",
    "note": "Progress prose quietly flips a restriction.",
    "state": {
      "obligations": [
        {
          "id": "compatibility",
          "text": "Preserve the existing public API."
        },
        {
          "id": "unverified",
          "text": "The proposed fix has not been verified on Windows."
        },
        {
          "id": "no-deploy",
          "text": "Prepare a patch; do not deploy it."
        }
      ],
      "handoff": "Keep the public interface compatible. Windows remains untested. The patch is ready to deploy."
    },
    "fixture": {
      "kept_0": 0.99,
      "kept_1": 0.99,
      "kept_2": 0.01
    },
    "expected": "repair-handoff",
    "expectedDetails": {
      "missing": [
        "no-deploy"
      ]
    }
  },
  {
    "id": "faithful-paraphrase",
    "note": "Meaning is preserved without copying verbatim.",
    "state": {
      "obligations": [
        {
          "id": "compatibility",
          "text": "Preserve the existing public API."
        },
        {
          "id": "unverified",
          "text": "The proposed fix has not been verified on Windows."
        },
        {
          "id": "no-deploy",
          "text": "Prepare a patch; do not deploy it."
        }
      ],
      "handoff": "Prepare the patch only; shipping it is outside scope. Existing callers must continue to work without API changes. Windows verification is still outstanding."
    },
    "fixture": {
      "kept_0": 0.99,
      "kept_1": 0.99,
      "kept_2": 0.99
    },
    "expected": "handoff-candidate",
    "expectedDetails": {
      "missing": []
    }
  },
  {
    "id": "erased-uncertainty",
    "note": "An unknown becomes an asserted success.",
    "state": {
      "obligations": [
        {
          "id": "compatibility",
          "text": "Preserve the existing public API."
        },
        {
          "id": "unverified",
          "text": "The proposed fix has not been verified on Windows."
        },
        {
          "id": "no-deploy",
          "text": "Prepare a patch; do not deploy it."
        }
      ],
      "handoff": "Preserve the existing public API. Prepare a patch; do not deploy it. The fix is verified on all platforms, including Windows."
    },
    "fixture": {
      "kept_0": 0.99,
      "kept_1": 0.01,
      "kept_2": 0.99
    },
    "expected": "repair-handoff",
    "expectedDetails": {
      "missing": [
        "unverified"
      ]
    }
  }
];
