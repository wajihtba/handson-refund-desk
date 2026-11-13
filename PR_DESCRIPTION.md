## What and why

Fixes a bug in `firstMessages()` where the user message was omitted when a `customerEmail` was provided. This caused the agent to receive only a system prompt with no actual customer question, making it ask for information the customer already gave.

## Acceptance criteria

- [x] `npm test` passes, and no test was changed or skipped
- [x] `npm run dev` shows the support inbox in the Preview
- [x] `npm run bare` prints a reply from the model
- [x] Verify solution passes (hidden tests check the contract in `src/agent/prompt.ts`)

## How I checked it

- Ran `npm test` — all 34 passing tests pass, 12 TODOs unchanged.
- Ran `npm run bare` — the model receives the customer message and responds. Saved output is in `runs/bare-call.txt`.
- The fix ensures `firstMessages()` always ends with the user message, whether or not `customerEmail` is set.

## AI use

None

## One thing I'd do differently (optional)

Add a unit test for `firstMessages()` that asserts the message array always ends with a user message, regardless of whether `customerEmail` is set.

---

**Reviewer question:** What did the model receive before your fix, and why did it answer the way it did?

Before the fix, when `opts.customerEmail` was provided, the function pushed the system message but skipped pushing the user message. The `messages.push({ role: "user", content: message })` line was inside the `else` branch only. So the model received just a system prompt telling it who the email was from, but never got the actual customer question. Without the customer's message, the model had no context about what the customer wanted — so it answered generically, asking for an order number or email as if the conversation had just started.
