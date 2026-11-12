import type {
  Customer,
  InboxMessage,
  Order,
  Payment,
  Policy,
  Product,
  Refund,
  Shipment,
  Staff,
} from "../../shared/types"

// The shapes of the data the fake shop system loads (data/*.json). Provided.
// The domain types themselves live in src/shared/types.ts, shared with the
// web app.

export type * from "../../shared/types"

export type Meta = { company: string; today: string; shopTimeZone: string; currency: "EUR" }

export type ShopErrorCode = "timeout" | "server_error" | "not_found" | "invalid_argument"

/** Where the fake shop fails on purpose (data/faults.json). */
export type Faults = {
  errors: {
    /** The shop method, in snake_case: "get_order", "get_payment", ... */
    tool: string
    /** Fails when every one of these arguments matches. A customerId matches
     * the customer an orderId belongs to. */
    when: Record<string, string>
    error: Extract<ShopErrorCode, "timeout" | "server_error">
    /** How many times it fails before it works, or "always". */
    times: number | "always"
  }[]
}

/** Messages and order notes with hidden instructions (data/red-team.json). */
export type RedTeam = {
  messages: (InboxMessage & { injection: string })[]
  orderNotes: { orderId: string; note: string }[]
}

export type ShopData = {
  meta: Meta
  products: Product[]
  customers: Customer[]
  orders: Order[]
  shipments: Shipment[]
  payments: Payment[]
  refunds: Refund[]
  policy: Policy
  staff: Staff[]
  inbox: InboxMessage[]
  faults: Faults
  redTeam: RedTeam
}
