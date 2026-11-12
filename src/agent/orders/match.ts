import type { Customer, Order, Product } from "../../shared/types"

// RD-202: find the customer who wrote and the order they mean. Verify runs
// hidden tests against this contract.
//
// What to do when the records don't give one clear answer is Nadia's
// decision, not the code's. The ticket leaves it out on purpose. Ask her
// before you write these.
//
// findCustomerFor(sender, customers): CustomerMatch
//   The customer who sent the message. sender.email and sender.name are
//   who the message came from (InboxMessage.from). sender.postcode is the
//   postcode the message gives, if any (a signature with an address, like
//   T-009's): extractHint (RD-201, orders/hint.ts) reads it.
//   - { status: "match", customerId } when the sender is one customer.
//   - { status: "ask", question } when you need the customer to tell you
//     more. The question is one sentence for the customer.
//   - { status: "unknown", reason } when no customer fits.
//
// matchOrder(orders, hint, ctx): OrderMatch
//   orders are the customer's orders. hint is what the message says about
//   the order (extractHint, RD-201); every field is optional. ctx.products names the products.
//   An order fits hint.product when one of its items is a product whose
//   name contains it, ignoring case ("kettle" fits "Glass kettle"), and
//   fits hint.month when placedAt falls in that month. hint.latest asks
//   for the newest order ("my last order"): of the orders that fit the
//   other fields, the one placed last (placedAt) is the one meant.
//   - { status: "match", orderId } when one order is the one meant.
//   - { status: "ask", question } when you need the customer to tell you
//     more. The question is one sentence for the customer.
//   - { status: "not_ours", reason } when HomeShop's support doesn't handle
//     this order. The reason is one sentence.
//
// The three scenarios in scenarios/202-*.json are the situations to get
// right. Each becomes an eval case.

export type Sender = { email: string; name: string; postcode?: string }

export type CustomerMatch =
  | { status: "match"; customerId: string }
  | { status: "ask"; question: string }
  | { status: "unknown"; reason: string }

export type OrderHint = {
  /** An order id the message gives, written as "FH-" plus 6 digits. */
  orderId?: string
  /** A product the message names: "kettle", "bath towels", ... */
  product?: string
  /** The month the order was placed, as YYYY-MM, when the message says. */
  month?: string
  /** True when the message means the newest fitting order: "my last order". */
  latest?: boolean
}

export type MatchContext = { products: Product[] }

export type OrderMatch =
  | { status: "match"; orderId: string }
  | { status: "ask"; question: string }
  | { status: "not_ours"; reason: string }

export function findCustomerFor(sender: Sender, customers: Customer[]): CustomerMatch {
  void sender
  void customers
  throw new Error("Not built yet: RD-202")
}

export function matchOrder(orders: Order[], hint: OrderHint, ctx: MatchContext): OrderMatch {
  void orders
  void hint
  void ctx
  throw new Error("Not built yet: RD-202")
}
