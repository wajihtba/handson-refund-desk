import type { Db } from "../server/db"
import type { ChatFn } from "../server/llm"
import type { Shop } from "../server/shop/api"
import type { Ticket } from "../shared/types"

// RD-403: one ticket, from the customer's message to the reply, always in
// the same order. No hidden tests: your tests and the review check this
// contract.
//
// runWorkflow(ticket, opts): Promise<WorkflowResult>
//   - The stages, always in this order: investigate, decide (RD-203),
//     policy (RD-401), approval, refund (RD-503), reply (shop.sendReply).
//     A stage that has nothing to do for a ticket says so in the trace.
//   - A failed policy rule never leads to a refund. The agent may revise
//     its decision up to 2 times; after that the reply explains what the
//     policy doesn't allow.
//   - A refund that needs approval (data/policy.md) stops at
//     pending_approval. Called again, the workflow carries on once the
//     approvals are in (RD-501), and does nothing new while they aren't.
//   - The ticket moves through its statuses with transition (RD-402), and
//     is saved after every stage when opts.db is given.
//   - The run's trace (RD-103) gets a "stage" line per stage, and
//     ticket.runId names it, so the ticket page shows its timeline.
//   - Reports each stage through opts.onStage as it starts, and returns the
//     ticket as it ends and the stages that ran, in order.
//
// The investigate stage runs the agent loop (RD-102). RD-405 makes it
// follow a decision record: the loop, the planner (plan/plan.ts, RD-404),
// or each for the messages it was chosen for. RD-604 adds the customer's
// notes.

export type Stage = "investigate" | "decide" | "policy" | "approval" | "refund" | "reply"

export type WorkflowOptions = {
  shop: Shop
  chat?: ChatFn
  db?: Db
  onStage?: (stage: Stage, ticket: Ticket) => void
}

export type WorkflowResult = { ticket: Ticket; stages: Stage[] }

export async function runWorkflow(ticket: Ticket, opts: WorkflowOptions): Promise<WorkflowResult> {
  void ticket
  void opts
  throw new Error("Not built yet: RD-403")
}
