// Authored teaching cases and illustrative responses. These are not API recordings.
export default [
  {
    "id": "acknowledgement",
    "note": "A queued job is not its output.",
    "state": {
      "request": "Return the failed checkout IDs for September 21.",
      "result": {
        "status": 200,
        "truncated": false,
        "text": "Your September 21 checkout report has been queued. Check back later."
      }
    },
    "fixture": {
      "satisfies": 0.01,
      "matches_scope": 0.99
    },
    "expected": "incomplete"
  },
  {
    "id": "wrong-day",
    "note": "The right deliverable for the wrong period.",
    "state": {
      "request": "Return the failed checkout IDs for September 21.",
      "result": {
        "status": 200,
        "truncated": false,
        "text": "September 20 failed checkout IDs: cart-18, cart-23. Complete report."
      }
    },
    "fixture": {
      "satisfies": 0.02,
      "matches_scope": 0.01
    },
    "expected": "incomplete"
  },
  {
    "id": "complete",
    "note": "A bounded result with matching scope.",
    "state": {
      "request": "Return the failed checkout IDs for September 21.",
      "result": {
        "status": 200,
        "truncated": false,
        "text": "September 21 failed checkout IDs: cart-31, cart-32. All failed checkouts for that day are included."
      }
    },
    "fixture": {
      "satisfies": 0.99,
      "matches_scope": 0.99
    },
    "expected": "accept-candidate"
  }
];
