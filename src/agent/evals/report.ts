import type { TraceLine } from "../../shared/types"

// RD-701: what one run costs and how long it takes, and the slow and
// expensive tail over a whole eval run. Verify runs hidden tests against
// this contract.
//
// Price: what the model costs, in euro cents per million tokens. Keep the
// one price your project uses in one place, with where it comes from.
//
// runStats(lines, price): RunStats
//   - lines are one run's trace lines (RD-103).
//   - promptTokens, completionTokens: the sums of `usage` over the run's
//     "model" lines.
//   - costCents: promptTokens x price.inputCentsPerMillion plus
//     completionTokens x price.outputCentsPerMillion, divided by
//     1,000,000 and rounded once, to 4 decimals. null when any "model"
//     line has no usage: an unknown cost is never zero.
//   - unknownUsage: how many "model" lines have no usage.
//   - durationMs: the sum of durationMs over the "model" and "tool" lines.
//     "stage" and "task" lines (milestone 5) span the steps inside them,
//     so they don't count.
//
// percentile(values, p): number | null
//   The nearest-rank percentile: the smallest of the values such that at
//   least p% of the values are less than or equal to it. p is from 1 to
//   100. No values: null. percentile([120, 80, 300, 95], 50) is 95.

export type Price = { inputCentsPerMillion: number; outputCentsPerMillion: number }

export type RunStats = {
  promptTokens: number
  completionTokens: number
  costCents: number | null
  unknownUsage: number
  durationMs: number
}

export function runStats(lines: TraceLine[], price: Price): RunStats {
  void lines
  void price
  throw new Error("Not built yet: RD-701")
}

export function percentile(values: number[], p: number): number | null {
  void values
  void p
  throw new Error("Not built yet: RD-701")
}
