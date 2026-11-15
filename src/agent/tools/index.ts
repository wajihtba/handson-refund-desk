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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ORDER_ID = /^FH-\d{6}$/
const CUSTOMER_ID = /^C-\d{4}$/

function isEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL.test(value)
}

function isOrderId(value: unknown): value is string {
  return typeof value === "string" && ORDER_ID.test(value)
}

function isCustomerId(value: unknown): value is string {
  return typeof value === "string" && CUSTOMER_ID.test(value)
}

export const tools: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "find_customer",
      description: "Find a customer by their email address.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "The customer's email address." },
        },
        required: ["email"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_orders",
      description: "List all orders for a customer, newest first.",
      parameters: {
        type: "object",
        properties: {
          customerId: { type: "string", description: "The customer ID, e.g. C-0134." },
        },
        required: ["customerId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_order",
      description: "Get the details of a specific order.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID, e.g. FH-100231." },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_shipment",
      description: "Get the shipment information for a specific order.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID, e.g. FH-100231." },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_payment",
      description: "Get the payment information for a specific order.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID, e.g. FH-100231." },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_refunds",
      description: "Get all refunds issued for a specific order.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID, e.g. FH-100231." },
        },
        required: ["orderId"],
      },
    },
  },
]

export async function runTool(name: string, rawArgs: string, shop: Shop): Promise<ToolResult> {
  let args: unknown
  try {
    args = JSON.parse(rawArgs)
  } catch {
    return { ok: false, error: { code: "invalid_arguments", message: "Arguments are not valid JSON." } }
  }

  if (typeof args !== "object" || args === null || Array.isArray(args)) {
    return { ok: false, error: { code: "invalid_arguments", message: "Arguments must be a JSON object." } }
  }

  const a = args as Record<string, unknown>

  try {
    switch (name) {
      case "find_customer": {
        if (!isEmail(a.email)) {
          return { ok: false, error: { code: "invalid_arguments", message: "email is not a valid email address." } }
        }
        const data = await shop.findCustomer({ email: a.email })
        return { ok: true, data }
      }
      case "list_orders": {
        if (!isCustomerId(a.customerId)) {
          return { ok: false, error: { code: "invalid_arguments", message: "customerId is not a valid customer ID (C- followed by 4 digits)." } }
        }
        const data = await shop.listOrders({ customerId: a.customerId })
        return { ok: true, data }
      }
      case "get_order": {
        if (!isOrderId(a.orderId)) {
          return { ok: false, error: { code: "invalid_arguments", message: "orderId is not a valid order ID (FH- followed by 6 digits)." } }
        }
        const data = await shop.getOrder({ orderId: a.orderId })
        return { ok: true, data }
      }
      case "get_shipment": {
        if (!isOrderId(a.orderId)) {
          return { ok: false, error: { code: "invalid_arguments", message: "orderId is not a valid order ID (FH- followed by 6 digits)." } }
        }
        const data = await shop.getShipment({ orderId: a.orderId })
        return { ok: true, data }
      }
      case "get_payment": {
        if (!isOrderId(a.orderId)) {
          return { ok: false, error: { code: "invalid_arguments", message: "orderId is not a valid order ID (FH- followed by 6 digits)." } }
        }
        const data = await shop.getPayment({ orderId: a.orderId })
        return { ok: true, data }
      }
      case "get_refunds": {
        if (!isOrderId(a.orderId)) {
          return { ok: false, error: { code: "invalid_arguments", message: "orderId is not a valid order ID (FH- followed by 6 digits)." } }
        }
        const data = await shop.getRefunds({ orderId: a.orderId })
        return { ok: true, data }
      }
      default:
        return { ok: false, error: { code: "unknown_tool", message: `Unknown tool: ${name}.` } }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: { code: "tool_failed", message } }
  }
}
