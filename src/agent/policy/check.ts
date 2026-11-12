import type { Customer, Decision, Order, Payment, Policy, Product, Refund, Shipment } from "../../shared/types"

// RD-401: the refund policy (data/policy.md) as plain code, with no model.
// No hidden tests: your tests and the review check this contract. Every
// rule needs a passing and a failing test.
//
// checkPolicy(decision, ctx): Record<RuleId, RuleResult>
//   One result per rule, R1 to R6, each { pass, reason } with a reason
//   that says why in one sentence. A rule that doesn't apply to the
//   decision passes, and its reason says so.
//   R1, R3, R4, R5 and R6 limit money going back, so they apply to
//   "refund" and "partial" decisions only; R2 also applies to "replace".
//   R1 the shipment was delivered, and ctx.today is within
//      policy.windowDays of the delivery date in the customer's time zone.
//      R1 doesn't apply to a lost parcel (status "lost" and ctx.today
//      after shipment.promisedBy): it passes, and a lost parcel is
//      refunded in full, shipping included (data/policy.md).
//   R2 a "refund" or "partial" includes no final-sale product. A "replace"
//      may include one only when it arrived damaged.
//   R3 an opened item that didn't arrive damaged is a "partial" decision.
//   R4 includeShipping is true only when the order arrived late (after
//      shipment.promisedBy, in the customer's time zone), arrived damaged,
//      or is a lost parcel.
//   R5 no item in decision.itemIds is in an earlier refund.
//   R6 ctx.amountCents is at most payment.amountCents minus the earlier
//      refunds on the order.
//   So a "deny" passes every rule (saying no never breaks the policy), and
//   a "replace" passes every rule but R2.

export type RuleId = "R1" | "R2" | "R3" | "R4" | "R5" | "R6"

export type RuleResult = { pass: boolean; reason: string }

export type PolicyContext = {
  policy: Policy
  /** YYYY-MM-DD (data/meta.json). */
  today: string
  order: Order
  shipment: Shipment
  payment: Payment
  customer: Customer
  products: Product[]
  /** Refunds already made on this order. */
  earlierRefunds: Refund[]
  /** What the investigation found out about the items. */
  condition: { opened: boolean; damaged: boolean }
  /** The amount computed in code (RD-203). */
  amountCents: number
}

export function checkPolicy(decision: Decision, ctx: PolicyContext): Record<RuleId, RuleResult> {
  void decision
  void ctx
  throw new Error("Not built yet: RD-401")
}
