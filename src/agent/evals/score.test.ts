import { test } from "node:test"

// RD-302: your tests for scoreCase (evals/score.ts). Build the steps by
// hand: a ToolStep is { type: "tool", name, args, ok, durationMs }, with
// args as the JSON string the model sent. Replace each test.todo with a
// real test.

test.todo("order is true when a successful get_order looked up the expected order")
test.todo("a failed get_order step doesn't count")
test.todo("other tools don't count, even with the right order id")
test.todo("noInvented is false when the answer names an order no tool returned")
