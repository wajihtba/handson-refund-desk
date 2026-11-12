import assert from "node:assert/strict"
import { test } from "node:test"

import { SYSTEM_PROMPT, firstMessages } from "./prompt"

// One of these fails on day one: fixing it is RD-100.

const fleur = "Hi, my kettle arrived broken last week. Can you check my order and tell me when my refund will arrive?"

test("the model is told who wrote, when we know", () => {
  const messages = firstMessages(fleur, { customerEmail: "fleurvisser@mail.example" })
  assert.equal(messages[0].role, "system")
  assert.match(String(messages[0].content), /fleurvisser@mail\.example/)
})

test("the customer's message reaches the model, even when we don't know who wrote", () => {
  const messages = firstMessages(fleur)
  assert.deepEqual(messages, [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: fleur },
  ])
})
