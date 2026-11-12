import type { ChatFn } from "../../server/llm"
import type { DecisionAction } from "../../shared/types"

// RD-304: a model judges the reply the agent drafted for the customer, on
// what a code check can't see. Verify runs hidden tests against this
// contract, with a scripted model as opts.chat.
//
// CRITERIA: what the judge decides, each one pass or fail.
//   decision  the reply states the decision code made, with its amount, and no other
//   promises  it promises nothing the decision doesn't: no refund on a denial,
//             no date, extra or exception the shop didn't give
//   language  it is in the language the customer wrote in
//   tone      it is polite, clear and short enough for a customer to act on
//
// judgeReply(input, opts): Promise<Verdict | null>
//   - One model call (opts.chat, or the platform model in src/server/llm.ts)
//     that holds the customer's message, the decision (its action and
//     amount) and the reply, and asks for structured output: a
//     responseFormat named "verdict" whose schema has one boolean property
//     per criterion and a "reason" string, all required.
//   - The answer is checked in code: every criterion a boolean and reason a
//     non-empty string. An answer that doesn't fit gets one more request
//     that says what was wrong. If that one doesn't fit either, the result
//     is null: the judge failed, and a failed judge never counts as a pass.
//   - pass is true only when every criterion passed.
//
// agreement(rows): Agreement
//   - rows hold, for each reply you labelled by hand, the judge's verdict
//     and your label (human: true when you would send the reply as it is).
//   - agreement: the share of rows where verdict.pass equals your label,
//     over the rows where the judge answered (not null).
//   - falsePass: how many rows the judge passed and you failed. falseFail:
//     how many it failed and you passed. failed: how many verdicts are null.
//   - agreement is rounded to 2 decimals, and is 0 when the judge answered
//     no row.

export const CRITERIA = ["decision", "promises", "language", "tone"] as const

export type Criterion = (typeof CRITERIA)[number]

export type ReplyToJudge = {
  /** The customer's message, as they wrote it. */
  message: string
  /** What code decided: the action and, for a refund, the amount ("€44.94"). */
  decision: { action: DecisionAction; amount?: string }
  /** The reply the agent drafted. */
  reply: string
}

export type Verdict = { pass: boolean; criteria: Record<Criterion, boolean>; reason: string }

export type Agreement = { agreement: number; falsePass: number; falseFail: number; failed: number }

export async function judgeReply(input: ReplyToJudge, opts: { chat?: ChatFn } = {}): Promise<Verdict | null> {
  void input
  void opts
  throw new Error("Not built yet: RD-304")
}

export function agreement(rows: { verdict: Verdict | null; human: boolean }[]): Agreement {
  void rows
  throw new Error("Not built yet: RD-304")
}
