// The shapes of HomeShop's data (data/*.json), of what the fake shop system
// returns, and of what the API and the web app send each other. Provided:
// read them, don't change them. Money is always whole euro cents.

export type Product = {
  id: string // "P-001"
  name: string
  category: string
  priceCents: number
  /** R2: final-sale items are never refunded (a damaged one can be replaced). */
  finalSale: boolean
}

export type Customer = {
  id: string // "C-0001"
  name: string
  email: string
  postcode: string
  /** Two-letter country code: "DE", "PT", ... */
  country: string
  /** IANA time zone, e.g. "Europe/Berlin". R1 counts days in this zone. */
  timeZone: string
}

export type OrderItem = {
  id: string // "FH-100001-1": the order id and the item's position
  productId: string
  quantity: number
  unitPriceCents: number
}

export type Order = {
  id: string // "FH-100001"
  customerId: string
  /** An instant, in UTC: "2026-10-03T14:12:00Z". */
  placedAt: string
  /** "marketplace": sold through a marketplace partner, not the web shop. */
  channel: "web" | "marketplace"
  items: OrderItem[]
  shippingCents: number
  /** Items plus shipping: what the customer paid. */
  totalCents: number
  /** A note the customer left at checkout. Only some orders have one. */
  note?: string
}

export type ShipmentStatus = "in_transit" | "delivered" | "lost"

export type Shipment = {
  orderId: string
  carrier: string
  trackingCode: string // "TRK" + 9 digits
  /** An instant, in UTC. */
  shippedAt: string
  /** An instant, in UTC ("2026-10-20T23:30:00Z"), or null when not delivered. */
  deliveredAt: string | null
  /** The date the shop promised delivery by (YYYY-MM-DD). Later is late (R4). */
  promisedBy: string
  status: ShipmentStatus
}

export type Payment = {
  orderId: string
  amountCents: number
  method: "card" | "paypal" | "klarna"
  paidAt: string
}

export type Refund = {
  id: string // "R-0001"
  orderId: string
  itemIds: string[]
  amountCents: number
  /** An instant, in UTC. */
  at: string
  /** Set on refunds issued through Shop.refund(). */
  idempotencyKey?: string
}

export type ApprovalStatus = "pending" | "approved" | "rejected"

export type Approval = {
  ticketId: string
  approverId: string
  amountCents: number
  summary: string
  status: ApprovalStatus
  comment?: string
}

export type StaffRole = "agent" | "support_lead" | "finance"

export type Staff = { id: string; name: string; email: string; role: StaffRole }

export type Policy = {
  currency: "EUR"
  /** R1: days after the local delivery date. */
  windowDays: number
  /** R3: an opened item gets this percentage of its price. */
  partialPercent: number
  /** Refunds above this need the support lead's approval. */
  leadApprovalAboveCents: number
  /** Refunds above this need finance's approval too. */
  financeApprovalAboveCents: number
  supportLeadId: string
  financeApproverId: string
  rules: { id: string; text: string }[]
  /** Who approves what, in words (data/policy.md). */
  approvals: string[]
}

/** A customer's email, as it arrived in the support inbox. */
export type InboxMessage = {
  id: string // "T-001": the ticket it opens
  from: { email: string; name: string }
  receivedAt: string
  subject: string
  body: string
}

export type TicketStatus =
  | "new"
  | "investigating"
  | "proposed"
  | "pending_approval"
  | "approved"
  | "refunded"
  | "replied"
  | "closed"
  | "rejected"

export type DecisionAction = "refund" | "partial" | "replace" | "deny"

/** What the agent recommends for one order (RD-203). */
export type Decision = {
  action: DecisionAction
  orderId: string
  /** The order items the decision is about. Empty only for "deny". */
  itemIds: string[]
  includeShipping: boolean
  /** At least two reasons, each one sentence. */
  reasons: string[]
}

export type TicketHistoryEntry = { from: TicketStatus; to: TicketStatus; at: string; note?: string }

/** One customer message and everything the desk did about it. */
export type Ticket = {
  id: string
  status: TicketStatus
  message: InboxMessage
  customerId?: string
  orderId?: string
  decision?: Decision
  /** Computed in code (RD-203), never by the model. */
  amountCents?: number
  /** The reply to send to the customer. */
  reply?: string
  /** The refund the shop issued (RD-503). */
  refundId?: string
  /** The last agent run, its trace is runs/<runId>.jsonl (RD-103). */
  runId?: string
  history: TicketHistoryEntry[]
  updatedAt: string
}

/**
 * One line of a run's trace file (RD-103). RD-103 writes "model" and "tool"
 * lines, one per step of the agent loop. Later tickets add to the same file:
 * "task" lines for the plan's task statuses (RD-404) and "stage" lines for the
 * workflow's stages (RD-403), and the token counts of each model step
 * (RD-701, in usage). `step` is the line's 1-based position in the file.
 */
export type TraceLine = {
  runId: string
  step: number
  type: "model" | "tool" | "task" | "stage"
  /** The tool on a "tool" line. */
  tool?: string
  args?: unknown
  summary: string
  durationMs: number
  /** RD-701: on a "model" line, the tokens the model reported for that call. */
  usage?: { promptTokens: number; completionTokens: number }
}

// ---- what the API sends the web app -------------------------------------------

/** One row of the inbox: GET /api/tickets. */
export type TicketSummary = {
  id: string
  status: TicketStatus
  from: { email: string; name: string }
  subject: string
  receivedAt: string
  /** Whole days from the message's date to today (data/meta.json). */
  waitingDays: number
  orderId?: string
  amountCents?: number
}

/** GET /api/tickets/:id */
export type TicketDetail = {
  ticket: Ticket
  /** The customer whose email the message came from, or null for an unknown address. */
  customer: Customer | null
  /** The ticket's order, once the agent found it. */
  order: Order | null
}

/** POST /api/tickets/:id/run */
export type RunResponse = {
  ticket: Ticket
  run: { runId: string; stopReason: string; steps: number }
  /** Tickets whose code this run skipped because it is not built yet ("RD-103", ...). */
  notBuilt: string[]
}
