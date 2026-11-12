# HomeShop Refund Desk

The AI agent behind the support desk of **HomeShop**, an online shop for
home and kitchen goods in the EU. A customer writes:

> My kettle arrived broken, I want my money back.

The agent finds the customer and the order, checks the shipment, decides
what the refund policy allows, prepares the refund and drafts the reply.
The agent reads, searches and recommends. Code checks the policy, the
support lead approves larger refunds, and only then can money move.

Everything runs on HomeShop's sample data and a fake shop system. No real
payment service is ever called, so you can repeat and check every run.

## Getting started

```sh
npm ci                   # install the dependencies
npm run check            # type check
npm test                 # unit tests (one fails on purpose: fixing it is RD-100)
npm run dev              # the API on port 3000 and the web app on port 5173
```

Then open the web app. In your HandsOn workspace, open the **Preview** tab
(port 5173). On your own computer, open http://localhost:5173/. The inbox
shows 40 customer messages. Open one to see its ticket page. Parts that
your code builds say "Not built yet" and name the ticket.

More commands, as the tickets need them:

```sh
npm run bare             # one model call with no tools (RD-100, RD-302)
npm run agent -- "Hi, an item in my order FH-100231 arrived broken. Can I get my money back?"   # once RD-102 is done
npm run agent -- --from jonas.becker@example.com "The frying pan from my last order is scratched"
npm run trace -- <runId> # show one run as a timeline (RD-103)
npm run evals -- --limit 3                                                                    # RD-302
npm run judge            # your reply judge against your hand labels (RD-304)
npm run build            # build the web app into dist/
npm run db:reset         # delete the database; the next start creates it again
```

In your HandsOn workspace, the platform provides the model. You don't need
an API key, and you should never add one.

`npm run agent`, `npm run bare`, `npm run evals` and the "Run the agent"
button use real tokens from your daily budget. Your tests should use the
scripted fake model instead (`src/server/testing/fake-chat.ts`). It costs
nothing and gives the same answers every time.

## What's where

```
data/              HomeShop's sample data (read-only, see below), and help/faq.md, the help centre (RD-505)
scenarios/         the three customer situations of RD-202
evals/             examples.jsonl, provided/*.jsonl and your cases.jsonl; recorded/, an early
                   version's runs to read (RD-301); replies.jsonl, drafted replies to label (RD-304)
runs/              traces (one JSONL file per run) and eval reports
docs/specs/        specs you write before a coding agent builds something (000-template.md, RD-204, RD-702)
docs/decisions/    decision records, starting from 000-template.md (RD-405)
reviews/           a teammate's patch to review, and your REVIEW.md (RD-602)
red-team/          the security review's findings against the agent (RD-603)
BACKLOG.md         work you decided to do later, written as tickets
EVALS.md           your eval scores and what the failures taught you
scripts/dev.mjs    npm run dev: starts the API and the web app together
src/
  shared/          types and zod schemas used by the API, the agent and the web app
  server/          the API (provided)
    app.ts         the Express app, its routes and its JSON errors
    routes/        tickets, runs, refunds, approvals (approvals is RD-501)
    db.ts          the SQLite database in .data/refund-desk.db
    llm.ts         calls the model
    shop/          the fake shop system, its data and its date helpers
    testing/       the scripted fake model for tests
  agent/           the agent: most tickets change files here
    tools/         the agent's tools (RD-101)
    loop.ts        the agent loop (RD-102)
    trace.ts       traces (RD-103)
    evals/         invented order ids, scoring, pass rates and the eval runner (RD-302),
                   repeated runs (RD-303), cost and time (RD-701) and the reply judge (RD-304)
    orders/        what the message says about the order (RD-201) and which order it is (RD-202)
    reliability/   retries (RD-204)
    prompt.ts      the messages every model call starts with (RD-100)
    decide.ts      the decision and its amount (RD-203)
    help/          the help centre and its search (RD-505)
    plan/          the planner and the plan's executor (RD-404)
    memory/        notes about a returning customer (RD-604)
    policy/ tickets/ workflow.ts refunds/
                   later milestones: each file starts with its contract
    tools/search.ts
                   find orders by product (RD-602, Youssef's patch)
  web/             the web app (React)
    pages/         Inbox and Ticket (provided), Approvals (RD-502), Status (RD-702)
    components/    RunTimeline (RD-103) and small provided pieces
```

Each file that a ticket names starts with a **contract** comment. The
contract lists the functions, types and behaviour that Verify's hidden
tests check, or says that the ticket has no hidden tests. How you build it
is up to you. Provided files are complete: read them, and leave them alone
unless a ticket says otherwise.

