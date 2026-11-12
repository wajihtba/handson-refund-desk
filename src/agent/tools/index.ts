import type { ToolDefinition } from "../../server/llm"
import type { Shop } from "../../server/shop/api"

// The agent's tools: what the model is told about them, and the one place
// that runs them. Verify runs hidden tests against this contract.
//
// tools: ToolDefinition[]  (the OpenAI function-tool format, see src/server/llm.ts)
//   find_customer { email }
//   list_orders   { customerId }
//   get_order     { orderId }
//   get_shipment  { orderId }
//   get_payment   { orderId }
//   get_refunds   { orderId }
//   Each has a description, typed parameters, and every argument above in
//   `required`. Order ids look like "FH-100231" (FH-, then 6 digits);
//   customer ids look like "C-0134".
//
// runTool(name, rawArgs, shop): Promise<ToolResult>
//   - rawArgs is the JSON string the model sent.
//   - Arguments are checked against the tool's schema before the shop is
//     called. A bad call never reaches the shop.
//   - Never throws. Every failure comes back as { ok: false, error }:
//       "unknown_tool"       no tool with that name
//       "invalid_arguments"  not a JSON object, a required argument missing
//                            or of the wrong type, an email that isn't an
//                            email address, or an order id that isn't
//                            FH- followed by 6 digits
//       "tool_failed"        the shop threw (its message says why), such as
//                            a well-formed order id it doesn't know
//                            (FH-999999): that is the shop's to refuse
//   - On success, { ok: true, data } with what the shop returned.
//   RD-204: a timeout or server error is retried (see
//   reliability/retry.ts) before it becomes "tool_failed".

export type ToolErrorCode = "unknown_tool" | "invalid_arguments" | "tool_failed"

export type ToolResult =
  | { ok: true; data: unknown }
  | { ok: false; error: { code: ToolErrorCode; message: string } }

export const tools: ToolDefinition[] = []

export async function runTool(name: string, rawArgs: string, shop: Shop): Promise<ToolResult> {
  void name
  void rawArgs
  void shop
  throw new Error("Not built yet: RD-101")
}
