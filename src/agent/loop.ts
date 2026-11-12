import type { ChatFn } from "../server/llm"
import type { Shop } from "../server/shop/api"

// RD-102: the agent loop. Verify runs hidden tests against this contract,
// with the scripted fake model (src/server/testing/fake-chat.ts) and a small
// fake shop passed as `shop`.
//
// runAgent(message, opts): Promise<RunResult>
//   - Sends the conversation to the model with the tools from tools/.
//     Runs every tool call in the reply with runTool, in order, and sends
//     each result back with the id of the tool call it answers. Then calls
//     the model again.
//   - Stops with "answer" when a reply has no tool calls. `text` is that
//     reply's text.
//   - Each model call counts as one step. After opts.maxSteps model calls
//     (default 10) without an answer, stops with "max_steps" and a text
//     that says the step limit was reached.
//   - Uses opts.shop when given (a new Shop() otherwise), and opts.chat
//     when given (the platform model in src/server/llm.ts otherwise).
//   - Calls opts.onStep with each step as soon as it happens, and returns
//     all the steps, in order, in `steps`.
//   - opts.customerEmail, when given, says who wrote the message: the
//     model is told, so it can look the customer up.
//
//   - Starts the conversation with firstMessages (prompt.ts, RD-100).
//
// RD-104 (stretch): a run that can't make progress ends early with "stuck", and its
// text names the tool that kept failing. No hidden tests: your tests and
// the review check this part. When a run counts as stuck is yours to decide
// and explain; a run that recovers after a failed call is not stuck, and
// the step limit above still applies.

export type ModelStep = {
  type: "model"
  text: string | null
  toolCalls: { id: string; name: string; arguments: string }[]
  durationMs: number
  usage?: { promptTokens: number; completionTokens: number }
}

export type ToolStep = {
  type: "tool"
  name: string
  /** The arguments exactly as the model sent them (a JSON string). */
  args: string
  ok: boolean
  /** On success, the data runTool returned (an order, a shipment, ...). */
  result?: unknown
  /** On failure, the error runTool returned, as text. */
  error?: string
  durationMs: number
}

export type Step = ModelStep | ToolStep

export type StopReason = "answer" | "max_steps" | "stuck"

export type RunResult = { stopReason: StopReason; text: string; steps: Step[] }

export type RunOptions = {
  maxSteps?: number
  shop?: Shop
  chat?: ChatFn
  /** The email address the message came from. */
  customerEmail?: string
  onStep?: (step: Step) => void
}

export async function runAgent(message: string, opts: RunOptions = {}): Promise<RunResult> {
  void message
  void opts
  throw new Error("Not built yet: RD-102")
}
