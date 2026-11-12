import { mkdirSync, writeFileSync } from "node:fs"

import { findInventedOrders } from "../agent/evals/invented"
import { firstMessages } from "../agent/prompt"
import { chat } from "./llm"
import { loadData } from "./shop/data"

// A bare model call. No tools, no loop: see what a model alone does with a
// customer's message (RD-100). Once RD-302 is done, it also prints the order
// ids the reply made up. It uses real model tokens.
//
//   npm run bare
//   npm run bare -- "Where is my order? I ordered a toaster last week."

const message =
  process.argv.slice(2).join(" ") ||
  "Hi, my kettle arrived broken last week. Can you check my order and tell me when my refund will arrive?"

const reply = await chat({
  messages: firstMessages(message),
})
const text = reply.text ?? "(the model returned no text)"
console.log(text)

mkdirSync("runs", { recursive: true })
writeFileSync("runs/bare-call.txt", `${message}\n\n${text}\n`)
console.log("\nSaved to runs/bare-call.txt")

try {
  const invented = findInventedOrders(
    text,
    loadData().orders.map((o) => o.id)
  )
  console.log(invented.length ? `Invented order ids: ${invented.join(", ")}` : "No invented order ids found.")
} catch (error) {
  console.log((error as Error).message)
}
