import assert from "node:assert/strict"
import { test } from "node:test"

import { Shop } from "../../server/shop/api"
import { runTool, tools } from "./index"

const shop = new Shop({ faults: false })

// ---- tools list -----------------------------------------------------------

test("tools list has all six tools", () => {
  const names = tools.map((t) => t.function.name)
  assert.deepEqual(names.sort(), [
    "find_customer",
    "get_order",
    "get_payment",
    "get_refunds",
    "get_shipment",
    "list_orders",
  ])
})

test("every tool has description and required parameters", () => {
  for (const t of tools) {
    assert.ok(t.function.description.length > 0, `${t.function.name} has no description`)
    assert.ok(Array.isArray(t.function.parameters.required), `${t.function.name} has no required`)
    assert.ok(t.function.parameters.required.length > 0, `${t.function.name} has empty required`)
  }
})

// ---- find_customer: valid -------------------------------------------------

test("find_customer returns a customer for a valid email", async () => {
  const result = await runTool("find_customer", JSON.stringify({ email: "jonas.becker@example.com" }), shop)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal((result.data as { id: string }).id, "C-0100")
})

// ---- find_customer: invalid -----------------------------------------------

test("find_customer rejects a missing email", async () => {
  const result = await runTool("find_customer", JSON.stringify({}), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("find_customer rejects a non-string email", async () => {
  const result = await runTool("find_customer", JSON.stringify({ email: 123 }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("find_customer rejects a malformed email", async () => {
  const result = await runTool("find_customer", JSON.stringify({ email: "not-an-email" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("find_customer rejects an email without domain", async () => {
  const result = await runTool("find_customer", JSON.stringify({ email: "user@" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- list_orders: valid ---------------------------------------------------

test("list_orders returns orders for a valid customer id", async () => {
  const result = await runTool("list_orders", JSON.stringify({ customerId: "C-0100" }), shop)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.ok(Array.isArray(result.data))
})

// ---- list_orders: invalid -------------------------------------------------

test("list_orders rejects a missing customerId", async () => {
  const result = await runTool("list_orders", JSON.stringify({}), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("list_orders rejects a non-string customerId", async () => {
  const result = await runTool("list_orders", JSON.stringify({ customerId: 123 }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("list_orders rejects a malformed customerId (wrong prefix)", async () => {
  const result = await runTool("list_orders", JSON.stringify({ customerId: "X-0100" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("list_orders rejects a malformed customerId (wrong digit count)", async () => {
  const result = await runTool("list_orders", JSON.stringify({ customerId: "C-123" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- get_order: valid -----------------------------------------------------

test("get_order returns an order for a valid order id", async () => {
  const result = await runTool("get_order", JSON.stringify({ orderId: "FH-100231" }), shop)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal((result.data as { id: string }).id, "FH-100231")
})

// ---- get_order: invalid ---------------------------------------------------

test("get_order rejects a missing orderId", async () => {
  const result = await runTool("get_order", JSON.stringify({}), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("get_order rejects a non-string orderId", async () => {
  const result = await runTool("get_order", JSON.stringify({ orderId: 123 }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("get_order rejects a malformed orderId (wrong prefix)", async () => {
  const result = await runTool("get_order", JSON.stringify({ orderId: "XX-100231" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("get_order rejects a malformed orderId (wrong digit count)", async () => {
  const result = await runTool("get_order", JSON.stringify({ orderId: "FH-123" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- get_shipment: valid --------------------------------------------------

test("get_shipment returns a shipment for a valid order id", async () => {
  const result = await runTool("get_shipment", JSON.stringify({ orderId: "FH-100231" }), shop)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal((result.data as { orderId: string }).orderId, "FH-100231")
})

// ---- get_shipment: invalid ------------------------------------------------

test("get_shipment rejects a malformed orderId", async () => {
  const result = await runTool("get_shipment", JSON.stringify({ orderId: "bad" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("get_shipment rejects a missing orderId", async () => {
  const result = await runTool("get_shipment", JSON.stringify({}), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- get_payment: valid ---------------------------------------------------

test("get_payment returns a payment for a valid order id", async () => {
  const result = await runTool("get_payment", JSON.stringify({ orderId: "FH-100231" }), shop)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.equal((result.data as { orderId: string }).orderId, "FH-100231")
})

// ---- get_payment: invalid -------------------------------------------------

test("get_payment rejects a malformed orderId", async () => {
  const result = await runTool("get_payment", JSON.stringify({ orderId: "FH-12345" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("get_payment rejects a missing orderId", async () => {
  const result = await runTool("get_payment", JSON.stringify({}), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- get_refunds: valid ---------------------------------------------------

test("get_refunds returns refunds for a valid order id", async () => {
  const result = await runTool("get_refunds", JSON.stringify({ orderId: "FH-100231" }), shop)
  assert.equal(result.ok, true)
  if (!result.ok) return
  assert.ok(Array.isArray(result.data))
})

// ---- get_refunds: invalid -------------------------------------------------

test("get_refunds rejects a malformed orderId", async () => {
  const result = await runTool("get_refunds", JSON.stringify({ orderId: "FH-1234567" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("get_refunds rejects a missing orderId", async () => {
  const result = await runTool("get_refunds", JSON.stringify({}), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- unknown tool ---------------------------------------------------------

test("unknown tool returns unknown_tool error", async () => {
  const result = await runTool("nonexistent", JSON.stringify({}), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "unknown_tool")
})

// ---- invalid JSON ---------------------------------------------------------

test("invalid JSON returns invalid_arguments error", async () => {
  const result = await runTool("get_order", "not json", shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- non-object JSON ------------------------------------------------------

test("array JSON returns invalid_arguments error", async () => {
  const result = await runTool("get_order", JSON.stringify(["FH-100231"]), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

test("string JSON returns invalid_arguments error", async () => {
  const result = await runTool("get_order", JSON.stringify("FH-100231"), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "invalid_arguments")
})

// ---- shop failure becomes tool_failed -------------------------------------

test("well-formed but unknown order id returns tool_failed", async () => {
  const result = await runTool("get_order", JSON.stringify({ orderId: "FH-999999" }), shop)
  assert.equal(result.ok, false)
  if (!result.ok) assert.equal(result.error.code, "tool_failed")
})

// ---- invalid call never reaches the shop ----------------------------------

test("invalid email never reaches the shop", async () => {
  const s = new Shop({ faults: false })
  await runTool("find_customer", JSON.stringify({ email: "bad" }), s)
  assert.equal(s.calls.length, 0)
})

test("invalid customerId never reaches the shop", async () => {
  const s = new Shop({ faults: false })
  await runTool("list_orders", JSON.stringify({ customerId: "bad" }), s)
  assert.equal(s.calls.length, 0)
})

test("invalid orderId never reaches the shop", async () => {
  const s = new Shop({ faults: false })
  await runTool("get_order", JSON.stringify({ orderId: "bad" }), s)
  assert.equal(s.calls.length, 0)
})
