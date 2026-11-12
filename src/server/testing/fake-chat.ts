import type { ChatFn, ChatReply, ChatRequest } from "../llm"

// A scripted model for tests: no network, no tokens, the same answer every
// run. Provided. Each call returns the next turn; past the end it repeats
// the last one when { repeatLast: true }, otherwise it throws.
//
//   const model = scriptedChat([
//     { toolCalls: [{ name: "get_order", args: { orderId: "FH-100231" } }] },
//     { text: "Order FH-100231 is a pressure cooker, delivered in August." },
//   ])
//   const run = await runAgent("...", { chat: model, shop })
//   model.requests[1].messages // what your loop sent back

export type ScriptedTurn = {
  text?: string
  toolCalls?: { name: string; args?: unknown }[]
  usage?: ChatReply["usage"]
}

export function scriptedChat(
  turns: ScriptedTurn[],
  opts: { repeatLast?: boolean } = {}
): ChatFn & { requests: ChatRequest[] } {
  const requests: ChatRequest[] = []
  const fn = async (request: ChatRequest): Promise<ChatReply> => {
    requests.push(structuredClone(request))
    const i = requests.length - 1
    if (i >= turns.length && !opts.repeatLast) throw new Error(`scriptedChat: no turn ${i + 1} in the script`)
    const turn = turns[Math.min(i, turns.length - 1)]
    return {
      text: turn.text ?? null,
      toolCalls: (turn.toolCalls ?? []).map((c, j) => ({
        id: `call_${i}_${j}`,
        name: c.name,
        arguments: typeof c.args === "string" ? c.args : JSON.stringify(c.args ?? {}),
      })),
      usage: turn.usage ?? { promptTokens: 100, completionTokens: 20 },
    }
  }
  return Object.assign(fn, { requests })
}
