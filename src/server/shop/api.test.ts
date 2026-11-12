import assert from "node:assert/strict"
import { test } from "node:test"

import { Shop, ShopApiError } from "./api"

// What the fake shop system promises. Provided: these pass from day one.

const isCode = (code: string) => (e: unknown) => e instanceof ShopApiError && e.code === code

test("finds a customer by email, whatever the case", async () => {
  const shop = new Shop({ faults: false })
  const c = await shop.findCustomer({ email: "  Jonas.Becker@Example.com " })
  assert.equal(c.id, "C-0100")
  await assert.rejects(shop.findCustomer({ email: "nobody@example.com" }), isCode("not_found"))
  await assert.rejects(shop.findCustomer({ email: "not an email" }), isCode("invalid_argument"))
})

test("two customers share a name", () => {
  const anas = new Shop().data.customers.filter((c) => c.name === "Ana Ferreira")
  assert.equal(anas.length, 2)
  assert.notEqual(anas[0].postcode, anas[1].postcode)
})

test("one customer has 60 orders, newest first", async () => {
  const orders = await new Shop().listOrders({ customerId: "C-0100" })
  assert.equal(orders.length, 60)
  assert.deepEqual(orders.map((o) => o.placedAt), [...orders.map((o) => o.placedAt)].sort().reverse())
})

test("an order's total is its items plus shipping", async () => {
  const shop = new Shop()
  for (const o of shop.data.orders.slice(0, 50)) {
    const items = o.items.reduce((n, it) => n + it.quantity * it.unitPriceCents, 0)
    assert.equal(o.totalCents, items + o.shippingCents)
  }
  const order = await shop.getOrder({ orderId: "FH-100231" })
  assert.equal(order.items[0].id, "FH-100231-1")
  await assert.rejects(shop.getOrder({ orderId: "FH-999999" }), isCode("not_found"))
})

test("every order has a shipment and a payment", async () => {
  const shop = new Shop({ faults: false })
  const s = await shop.getShipment({ orderId: "FH-100231" })
  assert.match(s.trackingCode, /^TRK\d{9}$/)
  const p = await shop.getPayment({ orderId: "FH-100231" })
  assert.equal(p.amountCents, (await shop.getOrder({ orderId: "FH-100231" })).totalCents)
})

test("a lookup that times out once works the second time", async () => {
  const shop = new Shop()
  const fault = shop.data.faults.errors.find((f) => f.tool === "get_order" && f.error === "timeout")
  assert.ok(fault)
  const args = { orderId: fault.when.orderId }
  await assert.rejects(shop.getOrder(args), isCode("timeout"))
  assert.equal((await shop.getOrder(args)).id, args.orderId)
})

test("payments always fail for one customer, and faults can be switched off", async () => {
  const [order] = await new Shop().listOrders({ customerId: "C-0213" })
  const shop = new Shop()
  await assert.rejects(shop.getPayment({ orderId: order.id }), isCode("server_error"))
  await assert.rejects(shop.getPayment({ orderId: order.id }), isCode("server_error"))
  assert.equal((await new Shop({ faults: false }).getPayment({ orderId: order.id })).orderId, order.id)
})

test("hidden instructions in order notes only with redTeam", async () => {
  const shop = new Shop({ redTeam: true })
  const { orderId } = shop.data.redTeam.orderNotes[0]
  assert.equal((await new Shop().getOrder({ orderId })).note, undefined)
  assert.ok((await shop.getOrder({ orderId })).note)
})

test("approvals: request, list, decide", async () => {
  const shop = new Shop()
  await shop.requestApproval({ ticketId: "T-001", approverId: "S-03", amountCents: 6000, summary: "Broken kettle" })
  assert.equal(shop.listApprovals("S-03")[0].status, "pending")
  assert.equal(shop.decideApproval({ ticketId: "T-001", approverId: "S-03", decision: "approved" }).status, "approved")
  assert.equal(shop.listApprovals("S-03")[0].status, "approved")
  await assert.rejects(shop.requestApproval({ ticketId: "T-001", approverId: "X-1", amountCents: 1, summary: "" }), isCode("not_found"))
})

test("a refund with the same idempotency key pays once", async () => {
  const shop = new Shop({ faults: false })
  const args = { orderId: "FH-100231", itemIds: ["FH-100231-1"], amountCents: 7999, idempotencyKey: "T-001:FH-100231-1" }
  const first = await shop.refund(args)
  const second = await shop.refund(args)
  assert.equal(second.id, first.id)
  assert.equal(shop.refundsIssued().length, 1)
  assert.equal((await shop.getRefunds({ orderId: "FH-100231" })).length, 1)
  await assert.rejects(shop.refund({ ...args, idempotencyKey: "other", itemIds: ["FH-1-1"] }), isCode("invalid_argument"))
})

test("refunds are stamped by the shop's fixed clock, on today in data/meta.json", async () => {
  const shop = new Shop({ faults: false })
  const first = await shop.refund({ orderId: "FH-100231", itemIds: ["FH-100231-1"], amountCents: 100, idempotencyKey: "a" })
  const second = await shop.refund({ orderId: "FH-100232", itemIds: ["FH-100232-1"], amountCents: 100, idempotencyKey: "b" })
  assert.equal(first.at, `${shop.data.meta.today}T12:00:00Z`)
  assert.equal(second.at, `${shop.data.meta.today}T12:01:00Z`)
})

test("the call log records every async call", async () => {
  const shop = new Shop({ faults: false })
  await shop.getCustomer({ customerId: "C-0100" })
  await shop.getShipment({ orderId: "FH-100231" })
  shop.listApprovals("S-03")
  assert.deepEqual(shop.calls.map((c) => c.tool), ["get_customer", "get_shipment"])
})
