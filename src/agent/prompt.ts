import type { Message } from "../server/llm"

// RD-100: the messages every model call starts with. npm run bare uses
// them, and so does your agent loop from RD-102. Verify runs hidden tests
// against this contract.
//
// firstMessages(message, opts): Message[]
//   - Starts with one { role: "system" } message: SYSTEM_PROMPT and, when
//     opts.customerEmail is given, a line that names that address as the
//     sender. Without an address, no address is named.
//   - Ends with the customer's message as one { role: "user" } message,
//     word for word, whether or not the address is known.
//   - Nothing else: the system message, then the customer's message.
//
// SYSTEM_PROMPT is the agent's instructions. Later tickets change it
// (RD-203 tells the agent to read the payment and earlier refunds first).

export const SYSTEM_PROMPT =
  "You are the customer support assistant of HomeShop, an online shop for home and kitchen goods. Answer the customer's refund request politely and briefly."

export function firstMessages(message: string, opts: { customerEmail?: string } = {}): Message[] {
  const messages: Message[] = []
  if (opts.customerEmail) {
    messages.push({ role: "system", content: `${SYSTEM_PROMPT}\nThe message is from ${opts.customerEmail}.` })
    messages.push({ role: "user", content: message })
  } else {
    messages.push({ role: "system", content: SYSTEM_PROMPT })
  }
  return messages
}
