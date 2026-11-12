import { loadData } from "./data"
import type { Approval, Customer, Faults, Order, Payment, Refund, Shipment, ShopData, ShopErrorCode } from "./types"

// The fake shop system HomeShop's agent talks to. Provided: your agent calls
// it through tools. It never calls a real payment service.
//
// It is deterministic: the same call on the same data always answers the
// same way, so a run can be repeated and checked. Even its clock is fixed:
// a refund it issues is stamped on the data's today (data/meta.json) at
// 12:00 UTC, one minute later for each further refund, so it is never dated
// before the customer wrote. It also misbehaves on
// purpose, as data/faults.json says: some lookups time out once, and the
// payments service always fails for one customer. With { redTeam: true },
// some orders carry notes with hidden instructions (RD-601).
//
// State (approvals, refunds issued, replies sent, the call log) lives in the
// instance: make one Shop per run, or per test.

export class ShopApiError extends Error {
  constructor(
    readonly code: ShopErrorCode,
    message: string
  ) {
    super(`${code}: ${message}`)
    this.name = "ShopApiError"
  }
}

export type ShopOptions = {
  /** Defaults to data/*.json. Tests pass a small data set of their own. */
  data?: ShopData
  /** Defaults to data.faults; false turns every fault off. */
  faults?: Faults | false
  /** Add the order notes with hidden instructions (RD-601). */
  redTeam?: boolean
}

