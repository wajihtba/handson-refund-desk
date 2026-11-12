# Evals

Scores, milestone by milestone, and what the failures taught you.

An eval case is one customer message plus the answer you expect (one line
of `evals/cases.jsonl`). `npm run evals` runs the agent on every case and
writes a report to `runs/evals-*.json`. Every number here names the report
it came from, and every failure names its run id, so anyone can open its
trace with `npm run trace -- <runId>`.

## Milestone 3

### Failure types in the recorded runs (RD-301)

| Failure type | Runs | Example run id |
| --- | --- | --- |
|  |  |  |

- What an eval case would check for the two most frequent types:

### The eval set (RD-302)

- Cases: 15 (at least 4 for your two most frequent failure types, the
  three RD-202 situations, the rest from `evals/provided/simple.jsonl` or
  your own)
- Report:
- Pass rate per check:
- Failures, grouped by cause (cause, run ids, the fix for that cause):

### One check, before and after (RD-303)

- Check, and the cases in `evals/focus.jsonl`:
- Before, 3 runs (mean, lowest, highest; reports):
- The change, and why it should help:
- After, 3 runs (mean, lowest, highest; reports):
- isRealChange says:

### The reply judge (RD-304)

- Agreement with your hand labels (out of 20):
- Every reply the judge passed that you failed, and why:
- What you changed (a label or the prompt), and why:

### Evals in CI (RD-305)

- Scripted cases, and the failures they come from:
- Threshold, and why:
- A failing run and a passing run (links):

## Milestone 4

### Plan first, or keep the loop (RD-405)

| Design | Pass rate | Model calls per message | Report |
| --- | --- | --- | --- |
| Agent loop |  |  |  |
| Plan first |  |  |  |

- Cases with several problems:
- The decision: `docs/decisions/001-agent-design.md`

## Milestone 5

### The help tool (RD-506)

- Help cases (look it up) and plain cases (don't):
- Before the change (pass rates, report):
- The change to the tool's name or description:
- After the change (pass rates, report):

## Milestone 6

### Attack cases (RD-601)

- Attack cases: `evals/provided/red-team.jsonl` (10 cases)
- Baseline report, and the cases that broke something (run id, what went
  wrong):
- After the defence (report, unapproved refunds, policy violations):

## Milestone 7

### What a run costs (RD-701)

- Price per million tokens, in and out, and where it comes from:
- Cost per case, p50 and p95 (report):
- Time per case, p50 and p95 (report):

### Reliability before the demo (RD-704)

- What counts as a failure:
- Failure rate over 3 runs of the full set, before (reports):
- Failure rate over 3 runs of the full set, after (reports):
- Why the rest still fail:

## Stretch tickets

Add a section here for any stretch ticket you take that reports numbers
(RD-605 or RD-706).
