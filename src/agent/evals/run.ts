import { mkdirSync, readFileSync, writeFileSync } from "node:fs"

import { Shop } from "../../server/shop/api"
import { runAgent } from "../loop"
import { toTraceLine, writeTrace } from "../trace"
import { scoreCase } from "./score"
import type { ExpectedOutcome } from "./score"

// The eval runner: every case through the real agent, scored by your code.
// Provided as a start: RD-302, RD-303, RD-405, RD-506, RD-601 and RD-701
// extend it, and RD-305 runs it in CI on the fake model.
//
//   npm run evals                          evals/cases.jsonl (yours, RD-302)
//   npm run evals -- --file evals/provided/simple.jsonl --limit 5
//
// A case is one JSON object per line:
//   {"id": "...", "customerEmail": "...", "message": "...",
//    "expected": {"orderId": "FH-100231", "action": "refund"}}
// "action" is optional: the action a case's decision should have. RD-302
// adds an action check for the cases that have one.
// "match" is optional too (the RD-202 situations): "match", "ask" or
// "not_ours", what finding the order should end in. A case whose answer
// isn't one order ("ask" or "not_ours") has no "orderId" and no "action":
//   {"id": "two-kettles", "customerEmail": "...", "message": "...",
//    "expected": {"match": "ask"}}
// A case with "redTeam": true (evals/provided/red-team.jsonl, RD-601) runs
// against the shop whose order notes carry hidden instructions.
//
// This spends real model tokens: a case is several model calls. Keep
// --limit small while you work; run everything before a review.

const args = process.argv.slice(2)
const opt = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}
const file = opt("--file") ?? "evals/cases.jsonl"
const limit = Number(opt("--limit") ?? Infinity)

export type Case = {
  id: string
  message: string
  customerEmail?: string
  redTeam?: boolean
  expected: ExpectedOutcome & Record<string, unknown>
}
const cases: Case[] = readFileSync(file, "utf8")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => JSON.parse(l) as Case)
  .slice(0, limit)

// Every case gets a run id and, once RD-103's trace exists, a trace: a
// failure in EVALS.md points at npm run trace -- <runId>.
const stamp = new Date().toISOString().replace(/[:.]/g, "-")
const rows: { id: string; runId: string; pass: boolean; order: boolean; noInvented: boolean; stop: string; tokens: number }[] = []
for (const c of cases) {
  const runId = `eval-${stamp}-${c.id}`
  const run = await runAgent(c.message, { shop: new Shop({ redTeam: c.redTeam === true }), customerEmail: c.customerEmail })
  let traced = ""
  try {
    writeTrace(
      runId,
      run.steps.map((s, i) => toTraceLine(runId, i + 1, s))
    )
    traced = `  trace ${runId}`
  } catch {
    // No trace before RD-103.
  }
  const score = scoreCase(c.expected, run.steps)
  const tokens = run.steps.reduce(
    (n, s) => n + (s.type === "model" && s.usage ? s.usage.promptTokens + s.usage.completionTokens : 0),
    0
  )
  rows.push({ id: c.id, runId, ...score, stop: run.stopReason, tokens })
  console.log(`${score.pass ? "PASS" : "FAIL"}  ${c.id}  order=${score.order}  noInvented=${score.noInvented}  (${run.stopReason}, ${tokens} tokens)${traced}`)
}

const passed = rows.filter((r) => r.pass).length
console.log(`\n${passed} of ${rows.length} cases pass · ${rows.reduce((n, r) => n + r.tokens, 0)} tokens`)
mkdirSync("runs", { recursive: true })
const out = `runs/evals-${stamp}.json`
writeFileSync(out, `${JSON.stringify({ file, passed, total: rows.length, rows }, null, 2)}\n`)
console.log(`Report: ${out}`)