/** One call to the shop, as the call log records it. */
export type ShopCall = { tool: string; args: Record<string, unknown> }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Shop {
  readonly data: ShopData
  /** Every async call, in order. listApprovals, decideApproval and refundsIssued are not logged. */
  readonly calls: ShopCall[] = []
  private readonly faults: Faults
  private readonly redTeam: boolean
  private readonly faultHits = new Map<number, number>()
  private readonly approvals: Approval[] = []
  private readonly issued: Refund[] = []
  private readonly replies: { ticketId: string; body: string }[] = []

  constructor(opts: ShopOptions = {}) {
    this.data = opts.data ?? loadData()
    this.faults = opts.faults === false ? { errors: [] } : (opts.faults ?? this.data.faults)
    this.redTeam = opts.redTeam ?? false
  }

  // ---- customers and orders (read-only) ---------------------------------------

  /** The customer with this email address. Case and surrounding spaces don't matter. */
  async findCustomer(args: { email: string }): Promise<Customer> {
    this.enter("find_customer", args)
    if (typeof args.email !== "string" || !EMAIL.test(args.email.trim()))
      throw new ShopApiError("invalid_argument", `not an email address: ${String(args.email)}`)
    const email = args.email.trim().toLowerCase()
    const c = this.data.customers.find((x) => x.email.toLowerCase() === email)
    if (!c) throw new ShopApiError("not_found", `no customer with email ${args.email}`)
    return { ...c }
  }

  async getCustomer(args: { customerId: string }): Promise<Customer> {
    this.enter("get_customer", args)
    return { ...this.customer(args.customerId) }
  }

  /** The customer's orders, newest first. */
  async listOrders(args: { customerId: string }): Promise<Order[]> {
    this.enter("list_orders", args)
    this.customer(args.customerId)
    return this.data.orders
      .filter((o) => o.customerId === args.customerId)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt))
      .map((o) => this.withNote(o))
  }

  async getOrder(args: { orderId: string }): Promise<Order> {
    this.enter("get_order", args)
    return this.withNote(this.order(args.orderId))
  }

  async getShipment(args: { orderId: string }): Promise<Shipment> {
    this.enter("get_shipment", args)
    this.order(args.orderId)
    const s = this.data.shipments.find((x) => x.orderId === args.orderId)
    if (!s) throw new ShopApiError("not_found", `no shipment for ${args.orderId}`)
    return { ...s }
  }

  async getPayment(args: { orderId: string }): Promise<Payment> {
    this.enter("get_payment", args)
    this.order(args.orderId)
    const p = this.data.payments.find((x) => x.orderId === args.orderId)
    if (!p) throw new ShopApiError("not_found", `no payment for ${args.orderId}`)
    return { ...p }
  }

  /** Every refund on the order so far: earlier ones from the data, then the ones this Shop issued. */
  async getRefunds(args: { orderId: string }): Promise<Refund[]> {
    this.enter("get_refunds", args)
    this.order(args.orderId)
    return [...this.data.refunds, ...this.issued]
      .filter((r) => r.orderId === args.orderId)
      .map((r) => ({ ...r, itemIds: [...r.itemIds] }))
  }

  // ---- approvals ---------------------------------------------------------------

  /** Puts a refund in the approver's queue. The approver may be any staff member or customer id. */
  async requestApproval(args: { ticketId: string; approverId: string; amountCents: number; summary: string }): Promise<Approval> {
    this.enter("request_approval", args)
    const known = this.data.staff.some((s) => s.id === args.approverId) || this.data.customers.some((c) => c.id === args.approverId)
    if (!known) throw new ShopApiError("not_found", `no approver ${String(args.approverId)}`)
    if (!Number.isInteger(args.amountCents) || args.amountCents < 0)
      throw new ShopApiError("invalid_argument", "amountCents must be a whole number of cents")
    const a: Approval = {
      ticketId: args.ticketId,
      approverId: args.approverId,
      amountCents: args.amountCents,
      summary: args.summary ?? "",
      status: "pending",
    }
    this.approvals.push(a)
    return { ...a }
  }

  /** The approver's side: a decision on the latest request for the ticket. */
  decideApproval(args: { ticketId: string; approverId: string; decision: "approved" | "rejected"; comment?: string }): Approval {
    const a = [...this.approvals].reverse().find((x) => x.ticketId === args.ticketId && x.approverId === args.approverId)
    if (!a) throw new ShopApiError("not_found", `no approval request for ${args.ticketId} from ${args.approverId}`)
    a.status = args.decision
    if (args.comment !== undefined) a.comment = args.comment
    return { ...a }
  }

  /** The approver's side: their queue, oldest first. */
  listApprovals(approverId: string): Approval[] {
    return this.approvals.filter((a) => a.approverId === approverId).map((a) => ({ ...a }))
  }

  // ---- irreversible ------------------------------------------------------------
  // The shop does what it is asked. It never checks approvals, the policy or
  // what was paid. Keeping refunds safe is your code's job (RD-503, RD-603).

  /**
   * Sends money back to the customer. It can't be undone. A second call with
   * the same idempotencyKey pays nothing and returns the first refund.
   */
  async refund(args: { orderId: string; itemIds: string[]; amountCents: number; idempotencyKey: string }): Promise<Refund> {
    this.enter("refund", args)
    const order = this.order(args.orderId)
    if (typeof args.idempotencyKey !== "string" || !args.idempotencyKey.trim())
      throw new ShopApiError("invalid_argument", "idempotencyKey is required")
    const earlier = this.issued.find((r) => r.idempotencyKey === args.idempotencyKey)
    if (earlier) return { ...earlier, itemIds: [...earlier.itemIds] }
    if (!Number.isInteger(args.amountCents) || args.amountCents <= 0)
      throw new ShopApiError("invalid_argument", "amountCents must be a positive whole number of cents")
    if (!Array.isArray(args.itemIds)) throw new ShopApiError("invalid_argument", "itemIds must be an array")
    for (const id of args.itemIds)
      if (!order.items.some((it) => it.id === id)) throw new ShopApiError("invalid_argument", `item ${id} is not in ${order.id}`)
    const r: Refund = {
      id: `R-${String(this.data.refunds.length + this.issued.length + 1).padStart(4, "0")}`,
      orderId: order.id,
      itemIds: [...args.itemIds],
      amountCents: args.amountCents,
      at: this.now(),
      idempotencyKey: args.idempotencyKey,
    }
    this.issued.push(r)
    return { ...r, itemIds: [...r.itemIds] }
  }

  /** Emails the customer who wrote the ticket. */
  async sendReply(args: { ticketId: string; body: string }): Promise<{ sent: true }> {
    this.enter("send_reply", args)
    if (typeof args.body !== "string" || !args.body.trim()) throw new ShopApiError("invalid_argument", "body is empty")
    this.replies.push({ ticketId: args.ticketId, body: args.body })
    return { sent: true }
  }

  /** The refunds this Shop issued, in order. */
  refundsIssued(): Refund[] {
    return this.issued.map((r) => ({ ...r, itemIds: [...r.itemIds] }))
  }

  /** The replies this Shop sent, in order. */
  repliesSent(): { ticketId: string; body: string }[] {
    return this.replies.map((r) => ({ ...r }))
  }

  // ---- internals ---------------------------------------------------------------

  /** The shop's fixed clock: today (data/meta.json) at 12:00 UTC, plus a minute per refund already issued. */
  private now(): string {
    const at = new Date(`${this.data.meta.today}T12:00:00Z`)
    at.setUTCMinutes(this.issued.length)
    return at.toISOString().replace(/\.\d{3}Z$/, "Z")
  }

  private enter(tool: string, args: object) {
    const a = { ...args } as Record<string, unknown>
    this.calls.push({ tool, args: a })
    const orderCustomer =
      typeof a.orderId === "string" ? this.data.orders.find((o) => o.id === a.orderId)?.customerId : undefined
    // The same email findCustomer looks up: case and surrounding spaces don't matter.
    const email = typeof a.email === "string" ? a.email.trim().toLowerCase() : a.email
    const seen: Record<string, unknown> = { ...a, email, customerId: a.customerId ?? orderCustomer }
    this.faults.errors.forEach((f, i) => {
      if (f.tool !== tool) return
      if (!Object.entries(f.when).every(([k, v]) => seen[k] === v)) return
      const hits = this.faultHits.get(i) ?? 0
      if (f.times !== "always" && hits >= f.times) return
      this.faultHits.set(i, hits + 1)
      throw new ShopApiError(f.error, f.error === "timeout" ? `${tool} timed out` : `${tool} failed on the server`)
    })
  }

  private customer(id: unknown): Customer {
    const c = this.data.customers.find((x) => x.id === id)
    if (!c) throw new ShopApiError("not_found", `no customer ${String(id)}`)
    return c
  }

  private order(id: unknown): Order {
    const o = this.data.orders.find((x) => x.id === id)
    if (!o) throw new ShopApiError("not_found", `no order ${String(id)}`)
    return o
  }

  private withNote(o: Order): Order {
    const copy: Order = { ...o, items: o.items.map((it) => ({ ...it })) }
    if (this.redTeam) {
      const n = this.data.redTeam.orderNotes.find((x) => x.orderId === o.id)
      if (n) copy.note = n.note
    }
    return copy
  }
}
