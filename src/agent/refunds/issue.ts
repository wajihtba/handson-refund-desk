import type { Shop } from "../../server/shop/api"
import type { Policy, Ticket } from "../../shared/types"

// The only code that moves money. RD-503 builds it, RD-504 and RD-603
// harden it. Verify runs hidden tests against this contract: on RD-503
// the money parts (approved status, once only, the payment cap, refund and
// partial only), on RD-603 all of it. RD-504 has no hidden tests of its
// own: your tests and the review check its lines.
//
// issueRefund(ticket, shop, opts): Promise<Ticket>
//   Refunds ticket.amountCents for ticket.decision.orderId and
//   ticket.decision.itemIds with shop.refund, and returns the ticket in
//   status "refunded" with refundId set to the refund's id.
//   - Throws a RefundRefusedError, and calls nothing on the shop, unless
//     the ticket is approved. Approved means ticket.status is "approved"
//     and, for an amount above policy.leadApprovalAboveCents (€50), the
//     shop's approval queue (shop.listApprovals) holds an approved
//     approval for this ticket from policy.supportLeadId. Above
//     policy.financeApprovalAboveCents (€200) it also holds one from
//     policy.financeApproverId. An approval from anyone else, such as the
//     customer or a support agent, never counts. A refund of €50 or less
//     needs no approval: ticket.status "approved" is enough.
//   - Never refunds more than the order's payment minus its earlier
//     refunds (shop.getPayment, shop.getRefunds): throws a
//     RefundRefusedError instead.
//   - Calling it twice for the same ticket refunds once. The idempotency
//     key comes from the ticket id and the item ids, so a retry after a
//     crash pays nothing more.
//   - Only "refund" and "partial" decisions move money. Any other decision
//     is refused.
//   opts.policy defaults to shop.data.policy.
//   RD-504: an approval covers only the amount it was requested for
//   (Approval.amountCents). An approved approval counts only when its
//   amountCents is at least ticket.amountCents. A refund above it throws a
//   RefundRefusedError and calls nothing on the shop. The workflow then
//   asks for a new approval of the new amount, and the ticket goes back to
//   pending_approval (the RD-504 change in tickets/ticket.ts).
//   The red-team findings in red-team/findings.md show where this matters.

export class RefundRefusedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "RefundRefusedError"
  }
}

export type IssueOptions = { policy?: Policy }

export async function issueRefund(ticket: Ticket, shop: Shop, opts: IssueOptions = {}): Promise<Ticket> {
  void ticket
  void shop
  void opts
  throw new Error("Not built yet: RD-503")
}
