import assert from "node:assert/strict"
import { afterEach, test } from "node:test"

import { chat } from "./llm"

// The model wrapper, with the proxy faked: no tokens spent. Provided.

const realFetch = globalThis.fetch
const env = { key: process.env.LAB_LLM_API_KEY, url: process.env.LAB_LLM_BASE_URL }
afterEach(() => {
  globalThis.fetch = realFetch
  // Assigning undefined would store the string "undefined": delete instead.
  for (const [name, value] of [["LAB_LLM_API_KEY", env.key], ["LAB_LLM_BASE_URL", env.url]] as const) {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
})

test("explains a missing proxy instead of failing obscurely", async () => {
  delete process.env.LAB_LLM_API_KEY
  delete process.env.LAB_LLM_BASE_URL
  await assert.rejects(chat({ messages: [{ role: "user", content: "hi" }] }), /not switched on/)
})

test("returns the model's tool calls", async () => {
  process.env.LAB_LLM_API_KEY = "test"
  process.env.LAB_LLM_BASE_URL = "https://proxy.test/v1"
  let sent: { tools?: unknown[] } = {}
  globalThis.fetch = async (_url, init) => {
    sent = JSON.parse(String(init?.body))
    return Response.json({
      choices: [{ message: { content: null, tool_calls: [{ id: "c1", function: { name: "get_order", arguments: '{"orderId":"FH-100231"}' } }] } }],
      usage: { prompt_tokens: 12, completion_tokens: 3 },
    })
  }
  const tools = [{ type: "function" as const, function: { name: "get_order", description: "d", parameters: {} } }]
  const reply = await chat({ messages: [{ role: "user", content: "hi" }], tools })
  assert.equal(sent.tools?.length, 1)
  assert.equal(reply.text, null)
  assert.deepEqual(reply.toolCalls, [{ id: "c1", name: "get_order", arguments: '{"orderId":"FH-100231"}' }])
  assert.deepEqual(reply.usage, { promptTokens: 12, completionTokens: 3 })
})

test("sends a JSON schema, and falls back to JSON mode when the model refuses it", async () => {
  process.env.LAB_LLM_API_KEY = "test"
  process.env.LAB_LLM_BASE_URL = "https://proxy.test/v1"
  const sent: { response_format?: { type: string }; messages: unknown[] }[] = []
  globalThis.fetch = async (_url, init) => {
    sent.push(JSON.parse(String(init?.body)))
    if (sent.length === 1) return Response.json({ error: { message: "response_format not supported" } }, { status: 400 })
    return Response.json({ choices: [{ message: { content: '{"product":"kettle"}' } }], usage: { prompt_tokens: 5, completion_tokens: 2 } })
  }
  const schema = { type: "object", properties: { product: { type: "string" } } }
  const reply = await chat({ messages: [{ role: "user", content: "my kettle" }], responseFormat: { name: "hint", schema } })
  assert.equal(sent[0].response_format?.type, "json_schema")
  assert.equal(sent[1].response_format?.type, "json_object")
  assert.equal(sent[1].messages.length, 2)
  assert.equal(reply.text, '{"product":"kettle"}')
})
