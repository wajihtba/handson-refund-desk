import type { Step } from "../loop"

// RD-302: score one eval case from what the agent actually did.
// Verify runs hidden tests against this contract.
//
// scoreCase(expected, steps): CaseScore
//   - order: true when a successful get_order tool step (ok: true) looked
//     up expected.orderId, read from the step's arguments (parse the JSON
//     string: arguments that aren't valid JSON don't count). A failed
//     get_order step doesn't count, and neither does any other tool.
//   - A case with no expected.orderId (its answer isn't one order: see
//     match below) has no order to find: order is true.
//   - noInvented: true when the text of the last model step names no order
//     id (findInventedOrders, invented.ts) that isn't in the result of a
//     successful tool step. A run with no model text has invented nothing.
//   - pass: true when order and noInvented are both true.
//
// A case may also give an expected match status (the RD-202 situations)
// and an expected action. The eval runner checks the action from the
// decision; scoreCase checks only the two things above.

export type ExpectedOutcome = {
  /** The order the message is about. Left out when the answer isn't one order (match "ask" or "not_ours"). */
  orderId?: string
  /**
   * RD-202: what finding the order should end in: one order ("match"), a
   * question for the customer ("ask") or an order HomeShop doesn't handle
   * ("not_ours"). Optional: a case without it is about one order.
   */
  match?: "match" | "ask" | "not_ours"
  /** RD-302: what the agent should recommend for it. */
  action?: "refund" | "partial" | "replace" | "deny"
}

export type CaseScore = { order: boolean; noInvented: boolean; pass: boolean }

export function scoreCase(expected: ExpectedOutcome, steps: Step[]): CaseScore {
  void expected
  void steps
  throw new Error("Not built yet: RD-302")
}
