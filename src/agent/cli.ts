import { Shop } from "../server/shop/api"
import { runAgent } from "./loop"
import type { Step } from "./loop"
import { toTraceLine, writeTrace } from "./trace"

// Run the agent on one customer message, against the fake shop. It uses
// real model tokens.
//
//   npm run agent -- "Hi, an item in my order FH-100231 arrived broken. Can I get my money back?"
//   npm run agent -- --from jonas.becker@example.com "The frying pan from my last order is scratched"
//
// --from says which email address the message came from (data/customers.json).
// Without it the agent only has the message. Every run writes a trace to
// runs/<runId>.jsonl once RD-103 is done.

const args = process.argv.slice(2)
const from = args.indexOf("--from")
const customerEmail = from >= 0 ? args.splice(from, 2)[1] : undefined
const message = args.join(" ")
if (!message) {
  console.error('Usage: npm run agent -- [--from customer@example.com] "the customer\'s message"')
  process.exit(1)
}

const line = (s: Step) =>
  s.type === "model"
    ? `model  ${s.toolCalls.length ? `asks for ${s.toolCalls.map((c) => c.name).join(", ")}` : "answers"} (${s.durationMs}ms)`
    : `tool   ${s.name} ${s.args} -> ${s.ok ? "ok" : `error: ${s.error ?? ""}`} (${s.durationMs}ms)`

const runId = `run-${new Date().toISOString().replace(/[:.]/g, "-")}`
const result = await runAgent(message, { shop: new Shop(), customerEmail, onStep: (s) => console.log(line(s)) })
console.log(`\n${result.text}\n\n(stopped: ${result.stopReason}, ${result.steps.length} steps)`)

try {
  const path = writeTrace(
    runId,
    result.steps.map((s, i) => toTraceLine(runId, i + 1, s))
  )
  console.log(`Trace: ${path}  (npm run trace -- ${runId})`)
} catch (error) {
  console.log(`No trace yet: ${(error as Error).message}`)
}
