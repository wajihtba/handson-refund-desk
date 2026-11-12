import type { ChatFn } from "../../server/llm"
import type { OrderHint } from "./match"

// RD-201: what the customer's message says about the order, read by the
// model as structured output and checked by your code. Verify runs hidden
// tests against this contract, with a scripted model passed as opts.chat.
//
// extractHint(message, opts): Promise<ExtractedHint>
//   - Makes one model call (opts.chat, or the platform model in
//     src/server/llm.ts) that sends the customer's message and a
//     responseFormat whose JSON schema has the properties orderId, product,
//     month, latest and postcode.
//   - Reads the reply's text as JSON and keeps a field only when it passes
//     its check. A field that fails is left out, never fixed by guessing:
//       orderId   "FH-" and 6 digits ("fh 100231" is fine, returned as
//                 "FH-100231"), and only when the message itself contains
//                 that order id. The model must not add one.
//       product   a string, at most 60 characters, not empty once trimmed;
//                 returned trimmed
//       month     "YYYY-MM", a real month
//       latest    kept only when it is true
//       postcode  a string, at most 12 characters, not empty once trimmed;
//                 returned trimmed
//     Any other field is left out.
//   - A reply that isn't a JSON object gives {}. A bad reply never throws.

export type ExtractedHint = OrderHint & { postcode?: string }

export async function extractHint(message: string, opts: { chat?: ChatFn } = {}): Promise<ExtractedHint> {
  void message
  void opts
  throw new Error("Not built yet: RD-201")
}
