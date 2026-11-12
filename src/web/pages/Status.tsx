import type { Refund, Ticket } from "../../shared/types"

// RD-702: the customer's refund status page, built by a coding agent from
// your spec (docs/specs/status-page.md, started from
// docs/specs/000-template.md). Verify runs hidden tests against this
// contract, rendering the page with react-dom/server
// (renderToStaticMarkup), with no browser and no router.
//
// toStatusView(ticket, refund?): StatusView
//   What the page shows, worked out from the ticket and, once refunded,
//   its refund. Never throws for a ticket from the API.
//
// StatusPage({ view }: { view: StatusView })   (the default export)
//   - Shows the ticket id, the customer's first name, the order id (once
//     known), the decision in plain words (for example "Full refund",
//     "Partial refund", "Replacement", "Refund declined", or that the
//     ticket is still being looked at), the amount as "€12.34" when
//     refunded, the date, and the customer's message.
//   - Text from the data (names, the customer's message) renders as text:
//     "<script>" in a message appears escaped, never as a tag. Never use
//     dangerouslySetInnerHTML.
//   - Renders without a router: no <Link>, no hooks from react-router.
//
// The route /status/:id (pages/StatusRoute.tsx, provided) loads the data
// and renders this page.

export type StatusView = {
  ticketId: string
  firstName: string
  orderId?: string
  /** The decision in plain words. */
  decision: string
  /** "€12.34", once refunded. */
  amount?: string
  /** YYYY-MM-DD: the refund's date once refunded, otherwise the ticket's last update. */
  date: string
  /** The customer's message, as they wrote it. */
  message: string
}

export function toStatusView(ticket: Ticket, refund?: Refund | null): StatusView {
  void ticket
  void refund
  throw new Error("Not built yet: RD-702")
}

export default function StatusPage({ view }: { view: StatusView }) {
  void view
  return <p className="empty">Not built yet: RD-702</p>
}
