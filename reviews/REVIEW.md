# Review: RD-602 order search

Youssef's patch: `reviews/rd-602.patch` (apply it on your branch with
`git apply reviews/rd-602.patch`). A coding agent wrote it: the
`search_orders` tool, its description, its tests and six eval cases in
`evals/provided/order-search.jsonl`. His PR says all six cases pass.

Review it as you would a teammate's pull request: the code, what the tool
tells the model, and whether the eval cases prove what they claim. Ask what
goes wrong for a customer or for HomeShop's money, not only what looks odd.

## Severities

- **blocker**: wrong results, money or data at risk. Prove it with a test that
  fails on the patch, then fix it before merging.
- **should fix**: works today, breaks soon or makes the next change harder.
- **nit**: style or naming. Never blocks.

## Findings

Most harmful first.

| # | Severity | Where (file:line, or case id) | What goes wrong, for whom | Test that proves it |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |

## What the patch got right

<!-- What you kept, and why. A review that only lists problems often leads to a rewrite. -->
