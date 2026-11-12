import type { ChatFn } from "../server/llm"
import type { Decision, Order, Policy } from "../shared/types"
import type { RunResult } from "./loop"

// RD-203: the agent's decision, asked for as structured output and checked
// in code, and an amount computed by code, never by the model. Verify runs
// hidden tests against this contract, with a scripted model as opts.chat.
//
// requestDecision(message, run, opts): Promise<Parsed>
//   - After the agent's run, one model call (opts.chat, or the platform
//     model in src/server/llm.ts) asks for the decision. The request holds
//     the customer's message and what the run's successful tool steps
//     returned, and a responseFormat named "decision" whose schema is the
//     JSON schema of DecisionSchema (src/shared/schemas.ts).
//   - Checks the reply's text with parseDecision. When it is invalid, asks
//     once more, with parseDecision's error in the request, and returns
//     what that second reply gives. Never more than two calls.
//
// parseDecision(text): Parsed
//   - text is the model's reply: a JSON object, bare or inside one ```json
//     fenced block.
//   - Valid when it fits DecisionSchema: action is one of "refund",
//     "partial", "replace" or "deny", orderId is a string, itemIds is an
//     array of strings (not empty unless the action is "deny"),
//     includeShipping is a boolean, and reasons is an array of at least 2
//     non-empty strings. Extra fields are left out of value.
//   - { ok: true, value } when valid, { ok: false, error } otherwise, with
//     an error that says what is wrong. Never throws.
//
// refundAmountCents(decision, order, policy): number
//   - The sum of quantity * unitPriceCents over the order items named in
//     decision.itemIds.
//   - For "partial": that sum times policy.partialPercent / 100, rounded
//     to whole cents.
//   - Plus order.shippingCents when decision.includeShipping is true.
//   - 0 for "replace" and "deny".
//   - Throws when an id in decision.itemIds is not an item of the order.

export type Parsed = { ok: true; value: Decision } | { ok: false; error: string }

export async function requestDecision(message: string, run: RunResult, opts: { chat?: ChatFn } = {}): Promise<Parsed> {
  void message
  void run
  void opts
  throw new Error("Not built yet: RD-203")
}

export function parseDecision(text: string): Parsed {
  void text
  return { ok: false, error: "Not built yet: RD-203" }
}

export function refundAmountCents(decision: Decision, order: Order, policy: Policy): number {
  void decision
  void order
  void policy
  throw new Error("Not built yet: RD-203")
}
