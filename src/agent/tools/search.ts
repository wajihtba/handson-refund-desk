import type { ToolDefinition } from "../../server/llm"
import type { Shop } from "../../server/shop/api"
import type { ToolResult } from "./index"

// RD-602: find a customer's orders by product, without listing every
// order. Youssef built it with a coding agent in reviews/rd-602.patch, and
// you review it. Verify runs hidden tests against this contract.
//
// searchOrdersTool: ToolDefinition
//   The tool "search_orders": one required string argument, product, and a
//   description that tells the model when to use it.
//
// searchOrders(rawArgs, shop, ctx): Promise<ToolResult>
//   - rawArgs is the JSON string the model sent. ctx.customerId is the
//     customer who wrote, found by your code. Only that customer's orders
//     are searched: the model never chooses whose orders.
//   - An order fits when one of its items is a product whose name contains
//     `product`, ignoring case.
//   - { ok: true, data } with every fitting order, newest first (placedAt),
//     each as { id, placedAt, products } (the product names). It never
//     picks one for the model: when several fit, the agent asks the
//     customer (RD-202).
//   - { ok: false, error } with code "invalid_arguments" when the arguments
//     aren't a JSON object or product is missing, not a string, or empty.
//     Never throws.

export const searchOrdersTool: ToolDefinition = {
  type: "function",
  function: { name: "search_orders", description: "Not built yet: RD-602", parameters: { type: "object", properties: {} } },
}

export async function searchOrders(rawArgs: string, shop: Shop, ctx: { customerId: string }): Promise<ToolResult> {
  void rawArgs
  void shop
  void ctx
  throw new Error("Not built yet: RD-602")
}