When code isn't built yet, the API answers `501` with
`{"error": "Not built yet: RD-102"}` instead of crashing, and the web app
shows that message where the result would go.

## Where to look this milestone

Each milestone changes only a few files. If a file isn't listed yet, it is
either provided or used in a later milestone. Leave it alone until a ticket
names it.

- **Milestone 1, the agent loop:** `src/agent/prompt.ts`,
  `src/agent/tools/index.ts`, `src/agent/loop.ts`, `src/agent/trace.ts` and
  `src/web/components/RunTimeline.tsx`, with their tests next to them.
- **Milestone 2, find the order and decide:** `src/agent/orders/hint.ts`,
  `src/agent/orders/match.ts` with `scenarios/`, `src/agent/decide.ts`,
  `src/agent/prompt.ts`, and `src/agent/reliability/retry.ts` with
  `docs/specs/`.
- **Milestone 3, evals:** `evals/recorded/` and a new `evals/labels.jsonl`,
  `src/agent/evals/invented.ts`, `src/agent/evals/score.ts`,
  `src/agent/evals/checks.ts`, `src/agent/evals/run.ts`, a new
  `evals/cases.jsonl`, `src/agent/evals/repeat.ts`, `src/agent/prompt.ts`
  or `src/agent/tools/index.ts`, `src/agent/evals/judge.ts` with
  `evals/replies.jsonl`, `.github/workflows/ci.yml`, and `EVALS.md`.
- **Milestone 4, policy, state and workflow:** `src/agent/policy/check.ts`,
  `src/agent/tickets/ticket.ts`, `src/server/db.ts`,
  `src/agent/workflow.ts`, `src/agent/plan/plan.ts` and `docs/decisions/`.
- **Milestone 5, approvals and safe refunds:**
  `src/server/routes/approvals.ts`, `src/web/pages/Approvals.tsx`,
  `src/agent/refunds/issue.ts`, `src/agent/tickets/ticket.ts` and
  `src/agent/help/help.ts`.
- **Milestone 6, guardrails under attack:** `evals/provided/red-team.jsonl`,
  `src/agent/evals/run.ts`, a new `SECURITY.md`, `reviews/` with
  `src/agent/tools/search.ts`, `red-team/findings.md`, `BACKLOG.md`,
  `src/agent/memory/notes.ts` and `src/server/db.ts`.
- **Milestone 7, demo week:** `src/agent/evals/report.ts` with
  `src/server/trace-cli.ts`, `docs/specs/`, `src/web/pages/Status.tsx`,
  `BACKLOG.md` and `README.md`.
- **Stretch tickets** (RD-104, RD-605, RD-705 and RD-706) name their own
  files.

## The data

| File | What's in it |
| --- | --- |
| `products.json` | 60 products: name, category, price in cents, and whether it is final sale |
| `customers.json` | 300 customers in seven countries: email, postcode, time zone |
| `orders.json` | About 1,200 orders from August to November: items, prices, shipping, total, sales channel |
| `shipments.json` | One per order: carrier, tracking code, delivery time (UTC), promised date, status |
| `payments.json` | What each customer paid, and how |
| `refunds.json` | Refunds already made before today |
| `policy.md`, `policy.json` | The refund policy (rules R1 to R6) and who approves what |
| `staff.json` | The support agents, the support lead and the finance approver |
| `inbox.json` | 40 customer messages: the tickets in the inbox |
| `meta.json` | "Today" (2026-11-20) for the refund window |
| `faults.json` | Where the fake shop fails on purpose |
| `red-team.json` | Messages and order notes with hidden instructions (milestone 6) |

All money is whole euro cents: 3999 is €39.99. All instants are UTC.

The fake shop misbehaves on purpose in a few places:
- some lookups time out once, and the payments service always fails for one
  customer
- a shipment can say "delivered" while the customer says it never came
- some customers have several orders for the same product
- `refund()` can't be undone
- from milestone 6, some order notes contain hidden instructions
  (`new Shop({ redTeam: true })`)

## How work is checked

- **Tests on every push** run in GitHub Actions (`.github/workflows/ci.yml`).
- **Verify solution** in the IDE runs hidden tests for the tickets that have
  them. The tests check the contract in the file the ticket names.
- **Pull request review:** Karim, your AI tech lead, reviews each PR against
  the ticket's acceptance criteria. An instructor reviews some PRs too.
- **Milestone review:** you demo the milestone's work in the running app and
  show its eval numbers.
