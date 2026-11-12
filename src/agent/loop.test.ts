import { test } from "node:test"

// RD-102: your tests for runAgent (loop.ts), on the scripted fake model in
// src/server/testing/fake-chat.ts, so they spend no tokens. Replace each
// test.todo with a real test. The Run and Debug view starts this file with
// the debugger attached:
//
//   node --import tsx --inspect-brk --test src/agent/loop.test.ts
//
// A fake model that asks for one tool, then answers:
//
//   const model = scriptedChat([
//     { toolCalls: [{ name: "get_order", args: { orderId: "FH-100231" } }] },
//     { text: "Order FH-100231 is a pressure cooker." },
//   ])
//   const run = await runAgent("Hi, an item in my order FH-100231 arrived broken.", { chat: model, shop: new Shop({ faults: false }) })
//   model.requests[1].messages   // what your loop sent back to the model

test.todo("stops with answer when a reply has no tool calls")
test.todo("runs every tool call and sends each result back with its tool call id")
test.todo("stops with max_steps after the step limit")
test.todo("calls onStep with each step as it happens")
